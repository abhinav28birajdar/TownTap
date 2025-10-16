// @ts-ignore: Import from URL
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Import from URL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "../_shared/types"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocationPayload {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  activity_type?: 'delivery' | 'service' | 'customer';
  related_id?: string; // order_id, service_request_id, etc.
  address?: string;
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

    const payload: LocationPayload = await req.json()
    
    // Validate required fields
    if (!payload.user_id || !payload.latitude || !payload.longitude) {
      throw new Error('Missing required fields: user_id, latitude, longitude')
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', payload.user_id)
      .single()

    if (profileError || !profile) {
      throw new Error('User not found')
    }

    const timestamp = new Date().toISOString()

    // Create location point for PostGIS
    const locationPoint = `POINT(${payload.longitude} ${payload.latitude})`

    // Update or insert live location
    const { data: liveLocation, error: liveLocationError } = await supabaseClient
      .from('live_locations')
      .upsert({
        user_id: payload.user_id,
        location: locationPoint,
        accuracy: payload.accuracy || 0,
        speed: payload.speed || 0,
        heading: payload.heading || 0,
        activity_type: payload.activity_type || 'customer',
        related_id: payload.related_id,
        address: payload.address,
        updated_at: timestamp
      }, {
        onConflict: 'user_id'
      })
      .select()

    if (liveLocationError) {
      console.error('Live location error:', liveLocationError)
    }

    // Store location history
    const { error: historyError } = await supabaseClient
      .from('location_history')
      .insert({
        user_id: payload.user_id,
        location: locationPoint,
        accuracy: payload.accuracy || 0,
        speed: payload.speed || 0,
        heading: payload.heading || 0,
        activity_type: payload.activity_type || 'customer',
        related_id: payload.related_id,
        address: payload.address,
        recorded_at: timestamp
      })

    if (historyError) {
      console.error('History error:', historyError)
    }

    // Handle activity-specific logic
    if (payload.activity_type && payload.related_id) {
      
      if (payload.activity_type === 'delivery') {
        // Update order with delivery location
        await supabaseClient
          .from('orders')
          .update({
            delivery_location: locationPoint,
            delivery_status: 'in_transit',
            updated_at: timestamp
          })
          .eq('id', payload.related_id)

        // Notify customer of delivery progress
        const { data: order } = await supabaseClient
          .from('orders')
          .select('customer_id, business_id, businesses(name)')
          .eq('id', payload.related_id)
          .single()

        if (order) {
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              recipient_id: order.customer_id,
              type: 'delivery_update',
              title: 'Your order is on the way! 🚗',
              message: `Your order from ${order.businesses?.name} is being delivered`,
              data: {
                order_id: payload.related_id,
                delivery_location: {
                  latitude: payload.latitude,
                  longitude: payload.longitude
                }
              },
              action_url: `/orders/${payload.related_id}/track`,
              send_push: true
            })
          })
        }

      } else if (payload.activity_type === 'service') {
        // Update service request with provider location
        await supabaseClient
          .from('service_requests')
          .update({
            provider_location: locationPoint,
            status: 'in_progress',
            updated_at: timestamp
          })
          .eq('id', payload.related_id)

        // Notify customer of service provider arrival
        const { data: serviceRequest } = await supabaseClient
          .from('service_requests')
          .select('customer_id, business_id, businesses(name), service_location')
          .eq('id', payload.related_id)
          .single()

        if (serviceRequest) {
          // Calculate distance to service location (simplified)
          const isNearby = Math.random() > 0.7 // Simulate proximity check
          
          if (isNearby) {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                recipient_id: serviceRequest.customer_id,
                type: 'service_arrival',
                title: 'Service provider arriving! 👋',
                message: `${serviceRequest.businesses?.name} is almost at your location`,
                data: {
                  service_request_id: payload.related_id,
                  provider_location: {
                    latitude: payload.latitude,
                    longitude: payload.longitude
                  }
                },
                action_url: `/services/${payload.related_id}/track`,
                send_push: true
              })
            })
          }
        }
      }
    }

    // Find nearby users for social features (if enabled)
    if (payload.activity_type === 'customer') {
      const { data: nearbyUsers } = await supabaseClient
        .rpc('find_nearby_users', {
          user_lat: payload.latitude,
          user_lng: payload.longitude,
          radius_km: 5
        })

      // Could implement features like:
      // - Nearby friends notification
      // - Local business recommendations
      // - Community events alerts
    }

    // Update user's last seen location in profile
    await supabaseClient
      .from('profiles')
      .update({
        last_location: locationPoint,
        last_seen: timestamp
      })
      .eq('id', payload.user_id)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Location updated successfully',
        location: {
          latitude: payload.latitude,
          longitude: payload.longitude,
          timestamp: timestamp
        },
        nearby_users: payload.activity_type === 'customer' ? [] : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Location update error:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})