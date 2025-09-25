export interface AIRecommendation {
  businessId: string;
  score: number;
  reason: string;
  confidence: number;
  relevantFeatures: string[];
}

export interface AIInsight {
  type: 'preference' | 'trend' | 'suggestion';
  description: string;
  actionable: boolean;
  action?: {
    type: string;
    label: string;
    data: any;
  };
}

export interface AIPersonalization {
  greeting: string;
  recommendations: AIRecommendation[];
  insights: AIInsight[];
  contextualSuggestions: {
    timeOfDay: string;
    weather?: string;
    events?: string[];
    specialOffers?: {
      businessId: string;
      offer: string;
      expiresAt: string;
    }[];
  };
}

export interface AIFeedback {
  recommendationId: string;
  userId: string;
  action: 'click' | 'order' | 'dismiss' | 'save';
  timestamp: string;
  context?: Record<string, any>;
}
