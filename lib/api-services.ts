/**
 * TownTap - API Services
 * Supabase-connected API services for all app functionality
 * Uses any types to avoid Supabase type generation issues
 */

import { supabase } from './supabase';

// ==================== AUTH API ====================
export const authApi = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, userData: {
    fullName: string;
    phone?: string;
    userType: 'customer' | 'business_owner';
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          phone: userData.phone,
          role: userData.userType,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates as any)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ==================== BUSINESS API ====================
export const businessApi = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        category:categories(*),
        services(*),
        reviews(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByOwnerId(ownerId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId);
    if (error) throw error;
    return data;
  },

  async getAll(options?: {
    categoryId?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    let query = supabase
      .from('businesses')
      .select('*, category:categories(*)');

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getFeatured(limit = 10) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_featured', true)
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async create(businessData: Record<string, any>) {
    const { data, error } = await supabase
      .from('businesses')
      .insert(businessData as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ==================== SERVICE API ====================
export const serviceApi = {
  async getByBusinessId(businessId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId);
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*, business:businesses(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(serviceData: Record<string, any>) {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('services')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ==================== BOOKING API ====================
export const bookingApi = {
  async getByCustomerId(customerId: string, status?: string) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        business:businesses(*),
        service:services(*)
      `)
      .eq('customer_id', customerId)
      .order('scheduled_for', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByBusinessId(businessId: string, status?: string) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:profiles(*),
        service:services(*)
      `)
      .eq('business_id', businessId)
      .order('scheduled_for', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        business:businesses(*),
        service:services(*),
        customer:profiles(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(bookingData: Record<string, any>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string, additionalData?: Record<string, any>) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        ...additionalData,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async cancel(id: string, reason?: string) {
    return this.updateStatus(id, 'cancelled', {
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    });
  },
};

// ==================== REVIEW API ====================
export const reviewApi = {
  async getByBusinessId(businessId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, customer:profiles(*)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByCustomerId(customerId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, business:businesses(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(reviewData: Record<string, any>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ==================== FAVORITES API ====================
export const favoritesApi = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, business:businesses(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async add(userId: string, businessId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, business_id: businessId } as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(userId: string, businessId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('business_id', businessId);
    if (error) throw error;
  },

  async check(userId: string, businessId: string) {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('business_id', businessId)
      .single();
    return !!data;
  },
};

// ==================== CATEGORY API ====================
export const categoryApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
};

// ==================== NOTIFICATION API ====================
export const notificationApi = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() } as any)
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
    return count || 0;
  },
};

// ==================== MESSAGING API ====================
export const messagingApi = {
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`customer_id.eq.${userId},business_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      } as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createConversation(customerId: string, businessId: string) {
    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_id', customerId)
      .eq('business_id', businessId)
      .single();

    if (existing) return existing;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        customer_id: customerId,
        business_id: businessId,
      } as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ==================== SEARCH API ====================
export const searchApi = {
  async searchBusinesses(query: string, options?: {
    categoryId?: string;
    limit?: number;
  }) {
    let searchQuery = supabase
      .from('businesses')
      .select('*, category:categories(*)')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (options?.categoryId) {
      searchQuery = searchQuery.eq('category_id', options.categoryId);
    }
    if (options?.limit) {
      searchQuery = searchQuery.limit(options.limit);
    }

    const { data, error } = await searchQuery;
    if (error) throw error;
    return data;
  },

  async searchServices(query: string, limit = 20) {
    const { data, error } = await supabase
      .from('services')
      .select('*, business:businesses(*)')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);
    if (error) throw error;
    return data;
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  business: businessApi,
  service: serviceApi,
  booking: bookingApi,
  review: reviewApi,
  favorites: favoritesApi,
  category: categoryApi,
  notification: notificationApi,
  messaging: messagingApi,
  search: searchApi,
};

export default api;
