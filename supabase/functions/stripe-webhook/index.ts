// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { createHmac } from "https://deno.land/std@0.168.0/crypto/hmac.ts";

const STRIPE_SECRET_KEY = Deno?.env?.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SIGNING_SECRET = Deno?.env?.get("STRIPE_WEBHOOK_SIGNING_SECRET");
const SUPABASE_URL = Deno?.env?.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY");

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(
  SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY || ""
);

// Verify Stripe webhook signature
const verifyStripeSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  try {
    // Get timestamp and signatures from the signature string
    const parts = signature.split(",");
    const timestampPart = parts.find(part => part.startsWith("t="));
    const signaturePart = parts.find(part => part.startsWith("v1="));
    
    if (!timestampPart || !signaturePart) {
      return false;
    }
    
    const timestamp = timestampPart.substring(2);
    const expectedSignature = signaturePart.substring(3);
    
    // Create a signature to compare with Stripe's
    const signedPayload = `${timestamp}.${payload}`;
    const hmac = createHmac("sha256", secret);
    const computedSignature = hmac.update(signedPayload).digest("hex");
    
    return computedSignature === expectedSignature;
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
};

// Process different types of Stripe webhook events
const handleStripeEvent = async (event: any) => {
  const eventType = event.type;
  console.log(`Processing Stripe event: ${eventType}`);

  switch (eventType) {
    case "payment_intent.succeeded":
      return await handlePaymentIntentSucceeded(event.data.object);
    
    case "payment_intent.payment_failed":
      return await handlePaymentIntentFailed(event.data.object);
    
    case "checkout.session.completed":
      return await handleCheckoutSessionCompleted(event.data.object);
    
    case "invoice.paid":
      return await handleInvoicePaid(event.data.object);
    
    case "invoice.payment_failed":
      return await handleInvoicePaymentFailed(event.data.object);
    
    case "customer.subscription.created":
    case "customer.subscription.updated":
      return await handleSubscriptionChange(event.data.object);
    
    case "customer.subscription.deleted":
      return await handleSubscriptionDeleted(event.data.object);
    
    default:
      console.log(`Unhandled event type: ${eventType}`);
      return { success: true, message: "Unhandled event type" };
  }
};

// Handler for successful payments
const handlePaymentIntentSucceeded = async (paymentIntent: any) => {
  try {
    // Update order status in the database
    if (paymentIntent.metadata && paymentIntent.metadata.order_id) {
      const { data, error } = await supabase
        .from("orders")
        .update({ 
          payment_status: "paid",
          payment_details: paymentIntent,
          updated_at: new Date().toISOString()
        })
        .eq("id", paymentIntent.metadata.order_id);

      if (error) {
        throw error;
      }

      // Create notification for the business
      if (paymentIntent.metadata.business_id) {
        await supabase.from("notifications").insert({
          recipient_id: paymentIntent.metadata.business_id,
          type: "payment_received",
          title: "Payment Received",
          content: `Payment of ${formatCurrency(paymentIntent.amount / 100, paymentIntent.currency)} has been received for order #${paymentIntent.metadata.order_id}`,
          data: {
            order_id: paymentIntent.metadata.order_id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
          }
        });
      }
    }
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error handling payment intent succeeded:", error);
    return { success: false, error: errorMessage };
  }
};

// Handler for failed payments
const handlePaymentIntentFailed = async (paymentIntent: any) => {
  try {
    if (paymentIntent.metadata && paymentIntent.metadata.order_id) {
      const { error } = await supabase
        .from("orders")
        .update({ 
          payment_status: "failed",
          payment_error: paymentIntent.last_payment_error?.message || "Payment failed",
          updated_at: new Date().toISOString()
        })
        .eq("id", paymentIntent.metadata.order_id);

      if (error) {
        throw error;
      }

      // Create notification for the user
      if (paymentIntent.metadata.user_id) {
        await supabase.from("notifications").insert({
          recipient_id: paymentIntent.metadata.user_id,
          type: "payment_failed",
          title: "Payment Failed",
          content: `Your payment for order #${paymentIntent.metadata.order_id} has failed. Please update your payment method.`,
          data: {
            order_id: paymentIntent.metadata.order_id,
            error: paymentIntent.last_payment_error?.message
          }
        });
      }
    }
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error handling payment intent failed:", error);
    return { success: false, error: errorMessage };
  }
};

