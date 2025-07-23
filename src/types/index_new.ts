// Global types for the TownTap application

export type UserRole = 'customer' | 'business' | 'admin';
export type AppLanguage = 'en' | 'hi';

// Core User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  user_type: UserRole;
  avatar_url?: string;
  fcm_token?: string;
  locale?: AppLanguage;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  notifications_enabled: boolean;
  language: AppLanguage;
  delivery_updates: boolean;
  promotional_offers: boolean;
  ai_suggestions: boolean;
  theme: 'light' | 'dark' | 'auto';
}

// Business Types
export interface Business {
  id: string;
  business_name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  geojson_point?: any;
  contact_phone: string;
  contact_email?: string;
  website?: string;
  business_type: 'restaurant' | 'grocery' | 'pharmacy' | 'electronics' | 'clothing' | 'services' | 'electrician' | 'plumber' | 'other';
  specialized_categories: string[];
  operating_hours: OperatingHours;
  delivery_available: boolean;
  delivery_radius_km: number;
  min_order_value: number;
  delivery_charge: number;
  avg_rating: number;
  total_reviews: number;
  is_approved: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval';
  owner_id: string;
  bank_account_info_encrypted?: string;
  social_media_links?: SocialMediaLinks;
  created_at: string;
  updated_at: string;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string; // HH:MM format
  close: string; // HH:MM format
  is_closed: boolean;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
}

// Product and Service Types
export interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  image_urls: string[];
  category: string;
  subcategory?: string;
  unit: string;
  stock_quantity?: number;
  is_available: boolean;
  tags: string[];
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  created_at: string;
  updated_at: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  base_price: number;
  price_type: 'fixed' | 'hourly' | 'custom';
  category: string;
  subcategory?: string;
  duration_minutes?: number;
  is_available: boolean;
  service_area_km?: number;
  requirements?: string[];
  created_at: string;
  updated_at: string;
}

// Order and Transaction Types
export interface Order {
  id: string;
  customer_id: string;
  business_id: string;
  order_type: 'product' | 'service';
  items: OrderItem[];
  service_details?: ServiceBooking;
  subtotal: number;
  delivery_charge: number;
  service_charge: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  delivery_address?: Address;
  billing_address?: Address;
  delivery_instructions?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  tracking_id?: string;
  cancellation_reason?: string;
  rating?: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet' | 'net_banking';

export interface OrderItem {
  id: string;
  product_id?: string;
  service_id?: string;
  name: string;
  image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  customizations?: ProductCustomization[];
}

export interface ProductCustomization {
  option_name: string;
  selected_value: string;
  additional_price: number;
}

export interface ServiceBooking {
  service_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  service_address: Address;
  special_requirements?: string;
  technician_id?: string;
  completion_status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Address {
  id?: string;
  user_id?: string;
  label: string; // e.g., "Home", "Office", "Other"
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  address_type: 'home' | 'work' | 'other';
  created_at?: string;
}

// AI Service Types
export type AIContentType = 'PROMOTIONAL_CAPTION' | 'OFFER_HEADLINE' | 'PRODUCT_DESCRIPTION' | 'RESPONSE_TEMPLATE' | 'REMINDER_MESSAGE' | 'PERFORMANCE_SUMMARY' | 'CHAT_RESPONSE';
export type AITone = 'FESTIVE' | 'FORMAL' | 'CASUAL' | 'URGENT' | 'EMPATHETIC' | 'PROFESSIONAL' | 'FRIENDLY';
export type AIPlatform = 'INSTAGRAM' | 'WHATSAPP' | 'FACEBOOK' | 'WEBSITE' | 'EMAIL' | 'SMS' | 'CHAT_BOT';

export interface AIRequest {
  prompt: string;
  content_type: AIContentType;
  platform: AIPlatform;
  tone: AITone;
  language: AppLanguage;
  business_context?: BusinessContext;
  customer_context?: CustomerContext;
}

export interface BusinessContext {
  business_name: string;
  business_type: string;
  specializations: string[];
  recent_products?: Product[];
  recent_orders?: Order[];
  performance_data?: any;
}

export interface CustomerContext {
  location: Location;
  preferences: string[];
  recent_searches: string[];
  order_history: Order[];
}

export interface AIResponse {
  content: string;
  suggestions?: string[];
  confidence_score?: number;
  metadata?: {
    model_used: string;
    processing_time_ms: number;
    tokens_used?: number;
  };
}

export interface AIPromptHistory {
  id: string;
  profile_id: string;
  feature_type: 'content_gen' | 'customer_ai' | 'insights' | 'interaction_suggest';
  input_prompt: string;
  ai_response: string;
  meta_data?: any;
  cost?: number;
  language: AppLanguage;
  created_at: string;
}

// Chat and Communication Types
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'customer' | 'business' | 'ai' | 'system';
  message: string;
  message_type: 'text' | 'image' | 'voice' | 'ai_suggestion' | 'order_update' | 'location';
  attachment_urls?: string[];
  ai_metadata?: {
    suggestion_type: string;
    confidence: number;
    generated_responses?: string[];
  };
  timestamp: string;
  is_read: boolean;
  reply_to_message_id?: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  business_id: string;
  last_message: string;
  last_message_timestamp: string;
  unread_count_customer: number;
  unread_count_business: number;
  is_active: boolean;
  created_at: string;
}

// Location and Geography Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timestamp?: string;
  accuracy?: number; // in meters
}

