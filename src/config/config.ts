// Supabase configuration (TownTap backend)
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '', // Only for server-side operations
};

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.towntap.com',
  timeout: 30000,
  supabaseUrl: SUPABASE_CONFIG.url,
  supabaseAnonKey: SUPABASE_CONFIG.anonKey,
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

// TownTap Business Categories with Four Interaction Types
export const BUSINESS_CATEGORIES = {
  // Type A: "Order & Buy Now" (Product-Oriented)
  TYPE_A: [
    { label: 'Grocery Shop / General Store', value: 'grocery', icon: '🛒', type: 'type_a', description: 'Fresh groceries, snacks, and daily essentials' },
    { label: 'Pharmacy', value: 'pharmacy', icon: '💊', type: 'type_a', description: 'Medicines, health products, and medical supplies' },
    { label: 'Bakery/Sweet Shop', value: 'bakery', icon: '🧁', type: 'type_a', description: 'Fresh baked goods, cakes, and traditional sweets' },
    { label: 'Books & Stationery', value: 'books_stationery', icon: '📚', type: 'type_a', description: 'Books, office supplies, and educational materials' },
    { label: 'Organic Farming (Direct Sales)', value: 'organic_farm', icon: '🌱', type: 'type_a', description: 'Fresh organic produce directly from farmers' },
    { label: 'Tailoring (Ready Products)', value: 'tailoring_products', icon: '👕', type: 'type_a', description: 'Ready-made clothing and accessories' },
    { label: 'Electronics & Gadgets', value: 'electronics', icon: '📱', type: 'type_a', description: 'Mobile phones, computers, and electronic accessories' },
    { label: 'Home & Kitchen', value: 'home_kitchen', icon: '🏠', type: 'type_a', description: 'Household items, kitchenware, and home decor' },
  ],
  
  // Type B: "Book & Request Service" (Appointment/Service-Oriented)
  TYPE_B: [
    { label: 'Home Repair Services', value: 'home_repair', icon: '🔧', type: 'type_b', description: 'Plumbing, electrical, and general home maintenance' },
    { label: 'Beauty & Wellness', value: 'beauty_wellness', icon: '💆‍♀️', type: 'type_b', description: 'Salon, spa, massage, and wellness services' },
    { label: 'Cleaning Services', value: 'cleaning', icon: '🧽', type: 'type_b', description: 'House cleaning, deep cleaning, and sanitization' },
    { label: 'Tutoring & Education', value: 'tutoring', icon: '👨‍🏫', type: 'type_b', description: 'Private tutoring, coaching, and skill development' },
    { label: 'Vehicle Services', value: 'vehicle_services', icon: '🚗', type: 'type_b', description: 'Car/bike repair, maintenance, and servicing' },
    { label: 'Pet Care Services', value: 'pet_care', icon: '🐕', type: 'type_b', description: 'Pet grooming, veterinary care, and pet sitting' },
    { label: 'Fitness & Sports Training', value: 'fitness_training', icon: '🏃‍♂️', type: 'type_b', description: 'Personal training, sports coaching, and fitness classes' },
    { label: 'Healthcare Services', value: 'healthcare', icon: '🏥', type: 'type_b', description: 'Doctor consultations, physiotherapy, and health checkups' },
  ],
  
  // Type C: "Inquire & Consult" (Lead Generation / Complex Project-Oriented)
  TYPE_C: [
    { label: 'Real Estate', value: 'real_estate', icon: '🏠', type: 'type_c', description: 'Property buying, selling, and rental consultations' },
    { label: 'Travel & Tourism', value: 'travel_tourism', icon: '✈️', type: 'type_c', description: 'Trip planning, bookings, and travel consultation' },
    { label: 'Event Planning', value: 'event_planning', icon: '🎉', type: 'type_c', description: 'Wedding planning, party organization, and event management' },
    { label: 'Legal Services', value: 'legal_services', icon: '⚖️', type: 'type_c', description: 'Legal advice, documentation, and consultation' },
    { label: 'Financial Services', value: 'financial_services', icon: '💰', type: 'type_c', description: 'Insurance, loans, and financial planning' },
    { label: 'Construction & Architecture', value: 'construction', icon: '🏗️', type: 'type_c', description: 'Building construction, architecture, and interior design' },
    { label: 'Business Consulting', value: 'business_consulting', icon: '📊', type: 'type_c', description: 'Business strategy, marketing, and management consulting' },
    { label: 'IT & Software Development', value: 'it_development', icon: '💻', type: 'type_c', description: 'Software development, IT consulting, and digital solutions' },
  ],

  // Type D: "Rent & Use" (Rental Services)
  TYPE_D: [
    { label: 'Costume & Clothing Rental', value: 'costume_rental', icon: '👗', type: 'type_d', description: 'Wedding wear, costumes, and formal clothing rentals' },
    { label: 'Equipment Rental', value: 'equipment_rental', icon: '🛠️', type: 'type_d', description: 'Construction tools, party equipment, and machinery' },
    { label: 'Vehicle Rental', value: 'vehicle_rental', icon: '🚲', type: 'type_d', description: 'Bikes, cars, and commercial vehicle rentals' },
    { label: 'Event Equipment', value: 'event_equipment', icon: '🎵', type: 'type_d', description: 'Sound systems, decorations, and event supplies' },
    { label: 'Sports Equipment', value: 'sports_equipment', icon: '🏸', type: 'type_d', description: 'Sports gear, fitness equipment, and outdoor activity rentals' },
    { label: 'Electronics Rental', value: 'electronics_rental', icon: '📺', type: 'type_d', description: 'TVs, projectors, cameras, and electronic equipment rentals' },
    { label: 'Furniture Rental', value: 'furniture_rental', icon: '🪑', type: 'type_d', description: 'Temporary furniture solutions for homes and events' },
    { label: 'Book & Media Rental', value: 'book_rental', icon: '📖', type: 'type_d', description: 'Book lending, DVD rentals, and educational material sharing' },
  ]
} as const;

