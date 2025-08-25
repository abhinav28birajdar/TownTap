// FILE: supabase/functions/ai-assistant/index.ts
// PURPOSE: AI-powered customer assistant and business content generation using OpenAI/Gemini

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createResponse, handleOptionsRequest, supabaseServiceRole } from '../_shared/supabaseClient.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;

interface AIRequest {
  user_id: string;
  feature_type: 'customer_ai' | 'content_gen' | 'insights_gen' | 'interaction_suggest';
  prompt: string;
  context?: any;
  language?: 'en' | 'hi';
  business_id?: string;
}

interface ContentGenerationRequest extends AIRequest {
  content_type: 'PROMOTIONAL_CAPTION' | 'OFFER_HEADLINE' | 'PRODUCT_DESCRIPTION' | 'RESPONSE_TEMPLATE';
  platform: 'INSTAGRAM' | 'WHATSAPP' | 'FACEBOOK' | 'WEBSITE' | 'EMAIL' | 'SMS';
  tone: 'FESTIVE' | 'FORMAL' | 'CASUAL' | 'URGENT' | 'EMPATHETIC' | 'PROFESSIONAL' | 'CONVERSATIONAL';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptionsRequest();

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    if (path === '/customer-chat' && req.method === 'POST') {
      return await handleCustomerChat(req);
    } else if (path === '/generate-content' && req.method === 'POST') {
      return await generateBusinessContent(req);
    } else if (path === '/generate-insights' && req.method === 'POST') {
      return await generateBusinessInsights(req);
    } else if (path === '/suggest-response' && req.method === 'POST') {
      return await suggestBusinessResponse(req);
    } else {
      return createResponse({ error: 'Route not found' }, 404);
    }
  } catch (error: any) {
    console.error('AI Assistant error:', error.message);
    return createResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
});

async function handleCustomerChat(req: Request) {
  const data: AIRequest = await req.json();
  
  if (!data.user_id || !data.prompt) {
    return createResponse({ error: 'User ID and prompt are required' }, 400);
  }

  try {
    // Get user location and preferences for context
    const { data: userProfile } = await supabaseServiceRole
      .from('profiles')
      .select('*')
      .eq('id', data.user_id)
      .single();

    // Get nearby businesses for recommendations
    const { data: nearbyBusinesses } = await supabaseServiceRole
      .from('businesses')
      .select(`
        id, business_name, description, business_type, 
        specialized_categories, avg_rating, delivery_charge
      `)
      .eq('is_approved', true)
      .eq('status', 'active')
      .limit(10);

    // Construct AI prompt with context
    const systemPrompt = `You are TownTap AI Assistant, helping customers discover local businesses and services. 
    
User Context:
- User Language: ${data.language || 'en'}
- Location: User is looking for local services

Available Businesses:
${nearbyBusinesses?.map(b => `- ${b.business_name}: ${b.description} (Rating: ${b.avg_rating}/5)`).join('\n') || 'No businesses available'}

Instructions:
1. Be helpful and conversational
2. Recommend relevant businesses based on user queries
3. Provide specific details about services/products
4. Ask clarifying questions when needed
5. Respond in ${data.language === 'hi' ? 'Hindi and English mix (Hinglish)' : 'English'}
6. Keep responses concise but informative`;

    const response = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: data.prompt }
    ]);

    // Log AI interaction
    await logAIInteraction(data.user_id, 'customer_ai', data.prompt, response, {
      language: data.language,
      businesses_count: nearbyBusinesses?.length || 0
    });

    // Extract business recommendations from response
    const recommendedBusinesses = nearbyBusinesses?.filter(business => 
      response.toLowerCase().includes(business.business_name.toLowerCase())
    ) || [];

    return createResponse({
      response,
      recommended_businesses: recommendedBusinesses,
      conversation_id: `chat_${data.user_id}_${Date.now()}`
    }, 200);

  } catch (error: any) {
    console.error('Customer chat error:', error);
    return createResponse({ error: 'Failed to process chat request' }, 500);
  }
}

