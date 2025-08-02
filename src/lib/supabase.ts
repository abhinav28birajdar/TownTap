import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required variables:\n' +
    '- EXPO_PUBLIC_SUPABASE_URL\n' +
    '- EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Main Supabase client (for user operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'TownTap',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: Number(process.env.EXPO_PUBLIC_REALTIME_EVENTS_PER_SECOND) || 10,
    },
  },
});

// Admin Supabase client (for admin operations - if service key is available)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
};

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.EXPO_PUBLIC_SUPABASE_URL.includes('supabase.co')
  );
};

// Get configuration info
export const getSupabaseConfig = () => ({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
  realtimeEnabled: process.env.EXPO_PUBLIC_ENABLE_REALTIME === 'true',
});

// Mock data for demo
export const mockBusinessCategories = [
  { id: '1', name: 'Stationary', icon: '📝', description: 'Stationery shops, office supplies, books', created_at: new Date().toISOString() },
  { id: '2', name: 'Salon & Beauty', icon: '💇', description: 'Hair salons, beauty parlors, spas', created_at: new Date().toISOString() },
  { id: '3', name: 'Bookstore', icon: '📚', description: 'Book shops, libraries, educational materials', created_at: new Date().toISOString() },
  { id: '4', name: 'Carpenter', icon: '🔨', description: 'Furniture making, wood work, repairs', created_at: new Date().toISOString() },
  { id: '5', name: 'Study Center', icon: '🎓', description: 'Coaching centers, tuition classes, education', created_at: new Date().toISOString() },
  { id: '6', name: 'Library', icon: '📖', description: 'Public libraries, reading rooms', created_at: new Date().toISOString() },
  { id: '7', name: 'Grocery', icon: '🛒', description: 'Grocery stores, supermarkets, daily needs', created_at: new Date().toISOString() },
  { id: '8', name: 'Restaurant', icon: '🍽️', description: 'Restaurants, cafes, food outlets', created_at: new Date().toISOString() },
  { id: '9', name: 'Medical', icon: '⚕️', description: 'Hospitals, clinics, pharmacies', created_at: new Date().toISOString() },
  { id: '10', name: 'Electronics', icon: '📱', description: 'Mobile shops, computer stores, electronics', created_at: new Date().toISOString() },
];

export const mockBusinesses = [
  {
    id: '1',
    owner_id: 'demo-business-1',
    category_id: '1',
    business_name: 'Ram Stationary Store',
    description: 'Complete stationary items, notebooks, pens, office supplies',
    phone_number: '+91 9876543210',
    whatsapp_number: '+91 9876543210',
    email: 'ram.stationary@gmail.com',
    location: { latitude: 19.0760, longitude: 72.8777 },
    address: 'Shop No. 15, Mumbai Central, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400008',
    landmark: 'Near Railway Station',
    business_hours: {},
    services: ['Notebooks', 'Pens', 'Office Supplies', 'Printing'],
    images: [],
    rating: 4.2,
    total_reviews: 25,
    is_verified: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    distance_km: 0.5,
    category: { id: '1', name: 'Stationary', icon: '📝', description: 'Stationery shops', created_at: new Date().toISOString() }
  },
  {
    id: '2',
    owner_id: 'demo-business-2',
    category_id: '2',
    business_name: 'Beauty Palace Salon',
    description: 'Professional hair cutting, styling, beauty treatments',
    phone_number: '+91 9876543211',
    whatsapp_number: '+91 9876543211',
    email: 'beauty.palace@gmail.com',
    location: { latitude: 19.0750, longitude: 72.8770 },
    address: 'Shop No. 22, Linking Road, Bandra',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    landmark: 'Near Bandra Station',
    business_hours: {},
    services: ['Hair Cut', 'Hair Styling', 'Facial', 'Manicure', 'Pedicure'],
    images: [],
    rating: 4.5,
    total_reviews: 42,
    is_verified: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    distance_km: 0.8,
    category: { id: '2', name: 'Salon & Beauty', icon: '💇', description: 'Hair salons, beauty parlors', created_at: new Date().toISOString() }
  },
  {
    id: '3',
    owner_id: 'demo-business-3',
    category_id: '4',
    business_name: 'Sharma Carpentry Works',
    description: 'Custom furniture, wood work, home repairs',
    phone_number: '+91 9876543212',
    whatsapp_number: '+91 9876543212',
    email: 'sharma.carpentry@gmail.com',
    location: { latitude: 19.0740, longitude: 72.8760 },
    address: 'Workshop 5, Industrial Area, Andheri',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    landmark: 'Near Metro Station',
    business_hours: {},
    services: ['Custom Furniture', 'Wood Repair', 'Door Installation', 'Kitchen Cabinets'],
    images: [],
    rating: 4.7,
    total_reviews: 18,
    is_verified: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    distance_km: 1.2,
    category: { id: '4', name: 'Carpenter', icon: '🔨', description: 'Furniture making, wood work', created_at: new Date().toISOString() }
  }
];

