import { supabase } from '../lib/supabase';
import {
    Business,
    PaginatedResponse,
    Review,
    ReviewInsert,
    ReviewUpdate
} from '../types';

export class ReviewService {
  // =====================================================
  // REVIEW MANAGEMENT
  // =====================================================

  static async createReview(reviewData: ReviewInsert): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select(`
          *,
          customer:profiles!reviews_customer_id_fkey (
            id,
            name,
            avatar_url
          ),
          business:businesses!reviews_business_id_fkey (
            id,
            name,
            category
          )
        `)
        .single();

      if (error) throw error;
      
      // Update business rating
      await this.updateBusinessRating(reviewData.business_id);
      
      return data as Review;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create review');
    }
  }

  static async updateReview(reviewId: string, updates: ReviewUpdate): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .select(`
          *,
          customer:profiles!reviews_customer_id_fkey (
            id,
            name,
            avatar_url
          ),
          business:businesses!reviews_business_id_fkey (
            id,
            name,
            category
          )
        `)
        .single();

      if (error) throw error;
      
      // Update business rating if rating changed
      if (updates.rating !== undefined) {
        const { data: review } = await supabase
          .from('reviews')
          .select('business_id')
          .eq('id', reviewId)
          .single();
        
        if (review) {
          await this.updateBusinessRating(review.business_id);
        }
      }
      
      return data as Review;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update review');
    }
  }

  static async deleteReview(reviewId: string): Promise<void> {
    try {
      // Get business ID before deletion
      const { data: review } = await supabase
        .from('reviews')
        .select('business_id')
        .eq('id', reviewId)
        .single();

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      
      // Update business rating after deletion
      if (review) {
        await this.updateBusinessRating(review.business_id);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete review');
    }
  }

  static async getReview(reviewId: string): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customer:profiles!reviews_customer_id_fkey (
            id,
            name,
            avatar_url
          ),
          business:businesses!reviews_business_id_fkey (
            id,
            name,
            category
          )
        `)
        .eq('id', reviewId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data as Review;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch review');
    }
  }

  // =====================================================
  // BUSINESS REVIEWS
  // =====================================================

  static async getBusinessReviews(
    businessId: string,
    page: number = 1,
    limit: number = 20,
    sortBy: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' = 'newest'
  ): Promise<PaginatedResponse<Review>> {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          customer:profiles!reviews_customer_id_fkey (
            id,
            name,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('business_id', businessId);

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest_rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest_rating':
          query = query.order('rating', { ascending: true });
          break;
      }

      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Review[],
        count: count || 0,
        hasMore: (count || 0) > from + limit,
        nextCursor: (count || 0) > from + limit ? (page + 1).toString() : undefined
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch business reviews');
    }
  }

  static async getCustomerReviews(
    customerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Review>> {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          business:businesses!reviews_business_id_fkey (
            id,
            name,
            category,
            image_url
          )
        `, { count: 'exact' })
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Review[],
        count: count || 0,
        hasMore: (count || 0) > from + limit,
        nextCursor: (count || 0) > from + limit ? (page + 1).toString() : undefined
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch customer reviews');
    }
  }

  // =====================================================
  // REVIEW STATISTICS
  // =====================================================

  static async getBusinessRatingStats(businessId: string) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', businessId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const totalReviews = data.length;
      const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / totalReviews;

      const ratingDistribution = data.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Ensure all ratings 1-5 are represented
      for (let i = 1; i <= 5; i++) {
        if (!ratingDistribution[i]) {
          ratingDistribution[i] = 0;
        }
      }

      return {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews,
        ratingDistribution
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get rating stats');
    }
  }

  private static async updateBusinessRating(businessId: string): Promise<void> {
    try {
      const stats = await this.getBusinessRatingStats(businessId);
      
      const { error } = await supabase
        .from('businesses')
        .update({
          rating: stats.averageRating,
          reviews_count: stats.totalReviews
        })
        .eq('id', businessId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to update business rating:', error);
    }
  }

  // =====================================================
  // REVIEW FILTERING & SEARCH
  // =====================================================

  static async searchReviews(
    businessId: string,
    searchQuery: string,
    minRating?: number,
    maxRating?: number,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Review>> {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          customer:profiles!reviews_customer_id_fkey (
            id,
            name,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('business_id', businessId);

      if (searchQuery) {
        query = query.or(`comment.ilike.%${searchQuery}%`);
      }

      if (minRating !== undefined) {
        query = query.gte('rating', minRating);
      }

      if (maxRating !== undefined) {
        query = query.lte('rating', maxRating);
      }

      const from = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Review[],
        count: count || 0,
        hasMore: (count || 0) > from + limit,
        nextCursor: (count || 0) > from + limit ? (page + 1).toString() : undefined
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search reviews');
    }
  }

  static async getReviewsByRating(
    businessId: string,
    rating: number,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Review>> {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          customer:profiles!reviews_customer_id_fkey (
            id,
            name,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('business_id', businessId)
        .eq('rating', rating)
        .order('created_at', { ascending: false });

      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Review[],
        count: count || 0,
        hasMore: (count || 0) > from + limit,
        nextCursor: (count || 0) > from + limit ? (page + 1).toString() : undefined
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch reviews by rating');
    }
  }

  // =====================================================
  // REVIEW VALIDATION
  // =====================================================

  static async canCustomerReviewBusiness(customerId: string, businessId: string): Promise<boolean> {
    try {
      // Check if customer has completed orders with this business
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .eq('status', 'completed')
        .limit(1);

      if (!orders || orders.length === 0) return false;

      // Check if customer has already reviewed this business
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .limit(1);

      return !existingReview || existingReview.length === 0;
    } catch (error: any) {
      console.error('Failed to check review eligibility:', error);
      return false;
    }
  }

  static async hasCustomerReviewedBusiness(customerId: string, businessId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error: any) {
      console.error('Failed to check existing review:', error);
      return false;
    }
  }

  // =====================================================
  // REVIEW RESPONSES (Business Owner Replies)
  // =====================================================

  static async addBusinessResponse(reviewId: string, response: string): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ 
          business_response: response,
          response_date: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select(`
          *,
          customer:profiles!reviews_customer_id_fkey (
            id,
            name,
            avatar_url
          ),
          business:businesses!reviews_business_id_fkey (
            id,
            name,
            category
          )
        `)
        .single();

      if (error) throw error;
      return data as Review;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add business response');
    }
  }

  static async updateBusinessResponse(reviewId: string, response: string): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ 
          business_response: response,
          response_date: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select(`
          *,
          customer:profiles!reviews_customer_id_fkey (
            id,
            name,
            avatar_url
          ),
          business:businesses!reviews_business_id_fkey (
            id,
            name,
            category
          )
        `)
        .single();

      if (error) throw error;
      return data as Review;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update business response');
    }
  }

  static async deleteBusinessResponse(reviewId: string): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ 
          business_response: null,
          response_date: null
        })
        .eq('id', reviewId)
        .select(`
          *,
          customer:profiles!reviews_customer_id_fkey (
            id,
            name,
            avatar_url
          ),
          business:businesses!reviews_business_id_fkey (
            id,
            name,
            category
          )
        `)
        .single();

      if (error) throw error;
      return data as Review;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete business response');
    }
  }

  // =====================================================
  // REVIEW REPORTING & MODERATION
  // =====================================================

  static async reportReview(
    reviewId: string,
    reporterId: string,
    reason: string,
    description?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('review_reports')
        .insert({
          review_id: reviewId,
          reporter_id: reporterId,
          reason,
          description
        });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to report review');
    }
  }

  static async flagReviewForModeration(reviewId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          is_flagged: true,
          flag_reason: reason
        })
        .eq('id', reviewId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to flag review');
    }
  }

  // =====================================================
  // ANALYTICS & INSIGHTS
  // =====================================================

  static async getReviewTrends(businessId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('reviews')
        .select('rating, created_at')
        .eq('business_id', businessId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const trends = data.reduce((acc, review) => {
        const date = review.created_at.split('T')[0]; // Get date part only
        if (!acc[date]) {
          acc[date] = { count: 0, totalRating: 0 };
        }
        acc[date].count += 1;
        acc[date].totalRating += review.rating;
        return acc;
      }, {} as Record<string, { count: number; totalRating: number }>);

      return Object.entries(trends).map(([date, data]) => ({
        date,
        reviewCount: data.count,
        averageRating: data.totalRating / data.count
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get review trends');
    }
  }

  static async getTopReviewedBusinesses(limit: number = 10): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('reviews_count', { ascending: false })
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Business[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get top reviewed businesses');
    }
  }
}

export default ReviewService;
