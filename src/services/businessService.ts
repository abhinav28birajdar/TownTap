import { supabase } from '../lib/supabase';
import { 
  BusinessProfile, 
  BusinessRegistrationData, 
  BusinessStats, 
  ApiResponse,
  ImagePickerAsset
} from '../types';

/**
 * Business Service - Handles all business-related operations
 * For business owners and administrators
 */
export class BusinessService {
  /**
   * Utility function to calculate distance between two coordinates using Haversine formula
   * @param lat1 - Latitude of first point
   * @param lon1 - Longitude of first point
   * @param lat2 - Latitude of second point
   * @param lon2 - Longitude of second point
   * @returns Distance in kilometers
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }
  // ===== BUSINESS PROFILE MANAGEMENT =====

  /**
   * Create a new business profile
   */
  static async createBusiness(
    data: BusinessRegistrationData,
    ownerId: string
  ): Promise<ApiResponse<BusinessProfile>> {
    try {
      // Upload logo and banner if provided
      let logo_url: string | undefined;
      let banner_url: string | undefined;
      const gallery_urls: string[] = [];

      if (data.logo_file) {
        const logoResult = await BusinessService.uploadBusinessImage(data.logo_file, 'logo');
        if (logoResult.success && logoResult.data) {
          logo_url = logoResult.data;
        }
      }

      if (data.banner_file) {
        const bannerResult = await BusinessService.uploadBusinessImage(data.banner_file, 'banner');
        if (bannerResult.success && bannerResult.data) {
          banner_url = bannerResult.data;
        }
      }

      if (data.gallery_files && data.gallery_files.length > 0) {
        for (const file of data.gallery_files) {
          const galleryResult = await BusinessService.uploadBusinessImage(file, 'gallery');
          if (galleryResult.success && galleryResult.data) {
            gallery_urls.push(galleryResult.data);
          }
        }
      }

      const { data: business, error } = await supabase
        .from('business_profiles')
        .insert({
          ...data,
          owner_id: ownerId,
          logo_url,
          banner_url,
          gallery_images: gallery_urls,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Business registration error:', error);
        return {
          success: false,
          error: 'Failed to register business'
        };
      }
      
      return {
        success: true,
        data: business,
        message: 'Business registered successfully. Awaiting approval.'
      };
    } catch (err) {
      console.error('Business registration exception:', err);
      return {
        success: false,
        error: 'An unexpected error occurred during business registration'
      };
    }
  }

  /**
   * Get business profile by owner ID
   */
  static async getBusinessByOwner(ownerId: string): Promise<BusinessProfile | null> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('owner_id', ownerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      console.error('Get business by owner error:', err);
      throw err;
    }
  }

