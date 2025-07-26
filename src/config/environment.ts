// App Configuration Constants
export const CONFIG = {
  // App Info
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'TownTap',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',

  // API Configuration
  API_TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 10000,
  MAX_RETRIES: Number(process.env.EXPO_PUBLIC_MAX_RETRIES) || 3,

  // Location Configuration
  DEFAULT_LOCATION: {
    latitude: Number(process.env.EXPO_PUBLIC_DEFAULT_LATITUDE) || 19.0760,
    longitude: Number(process.env.EXPO_PUBLIC_DEFAULT_LONGITUDE) || 72.8777,
    radius: Number(process.env.EXPO_PUBLIC_DEFAULT_RADIUS) || 10,
  },

  // Business Configuration
  BUSINESS: {
    MIN_ORDER_AMOUNT: Number(process.env.EXPO_PUBLIC_MIN_ORDER_AMOUNT) || 50,
    DEFAULT_DELIVERY_FEE: Number(process.env.EXPO_PUBLIC_DEFAULT_DELIVERY_FEE) || 25,
    DEFAULT_DELIVERY_TIME: Number(process.env.EXPO_PUBLIC_DEFAULT_DELIVERY_TIME) || 30,
  },

  // Feature Flags
  FEATURES: {
    REALTIME: process.env.EXPO_PUBLIC_ENABLE_REALTIME === 'true',
    ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  },

  // Development flags
  IS_DEV: process.env.EXPO_PUBLIC_ENVIRONMENT === 'development',
  IS_PROD: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production',
} as const;

// Validate required environment variables
export const validateConfig = () => {
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `- ${v}`).join('\n')}\n\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

// Log configuration (excluding sensitive data)
export const logConfig = () => {
  if (CONFIG.IS_DEV) {
    console.log('🔧 TownTap Configuration:', {
      appName: CONFIG.APP_NAME,
      version: CONFIG.APP_VERSION,
      environment: CONFIG.ENVIRONMENT,
      features: CONFIG.FEATURES,
      defaultLocation: CONFIG.DEFAULT_LOCATION,
      supabaseConfigured: !!(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
    });
  }
};