async function generateBusinessContent(req: Request) {
  const data: ContentGenerationRequest = await req.json();
  
  if (!data.business_id || !data.content_type || !data.platform || !data.tone) {
    return createResponse({ error: 'Business ID, content type, platform, and tone are required' }, 400);
  }

  try {
    // Get business details for context
    const { data: business } = await supabaseServiceRole
      .from('businesses')
      .select(`
        business_name, description, business_type, specialized_categories,
        avg_rating, total_reviews
      `)
      .eq('id', data.business_id)
      .single();

    if (!business) {
      return createResponse({ error: 'Business not found' }, 404);
    }

    // Get recent products/services for content inspiration
    const { data: products } = await supabaseServiceRole
      .from('products')
      .select('name, description, price')
      .eq('business_id', data.business_id)
      .eq('is_available', true)
      .limit(5);

    const { data: services } = await supabaseServiceRole
      .from('services')
      .select('name, description, base_price')
      .eq('business_id', data.business_id)
      .eq('is_available', true)
      .limit(5);

    // Construct content generation prompt
    const contentPrompts = {
      PROMOTIONAL_CAPTION: `Create an engaging ${data.tone.toLowerCase()} promotional caption for ${data.platform} for ${business.business_name}. 
        Business: ${business.description}
        Products/Services: ${[...products || [], ...services || []].map(item => item.name).join(', ')}
        Rating: ${business.avg_rating}/5 (${business.total_reviews} reviews)
        
        Requirements:
        - ${data.platform} format and best practices
        - ${data.tone.toLowerCase()} tone
        - Include relevant hashtags
        - Call-to-action
        - ${data.language === 'hi' ? 'Mix of Hindi and English' : 'English only'}`,
        
      OFFER_HEADLINE: `Create a compelling offer headline for ${business.business_name}.
        Business Type: ${business.business_type}
        Tone: ${data.tone.toLowerCase()}
        Platform: ${data.platform}
        
        Make it attention-grabbing and relevant to ${business.specialized_categories?.join(', ')} business.`,
        
      PRODUCT_DESCRIPTION: `Write detailed product descriptions for ${business.business_name}.
        Products: ${products?.map(p => `${p.name} - ₹${p.price}`).join('\n') || 'No products available'}
        
        Requirements:
        - Highlight key features and benefits
        - Include pricing information
        - ${data.tone.toLowerCase()} tone
        - Optimized for ${data.platform}`,
        
      RESPONSE_TEMPLATE: `Create professional response templates for ${business.business_name} customer inquiries.
        Business: ${business.description}
        
        Create templates for:
        - Order confirmations
        - Service booking confirmations
        - Inquiry responses
        - Complaint handling
        
        Tone: ${data.tone.toLowerCase()}`
    };

    const prompt = contentPrompts[data.content_type] || data.prompt;
    const response = await callOpenAI([
      { role: 'system', content: 'You are a professional marketing content creator specialized in local businesses.' },
      { role: 'user', content: prompt }
    ]);

    // Save generated content to library
    const { data: savedContent } = await supabaseServiceRole
      .from('ai_content_library')
      .insert({
        business_id: data.business_id,
        content_type: data.content_type,
        platform: data.platform,
        tone: data.tone,
        language: data.language || 'en',
        generated_text: response,
      })
      .select()
      .single();

    // Log AI interaction
    await logAIInteraction(data.user_id, 'content_gen', prompt, response, {
      business_id: data.business_id,
      content_type: data.content_type,
      platform: data.platform,
      tone: data.tone
    });

    return createResponse({
      generated_content: response,
      content_id: savedContent?.id,
      business_name: business.business_name
    }, 200);

  } catch (error: any) {
    console.error('Content generation error:', error);
    return createResponse({ error: 'Failed to generate content' }, 500);
  }
}

