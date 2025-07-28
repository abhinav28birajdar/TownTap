import { supabase } from '../lib/supabase';
import type {
    AnalyticsSummary,
    Business,
    BusinessRegistration,
    Favorite,
    Message,
    MessageFormData,
    Review,
    ReviewFormData
} from '../types/index_location';

export class BusinessService {
  
  /**
   * Register a new business
   */
  static async registerBusiness(
    businessData: BusinessRegistration, 
    ownerId: string
  ): Promise<Business | null> {
    try {
      // Extract location and business_name for proper mapping
      const { business_name, location, phone_number, ...restData } = businessData;
      
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          owner_id: ownerId,
          name: business_name, // Map business_name to name
          phone: phone_number, // Map phone_number to phone
          ...restData,
          location: location, // Store complete location object
          latitude: location.latitude, // Keep for backward compatibility
          longitude: location.longitude, // Keep for backward compatibility
        })
        .select(`
          *,
          category:business_categories(*),
          owner:profiles(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      return this.transformBusinessData(data);
    } catch (error) {
      console.error('Error registering business:', error);
      return null;
    }
  }

  /**
   * Update existing business
   */
  static async updateBusiness(
    businessId: string, 
    updateData: Partial<BusinessRegistration>
  ): Promise<Business | null> {
    try {
      const dataToUpdate: any = { ...updateData };
      
      // Transform location if provided
      if (updateData.location) {
        dataToUpdate.location = `POINT(${updateData.location.longitude} ${updateData.location.latitude})`;
      }

      const { data, error } = await supabase
        .from('businesses')
        .update(dataToUpdate)
        .eq('id', businessId)
        .select(`
          *,
          category:business_categories(*),
          owner:profiles(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      return this.transformBusinessData(data);
    } catch (error) {
      console.error('Error updating business:', error);
      return null;
    }
  }

  /**
   * Get businesses owned by a user
   */
  static async getMyBusinesses(ownerId: string): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          category:business_categories(*),
          owner:profiles(*)
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(this.transformBusinessData);
    } catch (error) {
      console.error('Error getting my businesses:', error);
      return [];
    }
  }

  /**
   * Delete/Deactivate a business
   */
  static async deactivateBusiness(businessId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_active: false })
        .eq('id', businessId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deactivating business:', error);
      return false;
    }
  }

  /**
   * Add a review for a business
   */
  static async addReview(reviewData: ReviewFormData): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select(`
          *,
          customer:profiles(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error adding review:', error);
      return null;
    }
  }

  /**
   * Get reviews for a business
   */
  static async getBusinessReviews(businessId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customer:profiles(*)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting business reviews:', error);
      return [];
    }
  }

  /**
   * Add business to favorites
   */
  static async addToFavorites(customerId: string, businessId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ customer_id: customerId, business_id: businessId });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  /**
   * Remove business from favorites
   */
  static async removeFromFavorites(customerId: string, businessId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('customer_id', customerId)
        .eq('business_id', businessId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  /**
   * Get user's favorite businesses
   */
  static async getFavorites(customerId: string): Promise<Favorite[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          business:businesses(
            *,
            category:business_categories(*)
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(fav => ({
        ...fav,
        business: fav.business ? this.transformBusinessData(fav.business) : undefined,
      }));
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Check if business is in favorites
   */
  static async isFavorite(customerId: string, businessId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking if favorite:', error);
      return false;
    }
  }

  /**
   * Send message to business
   */
  static async sendMessage(messageData: MessageFormData): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          business:businesses(*),
          customer:profiles(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Get messages for a business (Business Owner view)
   */
  static async getBusinessMessages(businessId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          business:businesses(*),
          customer:profiles(*)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting business messages:', error);
      return [];
    }
  }

  /**
   * Get customer's message conversations
   */
  static async getCustomerMessages(customerId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          business:businesses(*),
          customer:profiles(*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting customer messages:', error);
      return [];
    }
  }

  /**
   * Update message status
   */
  static async updateMessageStatus(
    messageId: string, 
    status: 'new' | 'read' | 'replied' | 'closed'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating message status:', error);
      return false;
    }
  }

  /**
   * Get business analytics
   */
  static async getBusinessAnalytics(
    businessId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<AnalyticsSummary> {
    try {
      let query = supabase
        .from('business_analytics')
        .select('*')
        .eq('business_id', businessId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const analytics = data || [];

      // Calculate summary
      const summary: AnalyticsSummary = {
        total_views: analytics.reduce((sum, item) => sum + item.views, 0),
        total_inquiries: analytics.reduce((sum, item) => sum + item.inquiries, 0),
        total_calls: analytics.reduce((sum, item) => sum + item.calls, 0),
        total_messages: analytics.reduce((sum, item) => sum + item.messages, 0),
        daily_analytics: analytics,
        popular_days: [], // Could be calculated based on data
        peak_hours: [], // Could be calculated based on data
      };

      return summary;
    } catch (error) {
      console.error('Error getting business analytics:', error);
      return {
        total_views: 0,
        total_inquiries: 0,
        total_calls: 0,
        total_messages: 0,
        daily_analytics: [],
        popular_days: [],
        peak_hours: [],
      };
    }
  }

  /**
   * Upload business image
   */
  static async uploadBusinessImage(
    businessId: string, 
    imageUri: string, 
    fileName: string
  ): Promise<string | null> {
    try {
      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const filePath = `businesses/${businessId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('business-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading business image:', error);
      return null;
    }
  }

  /**
   * Transform database business data to our Business interface
   */
  private static transformBusinessData(data: any): Business {
    return {
      ...data,
      business_name: data.name, // Map name to business_name for frontend
      location: {
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      },
      business_hours: data.business_hours || {},
      services: data.services || [],
      images: data.images || [],
    };
  }
}
