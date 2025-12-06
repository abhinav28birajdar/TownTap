import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';
import { Database } from './database.types';
import { getAppConfig } from './secure-config-manager';

// Custom storage for auth tokens
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from SecureStore:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in SecureStore:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from SecureStore:', error);
    }
  },
};

// Initialize with fallback to environment variables
let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
let supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create initial client (will be recreated with dynamic config if available)
let supabaseClient: SupabaseClient<Database>;

function createSupabaseClient(url: string, key: string): SupabaseClient<Database> {
  return createClient<Database>(url, key, {
    auth: {
      storage: ExpoSecureStoreAdapter as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

// Initialize client
if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a placeholder client that will be replaced
  supabaseClient = createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key');
}

/**
 * Initialize Supabase client with dynamic configuration from SecureStore
 * Call this at app startup before using Supabase
 */
export async function initializeSupabase(): Promise<boolean> {
  try {
    const config = await getAppConfig();
    
    if (config) {
      supabaseUrl = config.supabaseUrl;
      supabaseAnonKey = config.supabaseAnonKey;
      supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);
      return true;
    }
    
    // Check if env vars are set
    if (process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return false;
  }
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    return (supabaseClient as any)[prop];
  },
});

export { supabaseClient };
