import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase configuration from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with React Native specific configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for token persistence in React Native
    storage: AsyncStorage,
    // Enable automatic token refresh
    autoRefreshToken: true,
    // Persist session across app restarts
    persistSession: true,
    // Detect session in URL (useful for deep linking)
    detectSessionInUrl: false,
  },
  // Enable real-time subscriptions
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database type definitions (these will be generated from your Supabase schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone_number?: string;
          full_name: string;
          user_type: 'customer' | 'business' | 'admin';
          fcm_token?: string;
          locale: 'en' | 'hi';
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone_number?: string;
          full_name: string;
          user_type: 'customer' | 'business' | 'admin';
          fcm_token?: string;
          locale?: 'en' | 'hi';
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone_number?: string;
          full_name?: string;
          user_type?: 'customer' | 'business' | 'admin';
          fcm_token?: string;
          locale?: 'en' | 'hi';
          avatar_url?: string;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          logo_url?: string;
          description: string;
          address_line1: string;
          city: string;
          state: string;
          zip_code: string;
          latitude: number;
          longitude: number;
          contact_phone: string;
          operating_hours: any;
          delivery_radius_km: number;
          business_type: 'type_a' | 'type_b' | 'type_c';
          specialized_categories: string[];
          is_approved: boolean;
          status: 'active' | 'inactive' | 'suspended';
          avg_rating: number;
          total_reviews: number;
          bank_account_info_encrypted?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          logo_url?: string;
          description: string;
          address_line1: string;
          city: string;
          state: string;
          zip_code: string;
          latitude: number;
          longitude: number;
          contact_phone: string;
          operating_hours: any;
          delivery_radius_km: number;
          business_type: 'type_a' | 'type_b' | 'type_c';
          specialized_categories: string[];
          is_approved?: boolean;
          status?: 'active' | 'inactive' | 'suspended';
          avg_rating?: number;
          total_reviews?: number;
          bank_account_info_encrypted?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          logo_url?: string;
          description?: string;
          address_line1?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          latitude?: number;
          longitude?: number;
          contact_phone?: string;
          operating_hours?: any;
          delivery_radius_km?: number;
          business_type?: 'type_a' | 'type_b' | 'type_c';
          specialized_categories?: string[];
          is_approved?: boolean;
          status?: 'active' | 'inactive' | 'suspended';
          avg_rating?: number;
          total_reviews?: number;
          bank_account_info_encrypted?: string;
          updated_at?: string;
        };
      };
      // Add more table types as needed
    };
    Views: {
      // Add view types here
    };
    Functions: {
      // Add function types here
    };
    Enums: {
      user_type: 'customer' | 'business' | 'admin';
      business_type: 'type_a' | 'type_b' | 'type_c';
      order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    };
  };
}

// Helper functions for common Supabase operations
export const supabaseHelpers = {
  // Get current user profile
  async getCurrentUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  // Upload file to Supabase Storage
  async uploadFile(bucket: string, path: string, file: File | Blob, options?: { upsert?: boolean }) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);

    if (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };
  },

  // Get signed URL for private files
  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    return { data, error };
  },

  // Subscribe to real-time changes
  subscribeToTable(
    table: string,
    filter?: string,
    value?: any,
    callback?: (payload: any) => void
  ) {
    let query = supabase.channel(`realtime-${table}`).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter && value && { filter: `${filter}=eq.${value}` }),
      },
      callback || ((payload) => console.log('Change received!', payload))
    );

    return query.subscribe();
  },

  // Check if user has permission for a specific operation
  async checkPermission(operation: string, resourceId?: string) {
    // Implement RLS-based permission checking
    // This would typically be handled by Supabase RLS policies
    return true;
  },

  // Call Supabase Edge Function
  async callEdgeFunction(functionName: string, body?: any) {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
    });

    if (error) {
      console.error(`Error calling Edge Function ${functionName}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  },
};

// Authentication helpers
export const authHelpers = {
  // Sign up with email and password
  async signUpWithEmail(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    return { data, error };
  },

  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  // Sign in with phone OTP
  async signInWithPhone(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    return { data, error };
  },

  // Verify OTP
  async verifyOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // Update password
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    return { data, error };
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default supabase;
