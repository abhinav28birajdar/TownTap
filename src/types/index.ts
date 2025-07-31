// =====================================================
// TownTap Complete Type Definitions
// =====================================================

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      businesses: {
        Row: Business;
        Insert: BusinessInsert;
        Update: BusinessUpdate;
      };
      business_categories: {
        Row: BusinessCategory;
        Insert: BusinessCategoryInsert;
        Update: BusinessCategoryUpdate;
      };
      business_subcategories: {
        Row: BusinessSubcategory;
        Insert: BusinessSubcategoryInsert;
        Update: BusinessSubcategoryUpdate;
      };
      services: {
        Row: Service;
        Insert: ServiceInsert;
        Update: ServiceUpdate;
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      order_items: {
        Row: OrderItem;
        Insert: OrderItemInsert;
        Update: OrderItemUpdate;
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      conversations: {
        Row: Conversation;
        Insert: ConversationInsert;
        Update: ConversationUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      customer_addresses: {
        Row: CustomerAddress;
        Insert: CustomerAddressInsert;
        Update: CustomerAddressUpdate;
      };
      customer_payment_methods: {
        Row: PaymentMethod;
        Insert: PaymentMethodInsert;
        Update: PaymentMethodUpdate;
      };
      coupons: {
        Row: Coupon;
        Insert: CouponInsert;
        Update: CouponUpdate;
      };
      loyalty_transactions: {
        Row: LoyaltyTransaction;
        Insert: LoyaltyTransactionInsert;
        Update: LoyaltyTransactionUpdate;
      };
      referrals: {
        Row: Referral;
        Insert: ReferralInsert;
        Update: ReferralUpdate;
      };
      customer_wishlists: {
        Row: CustomerWishlist;
        Insert: CustomerWishlistInsert;
        Update: CustomerWishlistUpdate;
      };
      business_staff: {
        Row: BusinessStaff;
        Insert: BusinessStaffInsert;
        Update: BusinessStaffUpdate;
      };
    };
    Functions: {
      get_nearby_businesses: {
        Args: {
          user_lat: number;
          user_lon: number;
          search_radius?: number;
          category_filter?: string;
          limit_count?: number;
        };
        Returns: NearbyBusiness[];
      };
      search_services: {
        Args: {
          search_query: string;
          user_lat?: number;
          user_lon?: number;
          search_radius?: number;
        };
        Returns: ServiceSearchResult[];
      };
      calculate_distance: {
        Args: {
          lat1: number;
          lon1: number;
          lat2: number;
          lon2: number;
        };
        Returns: number;
      };
    };
  };
}

