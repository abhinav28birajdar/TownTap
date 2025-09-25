// @ts-nocheck
// FILE: supabase/functions/payment-processing/index.ts
// PURPOSE: Handles payment processing with Razorpay integration, order creation, and webhook handling

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createResponse, handleOptionsRequest, supabaseServiceRole } from '../_shared/supabaseClient.ts';

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;

interface PaymentRequest {
  amount: number;
  currency: string;
  order_id?: string;
  service_request_id?: string;
  user_id: string;
  business_id?: string;
  payment_method: string;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptionsRequest();

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    if (path === '/create-order' && req.method === 'POST') {
      return await createRazorpayOrder(req);
    } else if (path === '/verify-payment' && req.method === 'POST') {
      return await verifyPayment(req);
    } else if (path === '/webhook' && req.method === 'POST') {
      return await handleWebhook(req);
    } else if (path === '/initiate-upi' && req.method === 'POST') {
      return await initiateUPIPayment(req);
    } else {
      return createResponse({ error: 'Route not found' }, 404);
    }
  } catch (error: any) {
    console.error('Payment processing error:', error.message);
    return createResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
});

async function createRazorpayOrder(req: Request) {
  const paymentData: PaymentRequest = await req.json();
  
  // Validate required fields
  if (!paymentData.amount || !paymentData.user_id) {
    return createResponse({ error: 'Amount and user_id are required' }, 400);
  }

  // Create Razorpay order
  const orderData = {
    amount: paymentData.amount * 100, // Convert to paise
    currency: paymentData.currency || 'INR',
    receipt: `receipt_${Date.now()}_${paymentData.user_id}`,
    notes: {
      user_id: paymentData.user_id,
      order_id: paymentData.order_id,
      service_request_id: paymentData.service_request_id,
    }
  };

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay order creation failed:', errorData);
      return createResponse({ error: 'Failed to create payment order' }, 500);
    }

    const razorpayOrder: RazorpayOrder = await response.json();

    // Store payment record in database
    const { data: payment, error } = await supabaseServiceRole
      .from('payments')
      .insert({
        order_id: paymentData.order_id,
        service_request_id: paymentData.service_request_id,
        user_id: paymentData.user_id,
        business_id: paymentData.business_id,
        amount: paymentData.amount,
        currency: orderData.currency,
        provider: 'RAZORPAY',
        method: paymentData.payment_method,
        status: 'pending',
        gateway_reference_id: razorpayOrder.id,
        transaction_type: paymentData.order_id ? 'order_payment' : 'service_payment',
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing payment record:', error);
      return createResponse({ error: 'Failed to store payment record' }, 500);
    }

    return createResponse({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      payment_id: payment.id,
    }, 200);

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return createResponse({ error: 'Payment service unavailable' }, 503);
  }
}

