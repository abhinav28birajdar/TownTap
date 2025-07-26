// App Configuration Constants
export const APP_CONFIG = {
  APP_NAME: 'TownTap',
  VERSION: '1.0.0',
  
  // AI Configuration
  AI: {
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    SUPPORTED_LANGUAGES: ['en', 'hi'],
    FEATURES: {
      CONTENT_GENERATOR: 'content_generator',
      CUSTOMER_ASSISTANT: 'customer_assistant',
      INTERACTION_SUGGESTIONS: 'interaction_suggestions',
      PERFORMANCE_INSIGHTS: 'performance_insights'
    }
  },

  // Business Types
  BUSINESS_TYPES: {
    TYPE_A: 'type_a', // Order & Buy Now
    TYPE_B: 'type_b', // Book & Request Service
    TYPE_C: 'type_c'  // Inquire & Consult
  },

  // User Roles
  USER_ROLES: {
    CUSTOMER: 'customer',
    BUSINESS: 'business',
    ADMIN: 'admin'
  },

  // Order/Request Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  SERVICE_REQUEST_STATUS: {
    PENDING: 'pending',
    QUOTED: 'quoted',
    ACCEPTED: 'accepted',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // Animation Durations (ms)
  ANIMATIONS: {
    FAST: 200,
    MEDIUM: 300,
    SLOW: 500,
    EXTRA_SLOW: 800
  },

  // Map Configuration
  MAP: {
    DEFAULT_LATITUDE: 28.6139,
    DEFAULT_LONGITUDE: 77.2090,
    DELTA: 0.0922
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  }
};

// Export individual constants for easier import
export const BUSINESS_TYPES = APP_CONFIG.BUSINESS_TYPES;
export const USER_ROLES = APP_CONFIG.USER_ROLES;
export const ORDER_STATUS = APP_CONFIG.ORDER_STATUS;
export const CONTENT_TEMPLATES = {
  PLATFORMS: [
    'Instagram',
    'Facebook',
    'WhatsApp Status',
    'Twitter',
    'LinkedIn',
    'General'
  ],
  
  TONES: [
    'Professional',
    'Casual',
    'Friendly',
    'Festive',
    'Urgent',
    'Promotional'
  ],
  
  CONTENT_TYPES: [
    'Promotional Caption',
    'Product Description',
    'Service Description',
    'Announcement',
    'Offer/Deal',
    'Customer Response',
    'FAQ Answer'
  ]
};

// App Theme Colors
export const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  secondary: '#10B981',
  accent: '#F59E0B',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Additional Colors
  purple: {
    50: '#F3F4F6',
    100: '#E5E7EB',
    200: '#D1D5DB',
    300: '#9CA3AF',
    400: '#6B7280',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95'
  },

  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A'
  },
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  },
  
  // Background
  background: '#F9FAFB',
  surface: '#FFFFFF',
  
  // Text
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    inverse: '#FFFFFF'
  }
};

// App Dimensions
export const DIMENSIONS = {
  PADDING: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  
  BORDER_RADIUS: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },
  
  ICON_SIZES: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40
  }
};