// =====================================================
// Core Entity Types
// =====================================================

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  user_type: 'customer' | 'business_owner' | 'admin';
  avatar_url: string | null;
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  language_preference: string;
  notification_preferences: NotificationPreferences;
  loyalty_points: number;
  membership_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface BusinessCategory {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessSubcategory {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  whatsapp_number: string | null;
  address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  location: Location | null;
  service_area_radius: number;
  services: string[];
  specialties: string[];
  images: string[];
  business_hours: BusinessHours;
  about_us: string | null;
  mission_statement: string | null;
  certifications: string[];
  is_open: boolean;
  is_verified: boolean;
  is_featured: boolean;
  is_premium: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  rating: number;
  total_reviews: number;
  total_orders: number;
  delivery_radius: number;
  min_order_amount: number;
  delivery_fee: number;
  estimated_delivery_time: number;
  emergency_service: boolean;
  instant_booking: boolean;
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  subscription_expires_at: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  gallery_images: string[];
  video_urls: string[];
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    is_closed: boolean;
  };
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  price: number | null;
  price_type: 'fixed' | 'hourly' | 'quote_based' | 'package';
  duration: number | null;
  images: string[];
  is_active: boolean;
  is_emergency: boolean;
  requires_site_visit: boolean;
  advance_booking_required: boolean;
  min_advance_hours: number;
  max_advance_days: number;
  availability_slots: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  category: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  images: string[];
  weight: number | null;
  dimensions: ProductDimensions | null;
  is_active: boolean;
  requires_shipping: boolean;
  digital_product: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface Order {
  id: string;
  customer_id: string;
  business_id: string;
  assigned_staff_id: string | null;
  order_number: string;
  order_type: 'service' | 'product' | 'mixed';
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'on_route' | 'arrived' | 'completed' | 'cancelled' | 'payment_pending';
  scheduled_date: string | null;
  scheduled_time_slot: string | null;
  is_emergency: boolean;
  requires_quote: boolean;
  quote_amount: number | null;
  quote_status: 'pending' | 'approved' | 'rejected' | null;
  service_address: Address;
  service_instructions: string | null;
  customer_location: Location | null;
  subtotal: number;
  service_fee: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  platform_fee: number;
  total_amount: number;
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refund';
  payment_id: string | null;
  escrow_amount: number | null;
  estimated_start_time: string | null;
  actual_start_time: string | null;
  estimated_completion_time: string | null;
  actual_completion_time: string | null;
  special_instructions: string | null;
  cancellation_reason: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: 'service' | 'product';
  service_id: string | null;
  product_id: string | null;
  variation_ids: string[];
  item_name: string;
  item_description: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  special_instructions: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  business_id: string;
  order_id: string | null;
  service_id: string | null;
  rating: number;
  comment: string | null;
  images: string[];
  videos: string[];
  review_tags: string[];
  is_verified: boolean;
  helpful_count: number;
  response_from_business: string | null;
  response_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  business_id: string;
  order_id: string | null;
  last_message_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'location' | 'order_update' | 'voice' | 'video';
  attachment_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'order_update' | 'message' | 'promotion' | 'reminder' | 'system';
  data: Record<string, any>;
  is_read: boolean;
  is_sent: boolean;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  customer_id: string;
  type: 'card' | 'upi' | 'wallet' | 'netbanking';
  provider: string | null;
  token: string | null;
  last_four: string | null;
  expiry_month: number | null;
  expiry_year: number | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  business_id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount' | 'free_delivery';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  user_usage_limit: number;
  applicable_categories: string[];
  applicable_services: string[];
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  order_id: string | null;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward_amount: number | null;
  order_id: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface CustomerWishlist {
  id: string;
  customer_id: string;
  business_id: string;
  service_id: string;
  created_at: string;
}

export interface BusinessStaff {
  id: string;
  business_id: string;
  profile_id: string;
  role: 'admin' | 'manager' | 'staff' | 'service_provider';
  permissions: Record<string, any>;
  is_active: boolean;
  hourly_rate: number | null;
  specializations: string[];
  created_at: string;
  updated_at: string;
}

// =====================================================
// Utility Types
// =====================================================

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  id?: string;
  label: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

export interface NearbyBusiness {
  business_id: string;
  business_name: string;
  distance_km: number;
  rating: number;
  total_reviews: number;
  is_open: boolean;
  estimated_delivery_time: number;
}

export interface ServiceSearchResult {
  business_id: string;
  service_id: string;
  business_name: string;
  service_name: string;
  distance_km: number;
  relevance_score: number;
}

// =====================================================
// Insert/Update Types
// =====================================================

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at' | 'loyalty_points' | 'membership_tier'>;
export type ProfileUpdate = Partial<ProfileInsert>;

export type BusinessInsert = Omit<Business, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_reviews' | 'total_orders'>;
export type BusinessUpdate = Partial<BusinessInsert>;

export type BusinessCategoryInsert = Omit<BusinessCategory, 'id' | 'created_at' | 'updated_at'>;
export type BusinessCategoryUpdate = Partial<BusinessCategoryInsert>;

export type BusinessSubcategoryInsert = Omit<BusinessSubcategory, 'id' | 'created_at' | 'updated_at'>;
export type BusinessSubcategoryUpdate = Partial<BusinessSubcategoryInsert>;

export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>;
export type ServiceUpdate = Partial<ServiceInsert>;

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;

export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_number'>;
export type OrderUpdate = Partial<OrderInsert>;

export type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at' | 'item_description'>;
export type OrderItemUpdate = Partial<OrderItemInsert>;

export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at' | 'helpful_count' | 'is_verified'>;
export type ReviewUpdate = Partial<ReviewInsert>;

export type ConversationInsert = Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'last_message_at'>;
export type ConversationUpdate = Partial<ConversationInsert>;

export type MessageInsert = Omit<Message, 'id' | 'created_at' | 'is_read' | 'read_at'>;
export type MessageUpdate = Partial<MessageInsert>;

export type NotificationInsert = Omit<Notification, 'id' | 'created_at' | 'is_read' | 'is_sent' | 'sent_at'> & {
  is_read?: boolean;
  is_sent?: boolean;
  sent_at?: string | null;
  data?: Record<string, any>;
};
export type NotificationUpdate = Partial<NotificationInsert>;

export type CustomerAddressInsert = Omit<CustomerAddress, 'id' | 'created_at' | 'updated_at'>;
export type CustomerAddressUpdate = Partial<CustomerAddressInsert>;

export type PaymentMethodInsert = Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>;
export type PaymentMethodUpdate = Partial<PaymentMethodInsert>;

export type CouponInsert = Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'used_count'>;
export type CouponUpdate = Partial<CouponInsert>;

export type LoyaltyTransactionInsert = Omit<LoyaltyTransaction, 'id' | 'created_at'>;
export type LoyaltyTransactionUpdate = Partial<LoyaltyTransactionInsert>;

export type ReferralInsert = Omit<Referral, 'id' | 'created_at'>;
export type ReferralUpdate = Partial<ReferralInsert>;

export type CustomerWishlistInsert = Omit<CustomerWishlist, 'id' | 'created_at'>;
export type CustomerWishlistUpdate = Partial<CustomerWishlistInsert>;

export type BusinessStaffInsert = Omit<BusinessStaff, 'id' | 'created_at' | 'updated_at'>;
export type BusinessStaffUpdate = Partial<BusinessStaffInsert>;

// =====================================================
// Authentication & State Types
// =====================================================

export interface User {
  id: string;
  email: string;
  phone?: string;
  profile: Profile;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
}

// =====================================================
// Screen Props & Navigation Types
// =====================================================

export interface OnboardingData {
  userType: 'customer' | 'business_owner';
  personalInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  location?: Location;
  businessInfo?: {
    businessName: string;
    category: string;
    address: string;
  };
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  distance?: number;
  availability?: 'available_now' | 'emergency' | 'advance_booking';
  sortBy?: 'relevance' | 'distance' | 'rating' | 'price_low' | 'price_high';
}

export interface CartItem {
  id: string;
  type: 'service' | 'product';
  businessId: string;
  serviceId?: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  variations?: string[];
  specialInstructions?: string;
}

export interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  scheduledDate?: string;
  scheduledTime?: string;
  specialInstructions?: string;
}

// =====================================================
// API Response Types
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface BusinessWithDistance extends Omit<Business, 'services'> {
  distance?: number;
  services?: Service[];
  reviews?: Review[];
}

export interface OrderWithDetails extends Order {
  business?: Business;
  customer?: Profile;
  items?: OrderItem[];
  reviews?: Review[];
}

// =====================================================
// Form & Validation Types
// =====================================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: 'customer' | 'business_owner';
  acceptTerms: boolean;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message: string;
}