async function generateBusinessInsights(req: Request) {
  const data: AIRequest = await req.json();
  
  if (!data.business_id) {
    return createResponse({ error: 'Business ID is required' }, 400);
  }

  try {
    // Get business analytics data
    const { data: metrics } = await supabaseServiceRole
      .from('business_analytics_metrics')
      .select('*')
      .eq('business_id', data.business_id)
      .order('date_period', { ascending: false })
      .limit(30); // Last 30 days

    // Get recent orders and reviews for analysis
    const { data: recentOrders } = await supabaseServiceRole
      .from('orders')
      .select('total_amount, order_status, created_at')
      .eq('business_id', data.business_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    const { data: recentReviews } = await supabaseServiceRole
      .from('reviews')
      .select('rating, comment, created_at')
      .eq('business_id', data.business_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    // Prepare data summary for AI
    const dataSum = {
      total_revenue: metrics?.reduce((sum, m) => sum + m.total_revenue, 0) || 0,
      total_orders: recentOrders?.length || 0,
      avg_rating: recentReviews?.reduce((sum, r) => sum + r.rating, 0) / (recentReviews?.length || 1),
      completion_rate: recentOrders?.filter(o => o.order_status === 'completed').length / (recentOrders?.length || 1),
    };

    const prompt = `Analyze this business performance data and provide actionable insights:

Business Performance (Last 30 days):
- Total Revenue: ₹${dataSum.total_revenue}
- Total Orders: ${dataSum.total_orders}
- Average Rating: ${dataSum.avg_rating.toFixed(1)}/5
- Order Completion Rate: ${(dataSum.completion_rate * 100).toFixed(1)}%

Recent Reviews Summary:
${recentReviews?.slice(0, 5).map(r => `- ${r.rating}/5: ${r.comment?.substring(0, 100) || 'No comment'}`).join('\n') || 'No recent reviews'}

Provide:
1. Performance summary (2-3 sentences)
2. Top 3 strengths
3. Top 3 areas for improvement
4. 5 specific actionable recommendations
5. Predicted trends for next month

Format as structured JSON with clear sections.`;

    const response = await callOpenAI([
      { role: 'system', content: 'You are a business analytics expert providing insights to local business owners.' },
      { role: 'user', content: prompt }
    ]);

    // Log AI interaction
    await logAIInteraction(data.user_id, 'insights_gen', prompt, response, {
      business_id: data.business_id,
      metrics_count: metrics?.length || 0,
      orders_analyzed: recentOrders?.length || 0
    });

    return createResponse({
      insights: response,
      data_period: '30 days',
      generated_at: new Date().toISOString()
    }, 200);

  } catch (error: any) {
    console.error('Insights generation error:', error);
    return createResponse({ error: 'Failed to generate insights' }, 500);
  }
}

async function suggestBusinessResponse(req: Request) {
  const { business_id, customer_message, context_type, user_id } = await req.json();
  
  if (!business_id || !customer_message) {
    return createResponse({ error: 'Business ID and customer message are required' }, 400);
  }

  try {
    // Get business details
    const { data: business } = await supabaseServiceRole
      .from('businesses')
      .select('business_name, description, business_type')
      .eq('id', business_id)
      .single();

    const prompt = `Suggest a professional response for this customer message:

Business: ${business?.business_name}
Business Type: ${business?.business_type}
Context: ${context_type || 'general inquiry'}

Customer Message: "${customer_message}"

Requirements:
- Professional and friendly tone
- Address customer concerns specifically
- Include next steps or call-to-action
- Keep response concise but helpful
- Maintain brand voice for a ${business?.business_type} business

Provide 2-3 response options with different tones (formal, casual, empathetic).`;

    const response = await callOpenAI([
      { role: 'system', content: 'You are a customer service expert helping businesses respond to customer inquiries professionally.' },
      { role: 'user', content: prompt }
    ]);

    // Log AI interaction
    await logAIInteraction(user_id, 'interaction_suggest', prompt, response, {
      business_id,
      context_type,
      message_length: customer_message.length
    });

    return createResponse({
      suggested_responses: response,
      business_name: business?.business_name
    }, 200);

  } catch (error: any) {
    console.error('Response suggestion error:', error);
    return createResponse({ error: 'Failed to suggest response' }, 500);
  }
}

async function callOpenAI(messages: any[], model: string = 'gpt-3.5-turbo'): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response generated';
}

async function logAIInteraction(profileId: string, featureType: string, prompt: string, response: string, metadata: any) {
  try {
    await supabaseServiceRole
      .from('ai_prompts_history')
      .insert({
        profile_id: profileId,
        feature_type: featureType,
        input_prompt: prompt,
        ai_response: response,
        meta_data: metadata,
        cost: 0.01, // Estimated cost - should be calculated based on tokens
      });
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
  }
}
