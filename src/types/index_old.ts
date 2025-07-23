export interface User {
  id: string;
  email: string;
  phone_number?: string;
  full_name: string;
  user_type: 'customer' | 'business' | 'admin';
  fcm_token?: string;
  locale: 'en' | 'hi';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  logo_url?: string;
  description: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  contact_phone: string;
  operating_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
  delivery_radius_km: number;
  business_type: 'type_a' | 'type_b' | 'type_c';
  specialized_categories: string[];
  is_approved: boolean;
  status: 'active' | 'inactive' | 'suspended';
  avg_rating: number;
  total_reviews: number;
  bank_account_info_encrypted?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon_url: string;
  description: string;
  interaction_type: 'type_a' | 'type_b' | 'type_c';
  is_active: boolean;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string;
  image_urls: string[];
  price: number;
  discount_price?: number;
  stock_quantity: number;
  unit: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  image_urls: string[];
  base_price: number;
  estimated_time_mins: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  business_id: string;
  total_amount: number;
  delivery_charge: number;
  platform_commission_amount: number;
  order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cash' | 'online';
  delivery_option: 'pickup' | 'delivery';
  delivery_address_json: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip_code: string;
    latitude: number;
    longitude: number;
  };
  order_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_order: number;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  business_id: string;
  service_id?: string;
  problem_description: string;
  photos_urls: string[];
  service_address_json: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip_code: string;
    latitude: number;
    longitude: number;
  };
  preferred_date?: string;
  preferred_time_slot?: string;
  request_status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  quoted_price?: number;
  actual_charge?: number;
  payment_status: 'pending' | 'paid' | 'failed';
  scheduled_timestamp?: string;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  customer_id: string;
  business_id: string;
  inquiry_type: string;
  details: string;
  attachments_urls: string[];
  budget_range?: string;
  preferred_contact_method: 'phone' | 'email' | 'whatsapp';
  inquiry_status: 'pending' | 'responded' | 'converted' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  business_id: string;
  order_id?: string;
  service_request_id?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  recipient_profile_id: string;
  type: 'order' | 'service' | 'inquiry' | 'promotion' | 'system';
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  profile_id: string;
  label: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
}

export interface AIPromptHistory {
  id: string;
  profile_id: string;
  feature_type: 'content_gen' | 'customer_ai' | 'insights' | 'customer_assistant';
  input_prompt: string;
  ai_response: string;
  meta_data: Record<string, any>;
  cost?: number;
  language: 'en' | 'hi';
  created_at: string;
}

export interface BusinessAnalyticsMetrics {
  id: string;
  business_id: string;
  date_period: string;
  total_revenue: number;
  total_orders: number;
  new_customers: number;
  avg_rating: number;
  cancellation_count: number;
  top_products_json: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// AI Feature Related Types
export interface AIContentGenerationRequest {
  business_id: string;
  prompt_text: string;
  content_type: 'promotional_caption' | 'product_description' | 'service_description' | 'social_media_post';
  platform: 'instagram' | 'facebook' | 'whatsapp' | 'general';
  tone: 'festive' | 'professional' | 'casual' | 'urgent' | 'friendly';
  language: 'en' | 'hi';
}

export interface AICustomerInteractionRequest {
  business_id: string;
  customer_id: string;
  context_type: 'order' | 'service_request' | 'chat_message';
  context_id: string;
  customer_query_text?: string;
  language: 'en' | 'hi';
}

export interface AIPerformanceSummaryRequest {
  business_id: string;
  report_period: 'weekly' | 'monthly' | 'custom';
  start_date?: string;
  end_date?: string;
  language: 'en' | 'hi';
}

export interface AICustomerAssistantRequest {
  customer_id: string;
  customer_query_text: string;
  latitude: number;
  longitude: number;
  language: 'en' | 'hi';
}

// Application State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  business_id: string | null;
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  CustomerApp: undefined;
  BusinessApp: undefined;
};

export type CustomerTabParamList = {
  Home: undefined;
  Search: undefined;
  Orders: undefined;
  Profile: undefined;
  AIAssistant: undefined;
};

export type BusinessTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Products: undefined;
  Analytics: undefined;
  AITools: undefined;
  Profile: undefined;
};

export type CustomerStackParamList = {
  BusinessDetails: { businessId: string };
  ProductDetails: { productId: string };
  ServiceBooking: { serviceId: string };
  Checkout: undefined;
  OrderTracking: { orderId: string };
  ReviewScreen: { orderId?: string; serviceRequestId?: string };
};

export type BusinessStackParamList = {
  OrderDetails: { orderId: string };
  ProductEditor: { productId?: string };
  ServiceEditor: { serviceId?: string };
  CustomerChat: { customerId: string; contextType: string; contextId: string };
  AIContentGenerator: undefined;
  PerformanceInsights: undefined;
};

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  user_type: 'customer' | 'business';
}

export interface BusinessRegistrationForm {
  name: string;
  description: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  contact_phone: string;
  business_type: 'type_a' | 'type_b' | 'type_c';
  specialized_categories: string[];
  operating_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
  delivery_radius_km: number;
}

export interface ProductForm {
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  unit: string;
  image_urls: string[];
}

export interface ServiceForm {
  name: string;
  description: string;
  base_price: number;
  estimated_time_mins: number;
  image_urls: string[];
}

// Utility Types
export type Language = 'en' | 'hi';
export type UserType = 'customer' | 'business' | 'admin';
export type BusinessType = 'type_a' | 'type_b' | 'type_c';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ServiceRequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type InquiryStatus = 'pending' | 'responded' | 'converted' | 'closed';
