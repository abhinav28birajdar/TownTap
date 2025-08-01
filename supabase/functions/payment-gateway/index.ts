// =====================================================
// PAYMENT PROCESSING EDGE FUNCTION
// =====================================================
// Handles Razorpay payment orders, UPI deep links, and verification

// @ts-ignore - Deno runtime
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"
// @ts-ignore - Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentOrderRequest {
  order_id: string
  amount: number
  currency?: string
  customer_id: string
  business_id: string
}

interface PaymentVerificationRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  order_id: string
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      // @ts-ignore - Deno global
      // @ts-ignore
// @ts-ignore
Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
// @ts-ignore
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    switch (action) {
      case 'create-order':
        return await createPaymentOrder(req, supabase)
      case 'verify-payment':
        return await verifyPayment(req, supabase)
      case 'generate-upi-intent':
        return await generateUPIIntent(req, supabase)
      case 'webhook':
        return await handleWebhook(req, supabase)
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PAYMENT_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function createPaymentOrder(req: Request, supabase: any) {
  const { order_id, amount, currency = 'INR', customer_id, business_id }: PaymentOrderRequest = await req.json()

  // Get Razorpay credentials
  const razorpayKeyId = // @ts-ignore
// @ts-ignore
Deno.env.get('RAZORPAY_KEY_ID')
  const razorpayKeySecret = // @ts-ignore
// @ts-ignore
Deno.env.get('RAZORPAY_KEY_SECRET')

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error('Razorpay credentials not configured')
  }

  // Create Razorpay order
  const razorpayOrder = {
    amount: Math.round(amount * 100), // Convert to paise
    currency,
    receipt: order_id,
    notes: {
      customer_id,
      business_id,
      order_id
    }
  }

  const authHeader = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
  
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(razorpayOrder)
  })

  if (!response.ok) {
    throw new Error('Failed to create Razorpay order')
  }

  const razorpayOrderData = await response.json()

  // Save payment record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      order_id,
      customer_id,
      business_id,
      amount,
      currency,
      payment_method: 'razorpay',
      status: 'pending',
      gateway_order_id: razorpayOrderData.id,
      gateway_response: razorpayOrderData
    })

  if (paymentError) throw paymentError

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        razorpay_order_id: razorpayOrderData.id,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        key_id: razorpayKeyId
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function verifyPayment(req: Request, supabase: any) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }: PaymentVerificationRequest = await req.json()

  const razorpayKeySecret = // @ts-ignore
