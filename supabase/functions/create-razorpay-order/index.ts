// @ts-ignore: Import from URL
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Import from URL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "../_shared/types"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RazorpayOrderRequest {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: any;
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

    const payload: RazorpayOrderRequest = await req.json()
    
    // Validate required fields
    if (!payload.amount || !payload.currency || !payload.receipt) {
      throw new Error('Missing required fields: amount, currency, receipt')
    }

    // Create Razorpay order using their API
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${Deno.env.get('RAZORPAY_KEY_ID')}:${Deno.env.get('RAZORPAY_KEY_SECRET')}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: payload.amount,
        currency: payload.currency,
        receipt: payload.receipt,
        notes: payload.notes || {},
        payment_capture: 1 // Auto capture payment
      })
    })

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json()
      throw new Error(`Razorpay API Error: ${errorData.error?.description || 'Unknown error'}`)
    }

    const razorpayOrder = await razorpayResponse.json()

    // Store order details in database
    const { error: dbError } = await supabaseClient
      .from('razorpay_orders')
      .insert({
        razorpay_order_id: razorpayOrder.id,
        amount: payload.amount,
        currency: payload.currency,
        receipt: payload.receipt,
        status: razorpayOrder.status,
        notes: payload.notes || {},
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Don't throw here as Razorpay order is created successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: razorpayOrder.id,
        entity: razorpayOrder.entity,
        amount: razorpayOrder.amount,
        amount_paid: razorpayOrder.amount_paid,
        amount_due: razorpayOrder.amount_due,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        attempts: razorpayOrder.attempts,
        notes: razorpayOrder.notes,
        created_at: razorpayOrder.created_at
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Razorpay order creation error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})