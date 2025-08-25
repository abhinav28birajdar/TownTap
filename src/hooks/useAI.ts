import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

type AIContentType = 
  | 'product_description'
  | 'promotional_caption'
  | 'business_bio'
  | 'customer_response'
  | 'social_media_post'
  | 'email_template'
  | 'offer_announcement';

type ContentGeneratorResult = {
  content: string;
  alternative?: string;
  tags?: string[];
  metadata?: any;
};

type CustomerInteractionResult = {
  suggestedReply: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestedActions?: string[];
  customerIntent?: string;
};

type PerformanceInsightResult = {
  summary: string;
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    customerRetentionRate: number;
    [key: string]: number;
  };
  trends: {
    [key: string]: 'increasing' | 'decreasing' | 'stable';
  };
  suggestions: string[];
};

export function useAIContentGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async (
    businessId: string,
    type: AIContentType,
    prompt: string,
    options?: {
      tone?: 'professional' | 'casual' | 'friendly';
      language?: string;
      maxLength?: number;
      platform?: string;
    }
  ): Promise<ContentGeneratorResult | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke(
        'ai-content-generator',
        {
          body: {
            businessId,
            type,
            prompt,
            options,
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      // Log to AI content history
      await supabase.from('ai_content_history').insert({
        business_id: businessId,
        content_type: type,
        prompt,
        generated_content: data.content,
        platform: options?.platform,
      });

      return data;
    } catch (err: any) {
      console.error('Error generating AI content:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generateContent, isLoading, error };
}

export function useAICustomerInteraction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInteractionSuggestion = useCallback(async (
    businessId: string,
    context: {
      customerQuery: string;
      previousMessages?: string[];
      customerProfile?: any;
      orderHistory?: any;
    },
    options?: {
      language?: string;
      responseType?: 'quick' | 'detailed';
    }
  ): Promise<CustomerInteractionResult | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke(
        'ai-customer-interaction',
        {
          body: {
            businessId,
            context,
            options,
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      return data;
    } catch (err: any) {
      console.error('Error getting AI interaction suggestion:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getInteractionSuggestion, isLoading, error };
}

export function useAIPerformanceInsights() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPerformanceSummary = useCallback(async (
    businessId: string,
    options?: {
      period?: 'day' | 'week' | 'month' | 'year';
      metrics?: string[];
      language?: string;
    }
  ): Promise<PerformanceInsightResult | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke(
        'get-performance-summary',
        {
          body: {
            businessId,
            options,
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      return data;
    } catch (err: any) {
      console.error('Error getting AI performance insights:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getPerformanceSummary, isLoading, error };
}

export function useAICustomerAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAssistantResponse = useCallback(async (
    query: string,
    context?: {
      location?: { latitude: number; longitude: number };
      preferences?: string[];
      language?: string;
    }
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke(
        'ai-customer-assistant',
        {
          body: {
            query,
            context,
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      return data;
    } catch (err: any) {
      console.error('Error getting AI assistant response:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getAssistantResponse, isLoading, error };
}

export function useAIImageAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (
    imageUrl: string,
    analysisType: 'product' | 'business' | 'document' | 'receipt',
    options?: {
      language?: string;
      additionalContext?: string;
    }
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke(
        'ai-image-analysis',
        {
          body: {
            imageUrl,
            analysisType,
            options,
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      return data;
    } catch (err: any) {
      console.error('Error analyzing image with AI:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analyzeImage, isLoading, error };
}
