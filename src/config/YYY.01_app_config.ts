// =====================================================
// ENHANCED TOWNTAP - APPLICATION CONFIGURATION
// Central configuration for API endpoints, constants, and app settings
// =====================================================


// Environment Configuration
export const APP_CONFIG = {
  // App Information
  APP_NAME: 'Enhanced TownTap',
  APP_VERSION: '2.0.0',
  APP_BUILD: '1',
  
  // Environment
  ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
  IS_DEV: process.env.EXPO_PUBLIC_ENVIRONMENT === 'development',
  IS_PROD: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production',
  
  // Supabase Configuration
  SUPABASE: {
    URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // Feature Flags
  FEATURES: {
    AI_FEATURES: process.env.EXPO_PUBLIC_ENABLE_AI_FEATURES === 'true',
    REALTIME: process.env.EXPO_PUBLIC_ENABLE_REALTIME === 'true',
    ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    DARK_MODE: process.env.EXPO_PUBLIC_ENABLE_DARK_MODE === 'true',
    VOICE_SEARCH: process.env.EXPO_PUBLIC_ENABLE_VOICE_SEARCH === 'true',
    AR_FEATURES: process.env.EXPO_PUBLIC_ENABLE_AR_FEATURES === 'true',
    PAYMENT_GATEWAY: process.env.EXPO_PUBLIC_ENABLE_PAYMENT_GATEWAY === 'true',
    LOYALTY_PROGRAM: process.env.EXPO_PUBLIC_ENABLE_LOYALTY_PROGRAM === 'true',
  },
  
  // API Configuration
  API: {
    TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
    MAX_RETRIES: parseInt(process.env.EXPO_PUBLIC_MAX_RETRIES || '3'),
    RETRY_DELAY: 1000, // ms
  },
  
  // Location Configuration
  LOCATION: {
    DEFAULT_LATITUDE: parseFloat(process.env.EXPO_PUBLIC_DEFAULT_LATITUDE || '23.2599'), // Bhopal
    DEFAULT_LONGITUDE: parseFloat(process.env.EXPO_PUBLIC_DEFAULT_LONGITUDE || '77.4126'), // Bhopal
    DEFAULT_RADIUS: parseFloat(process.env.EXPO_PUBLIC_DEFAULT_RADIUS || '20'), // km
    MAX_RADIUS: 50, // km
    MIN_RADIUS: 1, // km
  },
  
  // Business Configuration
  BUSINESS: {
    MIN_ORDER_AMOUNT: parseFloat(process.env.EXPO_PUBLIC_MIN_ORDER_AMOUNT || '50'),
    DEFAULT_DELIVERY_FEE: parseFloat(process.env.EXPO_PUBLIC_DEFAULT_DELIVERY_FEE || '20'),
    DEFAULT_DELIVERY_TIME: parseInt(process.env.EXPO_PUBLIC_DEFAULT_DELIVERY_TIME || '30'), // minutes
    MAX_DELIVERY_TIME: 120, // minutes
    COMMISSION_RATE: 0.05, // 5%
  },
  
  // Payment Configuration
  PAYMENT: {
    RAZORPAY_KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
    MIN_WALLET_AMOUNT: 10,
    MAX_WALLET_AMOUNT: 10000,
    CURRENCY: 'INR',
  },
  
  // AI Configuration
  AI: {
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    MODEL: 'gemini-pro',
    FALLBACK_MODEL: 'gpt-3.5-turbo',
  },
  
  // Media Configuration
  MEDIA: {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    ALLOWED_VIDEO_FORMATS: ['mp4', 'mov', 'avi'],
    IMAGE_QUALITY: 0.8,
  },
  
  // Chat Configuration
  CHAT: {
    MAX_MESSAGE_LENGTH: 1000,
    TYPING_INDICATOR_TIMEOUT: 3000, // ms
    MESSAGE_PAGINATION_LIMIT: 50,
  },
  
  // Notification Configuration
  NOTIFICATIONS: {
    FCM_SENDER_ID: process.env.EXPO_PUBLIC_FCM_SENDER_ID || '',
    SOUND_ENABLED: true,
    VIBRATION_ENABLED: true,
  },
  
  // Cache Configuration
  CACHE: {
    USER_PROFILE_TTL: 30 * 60 * 1000, // 30 minutes
    BUSINESS_LIST_TTL: 10 * 60 * 1000, // 10 minutes
    PRODUCT_LIST_TTL: 15 * 60 * 1000, // 15 minutes
  },
  
  // Animation Configuration
  ANIMATION: {
    DURATION_FAST: 150,
    DURATION_NORMAL: 250,
    DURATION_SLOW: 350,
    SPRING_CONFIG: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Edge Function endpoints
  EDGE_FUNCTIONS: {
    AI_CONTENT_GENERATOR: '/ai_content_generator',
    AI_CUSTOMER_INTERACTION: '/ai_customer_interaction', 
    AI_CUSTOMER_ASSISTANT: '/ai_customer_assistant',
    GET_PERFORMANCE_SUMMARY: '/get_performance_summary',
    PROCESS_CHECKOUT_PAYMENT: '/process_checkout_payment',
    RAZORPAY_WEBHOOK: '/razorpay_webhook_handler',
    ADD_FUNDS_TO_WALLET: '/add_funds_to_wallet',
    PROCESS_WALLET_PAYMENT: '/process_wallet_payment',
    SEND_FCM_NOTIFICATION: '/send_fcm_notification',
    CREATE_ORDER_REQUEST: '/create_order_request',
    UPDATE_ORDER_STATUS: '/update_order_request_status',
    ADD_REVIEW: '/add_review',
    REGISTER_FCM_TOKEN: '/register_fcm_token',
    IMAGE_OPTIMIZATION: '/image_optimization',
  },
  
  // Database RPC Functions
  RPC: {
    GET_NEARBY_BUSINESSES: 'get_nearby_businesses',
    UPDATE_BUSINESS_GEOJSON: 'update_business_geojson',
  },
  
  // External APIs
  EXTERNAL: {
    RAZORPAY_BASE: 'https://api.razorpay.com/v1',
    FCM_BASE: 'https://fcm.googleapis.com/fcm/send',
    GOOGLE_MAPS_BASE: 'https://maps.googleapis.com/maps/api',
  },
} as const;

// Database Table Names
export const TABLES = {
  PROFILES: 'profiles',
  BUSINESSES: 'businesses',
  PRODUCTS: 'products',
  SERVICES: 'services',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  SERVICE_REQUESTS: 'service_requests',
  INQUIRIES: 'inquiries',
  PAYMENTS: 'payments',
  WALLET_BALANCES: 'wallet_balances',
  WALLET_TRANSACTIONS: 'wallet_transactions',
  CUSTOMER_LOYALTY: 'customer_loyalty',
  REVIEWS: 'reviews',
  CHAT_MESSAGES: 'chat_messages',
  NOTIFICATIONS: 'notifications',
  FCM_TOKENS: 'fcm_tokens',
  AI_PROMPTS_HISTORY: 'ai_prompts_history',
  AI_CONTENT_LIBRARY: 'ai_content_library',
  BUSINESS_ANALYTICS: 'business_analytics_metrics',
  STAFF_MEMBERS: 'staff_members',
  BUSINESS_HOURS: 'business_hours',
  SAVED_ADDRESSES: 'saved_addresses',
} as const;

// Storage Bucket Names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  BUSINESS_IMAGES: 'business-images',
  PRODUCT_IMAGES: 'product-images',
  SERVICE_IMAGES: 'service-images',
  CHAT_MEDIA: 'chat-media',
  DOCUMENTS: 'documents',
} as const;

// App-specific Constants
export const APP_CONSTANTS = {
  // User Types
  USER_TYPES: {
    CUSTOMER: 'customer',
    BUSINESS: 'business_owner',
    STAFF: 'staff',
    ADMIN: 'admin',
  } as const,
  
  // Order/Request Status
  ORDER_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    PREPARING: 'preparing',
    READY: 'ready',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
  } as const,
  
  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  } as const,
  
  // Payment Methods
  PAYMENT_METHODS: {
    CASH: 'cash',
    CARD: 'card',
    UPI: 'upi',
    WALLET: 'wallet',
    NET_BANKING: 'net_banking',
  } as const,
  
  // Business Status
  BUSINESS_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    BUSY: 'busy',
    TEMPORARILY_CLOSED: 'temporarily_closed',
  } as const,
  
  // Notification Types
  NOTIFICATION_TYPES: {
    ORDER_UPDATE: 'order_update',
    PAYMENT_UPDATE: 'payment_update',
    PROMOTION: 'promotion',
    SYSTEM: 'system',
    CHAT_MESSAGE: 'chat_message',
    REMINDER: 'reminder',
  } as const,
  
  // AI Content Types
  AI_CONTENT_TYPES: {
    PRODUCT_DESCRIPTION: 'product_description',
    PROMOTIONAL_CAPTION: 'promotional_caption',
    BUSINESS_BIO: 'business_bio',
    CUSTOMER_RESPONSE: 'customer_response',
    SOCIAL_MEDIA_POST: 'social_media_post',
  } as const,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_LENGTH: 10,
  BUSINESS_NAME_MIN_LENGTH: 3,
  BUSINESS_NAME_MAX_LENGTH: 100,
  PRODUCT_NAME_MIN_LENGTH: 3,
  PRODUCT_NAME_MAX_LENGTH: 100,
  REVIEW_MIN_LENGTH: 10,
  REVIEW_MAX_LENGTH: 500,
  BUSINESS_DESCRIPTION_MAX_LENGTH: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_INPUT: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  LOCATION_PERMISSION: 'Location permission is required for this feature.',
  CAMERA_PERMISSION: 'Camera permission is required to take photos.',
  STORAGE_PERMISSION: 'Storage permission is required to save files.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  PAYMENT_COMPLETED: 'Payment completed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  BUSINESS_REGISTERED: 'Business registered successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
} as const;

export type UserType = keyof typeof APP_CONSTANTS.USER_TYPES;
export type OrderStatus = keyof typeof APP_CONSTANTS.ORDER_STATUS;
export type PaymentStatus = keyof typeof APP_CONSTANTS.PAYMENT_STATUS;
export type PaymentMethod = keyof typeof APP_CONSTANTS.PAYMENT_METHODS;
export type BusinessStatus = keyof typeof APP_CONSTANTS.BUSINESS_STATUS;
export type NotificationType = keyof typeof APP_CONSTANTS.NOTIFICATION_TYPES;
