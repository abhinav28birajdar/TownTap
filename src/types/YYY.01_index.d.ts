// =====================================================
// ENHANCED TOWNTAP - CORE TYPE DEFINITIONS
// Comprehensive TypeScript interfaces for the entire application
// =====================================================

import { BusinessInteractionType } from '../constants/YYY.04_categories';

// ============== User & Authentication Types ==============

export interface User {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  user_type: UserType;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  preferred_language: 'en' | 'hi';
  notification_preferences: NotificationPreferences;
  ai_preferences: AIPreferences;
  location_preferences: LocationPreferences;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  // Customer specific fields
  dietary_preferences?: DietaryPreference[];
  interests?: string[];
  // Business specific fields
  business_id?: string;
}

export interface NotificationPreferences {
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  order_updates: boolean;
  promotional_offers: boolean;
  chat_messages: boolean;
  loyalty_updates: boolean;
}

export interface AIPreferences {
  enable_ai_recommendations: boolean;
  enable_voice_search: boolean;
  ai_interaction_style: 'casual' | 'formal' | 'friendly';
  content_generation_tone: 'professional' | 'casual' | 'creative';
}

export interface LocationPreferences {
  auto_detect_location: boolean;
  save_location_history: boolean;
  default_search_radius: number; // km
  preferred_delivery_address_id?: string;
}

export type UserType = 'customer' | 'business_owner' | 'staff' | 'admin';
export type DietaryPreference = 'vegetarian' | 'vegan' | 'non_vegetarian' | 'jain' | 'gluten_free';

// ============== Business Types ==============

export interface Business {
  id: string;
  owner_id: string;
  business_name: string;
  business_type: BusinessInteractionType;
  description: string;
  category: string;
  subcategory?: string;
  logo_url?: string;
  banner_url?: string;
  phone: string;
  email?: string;
  website_url?: string;
  social_links?: SocialLinks;
  address: BusinessAddress;
  location: LocationCoordinates;
  geojson_point?: any; // PostGIS geometry
  business_hours: BusinessHours;
  status: BusinessStatus;
  rating: number;
  review_count: number;
  total_orders: number;
  is_verified: boolean;
  verification_documents?: string[];
  commission_rate: number;
  created_at: string;
  updated_at: string;
  settings: BusinessSettings;
  // Computed fields
  distance?: number; // km from user location
  is_open?: boolean;
  estimated_delivery_time?: number; // minutes
  delivery_fee?: number;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface BusinessAddress {
  street: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  full_address: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  is_open: boolean;
  open_time?: string; // HH:MM format
  close_time?: string; // HH:MM format
  break_time?: {
    start_time: string;
    end_time: string;
  };
}

export interface BusinessSettings {
  auto_accept_orders: boolean;
  max_order_capacity: number;
  advance_booking_days: number;
  cancellation_policy?: string;
  delivery_areas?: DeliveryArea[];
  payment_methods: PaymentMethod[];
  tax_settings: TaxSettings;
}

export interface DeliveryArea {
  area_name: string;
  delivery_fee: number;
  estimated_time: number; // minutes
  is_active: boolean;
}

export interface TaxSettings {
  gst_number?: string;
  tax_inclusive_pricing: boolean;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
}

export type BusinessStatus = 'online' | 'offline' | 'busy' | 'temporarily_closed';

// ============== Product Types ==============

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  discounted_price?: number;
  currency: string;
  unit?: string; // kg, piece, liter, etc.
  images: string[];
  video_url?: string;
  variants?: ProductVariant[];
  add_ons?: ProductAddOn[];
  tags: string[];
  is_vegetarian?: boolean;
  ingredients?: string[];
  allergen_info?: string[];
  nutritional_info?: NutritionalInfo;
  stock_quantity?: number;
  min_order_quantity: number;
  max_order_quantity?: number;
  is_active: boolean;
  rating: number;
  review_count: number;
  preparation_time?: number; // minutes
  is_featured: boolean;
  sku?: string;
  barcode?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  final_price: number;
  discount_percentage?: number;
  is_in_stock: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'size' | 'color' | 'flavor' | 'custom';
  options: VariantOption[];
  is_required: boolean;
}

