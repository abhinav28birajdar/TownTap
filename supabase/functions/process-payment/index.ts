// Payment processing Edge Function for LocalMart
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  transaction_id: string;
  amount: number;
  payment_method: 'upi' | 'card' | 'net_banking' | 'wallet';
  customer_id: string;
  business_id: string;
  upi_id?: string;
  return_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { transaction_id, amount, payment_method, customer_id, business_id, upi_id, return_url }: PaymentRequest = await req.json()

    // Validate transaction exists and belongs to customer
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .eq('customer_id', customer_id)
      .single()

    if (transactionError || !transaction) {
      throw new Error('Transaction not found or unauthorized')
    }

    // Check if payment is already processed
    if (transaction.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Payment already processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let paymentResponse;

    switch (payment_method) {
      case 'upi':
        paymentResponse = await processUPIPayment({
          transaction_id,
          amount,
          upi_id: upi_id || '',
          return_url: return_url || ''
        });
        break;
      
      case 'card':
      case 'net_banking':
        paymentResponse = await processRazorpayPayment({
          transaction_id,
          amount,
          payment_method,
          return_url: return_url || ''
        });
        break;
      
      case 'wallet':
        paymentResponse = await processWalletPayment({
          transaction_id,
          amount,
          customer_id
        });
        break;
      
      default:
        throw new Error('Invalid payment method');
    }

    // Update transaction with payment details
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({
        payment_status: 'pending',
        payment_method,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction_id)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
    }

    return new Response(
      JSON.stringify(paymentResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function processUPIPayment({ transaction_id, amount, upi_id, return_url }: {
  transaction_id: string;
  amount: number;
  upi_id: string;
  return_url: string;
}) {
  // Generate UPI payment URL
  const merchantId = Deno.env.get('UPI_MERCHANT_ID') || 'LOCALMART'
  const merchantName = encodeURIComponent('LocalMart')
  const transactionNote = encodeURIComponent(`Payment for order ${transaction_id}`)
  
  const upiUrl = `upi://pay?pa=${upi_id}&pn=${merchantName}&mc=0000&tid=${transaction_id}&tr=${transaction_id}&tn=${transactionNote}&am=${amount}&cu=INR&url=${encodeURIComponent(return_url)}`
  
  return {
    success: true,
    payment_method: 'upi',
    payment_url: upiUrl,
    transaction_id,
    amount,
    currency: 'INR'
  }
}

async function processRazorpayPayment({ transaction_id, amount, payment_method, return_url }: {
  transaction_id: string;
  amount: number;
  payment_method: string;
  return_url: string;
}) {
  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
  
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error('Razorpay credentials not configured')
  }

  // Create Razorpay order
  const orderData = {
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    receipt: transaction_id,
    payment_capture: 1,
    notes: {
      transaction_id,
      payment_method
    }
  }

  const authHeader = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
  
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })

  if (!response.ok) {
    throw new Error('Failed to create Razorpay order')
  }

  const razorpayOrder = await response.json()

  return {
    success: true,
    payment_method: 'razorpay',
    razorpay_order_id: razorpayOrder.id,
    razorpay_key_id: razorpayKeyId,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    transaction_id,
    return_url
  }
}

async function processWalletPayment({ transaction_id, amount, customer_id }: {
  transaction_id: string;
  amount: number;
  customer_id: string;
}) {
  // This would integrate with your wallet system
  // For now, returning a placeholder response
  return {
    success: true,
    payment_method: 'wallet',
    message: 'Wallet payment initiated',
    transaction_id,
    amount,
    currency: 'INR'
  }
}