// =====================================================
// Theme & UI Types
// =====================================================

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  fonts: {
    regular: string;
    medium: string;
    bold: string;
    light: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export interface UIState {
  theme: 'light' | 'dark';
  language: string;
  isLoading: boolean;
  snackbar: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
}

// =====================================================
// Analytics & Tracking Types
// =====================================================

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface BusinessAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerRetentionRate: number;
  popularServices: Array<{
    serviceId: string;
    serviceName: string;
    orderCount: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
  }>;
  customerDemographics: {
    ageGroups: Record<string, number>;
    locations: Record<string, number>;
  };
}

// =====================================================
// Real-time & WebSocket Types
// =====================================================

export interface RealtimeEvent {
  type: 'order_update' | 'new_message' | 'location_update' | 'business_status';
  payload: any;
  timestamp: string;
}

export interface LocationUpdate {
  userId: string;
  location: Location;
  timestamp: string;
  accuracy?: number;
}

// =====================================================
// Integration Types (Payment, Maps, etc.)
// =====================================================

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret?: string;
}

export interface MapMarker {
  id: string;
  coordinate: Location;
  title: string;
  description?: string;
  type: 'business' | 'customer' | 'service_provider';
  icon?: string;
}

export interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  coordinates: Location[];
}

// =====================================================
// Export all types
// =====================================================

export default Database;
