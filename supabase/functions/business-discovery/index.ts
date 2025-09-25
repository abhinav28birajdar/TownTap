// @ts-nocheck
// FILE: supabase/functions/business-discovery/index.ts
// PURPOSE: Handles business discovery with geospatial queries, filtering, and search functionality

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createResponse, handleOptionsRequest, supabaseServiceRole } from '../_shared/supabaseClient.ts';

interface BusinessSearchParams {
  latitude: number;
  longitude: number;
  radius_km?: number;
  category_id?: string;
  business_type?: 'type_a' | 'type_b' | 'type_c';
  search_query?: string;
  limit?: number;
  offset?: number;
  min_rating?: number;
  is_open_now?: boolean;
  has_delivery?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptionsRequest();
  if (req.method !== 'POST') return createResponse({ error: 'Method Not Allowed' }, 405);

  try {
    const params: BusinessSearchParams = await req.json();
    
    if (!params.latitude || !params.longitude) {
      return createResponse({ error: 'Latitude and longitude are required' }, 400);
    }

    const {
      latitude,
      longitude,
      radius_km = 5,
      category_id,
      business_type,
      search_query,
      limit = 20,
      offset = 0,
      min_rating = 0,
      is_open_now = false,
      has_delivery = false
    } = params;

    // Build the query with PostGIS spatial functions
    let query = supabaseServiceRole
      .from('businesses')
      .select(`
        id,
        business_name,
        logo_url,
        banner_url,
        description,
        address_line1,
        city,
        state,
        latitude,
        longitude,
        contact_phone,
        operating_hours,
        delivery_radius_km,
        min_order_value,
        delivery_charge,
        business_type,
        specialized_categories,
        avg_rating,
        total_reviews,
        created_at
      `)
      .eq('is_approved', true)
      .eq('status', 'active');

    // Add distance filter using PostGIS
    // ST_DWithin uses meters, so convert km to meters
    const radiusMeters = radius_km * 1000;
    query = query.filter(
      'geojson_point',
      'st_dwithin',
      `POINT(${longitude} ${latitude})::geography,${radiusMeters}`
    );

    // Add business type filter
    if (business_type) {
      query = query.eq('business_type', business_type);
    }

    // Add category filter
    if (category_id) {
      query = query.contains('specialized_categories', [category_id]);
    }

    // Add rating filter
    if (min_rating > 0) {
      query = query.gte('avg_rating', min_rating);
    }

    // Add delivery filter
    if (has_delivery) {
      query = query.not('delivery_radius_km', 'is', null);
    }

    // Add text search
    if (search_query) {
      query = query.or(`business_name.ilike.%${search_query}%,description.ilike.%${search_query}%`);
    }

    // Execute query with pagination
    const { data: businesses, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) {
      console.error('Error fetching businesses:', error);
      return createResponse({ error: 'Failed to fetch businesses' }, 500);
    }

    // Calculate distances and filter by current time if is_open_now is true
    const businessesWithDistance = businesses?.map(business => {
      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        latitude,
        longitude,
        business.latitude,
        business.longitude
      );

      // Check if business is currently open
      let isCurrentlyOpen = false;
      if (is_open_now && business.operating_hours) {
        isCurrentlyOpen = checkIfBusinessIsOpen(business.operating_hours);
      }

      return {
        ...business,
        distance_km: distance,
        is_currently_open: isCurrentlyOpen
      };
    }) || [];

    // Filter by open status if requested
    const filteredBusinesses = is_open_now 
      ? businessesWithDistance.filter(b => b.is_currently_open)
      : businessesWithDistance;

    // Sort by distance
    filteredBusinesses.sort((a, b) => a.distance_km - b.distance_km);

    return createResponse({
      businesses: filteredBusinesses,
      total_count: count || 0,
      radius_km,
      center_location: { latitude, longitude }
    }, 200);

  } catch (error: any) {
    console.error('Business Discovery error:', error.message);
    return createResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Helper function to check if business is currently open
function checkIfBusinessIsOpen(operatingHours: any): boolean {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  const daySchedule = operatingHours[currentDay];
  if (!daySchedule || daySchedule.is_closed) {
    return false;
  }

  const { open, close } = daySchedule;
  return currentTime >= open && currentTime <= close;
}
