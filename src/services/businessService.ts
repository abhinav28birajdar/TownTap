import { supabase } from '../lib/supabase';
import { BusinessProfile, BusinessRegistrationData, BusinessStats } from '../types';

export class BusinessService {
  // Create a new business profile
  static async createBusiness(
    data: BusinessRegistrationData,
    ownerId: string
  ): Promise<BusinessProfile> {
    const { data: business, error } = await supabase
      .from('business_profiles')
      .insert({
        ...data,
        owner_id: ownerId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return business;
  }

  // Get business profile by owner ID
  static async getBusinessByOwner(ownerId: string): Promise<BusinessProfile | null> {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('owner_id', ownerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Get business profile by ID
  static async getBusinessById(id: string): Promise<BusinessProfile | null> {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Update business profile
  static async updateBusiness(
    id: string,
    updates: Partial<BusinessProfile>
  ): Promise<BusinessProfile> {
    const { data, error } = await supabase
      .from('business_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete business profile
  static async deleteBusiness(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Search businesses
  static async searchBusinesses(params: {
    query?: string;
    category?: string;
    location?: {
      latitude: number;
      longitude: number;
      radius?: number; // in meters
    };
    limit?: number;
    offset?: number;
  }): Promise<BusinessProfile[]> {
    let query = supabase
      .from('business_profiles')
      .select('*')
      .eq('is_active', true);

    // Text search
    if (params.query) {
      query = query.or(`business_name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
    }

    // Category filter
    if (params.category) {
      query = query.eq('category', params.category);
    }

    // Location-based search would require PostGIS extension
    // For now, we'll implement basic filtering

    // Pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get businesses by category
  static async getBusinessesByCategory(
    category: string,
    limit = 20,
    offset = 0
  ): Promise<BusinessProfile[]> {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  // Get featured businesses
  static async getFeaturedBusinesses(limit = 10): Promise<BusinessProfile[]> {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get recent businesses
  static async getRecentBusinesses(limit = 20): Promise<BusinessProfile[]> {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get business statistics
  static async getBusinessStats(businessId: string): Promise<BusinessStats> {
    // In a real implementation, these would be calculated from actual data
    // For now, we'll return mock data
    return {
      totalViews: Math.floor(Math.random() * 1000) + 100,
      monthlyViews: Math.floor(Math.random() * 100) + 10,
      totalOrders: Math.floor(Math.random() * 200) + 20,
      monthlyOrders: Math.floor(Math.random() * 50) + 5,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
      reviewCount: Math.floor(Math.random() * 100) + 5,
      favoriteCount: Math.floor(Math.random() * 50),
      shareCount: Math.floor(Math.random() * 25),
    };
  }

  // Toggle business active status
  static async toggleBusinessStatus(
    id: string,
    isActive: boolean
  ): Promise<BusinessProfile> {
    const { data, error } = await supabase
      .from('business_profiles')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Upload business images
  static async uploadBusinessImage(
    businessId: string,
    imageUri: string,
    imageName: string
  ): Promise<string> {
    try {
      // Convert image to blob (this would need proper implementation)
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const fileName = `businesses/${businessId}/${Date.now()}-${imageName}`;
      
      const { data, error } = await supabase.storage
        .from('business-images')
        .upload(fileName, blob);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('business-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading business image:', error);
      throw error;
    }
  }

  // Delete business image
  static async deleteBusinessImage(imagePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('business-images')
      .remove([imagePath]);

    if (error) throw error;
  }

  // Get business reviews summary
  static async getBusinessReviewsSummary(businessId: string) {
    // This would integrate with a reviews system
    // For now, return mock data
    return {
      averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      totalReviews: Math.floor(Math.random() * 100) + 5,
      ratingDistribution: {
        5: Math.floor(Math.random() * 50) + 10,
        4: Math.floor(Math.random() * 30) + 5,
        3: Math.floor(Math.random() * 15) + 2,
        2: Math.floor(Math.random() * 5) + 1,
        1: Math.floor(Math.random() * 3),
      },
    };
  }

  // Report business
  static async reportBusiness(
    businessId: string,
    reason: string,
    description?: string,
    reporterId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('business_reports')
      .insert({
        business_id: businessId,
        reporter_id: reporterId,
        reason,
        description,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  // Favorite/unfavorite business
  static async toggleBusinessFavorite(
    businessId: string,
    userId: string,
    isFavorite: boolean
  ): Promise<void> {
    if (isFavorite) {
      const { error } = await supabase
        .from('business_favorites')
        .insert({
          business_id: businessId,
          user_id: userId,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('business_favorites')
        .delete()
        .eq('business_id', businessId)
        .eq('user_id', userId);

      if (error) throw error;
    }
  }

  // Get user's favorite businesses
  static async getUserFavoriteBusinesses(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<BusinessProfile[]> {
    const { data, error } = await supabase
      .from('business_favorites')
      .select(`
        business_profiles (*)
      `)
      .eq('user_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(item => item.business_profiles).filter(Boolean) || [];
  }
}