import { supabase } from '../lib/supabase';
import {
    AIContentType,
    AIPlatform,
    AIResponse,
    AITone,
    AppLanguage,
    BusinessContext,
    CustomerContext
} from '../types';

// For development, we'll use mock responses
const SUPABASE_CONFIGURED = false; // Set to true when Supabase is properly configured

// Mock AI responses for development when Supabase is not configured
const mockAIResponses: Record<AIContentType, string[]> = {
  PROMOTIONAL_CAPTION: [
    "🎉 Special offer just for you! Get 20% off on all items today. Fresh, delicious, and delivered to your doorstep! #TownTapDeals",
    "✨ Experience the best in town! Premium quality, unbeatable prices. Order now and taste the difference! 🚀",
    "🔥 Limited time offer! Free delivery on orders above ₹299. Don't miss out on this amazing deal! 🛍️"
  ],
  OFFER_HEADLINE: [
    "Flash Sale: 50% Off Everything!",
    "Buy 2 Get 1 Free - Limited Time Only!",
    "Free Delivery This Weekend - Order Now!"
  ],
  PRODUCT_DESCRIPTION: [
    "Premium quality product made with finest ingredients. Perfect for your daily needs with guaranteed freshness and satisfaction.",
    "Expertly crafted with attention to detail. This product combines traditional methods with modern quality standards.",
    "High-quality, affordable solution that delivers exceptional value. Trusted by thousands of satisfied customers."
  ],
  RESPONSE_TEMPLATE: [
    "Thank you for your order! We're preparing it with care and will deliver it fresh to your doorstep.",
    "Your message is important to us. We'll get back to you within 24 hours with a detailed response.",
    "We appreciate your business! Your order is confirmed and will be ready for pickup/delivery shortly."
  ],
  REMINDER_MESSAGE: [
    "Friendly reminder: Your order is ready for pickup! Please collect it at your convenience.",
    "Don't forget - you have items in your cart waiting for you. Complete your order now!",
    "It's been a while! We miss you. Check out our new arrivals and special offers."
  ],
  PERFORMANCE_SUMMARY: [
    "Great month! Your sales increased by 15% with 89% customer satisfaction. Top-selling items include fresh produce and dairy products.",
    "Excellent performance! Customer ratings improved to 4.8/5. Consider expanding your popular categories for even better results.",
    "Strong growth trend! New customer acquisition up 22%. Your prompt delivery service is highly appreciated by customers."
  ],
  CHAT_RESPONSE: [
    "I'd be happy to help you find the best options in your area! Based on your location, here are some highly-rated businesses nearby.",
    "That's a great question! Let me recommend some popular choices that match your preferences and budget.",
    "I understand your needs. Here are some personalized suggestions that other customers in your area have loved."
  ]
};

interface GenerateContentProps {
  prompt: string;
  contentType: AIContentType;
  platform: AIPlatform;
  tone: AITone;
  language: AppLanguage;
  businessContext?: BusinessContext;
}

interface PerformanceSummaryProps {
  reportPeriod: 'weekly' | 'monthly';
  language: AppLanguage;
  businessId: string;
}

interface AIChatQueryProps {
  query: string;
  latitude: number;
  longitude: number;
  language: AppLanguage;
  customerContext?: CustomerContext;
}

// Helper function to generate mock response
const generateMockResponse = (contentType: AIContentType, tone: AITone, language: AppLanguage): AIResponse => {
  const responses = mockAIResponses[contentType] || ["Sample AI response for your request."];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Simulate processing time
  const processingTime = Math.floor(Math.random() * 2000) + 500;
  
  return {
    content: randomResponse,
    suggestions: [
      "Try adding emojis for better engagement",
      "Consider mentioning specific benefits",
      "Include a call-to-action button"
    ],
    confidence_score: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
    metadata: {
      model_used: 'mock-ai-model',
      processing_time_ms: processingTime,
      tokens_used: Math.floor(randomResponse.length / 4)
    }
  };
};

