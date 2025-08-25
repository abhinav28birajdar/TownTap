import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Business } from '../types';

type RecommendationContext = {
  location: {
    latitude: number;
    longitude: number;
  };
  previousOrders?: string[];
  preferences?: string[];
  timeOfDay?: string;
  dayOfWeek?: string;
};

type RecommendationResult = {
  businesses: Business[];
  explanation: string;
  categories: string[];
};

export function useAIRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (
    context: RecommendationContext
  ): Promise<RecommendationResult | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke(
        'get-ai-recommendations',
        {
          body: {
            ...context,
            timestamp: new Date().toISOString(),
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      return data;
    } catch (err: any) {
      console.error('Error getting AI recommendations:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPersonalizedGreeting = useCallback(async (
    userName?: string,
    context?: {
      timeOfDay?: string;
      lastVisit?: Date;
      previousOrders?: number;
    }
  ): Promise<string> => {
    try {
      setIsLoading(true);

      const { data, error: functionError } = await supabase.functions.invoke(
        'get-personalized-greeting',
        {
          body: {
            userName,
            context: {
              timeOfDay: context?.timeOfDay || getTimeOfDay(),
              lastVisit: context?.lastVisit?.toISOString(),
              previousOrders: context?.previousOrders || 0,
            },
          },
        }
      );

      if (functionError) {
        throw functionError;
      }

      return data.greeting;
    } catch (err) {
      console.error('Error getting personalized greeting:', err);
      // Return a default greeting on error
      return `Hello${userName ? `, ${userName}` : ''}!`;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return {
    getRecommendations,
    getPersonalizedGreeting,
    isLoading,
    error,
  };
}
