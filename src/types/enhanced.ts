// =====================================================
// ENHANCED TOWNTAP - CORE TYPE DEFINITIONS
// Comprehensive type system for hyperlocal ecosystem
// =====================================================

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  profile_picture_url?: string; // Alternative field name for compatibility
  user_type: 'customer' | 'business_owner' | 'staff' | 'admin';
  location?: Location;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  language_preference: string;
  ai_preferences: Record<string, any>;
  personality_insights: Record<string, any>;
  dietary_preferences?: string[];
  interests?: string[];
  spending_habits: Record<string, any>;
  is_verified: boolean;
  is_active: boolean;
  onboarding_completed: boolean;
  referral_code?: string;
  referred_by?: string;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_loyalty_points: number;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  ai_tags: string[];
  interaction_type: 'shopping' | 'booking' | 'consultation' | 'service';
  sort_order: number;
  is_active: boolean;
  parent_category_id?: string;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  category_id: string;
  business_name: string;
  description?: string;
  short_description?: string;
  business_type: 'type_a' | 'type_b' | 'type_c';
  email?: string;
  phone?: string;
  phone_number?: string;
  whatsapp_number?: string;
  website_url?: string;
  social_media: Record<string, string>;
  location?: Location;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  service_area?: any; // PostGIS geometry
  business_hours: Record<string, any>;
  special_hours: Record<string, any>;
  services: string[];
  amenities: string[];
  payment_methods: string[];
  languages_spoken: string[];
  image_url?: string;
  logo_url?: string;
  banner_url?: string;
  images: string[];
  videos: string[];
  rating: number;
  review_count: number;
  total_reviews: number;
  total_orders: number;
  total_revenue: number;
  ai_description?: string;
  ai_tags: string[];
  ai_performance_score: number;
  peak_hours: Record<string, any>;
  seasonal_trends: Record<string, any>;
  customer_demographics: Record<string, any>;
  is_verified: boolean;
  is_active: boolean;
  is_featured: boolean;
  is_open: boolean;
  is_premium: boolean;
  subscription_tier: 'basic' | 'pro' | 'enterprise';
  delivery_available: boolean;
  pickup_available: boolean;
  dine_in_available: boolean;
  home_service_available: boolean;
  minimum_order_amount: number;
  delivery_fee: number;
  free_delivery_above?: number;
  estimated_delivery_time: number;
  max_delivery_distance: number;
  emergency_contact?: string;
  business_license?: string;
  tax_id?: string;
  commission_rate: number;
  next_payout_date?: string;
  payout_account_details: Record<string, any>;
  notification_preferences: Record<string, any>;
  staff_count: number;
  created_at: string;
  updated_at: string;
  
  // Calculated fields
  distance_km?: number;
  category?: BusinessCategory;
}

export interface Product {
  id: string;
  business_id: string;
  category_id?: string;
  name: string;
  description?: string;
  ai_description?: string;
  short_description?: string;
  price: number;
  original_price?: number;
  discount_percentage: number;
  category?: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  sku?: string;
  barcode?: string;
  tags: string[];
  ingredients: string[];
  nutritional_info: Record<string, any>;
  allergen_info: string[];
  image_url?: string;
  images: string[];
  videos: string[];
  variants: ProductVariant[];
  customization_options: CustomizationOption[];
  is_available: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  unit: string;
  weight?: number;
  dimensions: Record<string, number>;
  preparation_time: number;
  shelf_life_days?: number;
  storage_requirements?: string;
  ai_recommendations: Record<string, any>;
  popularity_score: number;
  seasonal_availability: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price_adjustment: number;
  stock_quantity: number;
  is_available: boolean;
  attributes: Record<string, string>;
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: 'single_select' | 'multi_select' | 'text_input' | 'number_input';
  options: CustomizationChoice[];
  is_required: boolean;
  max_selections?: number;
}

