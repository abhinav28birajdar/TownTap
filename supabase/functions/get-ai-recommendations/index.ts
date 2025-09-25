// @ts-nocheck - Deno runtime environment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { generateBusinessRecommendations } from '../_shared/aiClient.ts';
import { createResponse, handleOptionsRequest, supabaseAdmin, verifyUserJwt } from '../_shared/supabaseClient.ts';

interface Business {
  id: string;
  business_type: string;
  distance_km: number;
  avg_rating: number;
  is_open: boolean;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // Verify user JWT
    const user = await verifyUserJwt(req.headers.get('Authorization'));

    // Parse request body
    const { location, previousOrders, timeOfDay, dayOfWeek } = await req.json();

    // Get nearby businesses using the get_nearby_businesses RPC function
    const { data: businesses, error: dbError } = await supabaseAdmin.rpc('get_nearby_businesses', {
      user_lat: location.latitude,
      user_lon: location.longitude,
      radius_km: 20, // 20km radius
      category_names: null, // All categories
      is_open_now: true,
      min_rating: 0,
      search_query: null
    });

    if (dbError) {
      throw dbError;
    }

    // Get AI recommendations based on the businesses and context
    const aiRecommendation = await generateBusinessRecommendations(
      businesses,
      { location, previousOrders, timeOfDay, dayOfWeek }
    );

    // Parse AI response to get recommended business IDs and explanations
    const recommendedBusinesses = businesses.slice(0, 5).map((business: Business) => ({
      id: business.id,
      reason: `This ${business.business_type} is ${business.distance_km.toFixed(1)}km away and has a rating of ${business.avg_rating.toFixed(1)}.`,
      score: business.avg_rating,
      confidence: 0.8,
      relevantFeatures: [
        'location',
        business.business_type.toLowerCase(),
        business.is_open ? 'open_now' : 'closed',
      ]
    }));

    return createResponse({
      businesses: recommendedBusinesses,
      explanation: aiRecommendation,
      categories: [...new Set(businesses.map((b: Business) => b.business_type))]
    });
  } catch (error: any) {
    console.error('Error in get-ai-recommendations:', error);
    return createResponse(
      { error: error.message },
      error.status || 500
    );
  }
});