// @ts-ignore
Deno.env.get('RAZORPAY_KEY_SECRET')
  if (!razorpayKeySecret) {
    throw new Error('Razorpay secret not configured')
  }

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id
  const expectedSignature = createHmac("sha256", razorpayKeySecret)
    .update(body)
    .digest("hex")

  if (expectedSignature !== razorpay_signature) {
    throw new Error('Invalid payment signature')
  }

  // Update payment status
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      gateway_payment_id: razorpay_payment_id,
      gateway_signature: razorpay_signature,
      completed_at: new Date().toISOString()
    })
    .eq('gateway_order_id', razorpay_order_id)

  if (updateError) throw updateError

  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'confirmed'
    })
    .eq('id', order_id)

  if (orderError) throw orderError

  // Process loyalty points
  await processLoyaltyPoints(supabase, order_id)

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Payment verified successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function generateUPIIntent(req: Request, supabase: any) {
  const { razorpay_order_id } = await req.json()

  // Get payment details
  const { data: payment, error } = await supabase
    .from('payments')
    .select('*')
    .eq('gateway_order_id', razorpay_order_id)
    .single()

  if (error || !payment) {
    throw new Error('Payment not found')
  }

  // Generate UPI deep links
  const upiId = // @ts-ignore
// @ts-ignore
Deno.env.get('UPI_ID') || 'merchant@paytm'
  const amount = payment.amount
  const note = `Payment for Order ${payment.order_id}`

  const upiLinks = {
    generic: `upi://pay?pa=${upiId}&pn=TownTap&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
    phonepe: `phonepe://pay?pa=${upiId}&pn=TownTap&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
    googlepay: `tez://upi/pay?pa=${upiId}&pn=TownTap&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
    paytm: `paytmmp://pay?pa=${upiId}&pn=TownTap&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
    bhim: `bhim://pay?pa=${upiId}&pn=TownTap&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        upi_links: upiLinks,
        qr_code_data: upiLinks.generic,
        amount,
        merchant_name: 'TownTap'
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handleWebhook(req: Request, supabase: any) {
  const signature = req.headers.get('x-razorpay-signature')
  const body = await req.text()

  // Verify webhook signature
  const razorpayWebhookSecret = // @ts-ignore
// @ts-ignore
Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
  if (razorpayWebhookSecret && signature) {
    const expectedSignature = createHmac("sha256", razorpayWebhookSecret)
      .update(body)
      .digest("hex")

    if (expectedSignature !== signature) {
      throw new Error('Invalid webhook signature')
    }
  }

  const webhookData = JSON.parse(body)
  const event = webhookData.event

  switch (event) {
    case 'payment.captured':
      await handlePaymentCaptured(webhookData.payload.payment.entity, supabase)
      break
    case 'payment.failed':
      await handlePaymentFailed(webhookData.payload.payment.entity, supabase)
      break
    case 'order.paid':
      await handleOrderPaid(webhookData.payload.order.entity, supabase)
      break
  }

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handlePaymentCaptured(payment: any, supabase: any) {
  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      gateway_payment_id: payment.id,
      completed_at: new Date().toISOString()
    })
    .eq('gateway_order_id', payment.order_id)

  // Send notification to customer
  await sendPaymentNotification(payment, 'success', supabase)
}

async function handlePaymentFailed(payment: any, supabase: any) {
  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      failed_at: new Date().toISOString()
    })
    .eq('gateway_order_id', payment.order_id)

  // Send notification to customer
  await sendPaymentNotification(payment, 'failed', supabase)
}

async function handleOrderPaid(order: any, supabase: any) {
  // Update order status to confirmed
  const { data: payment } = await supabase
    .from('payments')
    .select('order_id')
    .eq('gateway_order_id', order.id)
    .single()

  if (payment) {
    await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', payment.order_id)
  }
}

async function processLoyaltyPoints(supabase: any, orderId: string) {
  // Get order details
  const { data: order } = await supabase
    .from('orders')
    .select('customer_id, business_id, total_amount')
    .eq('id', orderId)
    .single()

  if (!order) return

  // Calculate points (1 point per ₹10)
  const points = Math.floor(order.total_amount / 10)

  // Update customer loyalty
  const { error } = await supabase.rpc('process_wallet_transaction', {
    p_user_id: order.customer_id,
    p_type: 'credit',
    p_amount: points,
    p_description: `Loyalty points for order #${orderId}`,
    p_related_order_id: orderId
  })

  if (!error) {
    // Record loyalty transaction
    await supabase
      .from('loyalty_transactions')
      .insert({
        customer_id: order.customer_id,
        business_id: order.business_id,
        order_id: orderId,
        type: 'earned',
        points,
        description: `Points earned from order #${orderId}`
      })
  }
}

async function sendPaymentNotification(payment: any, status: string, supabase: any) {
  // Get customer details
  const { data: paymentRecord } = await supabase
    .from('payments')
    .select('customer_id, order_id')
    .eq('gateway_order_id', payment.order_id)
    .single()

  if (!paymentRecord) return

  const title = status === 'success' ? 'Payment Successful' : 'Payment Failed'
  const body = status === 'success' 
    ? `Your payment of ₹${payment.amount / 100} has been processed successfully.`
    : `Your payment of ₹${payment.amount / 100} has failed. Please try again.`

  await supabase
    .from('notifications')
    .insert({
      user_id: paymentRecord.customer_id,
      title,
      body,
      type: 'payment',
      data: {
        payment_id: payment.id,
        order_id: paymentRecord.order_id,
        amount: payment.amount / 100,
        status
      }
    })
}
