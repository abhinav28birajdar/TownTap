import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from './database.types';
import { LocationCoordinates, locationService } from './location-service';
import { supabase } from './supabase';

type BusinessRow = Database['public']['Tables']['businesses']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];

export interface SearchFilter {
  category?: string;
  minRating?: number;
  maxDistance?: number; // in meters
  priceRange?: [number, number]; // min, max
  openNow?: boolean;
  hasDelivery?: boolean;
  hasParking?: boolean;
  acceptsCards?: boolean;
  sortBy?: 'distance' | 'rating' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  business: BusinessRow & {
    distance?: number;
    averageRating?: number;
    reviewCount?: number;
    isOpen?: boolean;
  };
  relevanceScore: number;
  matchedFields: string[];
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'business' | 'category' | 'location' | 'recent';
  metadata?: {
    businessId?: string;
    category?: string;
    coordinates?: LocationCoordinates;
  };
}

export interface SearchHistory {
  id: string;
  query: string;
  filters?: SearchFilter;
  timestamp: string;
  resultCount: number;
}

interface SearchCache {
  [key: string]: {
    results: SearchResult[];
    timestamp: number;
    expiresAt: number;
  };
}

class SearchService {
  private readonly SEARCH_CACHE_KEY = 'search_cache';
  private readonly SEARCH_HISTORY_KEY = 'search_history';
  private readonly SUGGESTIONS_CACHE_KEY = 'search_suggestions_cache';
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_HISTORY_ITEMS = 50;
  private readonly MAX_CACHE_ITEMS = 100;
  
  private cache: SearchCache = {};
  private suggestionCache: Map<string, { suggestions: SearchSuggestion[]; timestamp: number }> = new Map();

