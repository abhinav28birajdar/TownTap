// Geocoding and location services Edge Function for LocalMart
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeRequest {
  address: string;
}

interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
}

interface NearbyBusinessesRequest {
  latitude: number;
  longitude: number;
  radius_km?: number;
  category?: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    switch (action) {
      case 'geocode':
        return await handleGeocode(req)
      case 'reverse-geocode':
        return await handleReverseGeocode(req)
      case 'nearby-businesses':
        return await handleNearbyBusinesses(req, supabaseClient)
      case 'calculate-distance':
        return await handleCalculateDistance(req)
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Location service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function handleGeocode(req: Request) {
  const { address }: GeocodeRequest = await req.json()
  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')

  if (!googleMapsApiKey) {
    throw new Error('Google Maps API key not configured')
  }

  const encodedAddress = encodeURIComponent(address)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${googleMapsApiKey}&region=in`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error('Address not found')
  }

  const result = data.results[0]
  const location = result.geometry.location

  return new Response(
    JSON.stringify({
      success: true,
      latitude: location.lat,
      longitude: location.lng,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      address_components: result.address_components
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleReverseGeocode(req: Request) {
  const { latitude, longitude }: ReverseGeocodeRequest = await req.json()
  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')

  if (!googleMapsApiKey) {
    throw new Error('Google Maps API key not configured')
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}&region=in`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error('Location not found')
  }

  const result = data.results[0]

  return new Response(
    JSON.stringify({
      success: true,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      address_components: result.address_components
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleNearbyBusinesses(req: Request, supabaseClient: any) {
  const { latitude, longitude, radius_km = 5, category, limit = 20 }: NearbyBusinessesRequest = await req.json()

  let query = supabaseClient
    .from('businesses')
    .select(`
      id,
      name,
      description,
      category_type,
      address,
      logo_url,
      cover_image_url,
      avg_rating,
      total_reviews,
      realtime_status,
      accepts_cod,
      has_offers,
      ST_Distance(location_geom, ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography) / 1000 as distance_km
    `)
    .eq('is_approved', true)
    .eq('is_active', true)
    .lte('ST_Distance(location_geom, ST_SetSRID(ST_Point(' + longitude + ', ' + latitude + '), 4326)::geography)', radius_km * 1000)
    .order('distance_km')
    .limit(limit)

  if (category) {
    query = query.contains('category_type', [category])
  }

  const { data: businesses, error } = await query

  if (error) {
    throw new Error('Failed to fetch nearby businesses: ' + error.message)
  }

  return new Response(
    JSON.stringify({
      success: true,
      businesses: businesses || [],
      total: businesses?.length || 0,
      search_radius_km: radius_km,
      search_location: { latitude, longitude }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCalculateDistance(req: Request) {
  const body = await req.json()
  const { from_lat, from_lng, to_lat, to_lng, mode = 'driving' } = body

  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')

  if (!googleMapsApiKey) {
    // Fallback to Haversine formula for straight-line distance
    const distance = calculateHaversineDistance(from_lat, from_lng, to_lat, to_lng)
    return new Response(
      JSON.stringify({
        success: true,
        distance_km: distance,
        duration_minutes: Math.round(distance * 2), // Rough estimate
        route_type: 'straight_line'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const origin = `${from_lat},${from_lng}`
  const destination = `${to_lat},${to_lng}`
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=${mode}&key=${googleMapsApiKey}&region=in`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== 'OK' || !data.rows || data.rows.length === 0) {
    throw new Error('Unable to calculate route')
  }

  const element = data.rows[0].elements[0]

  if (element.status !== 'OK') {
    throw new Error('Route not found')
  }

  return new Response(
    JSON.stringify({
      success: true,
      distance_km: element.distance.value / 1000,
      duration_minutes: Math.round(element.duration.value / 60),
      distance_text: element.distance.text,
      duration_text: element.duration.text,
      route_type: mode
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}