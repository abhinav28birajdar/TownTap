// Business search and discovery Edge Function for LocalMart
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchRequest {
  query?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  rating_min?: number;
  price_range?: 'low' | 'medium' | 'high';
  is_open_now?: boolean;
  accepts_cod?: boolean;
  has_offers?: boolean;
  sort_by?: 'distance' | 'rating' | 'popularity' | 'newest';
  limit?: number;
  offset?: number;
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

    const searchParams: SearchRequest = await req.json()

    const {
      query,
      category,
      latitude,
      longitude,
      radius_km = 10,
      rating_min = 0,
      price_range,
      is_open_now,
      accepts_cod,
      has_offers,
      sort_by = 'distance',
      limit = 20,
      offset = 0
    } = searchParams

    // Build the base query
    let dbQuery = supabaseClient
      .from('businesses')
      .select(`
        id,
        name,
        description,
        category_type,
        business_phone,
        address,
        logo_url,
        cover_image_url,
        operating_hours,
        avg_rating,
        total_reviews,
        realtime_status,
        accepts_cod,
        has_offers,
        is_verified,
        commission_rate,
        min_order_amount,
        delivery_charge,
        delivery_radius_km,
        created_at,
        ${latitude && longitude ? 
          `ST_Distance(location_geom, ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)::geography) / 1000 as distance_km` :
          'null as distance_km'
        }
      `)
      .eq('is_approved', true)
      .eq('is_active', true)

    // Apply filters
    if (rating_min > 0) {
      dbQuery = dbQuery.gte('avg_rating', rating_min)
    }

    if (accepts_cod !== undefined) {
      dbQuery = dbQuery.eq('accepts_cod', accepts_cod)
    }

    if (has_offers !== undefined) {
      dbQuery = dbQuery.eq('has_offers', has_offers)
    }

    if (category) {
      dbQuery = dbQuery.contains('category_type', [category])
    }

    // Location-based filtering
    if (latitude && longitude && radius_km) {
      dbQuery = dbQuery.lte(
        'ST_Distance(location_geom, ST_SetSRID(ST_Point(' + longitude + ', ' + latitude + '), 4326)::geography)',
        radius_km * 1000
      )
    }

    // Text search using pg_trgm
    if (query && query.trim()) {
      const searchTerms = query.trim().split(' ').map(term => `%${term}%`).join(' & ')
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Apply sorting
    switch (sort_by) {
      case 'distance':
        if (latitude && longitude) {
          dbQuery = dbQuery.order('distance_km', { ascending: true })
        } else {
          dbQuery = dbQuery.order('created_at', { ascending: false })
        }
        break
      case 'rating':
        dbQuery = dbQuery.order('avg_rating', { ascending: false })
        break
      case 'popularity':
        dbQuery = dbQuery.order('total_reviews', { ascending: false })
        break
      case 'newest':
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1)

    const { data: businesses, error, count } = await dbQuery

    if (error) {
      throw new Error('Search failed: ' + error.message)
    }

    // Get popular categories for suggestions
    const { data: categories } = await supabaseClient
      .from('businesses')
      .select('category_type')
      .eq('is_approved', true)
      .eq('is_active', true)

    const categoryCount: Record<string, number> = {}
    categories?.forEach(business => {
      business.category_type?.forEach((cat: string) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1
      })
    })

    const popularCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }))

    // Filter businesses that are currently open if requested
    let filteredBusinesses = businesses || []
    
    if (is_open_now) {
      const currentTime = new Date()
      const currentDay = currentTime.getDay() // 0 = Sunday, 1 = Monday, etc.
      const currentHour = currentTime.getHours()
      const currentMinute = currentTime.getMinutes()
      const currentTimeMinutes = currentHour * 60 + currentMinute

      filteredBusinesses = filteredBusinesses.filter(business => {
        if (business.realtime_status !== 'online') {
          return false
        }

        const operatingHours = business.operating_hours
        if (!operatingHours || typeof operatingHours !== 'object') {
          return true // Assume open if no operating hours specified
        }

        const daySchedule = operatingHours[currentDay.toString()] || operatingHours[getDayName(currentDay)]
        if (!daySchedule) {
          return false // Closed on this day
        }

        if (daySchedule.closed) {
          return false
        }

        const openTime = parseTime(daySchedule.open)
        const closeTime = parseTime(daySchedule.close)

        if (openTime !== null && closeTime !== null) {
          if (closeTime < openTime) {
            // Handles overnight businesses (e.g., 22:00 to 06:00)
            return currentTimeMinutes >= openTime || currentTimeMinutes <= closeTime
          } else {
            return currentTimeMinutes >= openTime && currentTimeMinutes <= closeTime
          }
        }

        return true
      })
    }

    // Enhanced business data with additional computed fields
    const enhancedBusinesses = filteredBusinesses.map(business => ({
      ...business,
      is_currently_open: checkIfOpen(business.operating_hours, business.realtime_status),
      estimated_delivery_time: calculateDeliveryTime(business.distance_km),
      price_range_category: determinePriceRange(business.commission_rate, business.min_order_amount),
      verified_badge: business.is_verified,
      distance_text: business.distance_km ? formatDistance(business.distance_km) : null,
      rating_text: formatRating(business.avg_rating, business.total_reviews)
    }))

    return new Response(
      JSON.stringify({
        success: true,
        businesses: enhancedBusinesses,
        total_count: count || enhancedBusinesses.length,
        popular_categories: popularCategories,
        search_params: searchParams,
        pagination: {
          limit,
          offset,
          has_more: (count || 0) > offset + limit
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Search error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

function getDayName(dayIndex: number): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[dayIndex]
}

function parseTime(timeStr: string): number | null {
  if (!timeStr) return null
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  return parseInt(match[1]) * 60 + parseInt(match[2])
}

function checkIfOpen(operatingHours: any, realtimeStatus: string): boolean {
  if (realtimeStatus !== 'online') return false
  
  // Add logic to check current operating hours
  // This is a simplified version
  return realtimeStatus === 'online'
}

function calculateDeliveryTime(distanceKm?: number): string {
  if (!distanceKm) return 'Unknown'
  
  // Simple estimation: 30 minutes base + 5 minutes per km
  const estimatedMinutes = 30 + (distanceKm * 5)
  
  if (estimatedMinutes < 60) {
    return `${Math.round(estimatedMinutes)} mins`
  } else {
    const hours = Math.floor(estimatedMinutes / 60)
    const minutes = Math.round(estimatedMinutes % 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}

function determinePriceRange(commissionRate: number, minOrderAmount: number): 'low' | 'medium' | 'high' {
  if (minOrderAmount < 100 && commissionRate < 3) return 'low'
  if (minOrderAmount < 500 && commissionRate < 5) return 'medium'
  return 'high'
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`
  } else {
    return `${distanceKm.toFixed(1)}km away`
  }
}

function formatRating(rating: number, reviewCount: number): string {
  if (reviewCount === 0) return 'No reviews yet'
  return `${rating.toFixed(1)} (${reviewCount} reviews)`
}