import { supabase } from '../lib/supabase';
import {
    Business
} from '../types';

// AI and NLP Service interfaces
export interface SmartSearchQuery {
  query: string;
  location?: { latitude: number; longitude: number; radius?: number };
  filters?: {
    category?: string;
    priceRange?: { min: number; max: number };
    rating?: number;
    availability?: boolean;
    isEmergency?: boolean;
  };
  userPreferences?: {
    pastServices?: string[];
    preferredBusinesses?: string[];
    budgetRange?: { min: number; max: number };
  };
}

export interface AIRecommendation {
  business: Business;
  score: number;
  reason: string;
  estimatedPrice?: number;
  availability?: string;
}

export interface PredictiveServiceNeed {
  serviceType: string;
  businessId: string;
  predictedDate: string;
  confidence: number;
  reason: string;
}

export interface SearchAnalytics {
  totalSearches: number;
  avgClickThrough: number;
  topQueries: Array<{ query: string; count: number }>;
  conversionRate: number;
  popularFilters: Record<string, number>;
}

export class AISearchService {
  // =====================================================
  // SMART SEARCH WITH NLP
  // =====================================================

  static async smartSearch(searchQuery: SmartSearchQuery): Promise<{
    businesses: Business[];
    recommendations: AIRecommendation[];
    totalCount: number;
  }> {
    try {
      // Parse natural language query
      const parsedQuery = await this.parseNaturalLanguageQuery(searchQuery.query);
      
      // Build dynamic search with parsed parameters
      let query = supabase
        .from('businesses')
        .select(`
          *,
          services (*),
          products (*),
          business_hours (*)
        `)
        .eq('is_active', true);

      // Apply extracted filters from NLP
      if (parsedQuery.category) {
        query = query.eq('category', parsedQuery.category);
      }

      if (parsedQuery.serviceType) {
        query = query.contains('tags', [parsedQuery.serviceType]);
      }

      if (searchQuery.filters?.rating) {
        query = query.gte('rating', searchQuery.filters.rating);
      }

      if (searchQuery.filters?.isEmergency) {
        query = query.eq('emergency_services', true);
      }

      // Execute search
      const { data: businesses, error } = await query;
      if (error) throw error;

      // Filter by location if provided
      let filteredBusinesses = businesses || [];
      if (searchQuery.location) {
        filteredBusinesses = this.filterByLocation(
          filteredBusinesses,
          searchQuery.location.latitude,
          searchQuery.location.longitude,
          searchQuery.location.radius || 20
        );
      }

      // Filter by availability if requested
      if (searchQuery.filters?.availability) {
        filteredBusinesses = await this.filterByRealTimeAvailability(filteredBusinesses);
      }

      // Generate AI recommendations
      const recommendations = await this.generatePersonalizedRecommendations(
        filteredBusinesses,
        searchQuery.userPreferences,
        parsedQuery
      );

      return {
        businesses: filteredBusinesses,
        recommendations,
        totalCount: filteredBusinesses.length
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to perform smart search');
    }
  }

  private static async parseNaturalLanguageQuery(query: string): Promise<{
    category?: string;
    serviceType?: string;
    urgency?: 'low' | 'medium' | 'high' | 'emergency';
    timePreference?: string;
    location?: string;
    budget?: { min?: number; max?: number };
  }> {
    try {
      // Simple NLP parsing - in production, use advanced NLP services
      const lowerQuery = query.toLowerCase();
      
      // Extract service categories
      const serviceKeywords = {
        'plumber': 'Home Services',
        'electrician': 'Home Services',
        'cleaner': 'Home Services',
        'mechanic': 'Automotive',
        'doctor': 'Healthcare',
        'lawyer': 'Legal Services',
        'tutor': 'Education',
        'photographer': 'Events & Photography'
      };

      // Extract urgency indicators
      const urgencyKeywords = {
        'emergency': 'emergency',
        'urgent': 'high',
        'asap': 'high',
        'immediately': 'emergency',
        'now': 'high',
        'today': 'medium',
        'tomorrow': 'low'
      };

      // Extract time preferences
      const timePatterns = [
        /after (\d+) (am|pm)/i,
        /before (\d+) (am|pm)/i,
        /morning/i,
        /afternoon/i,
        /evening/i,
        /night/i
      ];

      let category: string | undefined;
      let serviceType: string | undefined;
      let urgency: 'low' | 'medium' | 'high' | 'emergency' | undefined;
      let timePreference: string | undefined;

      // Find service type
      for (const [keyword, cat] of Object.entries(serviceKeywords)) {
        if (lowerQuery.includes(keyword)) {
          category = cat;
          serviceType = keyword;
          break;
        }
      }

      // Find urgency
      for (const [keyword, level] of Object.entries(urgencyKeywords)) {
        if (lowerQuery.includes(keyword)) {
          urgency = level as any;
          break;
        }
      }

      // Find time preference
      for (const pattern of timePatterns) {
        const match = lowerQuery.match(pattern);
        if (match) {
          timePreference = match[0];
          break;
        }
      }

      return {
        category,
        serviceType,
        urgency,
        timePreference
      };
    } catch (error: any) {
      console.error('Failed to parse natural language query:', error);
      return {};
    }
  }

  private static filterByLocation(
    businesses: Business[],
    lat: number,
    lng: number,
    radiusKm: number
  ): Business[] {
    return businesses.filter(business => {
      if (!business.latitude || !business.longitude) return false;
      
      const distance = this.calculateDistance(lat, lng, business.latitude, business.longitude);
      return distance <= radiusKm;
    });
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static async filterByRealTimeAvailability(businesses: Business[]): Promise<Business[]> {
    const availableBusinesses: Business[] = [];
    
    for (const business of businesses) {
      const isAvailable = await this.checkRealTimeAvailability(business.id);
      if (isAvailable) {
        availableBusinesses.push(business);
      }
    }
    
    return availableBusinesses;
  }

  private static async checkRealTimeAvailability(businessId: string): Promise<boolean> {
    try {
      // Check business hours
      const { data: hours } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId);

      if (!hours || hours.length === 0) return false;

      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.toTimeString().slice(0, 5);

      const todayHours = hours.find(h => h.day_of_week === currentDay);
      if (!todayHours || !todayHours.is_open) return false;

      const isWithinHours = currentTime >= todayHours.open_time && currentTime <= todayHours.close_time;
      
      // Check if business is currently handling orders (not overbooked)
      const { data: activeOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('business_id', businessId)
        .in('status', ['pending', 'confirmed', 'in_progress']);

      // Simple availability check - max 5 concurrent orders
      const isNotOverbooked = (activeOrders?.length || 0) < 5;

      return isWithinHours && isNotOverbooked;
    } catch (error) {
      console.error('Failed to check availability:', error);
      return false;
    }
  }

  private static async generatePersonalizedRecommendations(
    businesses: Business[],
    userPreferences?: SmartSearchQuery['userPreferences'],
    parsedQuery?: any
  ): Promise<AIRecommendation[]> {
    try {
      const recommendations: AIRecommendation[] = [];

      for (const business of businesses) {
        let score = business.rating || 0;
        let reason = `Rated ${business.rating}/5 stars`;

        // Boost score based on user preferences
        if (userPreferences?.preferredBusinesses?.includes(business.id)) {
          score += 2;
          reason += '; Previously used';
        }

        // Boost for relevant past services
        if (userPreferences?.pastServices?.some(service => 
          (business as any).category?.toLowerCase().includes(service.toLowerCase())
        )) {
          score += 1;
          reason += '; Matches your service history';
        }

        // Boost for emergency services if urgent
        if (parsedQuery?.urgency === 'emergency' && (business as any).emergency_service) {
          score += 3;
          reason += '; Emergency services available';
        }

        // Distance penalty
        const distancePenalty = 0; // Would calculate if location provided
        score -= distancePenalty;

        recommendations.push({
          business,
          score: Math.min(score, 10), // Cap at 10
          reason,
          estimatedPrice: await this.estimateServicePrice(business.id, parsedQuery?.serviceType),
          availability: await this.getNextAvailableSlot(business.id)
        });
      }

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    } catch (error: any) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  private static async estimateServicePrice(businessId: string, serviceType?: string): Promise<number | undefined> {
    try {
      if (!serviceType) return undefined;

      const { data: services } = await supabase
        .from('services')
        .select('price')
        .eq('business_id', businessId)
        .ilike('name', `%${serviceType}%`)
        .limit(1);

      return services?.[0]?.price;
    } catch (error) {
      return undefined;
    }
  }

  private static async getNextAvailableSlot(businessId: string): Promise<string | undefined> {
    try {
      // Get next available slot - simplified logic
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toLocaleDateString();
    } catch (error) {
      return undefined;
    }
  }

  // =====================================================
  // PREDICTIVE SERVICE NEEDS
  // =====================================================

  static async getPredictiveServiceNeeds(userId: string): Promise<PredictiveServiceNeed[]> {
    try {
      // Get user's service history
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          business:businesses!orders_business_id_fkey (
            id,
            name,
            category
          ),
          order_items (
            service_name,
            product_name
          )
        `)
        .eq('customer_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (!orders || orders.length === 0) return [];

      const predictions: PredictiveServiceNeed[] = [];

      // Analyze patterns for recurring services
      const servicePatterns = this.analyzeServicePatterns(orders);

      for (const pattern of servicePatterns) {
        if (pattern.isRecurring) {
          const nextPredictedDate = this.calculateNextServiceDate(pattern);
          predictions.push({
            serviceType: pattern.serviceType,
            businessId: pattern.preferredBusinessId,
            predictedDate: nextPredictedDate,
            confidence: pattern.confidence,
            reason: `Based on your ${pattern.frequency} ${pattern.serviceType} pattern`
          });
        }
      }

      return predictions.slice(0, 5); // Return top 5 predictions
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get predictive service needs');
    }
  }

  private static analyzeServicePatterns(orders: any[]): Array<{
    serviceType: string;
    preferredBusinessId: string;
    frequency: string;
    isRecurring: boolean;
    confidence: number;
    lastServiceDate: string;
  }> {
    const serviceGroups: Record<string, any[]> = {};

    // Group orders by service type
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const serviceType = item.service_name || item.product_name;
        if (serviceType) {
          if (!serviceGroups[serviceType]) {
            serviceGroups[serviceType] = [];
          }
          serviceGroups[serviceType].push({
            ...order,
            serviceDate: order.created_at
          });
        }
      });
    });

    const patterns = [];

    for (const [serviceType, serviceOrders] of Object.entries(serviceGroups)) {
      if (serviceOrders.length >= 2) {
        // Calculate intervals between services
        const intervals = [];
        for (let i = 1; i < serviceOrders.length; i++) {
          const current = new Date(serviceOrders[i].serviceDate);
          const previous = new Date(serviceOrders[i - 1].serviceDate);
          const daysDiff = Math.abs((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
          intervals.push(daysDiff);
        }

        // Check if pattern is consistent (recurring)
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        const isRecurring = variance < (avgInterval * 0.3); // Less than 30% variance

        if (isRecurring) {
          // Find preferred business
          const businessCounts: Record<string, number> = {};
          serviceOrders.forEach(order => {
            businessCounts[order.business_id] = (businessCounts[order.business_id] || 0) + 1;
          });
          const preferredBusinessId = Object.keys(businessCounts).reduce((a, b) => 
            businessCounts[a] > businessCounts[b] ? a : b
          );

          let frequency = 'regular';
          if (avgInterval <= 7) frequency = 'weekly';
          else if (avgInterval <= 31) frequency = 'monthly';
          else if (avgInterval <= 93) frequency = 'quarterly';
          else if (avgInterval <= 186) frequency = 'semi-annual';
          else frequency = 'annual';

          patterns.push({
            serviceType,
            preferredBusinessId,
            frequency,
            isRecurring,
            confidence: Math.max(0.5, 1 - (variance / avgInterval)),
            lastServiceDate: serviceOrders[0].serviceDate
          });
        }
      }
    }

    return patterns;
  }

  private static calculateNextServiceDate(pattern: any): string {
    const lastDate = new Date(pattern.lastServiceDate);
    const frequencyDays: Record<string, number> = {
      'weekly': 7,
      'monthly': 30,
      'quarterly': 90,
      'semi-annual': 180,
      'annual': 365,
      'regular': 60
    };

    const daysToAdd = frequencyDays[pattern.frequency] || 60;
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    return nextDate.toISOString();
  }

  // =====================================================
  // REAL-TIME SEARCH UPDATES
  // =====================================================

  static subscribeToSearchUpdates(callback: (update: any) => void) {
    return supabase
      .channel('search_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'businesses'
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'services'
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'business_hours'
      }, callback)
      .subscribe();
  }
}

export default AISearchService;