export const aiService = {
  // Calls Supabase Edge Function to generate marketing content
  generateMarketingContent: async (props: GenerateContentProps): Promise<AIResponse> => {
    const { prompt, contentType, platform, tone, language, businessContext } = props;
    
    if (!SUPABASE_CONFIGURED) {
      console.log('Using mock AI response for development');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return generateMockResponse(contentType, tone, language);
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai_content_generator', {
        body: JSON.stringify({
          prompt,
          contentType,
          platform,
          tone,
          language,
          businessContext
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        console.error('Error generating content:', error);
        throw new Error(error.message);
      }
      
      return data as AIResponse;
    } catch (error) {
      console.error('AI service error:', error);
      // Fallback to mock response
      return generateMockResponse(contentType, tone, language);
    }
  },

  // Calls Supabase Edge Function for performance insights
  getPerformanceSummary: async (props: PerformanceSummaryProps): Promise<AIResponse> => {
    const { reportPeriod, language, businessId } = props;
    
    if (!SUPABASE_CONFIGURED) {
      console.log('Using mock performance summary for development');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      return generateMockResponse('PERFORMANCE_SUMMARY', 'PROFESSIONAL', language);
    }

    try {
      const { data, error } = await supabase.functions.invoke('get_performance_summary', {
        body: JSON.stringify({
          reportPeriod,
          language,
          businessId
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        console.error('Error fetching summary:', error);
        throw new Error(error.message);
      }
      
      return data as AIResponse;
    } catch (error) {
      console.error('Performance summary error:', error);
      // Fallback to mock response
      return generateMockResponse('PERFORMANCE_SUMMARY', 'PROFESSIONAL', language);
    }
  },

  // Calls Supabase Edge Function for customer AI assistant
  askCustomerAI: async (props: AIChatQueryProps): Promise<AIResponse & { suggestedBusinesses?: any[] }> => {
    const { query, latitude, longitude, language, customerContext } = props;
    
    if (!SUPABASE_CONFIGURED) {
      console.log('Using mock AI assistant response for development');
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      const baseResponse = generateMockResponse('CHAT_RESPONSE', 'FRIENDLY', language);
      return {
        ...baseResponse,
        suggestedBusinesses: [
          {
            id: 'mock-business-1',
            business_name: 'Local Grocery Store',
            rating: 4.5,
            distance: 0.8,
            estimated_delivery: '30 mins'
          },
          {
            id: 'mock-business-2',
            business_name: 'Fresh Mart',
            rating: 4.3,
            distance: 1.2,
            estimated_delivery: '45 mins'
          }
        ]
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai_customer_assistant', {
        body: JSON.stringify({
          query,
          latitude,
          longitude,
          language,
          customerContext
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        console.error('Error asking AI assistant:', error);
        throw new Error(error.message);
      }
      
      return data;
    } catch (error) {
      console.error('AI assistant error:', error);
      // Fallback to mock response
      const baseResponse = generateMockResponse('CHAT_RESPONSE', 'FRIENDLY', language);
      return {
        ...baseResponse,
        suggestedBusinesses: []
      };
    }
  },

  // Generate automated business responses
  generateBusinessResponse: async (customerMessage: string, businessContext: BusinessContext, language: AppLanguage): Promise<AIResponse> => {
    if (!SUPABASE_CONFIGURED) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return generateMockResponse('RESPONSE_TEMPLATE', 'PROFESSIONAL', language);
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai_business_response', {
        body: JSON.stringify({
          customerMessage,
          businessContext,
          language
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        console.error('Error generating business response:', error);
        throw new Error(error.message);
      }
      
      return data as AIResponse;
    } catch (error) {
      console.error('Business response generation error:', error);
      return generateMockResponse('RESPONSE_TEMPLATE', 'PROFESSIONAL', language);
    }
  },

  // Generate interaction suggestions for business owners
  getInteractionSuggestions: async (customerQuery: string, businessType: string, language: AppLanguage): Promise<string[]> => {
    if (!SUPABASE_CONFIGURED) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return [
        "Thank you for your inquiry! Let me help you with that.",
        "I'd be happy to provide more details about our services.",
        "Would you like me to check our current availability for you?"
      ];
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai_interaction_suggestions', {
        body: JSON.stringify({
          customerQuery,
          businessType,
          language
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) {
        console.error('Error getting interaction suggestions:', error);
        throw new Error(error.message);
      }
      
      return data.suggestions || [];
    } catch (error) {
      console.error('Interaction suggestions error:', error);
      return [
        "Thank you for contacting us!",
        "How can I assist you today?",
        "Let me help you with your request."
      ];
    }
  }
};

export default aiService;