export interface VariantOption {
  id: string;
  name: string;
  price_adjustment: number; // +/- from base price
  is_available: boolean;
}

export interface ProductAddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  max_quantity?: number;
}

export interface NutritionalInfo {
  calories_per_100g?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
}

// ============== Service Types ==============

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  base_price: number;
  price_range?: {
    min_price: number;
    max_price: number;
  };
  currency: string;
  duration_minutes: number;
  images: string[];
  video_url?: string;
  service_areas?: string[];
  requirements?: ServiceRequirement[];
  add_ons?: ServiceAddOn[];
  tags: string[];
  is_home_service: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  booking_advance_time: number; // hours
  cancellation_policy?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  next_available_slot?: string;
  is_available_today: boolean;
}

export interface ServiceRequirement {
  id: string;
  title: string;
  description: string;
  is_mandatory: boolean;
  input_type: 'text' | 'number' | 'date' | 'time' | 'select' | 'multi_select' | 'file';
  options?: string[]; // for select types
  validation_rules?: any;
}

export interface ServiceAddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_available: boolean;
}

// ============== Order & Request Types ==============

export interface Order {
  id: string;
  customer_id: string;
  business_id: string;
  order_type: 'delivery' | 'pickup' | 'dine_in';
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id?: string;
  delivery_address?: SavedAddress;
  pickup_time?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  special_instructions?: string;
  customer_rating?: number;
  customer_review?: string;
  business_notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: UserProfile;
  business?: Business;
  chat_room_id?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_variants?: SelectedVariant[];
  selected_add_ons?: SelectedAddOn[];
  special_instructions?: string;
  // Relations
  product?: Product;
}

export interface SelectedVariant {
  variant_id: string;
  variant_name: string;
  option_id: string;
  option_name: string;
  price_adjustment: number;
}

export interface SelectedAddOn {
  add_on_id: string;
  add_on_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  business_id: string;
  service_id: string;
  status: ServiceRequestStatus;
  service_name: string;
  service_description: string;
  requested_date: string;
  requested_time: string;
  confirmed_date?: string;
  confirmed_time?: string;
  service_address: SavedAddress;
  estimated_duration: number; // minutes
  base_price: number;
  additional_charges: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id?: string;
  requirements_data?: any; // JSON data based on service requirements
  selected_add_ons?: SelectedServiceAddOn[];
  problem_description?: string;
  attached_files?: string[];
  assigned_staff_id?: string;
  customer_rating?: number;
  customer_review?: string;
  business_notes?: string;
  completion_photos?: string[];
  invoice_url?: string;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: UserProfile;
  business?: Business;
  service?: Service;
  assigned_staff?: StaffMember;
  chat_room_id?: string;
}

export interface SelectedServiceAddOn {
  add_on_id: string;
  add_on_name: string;
  price: number;
  duration_minutes?: number;
}