async function verifyPayment(req: Request) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, payment_id } = await req.json();

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !payment_id) {
    return createResponse({ error: 'Missing required payment verification parameters' }, 400);
  }

  try {
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = await generateSignature(body, RAZORPAY_KEY_SECRET);

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await supabaseServiceRole
        .from('payments')
        .update({ 
          status: 'failed',
          error_details: { error: 'Invalid signature' }
        })
        .eq('id', payment_id);

      return createResponse({ error: 'Invalid payment signature' }, 400);
    }
    
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: {
        'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
    });

    if (!paymentResponse.ok) {
      return createResponse({ error: 'Failed to verify payment with Razorpay' }, 500);
    }

    const paymentDetails = await paymentResponse.json();

    // Update payment status in database
    const { data: updatedPayment, error } = await supabaseServiceRole
      .from('payments')
      .update({
        status: paymentDetails.status === 'captured' ? 'successful' : 'failed',
        webhook_payload: paymentDetails,
        gateway_reference_id: razorpay_payment_id,
      })
      .eq('id', payment_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      return createResponse({ error: 'Failed to update payment status' }, 500);
    }

    // If payment successful, update order/service request status
    if (updatedPayment.status === 'successful') {
      if (updatedPayment.order_id) {
        await supabaseServiceRole
          .from('orders')
          .update({ payment_status: 'paid', order_status: 'accepted' })
          .eq('id', updatedPayment.order_id);
      }

      if (updatedPayment.service_request_id) {
        await supabaseServiceRole
          .from('service_requests')
          .update({ payment_status: 'paid' })
          .eq('id', updatedPayment.service_request_id);
      }

      // Update user wallet if applicable
      if (updatedPayment.method === 'WALLET') {
        await supabaseServiceRole
          .from('wallet_transactions')
          .insert({
            user_id: updatedPayment.user_id,
            type: 'DEBIT',
            amount: updatedPayment.amount,
            description: `Payment for ${updatedPayment.order_id ? 'order' : 'service'}`,
            related_entity_type: updatedPayment.order_id ? 'order' : 'service_request',
            related_entity_id: updatedPayment.order_id || updatedPayment.service_request_id,
            payment_id: updatedPayment.id,
          });

        // Update profile wallet balance
        await supabaseServiceRole.rpc('update_wallet_balance', {
          user_id: updatedPayment.user_id,
          amount: -updatedPayment.amount,
        });
      }
    }

    return createResponse({
      payment_verified: true,
      payment_status: updatedPayment.status,
      payment_id: updatedPayment.id,
    }, 200);

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return createResponse({ error: 'Payment verification failed' }, 500);
  }
}

async function handleWebhook(req: Request) {
  const webhookSignature = req.headers.get('x-razorpay-signature');
  const body = await req.text();

  if (!webhookSignature) {
    return createResponse({ error: 'Missing webhook signature' }, 400);
  }

  try {
    // Verify webhook signature
    const expectedSignature = await generateSignature(body, Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!);
    
    if (expectedSignature !== webhookSignature) {
      return createResponse({ error: 'Invalid webhook signature' }, 400);
    }

    const event = JSON.parse(body);
    
    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return createResponse({ message: 'Webhook processed successfully' }, 200);

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return createResponse({ error: 'Webhook processing failed' }, 500);
  }
}

async function initiateUPIPayment(req: Request) {
  const { amount, user_id, upi_id, order_id, service_request_id } = await req.json();

  if (!amount || !user_id || !upi_id) {
    return createResponse({ error: 'Amount, user_id, and upi_id are required' }, 400);
  }

  // Generate UPI deep link
  const merchantId = 'your-merchant-id'; // Configure in environment
  const transactionId = `TXN_${Date.now()}_${user_id}`;
  
  const upiLink = `upi://pay?pa=${upi_id}&pn=TownTap&am=${amount}&cu=INR&tn=${transactionId}&tr=${transactionId}`;

  // Store payment record
  const { data: payment, error } = await supabaseServiceRole
    .from('payments')
    .insert({
      order_id,
      service_request_id,
      user_id,
      amount,
      currency: 'INR',
      provider: 'UPI_INTENT',
      method: 'UPI_INTENT',
      status: 'pending',
      gateway_reference_id: transactionId,
      transaction_type: order_id ? 'order_payment' : 'service_payment',
    })
    .select()
    .single();

  if (error) {
    console.error('Error storing UPI payment record:', error);
    return createResponse({ error: 'Failed to initiate UPI payment' }, 500);
  }

  return createResponse({
    upi_link: upiLink,
    transaction_id: transactionId,
    payment_id: payment.id,
  }, 200);
}

async function handlePaymentCaptured(payment: any) {
  await supabaseServiceRole
    .from('payments')
    .update({
      status: 'successful',
      webhook_payload: payment,
    })
    .eq('gateway_reference_id', payment.id);
}

async function handlePaymentFailed(payment: any) {
  await supabaseServiceRole
    .from('payments')
    .update({
      status: 'failed',
      error_details: payment.error_description,
      webhook_payload: payment,
    })
    .eq('gateway_reference_id', payment.id);
}

async function handleOrderPaid(order: any) {
  await supabaseServiceRole
    .from('payments')
    .update({
      status: 'successful',
      webhook_payload: order,
    })
    .eq('gateway_reference_id', order.id);
}

async function generateSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