  /**
   * Get business profile by ID
   */
  static async getBusinessById(id: string): Promise<BusinessProfile | null> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      console.error('Get business by ID error:', err);
      throw err;
    }
  }

  /**
   * Update business profile
   */
  static async updateBusiness(
    id: string,
    updates: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Business profile update error:', error);
        return {
          success: false,
          error: 'Failed to update business profile'
        };
      }

      return {
        success: true,
        data,
        message: 'Business profile updated successfully'
      };
    } catch (err) {
      console.error('Business profile update exception:', err);
      return {
        success: false,
        error: 'An unexpected error occurred during profile update'
      };
    }
  }

  /**
   * Delete business profile
   */
  static async deleteBusiness(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('business_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Business deletion error:', error);
        return {
          success: false,
          error: 'Failed to delete business'
        };
      }

      return {
        success: true,
        message: 'Business deleted successfully'
      };
    } catch (err) {
      console.error('Business deletion exception:', err);
      return {
        success: false,
        error: 'An unexpected error occurred during business deletion'
      };
    }
  }

  // ===== BUSINESS SEARCH & DISCOVERY =====

  /**
   * Search businesses with advanced filters
   */
  static async searchBusinesses(params: {
    query?: string;
    category?: string;
    location?: {
      latitude: number;
      longitude: number;
      radius?: number; // in meters
    };
    isOpen?: boolean;
    minRating?: number;
    sortBy?: 'popularity' | 'rating' | 'distance' | 'newest';
    limit?: number;
    offset?: number;
  }): Promise<BusinessProfile[]> {
    try {
      let query = supabase
        .from('business_profiles')
        .select('*')
        .eq('is_active', true);

      // Text search
      if (params.query) {
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      // Category filter
      if (params.category) {
        query = query.eq('category', params.category);
      }

      // Open status filter
      if (params.isOpen !== undefined) {
        query = query.eq('is_open', params.isOpen);
      }

      // Rating filter
      if (params.minRating) {
        query = query.gte('rating', params.minRating);
      }

      // Location-based search would require PostGIS extension in Supabase
      // For a complete solution, we'd use an edge function with PostGIS

      // Sorting
      if (params.sortBy) {
        switch (params.sortBy) {
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'popularity':
            query = query.order('order_count', { ascending: false });
            break;
          // For distance, we'd need PostGIS in a real implementation
        }
      } else {
        // Default sort by creation date
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Search businesses error:', err);
      throw err;
    }
  }

  /**
   * Get businesses by category
   */
  static async getBusinessesByCategory(
    category: string,
    limit = 20,
    offset = 0
  ): Promise<BusinessProfile[]> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Get businesses by category error:', err);
      throw err;
    }
  }

  /**
   * Get featured businesses
   */
  static async getFeaturedBusinesses(limit = 10): Promise<BusinessProfile[]> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Get featured businesses error:', err);
      throw err;
    }
  }

  /**
   * Get nearby businesses based on location
   */
  static async getNearbyBusinesses(
    latitude: number,
    longitude: number,
    radius = 5000, // 5km default radius
    limit = 20
  ): Promise<BusinessProfile[]> {
    try {
      // In a real implementation, we would use PostGIS with a query like:
      // ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3)
      
      // For now, simulate with a function call or direct query
      // This is a placeholder for actual implementation
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('is_active', true)
        .limit(limit);

      if (error) throw error;
      
      // Filter and calculate distances client-side (not efficient but works for demo)
      const businesses = data || [];
      return businesses
        .filter(business => {
          if (!business.latitude || !business.longitude) return false;
          
          // Calculate rough distance using Haversine formula
          const distance = BusinessService.calculateDistance(
            latitude, 
            longitude, 
            business.latitude, 
            business.longitude
          );
          
          // Add distance to business object
          business.distance = distance;
          
          // Only include businesses within radius
          return distance <= radius / 1000; // convert meters to km
        })
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (err) {
      console.error('Get nearby businesses error:', err);
      throw err;
    }
  }

  /**
   * Get recent businesses
   */
  static async getRecentBusinesses(limit = 20): Promise<BusinessProfile[]> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Get recent businesses error:', err);
      throw err;
    }
  }

  // Get business statistics
  static async getBusinessStats(businessId: string): Promise<BusinessStats> {
    try {
      // In a real implementation, these would be calculated from actual data
      // For now, we'll return mock data with properties matching our BusinessStats interface
      return {
        totalOrders: Math.floor(Math.random() * 200) + 20,
        monthlyOrders: Math.floor(Math.random() * 50) + 5,
        total_orders: Math.floor(Math.random() * 200) + 20,
        pending_orders: Math.floor(Math.random() * 10),
        total_revenue: Math.floor(Math.random() * 10000) + 1000,
        avg_rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
        total_reviews: Math.floor(Math.random() * 100) + 5,
        active_products: Math.floor(Math.random() * 30) + 5,
        totalViews: Math.floor(Math.random() * 1000) + 100,
        monthlyViews: Math.floor(Math.random() * 100) + 10,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 100) + 5,
        favoriteCount: Math.floor(Math.random() * 50),
        shareCount: Math.floor(Math.random() * 25),
      };
    } catch (err) {
      console.error('Get business stats error:', err);
      throw err;
    }
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
    file: ImagePickerAsset | string,
    imageType: string,
    businessId?: string
  ): Promise<ApiResponse<string>> {
    try {
      // Handle both string URIs and ImagePickerAsset objects
      const imageUri = typeof file === 'string' ? file : file.uri;
      
      // Convert image to blob (this would need proper implementation)
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Generate a unique ID if businessId is not provided
      const dirId = businessId || `temp-${Date.now()}`;
      const fileName = `businesses/${dirId}/${Date.now()}-${imageType}`;
      
      const { data, error } = await supabase.storage
        .from('business-images')
        .upload(fileName, blob);

      if (error) {
        console.error('Storage upload error:', error);
        return {
          success: false,
          error: 'Failed to upload image'
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('business-images')
        .getPublicUrl(fileName);

      return {
        success: true,
        data: urlData.publicUrl,
        message: 'Image uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading business image:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during image upload'
      };
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
    try {
      // First get the business IDs from the favorites table
      const { data: favorites, error: favError } = await supabase
        .from('business_favorites')
        .select('business_id')
        .eq('user_id', userId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (favError) throw favError;
      
      if (!favorites || favorites.length === 0) return [];
      
      // Then get the actual business profiles using the IDs
      const businessIds = favorites.map(fav => fav.business_id);
      
      const { data: businesses, error: bizError } = await supabase
        .from('business_profiles')
        .select('*')
        .in('id', businessIds);
        
      if (bizError) throw bizError;
      
      return businesses || [];
    } catch (err) {
      console.error('Get user favorites error:', err);
      throw err;
    }
  }

  /**
   * Get business categories
   */
  static async getBusinessCategories(): Promise<{id: string, name: string, icon: string}[]> {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Get business categories error:', err);
      throw err;
    }
  }
  
  /**
   * Get category subcategories
   */
  static async getCategorySubcategories(categoryId: string): Promise<{id: string, name: string}[]> {
    try {
      const { data, error } = await supabase
        .from('business_subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Get category subcategories error:', err);
      throw err;
    }
  }

  /**
   * Search businesses with pagination
   */
  static async searchBusinessesPaginated(
    query: string,
    page = 1,
    pageSize = 10
  ): Promise<{businesses: BusinessProfile[], total: number}> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('business_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .or(`name.ilike.%${query}%, description.ilike.%${query}%, tags.cs.{${query}}`);
      
      if (countError) throw countError;

      // Get the actual data
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%, description.ilike.%${query}%, tags.cs.{${query}}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;
      
      return {
        businesses: data || [],
        total: count || 0
      };
    } catch (err) {
      console.error('Search businesses paginated error:', err);
      throw err;
    }
  }
}