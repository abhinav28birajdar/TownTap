// @deno-types="npm:@types/node"
// FILE: supabase/functions/_shared/aiClient.ts
// @ts-nocheck - Deno runtime environment
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
const GEMINI_VISION_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export async function generateGeminiContent(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content.parts[0]?.text || '';
  } catch (error) {
    console.error('Error generating Gemini content:', error);
    throw error;
  }
}

export function _constructAiPrompt(basePrompt: string, context: Record<string, any>): string {
  const contextStr = Object.entries(context)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');

  return `${basePrompt}\n\nContext:\n${contextStr}`;
}

// Helper to format personalized greetings based on context
export function generatePersonalizedGreeting(userName: string | undefined, context: {
  timeOfDay?: string;
  lastVisit?: string;
  previousOrders?: number;
}): Promise<string> {
  const basePrompt = `Generate a warm, personalized greeting for our user. Make it friendly but professional.`;
  
  const promptContext = {
    userName: userName || 'there',
    timeOfDay: context.timeOfDay || 'day',
    lastVisit: context.lastVisit ? new Date(context.lastVisit).toLocaleDateString() : undefined,
    previousOrders: context.previousOrders || 0
  };

  const fullPrompt = _constructAiPrompt(basePrompt, promptContext);
  return generateGeminiContent(fullPrompt);
}

// Helper to generate business recommendations based on user context
export function generateBusinessRecommendations(businesses: any[], context: {
  location: { latitude: number; longitude: number };
  previousOrders?: string[];
  timeOfDay?: string;
  dayOfWeek?: string;
}): Promise<string> {
  const basePrompt = `Based on the user's context and available businesses, provide personalized recommendations. 
  Explain why each business might be relevant to the user.`;

  const promptContext = {
    userContext: context,
    availableBusinesses: businesses.map(b => ({
      id: b.id,
      name: b.business_name,
      category: b.category,
      rating: b.rating,
      distance: b.distance_km
    }))
  };

  const fullPrompt = _constructAiPrompt(basePrompt, promptContext);
  return generateGeminiContent(fullPrompt);
}
