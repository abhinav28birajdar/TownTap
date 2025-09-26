// Supabase configuration
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
};

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.towntap.com',
  timeout: 30000,
};

// App configuration
export const APP_CONFIG = {
  name: 'TownTap',
  version: '1.0.0',
  environment: process.env.EXPO_PUBLIC_ENV || 'development',
  deepLinkScheme: 'towntap',
};

// Feature flags
export const FEATURES = {
  enablePush: true,
  enableAnalytics: true,
  enableGeolocation: true,
  enablePayments: true,
  enableReviews: true,
  enableChat: true,
};

// Constants
export const CONSTANTS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES_PER_BUSINESS: 10,
  DEFAULT_PAGINATION_LIMIT: 20,
  SEARCH_DEBOUNCE_MS: 300,
  LOCATION_UPDATE_INTERVAL: 30000, // 30 seconds
  DEFAULT_MAP_RADIUS: 10000, // 10km in meters
};

// Business categories
export const BUSINESS_CATEGORIES = [
  { label: 'Restaurant', value: 'restaurant', icon: '🍽️' },
  { label: 'Retail Store', value: 'retail', icon: '🛍️' },
  { label: 'Service Provider', value: 'service', icon: '🔧' },
  { label: 'Healthcare', value: 'healthcare', icon: '🏥' },
  { label: 'Beauty & Wellness', value: 'beauty', icon: '💅' },
  { label: 'Education', value: 'education', icon: '📚' },
  { label: 'Entertainment', value: 'entertainment', icon: '🎬' },
  { label: 'Professional Services', value: 'professional', icon: '💼' },
  { label: 'Other', value: 'other', icon: '📍' },
] as const;

// Default business hours
export const DEFAULT_BUSINESS_HOURS = {
  monday: { open: '09:00', close: '17:00', is_closed: false },
  tuesday: { open: '09:00', close: '17:00', is_closed: false },
  wednesday: { open: '09:00', close: '17:00', is_closed: false },
  thursday: { open: '09:00', close: '17:00', is_closed: false },
  friday: { open: '09:00', close: '17:00', is_closed: false },
  saturday: { open: '09:00', close: '17:00', is_closed: false },
  sunday: { open: '09:00', close: '17:00', is_closed: true },
};

// Color palette
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#64D2FF',
  
  // Grays
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};