export interface BusinessLocation extends Location {
  business_id: string;
  distance?: number; // in kilometers
  estimated_travel_time?: number; // in minutes
}

export interface DeliveryZone {
  id: string;
  business_id: string;
  zone_name: string;
  coordinates: Location[]; // Polygon coordinates
  delivery_charge: number;
  estimated_delivery_time_minutes: number;
  is_active: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  image_url?: string;
  action_url?: string;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_for?: string;
  expires_at?: string;
  created_at: string;
}

export type NotificationType = 
  | 'order_placed' 
  | 'order_confirmed' 
  | 'order_ready' 
  | 'order_delivered' 
  | 'order_cancelled'
  | 'payment_success' 
  | 'payment_failed'
  | 'promotion' 
  | 'discount_offer'
  | 'new_business' 
  | 'business_update'
  | 'ai_suggestion' 
  | 'system_update'
  | 'security_alert'
  | 'maintenance';

// Review and Rating Types
export interface Review {
  id: string;
  business_id: string;
  customer_id: string;
  order_id?: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  images?: string[];
  helpful_count: number;
  response_from_business?: string;
  response_timestamp?: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

// Analytics and Insights Types
export interface BusinessAnalytics {
  business_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  new_customers: number;
  returning_customers: number;
  customer_satisfaction: number;
  top_products: ProductPerformance[];
  busiest_hours: HourlyData[];
  geographic_distribution: GeographicData[];
  created_at: string;
}

export interface ProductPerformance {
  product_id: string;
  product_name: string;
  units_sold: number;
  revenue: number;
  profit_margin: number;
}

export interface HourlyData {
  hour: number; // 0-23
  order_count: number;
  revenue: number;
}

export interface GeographicData {
  city: string;
  order_count: number;
  revenue: number;
  customer_count: number;
}

// Promotion and Marketing Types
export interface Promotion {
  id: string;
  business_id: string;
  title: string;
  description: string;
  image_url?: string;
  promotion_type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_delivery';
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number;
  applicable_products?: string[]; // product IDs
  applicable_categories?: string[];
  promo_code?: string;
  usage_limit?: number;
  usage_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  target_audience?: 'all' | 'new_customers' | 'returning_customers' | 'premium_customers';
  created_at: string;
}

// System Configuration Types
export interface AppConfig {
  maintenance_mode: boolean;
  min_app_version: string;
  force_update: boolean;
  api_base_url: string;
  support_email: string;
  support_phone: string;
  terms_url: string;
  privacy_policy_url: string;
  default_delivery_radius_km: number;
  max_delivery_radius_km: number;
  currency: string;
  timezone: string;
  supported_languages: AppLanguage[];
  feature_flags: FeatureFlags;
}

export interface FeatureFlags {
  ai_content_generation: boolean;
  ai_customer_assistance: boolean;
  voice_ordering: boolean;
  ar_product_preview: boolean;
  live_tracking: boolean;
  multi_vendor_ordering: boolean;
  subscription_services: boolean;
  loyalty_program: boolean;
}

// Error and API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: APIError;
  metadata?: {
    total_count?: number;
    page?: number;
    limit?: number;
    has_more?: boolean;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  request_id?: string;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  business_type?: string[];
  categories?: string[];
  price_range?: {
    min: number;
    max: number;
  };
  rating_above?: number;
  delivery_available?: boolean;
  max_delivery_time?: number; // in minutes
  distance_km?: number;
  open_now?: boolean;
  sort_by?: 'relevance' | 'distance' | 'rating' | 'delivery_time' | 'price_low_to_high' | 'price_high_to_low';
  location?: Location;
}

export interface SearchResult {
  businesses: Business[];
  products: Product[];
  services: Service[];
  total_results: number;
  search_time_ms: number;
  suggestions?: string[];
}

// Cart and Wishlist Types
export interface CartItem {
  id: string;
  business_id: string;
  product_id?: string;
  service_id?: string;
  name: string;
  image_url?: string;
  price: number;
  quantity: number;
  customizations?: ProductCustomization[];
  special_instructions?: string;
  added_at: string;
}

export interface Cart {
  user_id: string;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  estimated_delivery_charge: number;
  estimated_total: number;
  last_updated: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  business_id?: string;
  product_id?: string;
  service_id?: string;
  added_at: string;
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type UpdateFields<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;