// Auth helper functions
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Create or ensure profile exists
export const createOrUpdateProfile = async (userId: string, userData: any) => {
  try {
    // First try to get existing profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name || existingProfile.full_name,
          phone: userData.phone_number || userData.phone || existingProfile.phone,
          user_type: userData.user_type || existingProfile.user_type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            full_name: userData.full_name || userData.name || '',
            phone: userData.phone_number || userData.phone || null,
            user_type: userData.user_type || 'customer',
            email_verified: userData.email_verified || false,
            referral_code: userData.referral_code || null,
            referred_by: userData.referred_by || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      return { data, error };
    }
  } catch (error) {
    console.error('Profile creation/update error:', error);
    return { data: null, error };
  }
};

// Enhanced function to get or create profile
export const getOrCreateProfile = async (userId: string, userData?: any) => {
  try {
    // First try to get existing profile
    const { data: profile, error: getError } = await getProfile(userId);
    
    if (!getError && profile) {
      return { data: profile, error: null };
    }
    
    // If profile doesn't exist, create it
    if (userData) {
      return await createOrUpdateProfile(userId, userData);
    } else {
      // Create basic profile with minimal data
      return await createOrUpdateProfile(userId, {
        full_name: '',
        user_type: 'customer'
      });
    }
  } catch (error) {
    console.error('Get or create profile error:', error);
    return { data: null, error };
  }
};

// Database helper functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const getBusiness = async (businessId: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      categories(name, icon_url),
      products(*),
      services(*)
    `)
    .eq('id', businessId)
    .single();
  return { data, error };
};

export const getBusinessesByLocation = async (latitude: number, longitude: number, radius: number = 10) => {
  const { data, error } = await supabase.rpc('get_businesses_within_radius', {
    lat: latitude,
    lng: longitude,
    radius_km: radius
  });
  return { data, error };
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return { data, error };
};

// Real-time subscriptions
export const subscribeToOrders = (businessId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `business_id=eq.${businessId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToServiceRequests = (businessId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('service_requests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'service_requests',
        filter: `business_id=eq.${businessId}`,
      },
      callback
    )
    .subscribe();
};

// AI Integration helper functions
export const generateAIContent = async (payload: {
  businessId: string;
  promptText: string;
  contentType: string;
  platform: string;
  tone: string;
  language: string;
}) => {
  const { data, error } = await supabase.functions.invoke('generate-ai-content', {
    body: payload,
  });
  return { data, error };
};

export const getAICustomerSuggestions = async (payload: {
  businessId: string;
  customerId: string;
  contextType: string;
  contextId: string;
  customerQuery?: string;
  language: string;
}) => {
  const { data, error } = await supabase.functions.invoke('ai-customer-interaction', {
    body: payload,
  });
  return { data, error };
};

export const getPerformanceInsights = async (payload: {
  businessId: string;
  reportPeriod: string;
  language: string;
}) => {
  const { data, error } = await supabase.functions.invoke('get-performance-summary', {
    body: payload,
  });
  return { data, error };
};

export const customerAIAssistant = async (payload: {
  customerId: string;
  queryText: string;
  latitude: number;
  longitude: number;
  language: string;
}) => {
  const { data, error } = await supabase.functions.invoke('customer-ai-assistant', {
    body: payload,
  });
  return { data, error };
};

// Additional functions for business and customer screens
export const getBusinessCategories = async () => {
  if (!isSupabaseConfigured()) {
    return { data: mockBusinessCategories, error: null };
  }
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true);
  
  return { data: data || mockBusinessCategories, error };
};

export const getNearbyBusinesses = async (latitude: number, longitude: number, radius = 10) => {
  if (!isSupabaseConfigured()) {
    return { data: mockBusinesses, error: null };
  }
  
  // For now, return mock data. In real implementation, you'd use PostGIS or similar
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_approved', true);
  
  return { data: data || mockBusinesses, error };
};

export const getPopularProducts = async (limit = 10) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }
  
  const { data, error } = await supabase
    .from('products')
    .select('*, businesses(name)')
    .eq('is_available', true)
    .limit(limit);
  
  return { data: data || [], error };
};

export const getBusinessAnalytics = async (businessId: string) => {
  if (!isSupabaseConfigured()) {
    return { 
      data: {
        totalOrders: 45,
        totalRevenue: 12500,
        averageRating: 4.2,
        totalCustomers: 23
      }, 
      error: null 
    };
  }
  
  // Aggregate analytics data
  const { data, error } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('business_id', businessId);
  
  if (error) return { data: null, error };
  
  const totalOrders = data.length;
  const totalRevenue = data.reduce((sum, order) => sum + order.total_amount, 0);
  
  return { 
    data: {
      totalOrders,
      totalRevenue,
      averageRating: 4.2, // Mock for now
      totalCustomers: Math.floor(totalOrders * 0.7) // Mock calculation
    }, 
    error: null 
  };
};

export const getRecentOrders = async (businessId: string, limit = 5) => {
  if (!isSupabaseConfigured()) {
    return { 
      data: [
        {
          id: '1',
          customer_id: 'cust1',
          business_id: businessId,
          total_amount: 350,
          delivery_charge: 30,
          platform_commission_amount: 25,
          order_status: 'pending',
          payment_status: 'paid',
          payment_method: 'upi',
          delivery_option: 'delivery',
          delivery_address_json: {},
          order_notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          order_number: 'ORD001',
          status: 'pending',
          customer_name: 'John Doe'
        }
      ], 
      error: null 
    };
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, profiles(full_name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return { data: data || [], error };
};
