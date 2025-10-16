// @ts-ignore: Import from URL
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Import from URL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// @ts-ignore: Import from URL
import { createHmac } from "https://deno.land/std@0.168.0/crypto/hmac.ts"
import "../_shared/types"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentVerificationRequest {
  order_id: string;
  payment_id: string;
  signature: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: PaymentVerificationRequest = await req.json()
    
    if (!payload.order_id || !payload.payment_id || !payload.signature) {
      throw new Error('Missing required fields: order_id, payment_id, signature')
    }

    // Create signature for verification
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? ''
    const expectedSignature = createHmac("sha256", razorpaySecret)
      .update(`${payload.order_id}|${payload.payment_id}`)
      .digest('hex')

    const isValid = expectedSignature === payload.signature

    if (isValid) {
      // Fetch payment details from Razorpay
      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${payload.payment_id}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${Deno.env.get('RAZORPAY_KEY_ID')}:${razorpaySecret}`)}`,
        }
      })

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        
        // Update payment status in database
        await supabaseClient
          .from('payment_orders')
          .update({
            status: 'completed',
            payment_id: payload.payment_id,
            signature: payload.signature,
            payment_method: paymentData.method,
            updated_at: new Date().toISOString()
          })
          .eq('id', payload.order_id.split('_')[1]) // Extract order ID from Razorpay order ID

        // Trigger payment webhook for further processing
        await supabaseClient.functions.invoke('payment-webhook', {
          body: {
            payment_id: payload.payment_id,
            status: 'completed',
            amount: paymentData.amount / 100, // Convert from paise to rupees
            currency: paymentData.currency,
            metadata: {
              order_id: payload.order_id,
              method: paymentData.method
            }
          }
        })
      }
    }

    return new Response(
      JSON.stringify({
        verified: isValid,
        message: isValid ? 'Payment verified successfully' : 'Invalid payment signature'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({ 
        verified: false,
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})