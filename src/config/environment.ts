// =====================================================
// TownTap Enhanced Configuration
// =====================================================

export const CONFIG = {
  // =====================================================
  // APP CONFIGURATION
  // =====================================================
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'TownTap',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '2.0.0',
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
  BUNDLE_ID: process.env.EXPO_PUBLIC_BUNDLE_ID || 'com.towntap.app',

  // =====================================================
  // SUPABASE CONFIGURATION
  // =====================================================
  SUPABASE: {
    URL: process.env.EXPO_PUBLIC_SUPABASE_URL!,
    ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, // Server-side only
    JWT_SECRET: process.env.SUPABASE_JWT_SECRET, // Server-side only
  },

  // =====================================================
  // PAYMENT GATEWAY CONFIGURATION
  // =====================================================
  RAZORPAY: {
    KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID!,
    KEY_SECRET: process.env.RAZORPAY_KEY_SECRET!, // Server-side only
    WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET!, // Server-side only
    PAYOUT_ACCOUNT_ID: process.env.RAZORPAY_PAYOUT_ACCOUNT_ID, // For business payouts
  },

  // =====================================================
  // AI SERVICES CONFIGURATION
  // =====================================================
  AI_SERVICES: {
    // Google Gemini
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!, // Server-side only
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    
    // OpenAI (Backup)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY, // Server-side only
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  // =====================================================
  // PUSH NOTIFICATIONS
  // =====================================================
  NOTIFICATIONS: {
    FCM_SERVER_KEY: process.env.FCM_SERVER_KEY!, // Server-side only
    FCM_SENDER_ID: process.env.EXPO_PUBLIC_FCM_SENDER_ID!,
    EXPO_ACCESS_TOKEN: process.env.EXPO_ACCESS_TOKEN, // For Expo Push Notifications
  },

  // =====================================================
  // SMS & COMMUNICATION
  // =====================================================
  COMMUNICATION: {
    // Twilio (for SMS/OTP)
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID!, // Server-side only
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN!, // Server-side only
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER!, // Server-side only
    
    // WhatsApp Business API
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN, // Server-side only
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID, // Server-side only
    
    // Email (SendGrid/SMTP)
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY, // Server-side only
    FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@towntap.in',
  },

  // =====================================================
  // MAPS & LOCATION SERVICES
  // =====================================================
  MAPS: {
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
    GOOGLE_PLACES_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY!,
    MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN, // Alternative
  },

  // =====================================================
  // FILE STORAGE
  // =====================================================
  STORAGE: {
    SUPABASE_STORAGE_URL: process.env.EXPO_PUBLIC_SUPABASE_STORAGE_URL!,
    CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY, // Server-side only
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET, // Server-side only
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID, // Server-side only
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY, // Server-side only
  },

  // =====================================================
  // ANALYTICS & MONITORING
  // =====================================================
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: process.env.EXPO_PUBLIC_GOOGLE_ANALYTICS_ID,
    MIXPANEL_TOKEN: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN,
    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    AMPLITUDE_API_KEY: process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY,
  },

  // =====================================================
  // API CONFIGURATION
  // =====================================================
  API: {
    TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 15000,
    MAX_RETRIES: Number(process.env.EXPO_PUBLIC_MAX_RETRIES) || 3,
    RATE_LIMIT: Number(process.env.EXPO_PUBLIC_RATE_LIMIT) || 100,
  },

  // =====================================================
  // LOCATION CONFIGURATION
  // =====================================================
  LOCATION: {
    DEFAULT_LATITUDE: Number(process.env.EXPO_PUBLIC_DEFAULT_LATITUDE) || 19.0760, // Mumbai
    DEFAULT_LONGITUDE: Number(process.env.EXPO_PUBLIC_DEFAULT_LONGITUDE) || 72.8777,
    DEFAULT_RADIUS_KM: Number(process.env.EXPO_PUBLIC_DEFAULT_RADIUS) || 20,
    MAX_SEARCH_RADIUS_KM: Number(process.env.EXPO_PUBLIC_MAX_SEARCH_RADIUS) || 50,
  },

  // =====================================================
  // BUSINESS CONFIGURATION
  // =====================================================
  BUSINESS: {
    MIN_ORDER_AMOUNT: Number(process.env.EXPO_PUBLIC_MIN_ORDER_AMOUNT) || 50,
    DEFAULT_DELIVERY_FEE: Number(process.env.EXPO_PUBLIC_DEFAULT_DELIVERY_FEE) || 25,
    DEFAULT_DELIVERY_TIME_MINUTES: Number(process.env.EXPO_PUBLIC_DEFAULT_DELIVERY_TIME) || 30,
    COMMISSION_RATE: Number(process.env.EXPO_PUBLIC_COMMISSION_RATE) || 0.15, // 15%
    PAYOUT_THRESHOLD: Number(process.env.EXPO_PUBLIC_PAYOUT_THRESHOLD) || 1000,
  },

  // =====================================================
  // FEATURE FLAGS
  // =====================================================
  FEATURES: {
    REALTIME: process.env.EXPO_PUBLIC_ENABLE_REALTIME !== 'false',
    ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS !== 'false',
    NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
    AI_FEATURES: process.env.EXPO_PUBLIC_ENABLE_AI_FEATURES !== 'false',
    PAYMENT_GATEWAY: process.env.EXPO_PUBLIC_ENABLE_PAYMENT_GATEWAY !== 'false',
    LOYALTY_PROGRAM: process.env.EXPO_PUBLIC_ENABLE_LOYALTY_PROGRAM !== 'false',
    VOICE_SEARCH: process.env.EXPO_PUBLIC_ENABLE_VOICE_SEARCH === 'true',
    AR_FEATURES: process.env.EXPO_PUBLIC_ENABLE_AR_FEATURES === 'true',
    DARK_MODE: process.env.EXPO_PUBLIC_ENABLE_DARK_MODE !== 'false',
  },

  // =====================================================
  // MULTILINGUAL SUPPORT
  // =====================================================
  I18N: {
    DEFAULT_LANGUAGE: process.env.EXPO_PUBLIC_DEFAULT_LANGUAGE || 'en',
    SUPPORTED_LANGUAGES: (process.env.EXPO_PUBLIC_SUPPORTED_LANGUAGES || 'en,hi').split(','),
    TRANSLATION_SERVICE_KEY: process.env.GOOGLE_TRANSLATE_API_KEY, // Server-side only
  },

  // =====================================================
  // SECURITY CONFIGURATION
  // =====================================================
  SECURITY: {
    JWT_EXPIRY_HOURS: Number(process.env.JWT_EXPIRY_HOURS) || 24,
    REFRESH_TOKEN_EXPIRY_DAYS: Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS) || 30,
    OTP_EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES) || 10,
    MAX_LOGIN_ATTEMPTS: Number(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!, // Server-side only
  },

  // =====================================================
  // DEVELOPMENT FLAGS
  // =====================================================
  IS_DEV: process.env.EXPO_PUBLIC_ENVIRONMENT === 'development',
  IS_STAGING: process.env.EXPO_PUBLIC_ENVIRONMENT === 'staging',
  IS_PROD: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production',
  DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
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
      defaultLocation: {
        latitude: CONFIG.LOCATION.DEFAULT_LATITUDE,
        longitude: CONFIG.LOCATION.DEFAULT_LONGITUDE,
        radius: CONFIG.LOCATION.DEFAULT_RADIUS_KM
      },
      supabaseConfigured: !!(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
    });
  }
};
