import { supabase } from '../lib/supabase';
import { logConfig, validateConfig } from './environment';

// Initialize the application
export const initializeApp = async () => {
  try {
    // Validate environment configuration
    validateConfig();
    
    // Log configuration in development
    logConfig();
    
    // Test Supabase connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('⚠️ Supabase connection issue:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ App initialization failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Health check for the application
export const healthCheck = async () => {
  const checks = {
    environment: false,
    supabase: false,
    auth: false,
  };

  try {
    // Check environment variables
    validateConfig();
    checks.environment = true;
  } catch (error) {
    console.error('Environment check failed:', error);
  }

  try {
    // Check Supabase connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
    checks.supabase = !error;
  } catch (error) {
    console.error('Supabase check failed:', error);
  }

  try {
    // Check auth service
    const { data, error } = await supabase.auth.getSession();
    checks.auth = !error;
  } catch (error) {
    console.error('Auth check failed:', error);
  }

  return checks;
};

// Get app status
export const getAppStatus = () => ({
  timestamp: new Date().toISOString(),
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '') || 'Not configured',
  features: {
    realtime: process.env.EXPO_PUBLIC_ENABLE_REALTIME === 'true',
    analytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    notifications: process.env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  },
});