export interface CustomizationChoice {
  id: string;
  name: string;
  price_adjustment: number;
  is_available: boolean;
}

export interface Service {
  id: string;
  business_id: string;
  category_id?: string;
  name: string;
  description?: string;
  ai_description?: string;
  price?: number;
  price_type: 'fixed' | 'hourly' | 'custom';
  duration_minutes?: number;
  service_type: 'on_site' | 'remote' | 'in_store';
  skill_level: 'basic' | 'intermediate' | 'expert';
  equipment_required: string[];
  preparation_required?: string;
  cancellation_policy?: string;
  advance_booking_hours: number;
  max_bookings_per_day: number;
  staff_required: number;
  location_requirements?: string;
  ai_pricing_suggestions: Record<string, any>;
  seasonal_pricing: Record<string, any>;
  emergency_multiplier: number;
  is_available: boolean;
  is_emergency_service: boolean;
  image_url?: string;
  images: string[];
  videos: string[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id?: string;
  service_id?: string;
  business_id: string;
  name: string;
  price: number;
  quantity: number;
  variants?: ProductVariant[];
  customizations?: Record<string, any>;
  special_instructions?: string;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  business_id: string;
  staff_id?: string;
  order_type: 'product' | 'service' | 'mixed';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  delivery_charge: number;
  platform_commission_amount: number;
  discount_amount: number;
  loyalty_points_used: number;
  loyalty_points_earned: number;
  coupon_code?: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_details: Record<string, any>;
  delivery_option: 'pickup' | 'delivery' | 'dine_in' | 'on_site_service';
  delivery_address_json?: Location;
  delivery_instructions?: string;
  scheduled_for?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  order_notes?: string;
  special_instructions?: string;
  items: OrderItem[];
  tracking_updates: TrackingUpdate[];
  ai_recommendations: Record<string, any>;
  customer_rating?: number;
  customer_feedback?: string;
  business_notes?: string;
  cancellation_reason?: string;
  refund_amount: number;
  created_at: string;
  updated_at: string;
  
  // Related data
  business?: Business;
  customer?: UserProfile;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'partial';

export interface OrderItem {
  id: string;
  product_id?: string;
  service_id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  total_price: number;
  variants?: ProductVariant[];
  customizations?: Record<string, any>;
  special_instructions?: string;
  image_url?: string;
}

export interface TrackingUpdate {
  timestamp: string;
  status: OrderStatus;
  message: string;
  location?: Location;
  updated_by: string;
}

export interface ServiceRequest {
  id: string;
  request_number: string;
  customer_id: string;
  business_id: string;
  staff_id?: string;
  service_id: string;
  title: string;
  description: string;
  problem_images: string[];
  problem_videos: string[];
  priority_level: 'low' | 'medium' | 'high' | 'emergency';
  location_address?: string;
  location_coordinates?: Location;
  preferred_date?: string;
  preferred_time_slot?: string;
  estimated_duration?: number;
  quoted_price?: number;
  final_price?: number;
  status: ServiceRequestStatus;
  payment_status: PaymentStatus;
  ai_analysis: Record<string, any>;
  completion_images: string[];
  completion_video?: string;
  customer_satisfaction?: number;
  created_at: string;
  updated_at: string;
  
  // Related data
  service?: Service;
  business?: Business;
  customer?: UserProfile;
}

export type ServiceRequestStatus = 
  | 'submitted' 
  | 'quoted' 
  | 'accepted' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface Payment {
  id: string;
  order_id?: string;
  service_request_id?: string;
  customer_id: string;
  business_id: string;
  payment_gateway: 'razorpay' | 'wallet' | 'cod' | 'upi_direct';
  gateway_transaction_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  gateway_response: Record<string, any>;
  failure_reason?: string;
  refund_amount: number;
  refund_reason?: string;
  created_at: string;
  completed_at?: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_type: 'credit' | 'debit' | 'refund' | 'cashback' | 'referral_bonus';
  amount: number;
  balance_after: number;
  description?: string;
  reference_order_id?: string;
  payment_id?: string;
  created_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  business_id: string;
  order_id?: string;
  service_request_id?: string;
  product_id?: string;
  rating: number;
  comment?: string;
  images: string[];
  videos: string[];
  review_tags: string[];
  sentiment_score?: number;
  ai_analysis: Record<string, any>;
  is_verified: boolean;
  helpful_count: number;
  business_reply?: string;
  business_reply_date?: string;
  is_featured: boolean;
  created_at: string;
  
  // Related data
  customer?: UserProfile;
  business?: Business;
}

export interface ChatMessage {
  id: string;
  order_id?: string;
  service_request_id?: string;
  sender_id: string;
  recipient_id: string;
  message_type: 'text' | 'image' | 'audio' | 'location' | 'file';
  content?: string;
  media_url?: string;
  is_read: boolean;
  is_ai_suggestion: boolean;
  ai_confidence?: number;
  created_at: string;
  
  // Related data
  sender?: UserProfile;
  recipient?: UserProfile;
}

export interface AIContentItem {
  id: string;
  business_id?: string;
  user_id: string;
  content_type: AIContentType;
  prompt: string;
  generated_content: string;
  ai_model: string;
  language: string;
  tone?: string;
  platform?: string;
  is_favorite: boolean;
  usage_count: number;
  last_used?: string;
  tags: string[];
  created_at: string;
}

export type AIContentType = 
  | 'product_description' 
  | 'marketing_caption' 
  | 'social_post' 
  | 'email_content' 
  | 'sms_content' 
  | 'review_response';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, any>;
  is_read: boolean;
  is_sent: boolean;
  scheduled_for: string;
  sent_at?: string;
  created_at: string;
}

export interface SearchFilters {
  category?: string;
  business_type?: 'type_a' | 'type_b' | 'type_c';
  min_rating?: number;
  max_distance?: number;
  is_open_only?: boolean;
  delivery_available?: boolean;
  min_price?: number;
  max_price?: number;
  sort_by?: 'distance' | 'rating' | 'popularity' | 'ai_score' | 'price_low' | 'price_high';
}

export interface AppConfig {
  api_timeout: number;
  max_retries: number;
  default_location: Location;
  default_radius: number;
  min_order_amount: number;
  default_delivery_fee: number;
  points_per_rupee: number;
  max_image_size: number;
  supported_languages: string[];
  payment_methods: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'upi' | 'wallet' | 'cod' | 'net_banking';
  icon: string;
  is_enabled: boolean;
  min_amount?: number;
  max_amount?: number;
}

export interface BusinessAnalytics {
  id: string;
  business_id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  new_customers: number;
  repeat_customers: number;
  average_order_value: number;
  peak_hour?: number;
  popular_products: any[];
  customer_demographics: Record<string, any>;
  ai_insights: Record<string, any>;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    has_more?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Auth Types
export interface AuthState {
  user: UserProfile | null;
  session: any;
  loading: boolean;
  error: AppError | null;
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  BusinessDashboard: undefined;
  OrderTracking: { orderId: string };
  BusinessDetail: { businessId: string };
  ProductDetail: { productId: string };
  ServiceDetail: { serviceId: string };
  Checkout: { items: CartItem[] };
  Payment: { orderId: string };
  Profile: undefined;
  Settings: undefined;
  AIChat: undefined;
  Reviews: { businessId: string };
  Analytics: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Orders: undefined;
  Wallet: undefined;
  Profile: undefined;
};

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: Record<string, number>;
  typography: Record<string, any>;
  shadows: Record<string, any>;
  borderRadius: Record<string, number>;
}

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  padding?: number;
  margin?: number;
  elevation?: number;
  borderRadius?: number;
  backgroundColor?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: 'text' | 'email' | 'password' | 'phone' | 'number';
  multiline?: boolean;
  rows?: number;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
