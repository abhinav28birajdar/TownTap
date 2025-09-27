import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';

// Check if we have valid Supabase configuration
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-project') && 
  !supabaseAnonKey.includes('your-anon-key') &&
  supabaseUrl !== 'https://demo.supabase.co' &&
  supabaseAnonKey !== 'demo-anon-key';

console.log('Supabase configuration:', { isSupabaseConfigured, url: supabaseUrl });

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
  isConfigured: isSupabaseConfigured,
});

// Real-time subscription helpers
export const subscribeToOrderUpdates = (businessId: string, callback: (payload: any) => void) => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured. Real-time subscriptions disabled.');
    return { unsubscribe: () => {} };
  }
  return supabase
    .channel('order-updates')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: `business_id=eq.${businessId}`
      }, 
      callback
    )
    .subscribe();
};

export const subscribeToMessages = (userId: string, callback: (payload: any) => void) => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured. Real-time subscriptions disabled.');
    return { unsubscribe: () => {} };
  }
  return supabase
    .channel('user-messages')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, 
      callback
    )
    .subscribe();
};

export const subscribeToNotifications = (userId: string, callback: (payload: any) => void) => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured. Real-time subscriptions disabled.');
    return { unsubscribe: () => {} };
  }
  return supabase
    .channel('user-notifications')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `recipient_profile_id=eq.${userId}`
      }, 
      callback
    )
    .subscribe();
};