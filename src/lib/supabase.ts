import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration - Replace with your actual values
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client with AsyncStorage for auth persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Configuration helper
export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
});

// Test connection helper
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Business analytics helper
export const getBusinessAnalytics = async (businessId: string) => {
  try {
    const { data, error } = await supabase
      .from('business_analytics')
      .select('*')
      .eq('business_id', businessId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching business analytics:', error);
    return null;
  }
};

// Recent orders helper
export const getRecentOrders = async (businessId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
};

// AI content generation helper
export const generateAIContent = async (prompt: string, contentType: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('get-ai-recommendations', {
      body: { prompt, contentType }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw error;
  }
};

// Business categories helper
export const getBusinessCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('business_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching business categories:', error);
    return [];
  }
};

export default supabase;