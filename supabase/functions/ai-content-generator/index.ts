// =====================================================
// AI CONTENT GENERATOR EDGE FUNCTION
// =====================================================
// Generates AI-powered content for businesses using Google Gemini

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentGenerationRequest {
  business_id: string
  content_type: 'product_description' | 'social_media' | 'email_campaign' | 'sms_campaign' | 'notification' | 'review_response'
  context: {
    product_name?: string
    business_name?: string
    business_type?: string
    target_audience?: string
    tone?: 'professional' | 'friendly' | 'casual' | 'formal' | 'promotional'
    language?: 'en' | 'hi'
    additional_context?: string
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

    const { business_id, content_type, context }: ContentGenerationRequest = await req.json()

    // Get business details
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single()

    if (businessError || !business) {
      throw new Error('Business not found')
    }

    // Generate content using AI
    const generatedContent = await generateAIContent(content_type, context, business)

    // Save to content library
    const { data: savedContent, error: saveError } = await supabase
      .from('ai_content_library')
      .insert({
        business_id,
        title: generatedContent.title,
        content: generatedContent.content,
        content_type,
        tone: context.tone || 'professional',
        language: context.language || 'en',
        ai_model: 'gemini-pro',
        prompt_used: generatedContent.prompt,
        tokens_used: generatedContent.tokens_used
      })
      .select()
      .single()

    if (saveError) throw saveError

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          content: generatedContent,
          saved_id: savedContent.id
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
        code: 'AI_GENERATION_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function generateAIContent(contentType: string, context: any, business: any) {
  const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY')
  
  if (!geminiApiKey) {
    throw new Error('Google Gemini API key not configured')
  }

  const prompt = buildPrompt(contentType, context, business)
  
  // Call Google Gemini API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      }
    })
  })

  if (!response.ok) {
    throw new Error('Failed to generate AI content')
  }

  const data = await response.json()
  const generatedText = data.candidates[0]?.content?.parts[0]?.text

  if (!generatedText) {
    throw new Error('No content generated')
  }

  // Parse the response based on content type
  const parsedContent = parseAIResponse(generatedText, contentType)

  return {
    ...parsedContent,
    prompt,
    tokens_used: estimateTokens(prompt + generatedText)
  }
}

function buildPrompt(contentType: string, context: any, business: any) {
  const businessInfo = `Business: ${business.name} (${business.business_type})
Location: ${business.city}, ${business.state}
Category: ${business.category}
Description: ${business.description || 'N/A'}`

  const tone = context.tone || 'professional'
  const language = context.language || 'en'
  
  const languageInstruction = language === 'hi' 
    ? 'Write in Hindi (Devanagari script). Use simple, clear Hindi that local customers can easily understand.'
    : 'Write in English. Use clear, engaging language suitable for Indian customers.'

  switch (contentType) {
    case 'product_description':
      return `${languageInstruction}

${businessInfo}

Create an engaging product description for: ${context.product_name}

Requirements:
- Tone: ${tone}
- Length: 100-150 words
- Include key features and benefits
- Use persuasive language that encourages purchase
- Include call-to-action
- Make it SEO-friendly

Format your response as:
TITLE: [Product title]
DESCRIPTION: [Product description]
TAGS: [Relevant keywords separated by commas]`

    case 'social_media':
      return `${languageInstruction}

${businessInfo}

Create a social media post for this business.

Context: ${context.additional_context || 'General business promotion'}

Requirements:
- Tone: ${tone}
- Platform: Instagram/Facebook
- Include relevant hashtags
- Engaging and shareable content
- Call-to-action
- Length: 50-100 words

Format your response as:
POST: [Social media post content]
HASHTAGS: [Relevant hashtags]
CTA: [Call to action]`

    case 'email_campaign':
      return `${languageInstruction}

${businessInfo}

Create an email marketing campaign for this business.

Target Audience: ${context.target_audience || 'Local customers'}
Context: ${context.additional_context || 'General promotion'}

Requirements:
- Tone: ${tone}
- Include subject line
- Personalized greeting
- Clear value proposition
- Call-to-action
- Professional format

Format your response as:
SUBJECT: [Email subject line]
GREETING: [Personalized greeting]
BODY: [Email body content]
CTA: [Call to action button text]`

    case 'sms_campaign':
      return `${languageInstruction}

${businessInfo}

Create an SMS marketing message for this business.

Context: ${context.additional_context || 'General promotion'}

Requirements:
- Tone: ${tone}
- Maximum 160 characters
- Include business name
- Clear offer or message
- Call-to-action
- Sense of urgency

Format your response as:
SMS: [SMS content within 160 characters]`

    case 'notification':
      return `${languageInstruction}

${businessInfo}

Create a push notification for this business.

Context: ${context.additional_context || 'General update'}

Requirements:
- Tone: ${tone}
- Title: Maximum 50 characters
- Message: Maximum 100 characters
- Clear and actionable
- Engaging

Format your response as:
TITLE: [Notification title]
MESSAGE: [Notification message]`

    case 'review_response':
      return `${languageInstruction}

${businessInfo}

Create a professional response to a customer review.

Review Context: ${context.additional_context || 'General review'}

Requirements:
- Tone: ${tone} and grateful
- Thank the customer
- Address any concerns mentioned
- Invite them back
- Professional and empathetic
- Maximum 200 words

Format your response as:
RESPONSE: [Review response]`

    default:
      throw new Error('Invalid content type')
  }
}

function parseAIResponse(response: string, contentType: string) {
  const lines = response.split('\n').filter(line => line.trim())
  const result: any = {}

  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':').trim()
      
      switch (key.trim().toUpperCase()) {
        case 'TITLE':
          result.title = value
          break
        case 'DESCRIPTION':
        case 'POST':
        case 'BODY':
        case 'SMS':
        case 'RESPONSE':
          result.content = value
          break
        case 'TAGS':
        case 'HASHTAGS':
          result.tags = value.split(',').map(tag => tag.trim())
          break
        case 'CTA':
          result.call_to_action = value
          break
        case 'SUBJECT':
          result.subject = value
          break
        case 'GREETING':
          result.greeting = value
          break
        case 'MESSAGE':
          result.message = value
          break
      }
    }
  }

  // Fallback if parsing fails
  if (!result.content && !result.title) {
    result.content = response
    result.title = `AI Generated ${contentType.replace('_', ' ')}`
  }

  return result
}

function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English, 6 for Hindi
  const avgCharsPerToken = text.includes('।') || text.includes('है') ? 6 : 4
  return Math.ceil(text.length / avgCharsPerToken)
}