export interface Inquiry {
  id: string;
  customer_id: string;
  business_id: string;
  inquiry_type: string;
  subject: string;
  description: string;
  attached_files?: string[];
  status: 'pending' | 'responded' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  business_response?: string;
  response_date?: string;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: UserProfile;
  business?: Business;
  chat_room_id?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'accepted' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'completed' 
  | 'cancelled' 
  | 'rejected';

export type ServiceRequestStatus = 
  | 'pending'
  | 'accepted'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

// ============== Payment & Wallet Types ==============

export interface Payment {
  id: string;
  user_id: string;
  order_id?: string;
  service_request_id?: string;
  payment_type: 'order' | 'service' | 'wallet_topup' | 'refund';
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_gateway: 'razorpay' | 'upi' | 'wallet';
  gateway_payment_id?: string;
  gateway_order_id?: string;
  status: PaymentStatus;
  gateway_response?: any;
  failure_reason?: string;
  refund_amount?: number;
  refund_status?: 'pending' | 'processed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface WalletBalance {
  user_id: string;
  balance: number;
  currency: string;
  last_updated: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  reference_type?: 'order' | 'service' | 'topup' | 'refund' | 'cashback';
  reference_id?: string;
  payment_id?: string;
  balance_after: number;
  created_at: string;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet' | 'net_banking';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

// ============== Review & Rating Types ==============

export interface Review {
  id: string;
  customer_id: string;
  business_id: string;
  order_id?: string;
  service_request_id?: string;
  product_id?: string;
  service_id?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];
  helpful_count: number;
  is_verified_purchase: boolean;
  business_response?: string;
  business_response_date?: string;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: UserProfile;
  business?: Business;
  product?: Product;
  service?: Service;
}

// ============== Chat & Communication Types ==============

export interface ChatRoom {
  id: string;
  customer_id: string;
  business_id: string;
  order_id?: string;
  service_request_id?: string;
  inquiry_id?: string;
  status: 'active' | 'resolved' | 'closed';
  last_message?: string;
  last_message_time?: string;
  unread_count_customer: number;
  unread_count_business: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_type: 'customer' | 'business' | 'staff' | 'system';
  message_type: 'text' | 'image' | 'audio' | 'file' | 'location' | 'system';
  content: string;
  media_url?: string;
  file_name?: string;
  file_size?: number;
  location_data?: LocationCoordinates;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  // Relations
  sender?: UserProfile;
}

// ============== Notification Types ==============

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any; // Additional payload
  image_url?: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export type NotificationType = 
  | 'order_update'
  | 'payment_update' 
  | 'promotion'
  | 'system'
  | 'chat_message'
  | 'reminder'
  | 'loyalty_update'
  | 'review_request';

// ============== Location & Address Types ==============

export interface SavedAddress {
  id: string;
  user_id: string;
  label: string; // Home, Office, etc.
  contact_name: string;
  contact_phone: string;
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  location: LocationCoordinates;
  is_default: boolean;
  address_type: 'home' | 'office' | 'other';
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
}

// ============== Staff Management Types ==============

export interface StaffMember {
  id: string;
  user_id: string;
  business_id: string;
  role: StaffRole;
  permissions: StaffPermission[];
  is_active: boolean;
  hire_date: string;
  emergency_contact?: string;
  assigned_areas?: string[];
  current_status: 'available' | 'busy' | 'on_break' | 'offline';
  current_task_id?: string;
  created_at: string;
  updated_at: string;
  // Relations
  user?: UserProfile;
  business?: Business;
}

export type StaffRole = 'manager' | 'cashier' | 'delivery_driver' | 'technician' | 'assistant';

export interface StaffPermission {
  permission: string;
  granted: boolean;
}

export interface StaffTask {
  id: string;
  business_id: string;
  assigned_to: string;
  task_type: 'delivery' | 'service' | 'custom';
  title: string;
  description?: string;
  order_id?: string;
  service_request_id?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  estimated_completion: string;
  actual_completion?: string;
  location?: LocationCoordinates;
  notes?: string;
  completion_photos?: string[];
  created_at: string;
  updated_at: string;
}

// ============== Loyalty & Rewards Types ==============

export interface CustomerLoyalty {
  id: string;
  customer_id: string;
  business_id: string;
  points_earned: number;
  points_redeemed: number;
  current_points: number;
  tier_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_spent: number;
  visit_count: number;
  last_visit: string;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: UserProfile;
  business?: Business;
}

export interface LoyaltyTransaction {
  id: string;
  customer_loyalty_id: string;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  order_id?: string;
  service_request_id?: string;
  expiry_date?: string;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  business_id: string;
  title: string;
  description: string;
  points_required: number;
  discount_percentage?: number;
  discount_amount?: number;
  free_product_id?: string;
  validity_days: number;
  max_redemptions?: number;
  current_redemptions: number;
  is_active: boolean;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
}

// ============== AI & Analytics Types ==============

export interface AIPromptHistory {
  id: string;
  user_id: string;
  business_id?: string;
  prompt_type: AIContentType;
  input_prompt: string;
  generated_content: string;
  model_used: string;
  tokens_used: number;
  quality_rating?: number; // 1-5, user feedback
  is_saved: boolean;
  created_at: string;
}

export interface AIContentLibrary {
  id: string;
  user_id: string;
  business_id?: string;
  content_type: AIContentType;
  title: string;
  content: string;
  tags?: string[];
  is_favorite: boolean;
  usage_count: number;
  last_used: string;
  created_at: string;
  updated_at: string;
}

export type AIContentType = 
  | 'product_description'
  | 'promotional_caption'
  | 'business_bio'
  | 'customer_response'
  | 'social_media_post'
  | 'email_template'
  | 'offer_announcement';

export interface BusinessAnalytics {
  id: string;
  business_id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  new_customers: number;
  returning_customers: number;
  cancellation_rate: number;
  average_rating: number;
  top_products?: ProductAnalytics[];
  peak_hours?: HourlyAnalytics[];
  customer_demographics?: any;
  ai_insights?: string;
  created_at: string;
}

export interface ProductAnalytics {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  profit_margin: number;
}

export interface HourlyAnalytics {
  hour: number; // 0-23
  order_count: number;
  revenue: number;
}

// ============== App State Types ==============

export interface AppState {
  isLoading: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  selectedBusiness: Business | null;
  cart: CartState;
  location: LocationState;
  notifications: NotificationState;
  chat: ChatState;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  business_id: string | null;
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  discount_amount: number;
  total: number;
  applied_coupon?: string;
  delivery_address?: SavedAddress;
  payment_method?: PaymentMethod;
  special_instructions?: string;
}

export interface CartItem {
  id: string; // Unique cart item ID
  product_id: string;
  product_name: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  selected_variants?: SelectedVariant[];
  selected_add_ons?: SelectedAddOn[];
  special_instructions?: string;
  max_quantity?: number;
}

export interface LocationState {
  currentLocation: LocationCoordinates | null;
  selectedLocation: LocationCoordinates | null;
  savedAddresses: SavedAddress[];
  searchRadius: number;
  locationPermission: 'granted' | 'denied' | 'not_requested';
  isLoadingLocation: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fcmToken?: string;
  isPermissionGranted: boolean;
}

export interface ChatState {
  activeChatRooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>; // roomId -> messages
  unreadCounts: Record<string, number>; // roomId -> count
  isTyping: Record<string, boolean>; // roomId -> isTyping
}

// ============== API Response Types ==============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  rating_min?: number;
  price_range?: {
    min: number;
    max: number;
  };
  delivery_time_max?: number;
  is_open?: boolean;
  sort_by?: 'relevance' | 'rating' | 'distance' | 'price_low' | 'price_high' | 'newest';
  location?: LocationCoordinates;
  radius?: number;
}