  /**
   * Search businesses with advanced filtering
   */
  async searchBusinesses(
    query: string,
    filters?: SearchFilter,
    userLocation?: LocationCoordinates
  ): Promise<SearchResult[]> {
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(query, filters, userLocation);
      
      // Check cache first
      const cachedResults = await this.getCachedResults(cacheKey);
      if (cachedResults) {
        console.log('📋 Returning cached search results');
        return cachedResults;
      }

      console.log('🔍 Performing new search:', query);

      // Build the query
      let supabaseQuery = supabase
        .from('businesses')
        .select(`
          *,
          reviews!inner(rating, created_at)
        `);

      // Text search across multiple fields
      if (query.trim()) {
        const searchTerms = query.trim().split(/\s+/).join(' & ');
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,` +
          `description.ilike.%${query}%,` +
          `category.ilike.%${query}%,` +
          `address.ilike.%${query}%,` +
          `tags.cs.{${query}}`
        );
      }

      // Apply filters
      if (filters?.category) {
        supabaseQuery = supabaseQuery.eq('category', filters.category);
      }

      if (filters?.openNow) {
        supabaseQuery = supabaseQuery.eq('is_open', true);
      }

      if (filters?.hasDelivery) {
        supabaseQuery = supabaseQuery.eq('offers_delivery', true);
      }

      if (filters?.acceptsCards) {
        supabaseQuery = supabaseQuery.eq('accepts_credit_cards', true);
      }

      // Execute query
      const { data: businesses, error } = await supabaseQuery;

      if (error) {
        console.error('Search error:', error);
        return [];
      }

      if (!businesses || businesses.length === 0) {
        return [];
      }

      // Process results with location data
      const processedResults = await this.processSearchResults(
        businesses,
        query,
        filters,
        userLocation
      );

      // Cache results
      await this.cacheResults(cacheKey, processedResults);

      // Save to search history
      await this.addToSearchHistory(query, filters, processedResults.length);

      console.log(`✅ Found ${processedResults.length} businesses`);
      return processedResults;

    } catch (error) {
      console.error('Search service error:', error);
      return [];
    }
  }

  /**
   * Process search results with location and sorting
   */
  private async processSearchResults(
    businesses: any[],
    query: string,
    filters?: SearchFilter,
    userLocation?: LocationCoordinates
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const business of businesses) {
      // Calculate average rating and review count
      const reviews = business.reviews || [];
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
        : 0;
      const reviewCount = reviews.length;

      // Apply rating filter
      if (filters?.minRating && averageRating < filters.minRating) {
        continue;
      }

      // Calculate distance if user location is available
      let distance: number | undefined;
      if (userLocation && business.latitude && business.longitude) {
        distance = locationService.calculateDistance(userLocation, {
          latitude: business.latitude,
          longitude: business.longitude,
        });

        // Apply distance filter
        if (filters?.maxDistance && distance > filters.maxDistance) {
          continue;
        }
      }

      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(business, query, {
        distance,
        rating: averageRating,
        reviewCount,
      });

      // Determine matched fields
      const matchedFields = this.findMatchedFields(business, query);

      // Check if business is currently open (simplified)
      const isOpen = business.is_open; // This could be enhanced with actual hours

      results.push({
        business: {
          ...business,
          distance,
          averageRating,
          reviewCount,
          isOpen,
        },
        relevanceScore,
        matchedFields,
      });
    }

    // Sort results
    return this.sortResults(results, filters?.sortBy || 'relevance', filters?.sortOrder || 'desc');
  }

  /**
   * Calculate relevance score for search ranking
   */
  private calculateRelevanceScore(
    business: any,
    query: string,
    metrics: { distance?: number; rating: number; reviewCount: number }
  ): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Text relevance (40% weight)
    const fields = [
      { field: business.name, weight: 3 },
      { field: business.description, weight: 2 },
      { field: business.category, weight: 2 },
      { field: business.address, weight: 1 },
    ];

    let textScore = 0;
    for (const { field, weight } of fields) {
      if (field && field.toLowerCase().includes(queryLower)) {
        // Exact match bonus
        if (field.toLowerCase() === queryLower) {
          textScore += weight * 3;
        }
        // Starting with query bonus
        else if (field.toLowerCase().startsWith(queryLower)) {
          textScore += weight * 2;
        }
        // Contains query
        else {
          textScore += weight;
        }
      }
    }
    score += (textScore / 10) * 40;

    // Rating relevance (30% weight)
    score += (metrics.rating / 5) * 30;

    // Review count relevance (15% weight)
    const normalizedReviewCount = Math.min(metrics.reviewCount / 100, 1);
    score += normalizedReviewCount * 15;

    // Distance relevance (15% weight) - closer is better
    if (metrics.distance) {
      const maxDistance = 10000; // 10km
      const distanceScore = Math.max(0, (maxDistance - metrics.distance) / maxDistance);
      score += distanceScore * 15;
    } else {
      score += 7.5; // Default score if no location
    }

    return Math.round(score * 100) / 100;
  }

  /**
   * Find which fields matched the search query
   */
  private findMatchedFields(business: any, query: string): string[] {
    const matched: string[] = [];
    const queryLower = query.toLowerCase();

    if (business.name && business.name.toLowerCase().includes(queryLower)) {
      matched.push('name');
    }
    if (business.description && business.description.toLowerCase().includes(queryLower)) {
      matched.push('description');
    }
    if (business.category && business.category.toLowerCase().includes(queryLower)) {
      matched.push('category');
    }
    if (business.address && business.address.toLowerCase().includes(queryLower)) {
      matched.push('address');
    }

    return matched;
  }

  /**
   * Sort search results
   */
  private sortResults(
    results: SearchResult[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'distance':
          const distanceA = a.business.distance ?? Infinity;
          const distanceB = b.business.distance ?? Infinity;
          comparison = distanceA - distanceB;
          break;

        case 'rating':
          comparison = (a.business.averageRating || 0) - (b.business.averageRating || 0);
          break;

        case 'popularity':
          comparison = (a.business.reviewCount || 0) - (b.business.reviewCount || 0);
          break;

        case 'newest':
          comparison = new Date(a.business.created_at).getTime() - new Date(b.business.created_at).getTime();
          break;

        case 'relevance':
        default:
          comparison = a.relevanceScore - b.relevanceScore;
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(
    input: string,
    userLocation?: LocationCoordinates
  ): Promise<SearchSuggestion[]> {
    if (!input.trim()) {
      return await this.getRecentSearches();
    }

    // Check suggestion cache
    const cached = this.suggestionCache.get(input.toLowerCase());
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.suggestions;
    }

    const suggestions: SearchSuggestion[] = [];

    try {
      // Business name suggestions
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id, name, category, address')
        .ilike('name', `%${input}%`)
        .limit(5);

      if (businesses) {
        businesses.forEach(business => {
          suggestions.push({
            id: `business-${business.id}`,
            text: business.name,
            type: 'business',
            metadata: { businessId: business.id },
          });
        });
      }

      // Category suggestions
      const { data: categories } = await supabase
        .from('businesses')
        .select('category')
        .ilike('category', `%${input}%`)
        .limit(3);

      if (categories) {
        const uniqueCategories = [...new Set(categories.map(c => c.category))];
        uniqueCategories.forEach(category => {
          if (category) {
            suggestions.push({
              id: `category-${category}`,
              text: category,
              type: 'category',
              metadata: { category },
            });
          }
        });
      }

      // Location suggestions (using Google Places)
      if (userLocation) {
        const placeSuggestions = await locationService.getAutocompleteSuggestions(
          input,
          userLocation,
          50000 // 50km radius
        );

        placeSuggestions.slice(0, 3).forEach(place => {
          suggestions.push({
            id: `location-${place.placeId}`,
            text: place.description,
            type: 'location',
            metadata: { coordinates: userLocation },
          });
        });
      }

      // Cache suggestions
      this.suggestionCache.set(input.toLowerCase(), {
        suggestions,
        timestamp: Date.now(),
      });

      return suggestions;

    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get recent searches
   */
  async getRecentSearches(): Promise<SearchSuggestion[]> {
    try {
      const historyJson = await AsyncStorage.getItem(this.SEARCH_HISTORY_KEY);
      if (!historyJson) return [];

      const history: SearchHistory[] = JSON.parse(historyJson);
      
      return history
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
        .map(item => ({
          id: `recent-${item.id}`,
          text: item.query,
          type: 'recent' as const,
        }));

    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  /**
   * Add search to history
   */
  private async addToSearchHistory(
    query: string,
    filters?: SearchFilter,
    resultCount?: number
  ): Promise<void> {
    try {
      const historyItem: SearchHistory = {
        id: Date.now().toString(),
        query,
        filters,
        timestamp: new Date().toISOString(),
        resultCount: resultCount || 0,
      };

      const historyJson = await AsyncStorage.getItem(this.SEARCH_HISTORY_KEY);
      let history: SearchHistory[] = historyJson ? JSON.parse(historyJson) : [];

      // Remove duplicate queries
      history = history.filter(item => item.query !== query);

      // Add new search at the beginning
      history.unshift(historyItem);

      // Limit history size
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history = history.slice(0, this.MAX_HISTORY_ITEMS);
      }

      await AsyncStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SEARCH_HISTORY_KEY);
      console.log('🧹 Search history cleared');
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  /**
   * Generate cache key for search results
   */
  private generateCacheKey(
    query: string,
    filters?: SearchFilter,
    userLocation?: LocationCoordinates
  ): string {
    const filterString = filters ? JSON.stringify(filters) : '';
    const locationString = userLocation 
      ? `${Math.round(userLocation.latitude * 1000)},${Math.round(userLocation.longitude * 1000)}`
      : '';
    
    return `${query}|${filterString}|${locationString}`;
  }

  /**
   * Cache search results
   */
  private async cacheResults(cacheKey: string, results: SearchResult[]): Promise<void> {
    try {
      this.cache[cacheKey] = {
        results,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION,
      };

      // Limit cache size
      const cacheEntries = Object.entries(this.cache);
      if (cacheEntries.length > this.MAX_CACHE_ITEMS) {
        // Remove oldest entries
        cacheEntries
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, cacheEntries.length - this.MAX_CACHE_ITEMS)
          .forEach(([key]) => delete this.cache[key]);
      }

      // Persist cache
      await AsyncStorage.setItem(this.SEARCH_CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Error caching search results:', error);
    }
  }

  /**
   * Get cached search results
   */
  private async getCachedResults(cacheKey: string): Promise<SearchResult[] | null> {
    try {
      // Check memory cache first
      const memoryCache = this.cache[cacheKey];
      if (memoryCache && memoryCache.expiresAt > Date.now()) {
        return memoryCache.results;
      }

      // Check persistent cache
      const cacheJson = await AsyncStorage.getItem(this.SEARCH_CACHE_KEY);
      if (!cacheJson) return null;

      const cache: SearchCache = JSON.parse(cacheJson);
      const cached = cache[cacheKey];

      if (cached && cached.expiresAt > Date.now()) {
        // Update memory cache
        this.cache[cacheKey] = cached;
        return cached.results;
      }

      return null;
    } catch (error) {
      console.error('Error getting cached results:', error);
      return null;
    }
  }

  /**
   * Clear search cache
   */
  async clearCache(): Promise<void> {
    try {
      this.cache = {};
      this.suggestionCache.clear();
      await AsyncStorage.removeItem(this.SEARCH_CACHE_KEY);
      await AsyncStorage.removeItem(this.SUGGESTIONS_CACHE_KEY);
      console.log('🧹 Search cache cleared');
    } catch (error) {
      console.error('Error clearing search cache:', error);
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearches(): Promise<string[]> {
    try {
      const { data: searches } = await supabase
        .from('search_analytics')
        .select('query, search_count')
        .order('search_count', { ascending: false })
        .limit(10);

      return searches ? searches.map(s => s.query) : [];
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  /**
   * Track search analytics
   */
  async trackSearch(query: string, resultCount: number, filters?: SearchFilter): Promise<void> {
    try {
      // This could be sent to analytics service
      console.log('📊 Search tracked:', { query, resultCount, filters });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }
}

// Create and export singleton instance
export const searchService = new SearchService();

export default searchService;