// Flatten all categories for easy access
export const ALL_BUSINESS_CATEGORIES = [
  ...BUSINESS_CATEGORIES.TYPE_A,
  ...BUSINESS_CATEGORIES.TYPE_B,
  ...BUSINESS_CATEGORIES.TYPE_C,
  ...BUSINESS_CATEGORIES.TYPE_D
] as const;

// Business interaction type definitions
export const INTERACTION_TYPES = {
  TYPE_A: {
    name: 'Order & Buy',
    description: 'Browse products and place orders for immediate or scheduled delivery',
    flowSteps: ['Browse Products', 'Add to Cart', 'Place Order', 'Track Delivery', 'Receive & Pay'],
    paymentTiming: 'on_delivery_or_online',
    features: ['product_catalog', 'inventory_management', 'order_tracking', 'delivery_options']
  },
  TYPE_B: {
    name: 'Book & Track Service',
    description: 'Schedule appointments and track service providers in real-time',
    flowSteps: ['Browse Services', 'Book Appointment', 'Get Quote', 'Track Service Person', 'Complete & Pay'],
    paymentTiming: 'after_service_completion',
    features: ['appointment_booking', 'real_time_tracking', 'service_quotes', 'before_after_photos']
  },
  TYPE_C: {
    name: 'Inquire & Consult',
    description: 'Submit inquiries for complex projects and receive detailed proposals',
    flowSteps: ['Submit Inquiry', 'Receive Proposal', 'Negotiate Terms', 'Schedule Meeting', 'Finalize Deal'],
    paymentTiming: 'as_per_agreement',
    features: ['inquiry_forms', 'proposal_management', 'consultation_scheduling', 'project_tracking']
  },
  TYPE_D: {
    name: 'Rent & Use',
    description: 'Rent items for temporary use with flexible duration options',
    flowSteps: ['Browse Items', 'Check Availability', 'Book Rental', 'Pickup/Delivery', 'Return Item'],
    paymentTiming: 'advance_payment_with_deposit',
    features: ['availability_calendar', 'damage_protection', 'pickup_delivery_options', 'usage_tracking']
  }
} as const;

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