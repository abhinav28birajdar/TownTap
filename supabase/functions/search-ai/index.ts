// =====================================================
// AI-POWERED SEARCH & DISCOVERY EDGE FUNCTION
// =====================================================
// Handles intelligent business and product search with NLP

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchRequest {
  query: string
  location: {
    latitude: number
    longitude: number
  }
  filters?: {
    category?: string
    business_type?: string
    max_distance?: number
    price_range?: [number, number]
    rating_min?: number
  }
  user_preferences?: {
    dietary_preferences?: string[]
    interests?: string[]
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { query, location, filters, user_preferences }: SearchRequest = await req.json()

    // AI-enhanced query processing
    const processedQuery = await enhanceSearchQuery(query, user_preferences)
    
    // Build search parameters
    let searchQuery = supabase
      .rpc('get_nearby_businesses', {
        user_lat: location.latitude,
        user_lon: location.longitude,
        radius_km: filters?.max_distance || 20
      })

    // Apply filters
    if (filters?.category) {
      searchQuery = searchQuery.eq('category', filters.category)
    }
    
    if (filters?.business_type) {
      searchQuery = searchQuery.eq('business_type', filters.business_type)
    }

    if (filters?.rating_min) {
      searchQuery = searchQuery.gte('rating', filters.rating_min)
    }

    // Execute search
    const { data: businesses, error } = await searchQuery

    if (error) throw error

    // AI scoring and ranking
    const rankedResults = await rankSearchResults(businesses, processedQuery, user_preferences)

    // Get related products if applicable
    const businessIds = rankedResults.slice(0, 10).map(b => b.id)
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('business_id', businessIds)
      .eq('is_active', true)
      .textSearch('name', processedQuery.keywords.join(' | '))

    return new Response(
      JSON.stringify({
        success: true,
        results: {
          businesses: rankedResults,
          products: products || [],
          query_insights: processedQuery.insights,
          total_count: rankedResults.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'SEARCH_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function enhanceSearchQuery(query: string, preferences?: any) {
  // Simple NLP processing - in production, use Google Gemini or OpenAI
  const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2)
  
  // Category mapping
  const categoryMap: Record<string, string> = {
    'food': 'grocery-food',
    'medicine': 'pharmacy-health',
    'mobile': 'electronics-mobile',
    'clothes': 'fashion-apparel',
    'plumber': 'home-services',
    'salon': 'beauty-wellness',
    'mechanic': 'automotive',
    'gym': 'fitness-sports'
  }

  let detectedCategory = null
  for (const keyword of keywords) {
    if (categoryMap[keyword]) {
      detectedCategory = categoryMap[keyword]
      break
    }
  }

  return {
    original: query,
    keywords,
    category: detectedCategory,
    insights: {
      detected_intent: detectedCategory ? 'category_search' : 'general_search',
      suggested_filters: detectedCategory ? [detectedCategory] : []
    }
  }
}

async function rankSearchResults(businesses: any[], processedQuery: any, preferences?: any) {
  return businesses.map(business => {
    let relevanceScore = 0

    // Distance scoring (closer = higher score)
    const distanceScore = Math.max(0, 100 - (business.distance_km * 5))
    relevanceScore += distanceScore * 0.3

    // Rating scoring
    const ratingScore = (business.rating / 5) * 100
    relevanceScore += ratingScore * 0.25

    // Text relevance (simple keyword matching)
    const nameRelevance = processedQuery.keywords.some((keyword: string) => 
      business.name.toLowerCase().includes(keyword)
    ) ? 50 : 0
    relevanceScore += nameRelevance * 0.2

    // Category match bonus
    if (processedQuery.category && business.category === processedQuery.category) {
      relevanceScore += 25
    }

    // Preference matching
    if (preferences?.interests) {
      const interestMatch = preferences.interests.some((interest: string) => 
        business.category?.includes(interest)
      )
      if (interestMatch) relevanceScore += 15
    }

    // Business quality indicators
    if (business.is_verified) relevanceScore += 10
    if (business.total_reviews > 10) relevanceScore += 5

    return {
      ...business,
      relevance_score: Math.round(relevanceScore),
      match_reasons: getMatchReasons(business, processedQuery, relevanceScore)
    }
  }).sort((a, b) => b.relevance_score - a.relevance_score)
}

function getMatchReasons(business: any, processedQuery: any, score: number) {
  const reasons = []
  
  if (business.distance_km < 2) reasons.push('Very close to you')
  if (business.rating >= 4.5) reasons.push('Highly rated')
  if (business.is_verified) reasons.push('Verified business')
  if (processedQuery.category && business.category === processedQuery.category) {
    reasons.push('Exact category match')
  }
  
  return reasons
}
