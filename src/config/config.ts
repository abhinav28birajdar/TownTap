// Firebase configuration (LocalMart backend)
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
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

// LocalMart Business Categories with Three Interaction Types
export const BUSINESS_CATEGORIES = {
  // Type A: "Order & Buy Now" (Product-Oriented)
  TYPE_A: [
    { label: 'Grocery Shop / General Store', value: 'grocery', icon: '🛒', type: 'type_a' },
    { label: 'Pharmacy', value: 'pharmacy', icon: '💊', type: 'type_a' },
    { label: 'Bakery/Sweet Shop', value: 'bakery', icon: '🧁', type: 'type_a' },
    { label: 'Stationary & Books', value: 'stationary', icon: '📚', type: 'type_a' },
    { label: 'Organic Farming (Direct Sales)', value: 'organic_farm', icon: '🌱', type: 'type_a' },
    { label: 'Tailoring (Products)', value: 'tailoring_products', icon: '👕', type: 'type_a' },
  ],
  
  // Type B: "Book & Request Service" (Appointment/Service-Oriented)
  TYPE_B: [
    { label: 'Electrician', value: 'electrician', icon: '⚡', type: 'type_b' },
    { label: 'Plumber', value: 'plumber', icon: '🔧', type: 'type_b' },
    { label: 'Sports Coach', value: 'sports_coach', icon: '🏃‍♂️', type: 'type_b' },
    { label: 'Care for Elderly Persons', value: 'elderly_care', icon: '👵', type: 'type_b' },
    { label: 'Tailoring/Embroidery (Services)', value: 'tailoring_services', icon: '✂️', type: 'type_b' },
    { label: 'Beauty & Salon Services', value: 'beauty_salon', icon: '💅', type: 'type_b' },
    { label: 'Appliance/IT Repair', value: 'appliance_repair', icon: '🔨', type: 'type_b' },
  ],
  
  // Type C: "Inquire & Consult" (Lead Generation / Complex Project-Oriented)
  TYPE_C: [
    { label: 'Travel Agency', value: 'travel_agency', icon: '✈️', type: 'type_c' },
    { label: 'Real Estate Business', value: 'real_estate', icon: '🏠', type: 'type_c' },
    { label: 'Construction/Handyman', value: 'construction', icon: '�️', type: 'type_c' },
    { label: 'Architectural/Interior Design', value: 'architecture', icon: '�', type: 'type_c' },
    { label: 'Legal/Consultancy Services', value: 'legal_consultancy', icon: '⚖️', type: 'type_c' },
  ]
} as const;

// Flatten all categories for easy access
export const ALL_BUSINESS_CATEGORIES = [
  ...BUSINESS_CATEGORIES.TYPE_A,
  ...BUSINESS_CATEGORIES.TYPE_B,
  ...BUSINESS_CATEGORIES.TYPE_C
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