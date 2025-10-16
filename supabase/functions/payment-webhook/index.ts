// @ts-ignore: Import from URL
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Import from URL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "../_shared/types"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentWebhookPayload {
  event: string;
  data: {
    order_id?: string;
    service_request_id?: string;
    rental_id?: string;
    inquiry_id?: string;
    payment_id: string;
    payment_status: 'successful' | 'failed' | 'refunded';
    amount: number;
    currency: string;
    gateway_response: any;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: PaymentWebhookPayload = await req.json()
    
    console.log('Payment webhook received:', payload)

    // Update transaction status
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .update({
        payment_status: payload.data.payment_status,
        payment_gateway_response: payload.data.gateway_response,
        updated_at: new Date().toISOString()
      })
      .eq('payment_gateway_transaction_id', payload.data.payment_id)

    if (transactionError) {
      throw transactionError
    }

    // Update related entity based on type
    if (payload.data.order_id) {
      const orderStatus = payload.data.payment_status === 'successful' ? 'accepted' : 'payment_failed'
      
      const { error: orderError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: payload.data.payment_status,
          status: orderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', payload.data.order_id)

      if (orderError) throw orderError

      // Send notification to customer
      const { data: order } = await supabaseClient
        .from('orders')
        .select('customer_id, business_id, order_number')
        .eq('id', payload.data.order_id)
        .single()

      if (order) {
        await supabaseClient.from('notifications').insert({
          recipient_id: order.customer_id,
          type: 'payment_status',
          title: payload.data.payment_status === 'successful' ? 'Payment Successful' : 'Payment Failed',
          message: `Payment ${payload.data.payment_status} for order #${order.order_number}`,
          data: {
            order_id: payload.data.order_id,
            payment_status: payload.data.payment_status
          }
        })
      }
    } else if (payload.data.service_request_id) {
      const { error: serviceError } = await supabaseClient
        .from('service_requests')
        .update({
          payment_status: payload.data.payment_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', payload.data.service_request_id)

      if (serviceError) throw serviceError

      // Send notification
      const { data: serviceRequest } = await supabaseClient
        .from('service_requests')
        .select('customer_id, business_id, request_number')
        .eq('id', payload.data.service_request_id)
        .single()

      if (serviceRequest) {
        await supabaseClient.from('notifications').insert({
          recipient_id: serviceRequest.customer_id,
          type: 'payment_status',
          title: payload.data.payment_status === 'successful' ? 'Payment Successful' : 'Payment Failed',
          message: `Payment ${payload.data.payment_status} for service request #${serviceRequest.request_number}`,
          data: {
            service_request_id: payload.data.service_request_id,
            payment_status: payload.data.payment_status
          }
        })
      }
    } else if (payload.data.rental_id) {
      const { error: rentalError } = await supabaseClient
        .from('rentals')
        .update({
          payment_status: payload.data.payment_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', payload.data.rental_id)

      if (rentalError) throw rentalError

      // Send notification
      const { data: rental } = await supabaseClient
        .from('rentals')
        .select('customer_id, business_id, rental_number')
        .eq('id', payload.data.rental_id)
        .single()

      if (rental) {
        await supabaseClient.from('notifications').insert({
          recipient_id: rental.customer_id,
          type: 'payment_status',
          title: payload.data.payment_status === 'successful' ? 'Payment Successful' : 'Payment Failed',
          message: `Payment ${payload.data.payment_status} for rental #${rental.rental_number}`,
          data: {
            rental_id: payload.data.rental_id,
            payment_status: payload.data.payment_status
          }
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Payment webhook error:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})