// ============== Form Types ==============

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone?: string;
  user_type: UserType;
  terms_accepted: boolean;
}

export interface BusinessRegistrationForm {
  business_name: string;
  description: string;
  category: string;
  subcategory?: string;
  phone: string;
  email?: string;
  website_url?: string;
  address: BusinessAddress;
  location: LocationCoordinates;
  business_hours: BusinessHours;
  business_type: BusinessInteractionType;
  verification_documents?: string[];
}

export interface ProductForm {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  discounted_price?: number;
  unit?: string;
  images: string[];
  variants?: ProductVariant[];
  add_ons?: ProductAddOn[];
  tags: string[];
  is_vegetarian?: boolean;
  ingredients?: string[];
  stock_quantity?: number;
  min_order_quantity: number;
  max_order_quantity?: number;
  preparation_time?: number;
  sku?: string;
}

export interface ServiceForm {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  base_price: number;
  price_range?: {
    min_price: number;
    max_price: number;
  };
  duration_minutes: number;
  images: string[];
  service_areas?: string[];
  requirements?: ServiceRequirement[];
  add_ons?: ServiceAddOn[];
  tags: string[];
  is_home_service: boolean;
  booking_advance_time: number;
  cancellation_policy?: string;
}

// ============== Error Types ==============

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Export all types for easy importing
export type {
    BusinessCategory,
    CategoryId
} from '../constants/YYY.04_categories';

export type {
    ColorKey, Colors, DarkTheme, LightTheme, ThemeColors
} from '../constants/YYY.01_colors';

export type {
    FontSizeKey, FontSizes,
    FontWeights, TextStyleKey, TextStyles
} from '../constants/YYY.02_typography';

export type {
    BorderRadius, BorderRadiusKey,
    IconSizeKey, IconSizes,
    Layout,
    Shadows, Spacing, SpacingKey
} from '../constants/YYY.03_dimensions';