// Handler for completed checkout sessions
const handleCheckoutSessionCompleted = async (session: any) => {
  try {
    // If this is for a subscription
    if (session.mode === "subscription") {
      await handleSubscriptionCheckout(session);
      return { success: true };
    }
    
    // If this is for a one-time payment
    if (session.metadata && session.metadata.order_id) {
      const { error } = await supabase
        .from("orders")
        .update({ 
          payment_status: "paid",
          payment_details: session,
          updated_at: new Date().toISOString()
        })
        .eq("id", session.metadata.order_id);

      if (error) {
        throw error;
      }
    }
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error handling checkout session:", error);
    return { success: false, error: errorMessage };
  }
};

// Handler for paid invoices
const handleInvoicePaid = async (invoice: any) => {
  try {
    // Update subscription payment status
    if (invoice.subscription) {
      const { error } = await supabase
        .from("subscriptions")
        .update({ 
          status: "active",
          current_period_end: new Date(invoice.lines.data[0].period.end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("stripe_subscription_id", invoice.subscription);

      if (error) {
        throw error;
      }

      // Create notification for the business
      if (invoice.customer_email) {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", invoice.customer_email)
          .single();
          
        if (data) {
          await supabase.from("notifications").insert({
            recipient_id: data.id,
            type: "invoice_paid",
            title: "Invoice Paid",
            content: `Your invoice for ${formatCurrency(invoice.amount_paid / 100, invoice.currency)} has been paid successfully.`,
            data: {
              invoice_id: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency
            }
          });
        }
      }
    }
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error handling invoice paid:", error);
    return { success: false, error: errorMessage };
  }
};

// Handler for failed invoice payments
const handleInvoicePaymentFailed = async (invoice: any) => {
  try {
    // Update subscription status
    if (invoice.subscription) {
      const { error } = await supabase
        .from("subscriptions")
        .update({ 
          status: "past_due",
          updated_at: new Date().toISOString()
        })
        .eq("stripe_subscription_id", invoice.subscription);

      if (error) {
        throw error;
      }

      // Create notification for the business
      if (invoice.customer_email) {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", invoice.customer_email)
          .single();
          
        if (data) {
          await supabase.from("notifications").insert({
            recipient_id: data.id,
            type: "invoice_failed",
            title: "Payment Failed",
            content: `Your payment of ${formatCurrency(invoice.amount_due / 100, invoice.currency)} has failed. Please update your payment method.`,
            data: {
              invoice_id: invoice.id,
              amount: invoice.amount_due,
              currency: invoice.currency
            }
          });
        }
      }
    }
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error handling invoice payment failed:", error);
    return { success: false, error: errorMessage };
  }
};

// Handler for subscription changes
const handleSubscriptionChange = async (subscription: any) => {
  try {
    // Find the business ID based on Stripe customer ID
    const { data: businessData } = await supabase
      .from("businesses")
      .select("id, owner_id")
      .eq("stripe_customer_id", subscription.customer)
      .single();

    if (!businessData) {
      console.error("Business not found for subscription:", subscription.id);
      return { success: false, error: "Business not found" };
    }

    // Update subscription in database
    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        business_id: businessData.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        plan_id: subscription.metadata?.plan_id || null,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      }, { onConflict: "stripe_subscription_id" });

    if (error) {
      throw error;
    }

    // Create notification for the business owner
    await supabase.from("notifications").insert({
      recipient_id: businessData.owner_id,
      type: "subscription_updated",
      title: "Subscription Updated",
      content: `Your subscription has been ${subscription.status === 'active' ? 'activated' : 'updated'}.`,
      data: {
        subscription_id: subscription.id,
        status: subscription.status
      }
    });
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error handling subscription change:", error);
    return { success: false, error: errorMessage };
  }
};

// Handler for deleted subscriptions
const handleSubscriptionDeleted = async (subscription: any) => {
  try {
    // Update subscription status in database
    const { error } = await supabase
      .from("subscriptions")
      .update({ 
        status: "canceled",
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      throw error;
    }

    // Find the business owner to notify
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("business_id")
      .eq("stripe_subscription_id", subscription.id)
      .single();
    
    if (subscriptionData) {
      const { data: businessData } = await supabase
        .from("businesses")
        .select("owner_id")
        .eq("id", subscriptionData.business_id)
        .single();
        
      if (businessData) {
        // Create notification for the business owner
        await supabase.from("notifications").insert({
          recipient_id: businessData.owner_id,
          type: "subscription_canceled",
          title: "Subscription Canceled",
          content: "Your subscription has been canceled.",
          data: {
            subscription_id: subscription.id
          }
        });
      }
    }
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error handling subscription deleted:", error);
    return { success: false, error: errorMessage };
  }
};

// Handler for subscription checkout completions
const handleSubscriptionCheckout = async (session: any) => {
  try {
    // Find the business ID from the session metadata
    const businessId = session.metadata?.business_id;
    
    if (!businessId) {
      console.error("Business ID not found in session metadata");
      return { success: false, error: "Business ID not found" };
    }
    
    // Update business with Stripe customer ID if needed
    const { error: businessUpdateError } = await supabase
      .from("businesses")
      .update({ 
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString()
      })
      .eq("id", businessId)
      .is("stripe_customer_id", null);
      
    if (businessUpdateError) {
      console.error("Error updating business with stripe customer ID:", businessUpdateError);
    }
    
    // Get subscription details from Stripe
    // Note: In a real implementation, you'd need to call Stripe API here
    // This is a simplified example assuming we have the subscription ID
    const subscriptionId = session.subscription;
    
    if (subscriptionId) {
      // Create or update subscription record
      const { error } = await supabase
        .from("subscriptions")
        .upsert({
          business_id: businessId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer,
          plan_id: session.metadata?.plan_id || null,
          status: "active", // Initial status based on successful checkout
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: "stripe_subscription_id" });
        
      if (error) {
        throw error;
      }
      
      // Get business owner ID for notification
      const { data: businessData } = await supabase
        .from("businesses")
        .select("owner_id")
        .eq("id", businessId)
        .single();
        
      if (businessData) {
        // Create notification for the business owner
        await supabase.from("notifications").insert({
          recipient_id: businessData.owner_id,
          type: "subscription_created",
          title: "Subscription Created",
          content: "Your subscription has been created successfully.",
          data: {
            subscription_id: subscriptionId
          }
        });
      }
    }
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error handling subscription checkout:", error);
    return { success: false, error: errorMessage };
  }
};

// Helper function to format currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase() || 'USD'
  }).format(amount);
};

// Main webhook handler
serve(async (req: Request) => {
  try {
    // Verify that we have the required env variables
    if (!STRIPE_WEBHOOK_SIGNING_SECRET) {
      return new Response(
        JSON.stringify({ error: "STRIPE_WEBHOOK_SIGNING_SECRET is not set" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No stripe signature in request" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the raw body
    const body = await req.text();
    
    // Verify the webhook signature
    const isValid = verifyStripeSignature(
      body,
      signature,
      STRIPE_WEBHOOK_SIGNING_SECRET
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse the webhook body
    const event = JSON.parse(body);

    // Process the webhook event
    const result = await handleStripeEvent(event);

    // Return a successful response
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    // Log and return any errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Webhook error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});