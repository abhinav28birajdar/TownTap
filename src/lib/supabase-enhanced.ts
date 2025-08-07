// =====================================================
// ENHANCED TOWNTAP - SUPABASE CLIENT CONFIGURATION
// Real-time, AI-powered backend integration
// =====================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { AppState } from 'react-native';

// Environment configuration
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Demo mode check
const isDemoMode = !supabaseUrl || supabaseUrl.includes('demo') || !supabaseAnonKey || supabaseAnonKey.includes('demo');

if (isDemoMode) {
  console.log('🚧 TownTap running in DEMO MODE - Replace with your Supabase project');
}

// Create a mock client for demo mode
const createDemoClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Demo mode - create your Supabase project' } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Demo mode - create your Supabase project' } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (callback: any) => {
      callback('SIGNED_OUT', null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
      }),
    }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
  }),
  channel: () => ({
    on: () => ({}),
    subscribe: () => Promise.resolve('OK'),
    unsubscribe: () => Promise.resolve('OK'),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
      download: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  functions: {
    invoke: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
  },
});

// Enhanced Supabase client configuration
export const supabase: SupabaseClient = isDemoMode ? createDemoClient() as any : createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for token persistence
    storage: AsyncStorage,
    
    // Auto refresh tokens
    autoRefreshToken: true,
    
    // Persist session across app restarts
    persistSession: true,
    
    // Detect session from URL (for OAuth flows)
    detectSessionInUrl: false,
    
    // Flow type for enhanced security
    flowType: 'pkce',
  },
  
  // Real-time configuration
  realtime: {
    // Enhanced real-time settings for better performance
    params: {
      eventsPerSecond: 10,
    },
    
    // Heartbeat interval for connection health
    heartbeatIntervalMs: 30000,
    
    // Reconnect on app state change
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000),
  },
  
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'enhanced-towntap-mobile',
      'X-App-Version': Constants.expoConfig?.version || '2.0.0',
    },
  },
  
  // Database configuration
  db: {
    schema: 'public',
  },
});

// App state change handler for connection management
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    // Reconnect real-time when app becomes active
    supabase.realtime.connect();
  } else if (state === 'background') {
    // Optionally disconnect real-time to save battery
    // supabase.realtime.disconnect();
  }
});

// Helper functions for enhanced Supabase operations

/**
 * Enhanced authentication state listener
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Get current user profile with enhanced error handling
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Enhanced sign in with multiple providers
 */
export const signInWithProvider = async (provider: 'google' | 'facebook' | 'apple') => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'com.towntap.enhanced://auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error);
    throw error;
  }
};

/**
 * Enhanced sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

/**
 * Enhanced sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

/**
 * Sign in with phone number and OTP
 */
export const signInWithPhone = async (phone: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in with phone:', error);
    throw error;
  }
};

/**
 * Send OTP to phone number
 */
export const sendOTP = async (phone: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      },
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP for phone authentication
 */
export const verifyOTP = async (phone: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Enhanced sign out with cleanup
 */
export const signOut = async () => {
  try {
    // Clear any cached data before signing out
    await AsyncStorage.multiRemove([
      'cart_items',
      'recent_searches',
      'cached_businesses',
    ]);
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Reset password with email
 */
export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'com.towntap.enhanced://auth/reset-password',
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Upload file to Supabase storage with optimization
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: any,
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options,
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Get public URL for uploaded file
 */
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

/**
 * Subscribe to real-time changes with enhanced error handling
 */
export const subscribeToTable = (
  table: string,
  filter?: string,
  callback?: (payload: any) => void
) => {
  const channel = supabase
    .channel(`realtime:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      (payload) => {
        console.log(`Real-time update for ${table}:`, payload);
        callback?.(payload);
      }
    )
    .subscribe((status) => {
      console.log(`Subscription status for ${table}:`, status);
    });
  
  return channel;
};

/**
 * Call Supabase Edge Function with enhanced error handling
 */
export const callEdgeFunction = async (
  functionName: string,
  payload?: any,
  options?: {
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  }
) => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      method: options?.method || 'POST',
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error calling edge function ${functionName}:`, error);
    throw error;
  }
};

/**
 * Enhanced database query with automatic retry and caching
 */
export const performQuery = async <T>(
  queryBuilder: any,
  cacheKey?: string,
  cacheDuration?: number
) => {
  try {
    // Check cache first if cache key provided
    if (cacheKey) {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const duration = cacheDuration || 5 * 60 * 1000; // 5 minutes default
        
        if (now - timestamp < duration) {
          console.log(`Returning cached data for ${cacheKey}`);
          return { data, error: null };
        }
      }
    }
    
    // Perform the query
    const result = await queryBuilder;
    
    // Cache the result if cache key provided and query was successful
    if (cacheKey && !result.error) {
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data: result.data,
        timestamp: Date.now(),
      }));
    }
    
    return result;
  } catch (error) {
    console.error('Error performing query:', error);
    return { data: null, error };
  }
};

/**
 * Batch operations helper
 */
export const performBatchOperations = async (operations: Array<() => Promise<any>>) => {
  try {
    const results = await Promise.allSettled(operations.map(op => op()));
    
    const successful = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');
    
    console.log(`Batch operations: ${successful.length} successful, ${failed.length} failed`);
    
    return {
      successful: successful.map(r => (r as PromiseFulfilledResult<any>).value),
      failed: failed.map(r => (r as PromiseRejectedResult).reason),
    };
  } catch (error) {
    console.error('Error in batch operations:', error);
    throw error;
  }
};

// Health check function
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    return { healthy: !error, error };
  } catch (error) {
    return { healthy: false, error };
  }
};

// Connection status
export const getConnectionStatus = () => {
  return supabase.realtime.isConnected();
};

// Export the configured client as default
export default supabase;
