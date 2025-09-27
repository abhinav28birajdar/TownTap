/**
 * FILE: src/types/localMartTypes.ts
 * PURPOSE: Enhanced TypeScript types for LocalMart - Community-Centric Platform
 * RESPONSIBILITIES: Define comprehensive types for Type A, B, C business interactions
 */

import { GeoPoint } from 'firebase/firestore';

// ========== CORE ENUMS & CONSTANTS ==========
export type UserRole = 'customer' | 'business' | 'admin';
export type BusinessInteractionType = 'type_a' | 'type_b' | 'type_c';
export type BusinessStatus = 'pending_approval' | 'active' | 'inactive' | 'suspended' | 'rejected';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
export type ServiceRequestStatus = 'pending' | 'accepted' | 'rejected' | 'quoted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type InquiryStatus = 'new' | 'reviewed' | 'contacted' | 'quoted' | 'closed' | 'archived';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'cod' | 'wallet';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// ========== BUSINESS CATEGORIES ==========
export interface BusinessCategory {
  id: string;
  name: string;
  icon_url: string;
  description?: string;
  interaction_type: BusinessInteractionType;
  is_active: boolean;
  display_order: number;
}

// Type A Categories (Order & Buy Now)
export const TYPE_A_CATEGORIES = [
  'grocery_store',
  'pharmacy',
  'bakery_sweets', 
  'tailoring_products',
  'organic_farming',
  'stationary_books'
] as const;

// Type B Categories (Book & Request Service)
export const TYPE_B_CATEGORIES = [
  'electrician',
  'plumber', 
  'sports_coach',
  'elderly_care',
  'tailoring_services',
  'beauty_salon',
  'appliance_repair',
  'it_repair'
] as const;

// Type C Categories (Inquire & Consult)
export const TYPE_C_CATEGORIES = [
  'travel_agency',
  'real_estate',
  'construction_handyman',
  'architecture_interior',
  'legal_consultancy'
] as const;

export type TypeACategory = typeof TYPE_A_CATEGORIES[number];
export type TypeBCategory = typeof TYPE_B_CATEGORIES[number];  
export type TypeCCategory = typeof TYPE_C_CATEGORIES[number];

// ========== USER MANAGEMENT ==========
export interface User {
  uid: string;
  email: string;
  phone_number?: string;
  full_name: string;
  profile_picture_url?: string;
  user_type: UserRole;
  fcm_token?: string;
  preferred_language: 'en' | 'hi';
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Customer extends User {
  user_type: 'customer';
  saved_addresses: Address[];
  payment_methods: PaymentMethod[];
  wallet_balance: number;
  loyalty_points: number;
  order_history: string[]; // Order IDs
  favorite_businesses: string[]; // Business IDs
}

// ========== LOCATION & ADDRESS ==========
export interface Address {
  id: string;
  full_address: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  geohash?: string;
}

// ========== BUSINESS PROFILES ==========
export interface BusinessBase {
  id: string;
  owner_id: string;
  business_name: string;
  logo_url?: string;
  banner_url?: string;
  gallery_images: string[];
  description: string;
  address: Address;
  location: GeoPoint;
  contact_person: string;
  contact_phone: string;
  contact_email?: string;
  whatsapp_number?: string;
  website_url?: string;
  operating_hours: OperatingHours;
  category: BusinessCategory;
  interaction_type: BusinessInteractionType;
  specialized_categories: string[];
  is_approved: boolean;
  status: BusinessStatus;
  is_featured: boolean;
  avg_rating: number;
  total_reviews: number;
  bank_account_info?: BankAccountInfo;
  created_at: Date;
  updated_at: Date;
}

export interface OperatingHours {
  [key: string]: DaySchedule; // Monday, Tuesday, etc.
}

export interface DaySchedule {
  is_open: boolean;
  open_time?: string; // "09:00"
  close_time?: string; // "18:00"
  is_24_hours?: boolean;
  break_times?: TimeSlot[];
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface BankAccountInfo {
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
}

// ========== TYPE A: ORDER & BUY NOW ==========
export interface TypeABusiness extends BusinessBase {
  interaction_type: 'type_a';
  delivery_radius_km?: number;
  min_order_value?: number;
  delivery_charge?: number;
  avg_preparation_time_minutes?: number;
  accepts_online_payments: boolean;
  supports_delivery: boolean;
  supports_pickup: boolean;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  discount_price?: number;
  currency: string;
  category: string;
  subcategory?: string;
  stock_quantity?: number;
  unit: string; // 'kg', 'pcs', 'ltr'
  sku?: string;
  weight?: number;
  is_available: boolean;
  is_featured: boolean;
  preparation_time_minutes?: number;
  tags: string[];
  nutritional_info?: Record<string, any>;
  allergen_info?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  business_id: string;
  business: TypeABusiness;
  items: CartItem[];
  subtotal: number;
  delivery_charge: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  delivery_option: 'delivery' | 'pickup';
  delivery_address?: Address;
  pickup_time?: Date;
  estimated_delivery_time?: Date;
  actual_delivery_time?: Date;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id?: string;
  status: OrderStatus;
  order_notes?: string;
  cancellation_reason?: string;
  refund_amount?: number;
  status_updates: OrderStatusUpdate[];
  created_at: Date;
  updated_at: Date;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  message: string;
  timestamp: Date;
  location?: LocationData;
}

// ========== TYPE B: BOOK & REQUEST SERVICE ==========
export interface TypeBBusiness extends BusinessBase {
  interaction_type: 'type_b';
  service_radius_km?: number;
  base_service_charge?: number;
  supports_home_service: boolean;
  supports_in_store_service: boolean;
  advance_booking_required: boolean;
  min_advance_booking_hours?: number;
  max_advance_booking_days?: number;
  staff_members?: StaffMember[];
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  subcategory?: string;
  base_price?: number;
  price_type: 'fixed' | 'hourly' | 'per_unit' | 'quote_based';
  currency: string;
  estimated_duration_minutes?: number;
  service_location: 'at_business' | 'at_customer' | 'both';
  equipment_required?: string[];
  staff_skills_required?: string[];
  custom_fields?: ServiceCustomField[];
  is_available: boolean;
  is_featured: boolean;
  booking_slots?: TimeSlot[];
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ServiceCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'time' | 'file';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ServiceRequest {
  id: string;
  request_number: string;
  customer_id: string;
  business_id: string;
  business: TypeBBusiness;
  service_id?: string;
  service?: Service;
  problem_description: string;
  service_address: Address;
  preferred_date?: Date;
  preferred_time_slot?: string;
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  photos: string[];
  videos?: string[];
  custom_field_responses?: Record<string, any>;
  quoted_price?: number;
  final_price?: number;
  currency: string;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id?: string;
  status: ServiceRequestStatus;
  scheduled_date?: Date;
  scheduled_time_slot?: string;
  assigned_staff_id?: string;
  completion_photos?: string[];
  completion_otp?: string;
  customer_rating?: number;
  customer_review?: string;
  business_response?: string;
  status_updates: ServiceStatusUpdate[];
  created_at: Date;
  updated_at: Date;
}

export interface ServiceStatusUpdate {
  status: ServiceRequestStatus;
  message: string;
  timestamp: Date;
  staff_id?: string;
  photos?: string[];
  location?: LocationData;
}

export interface StaffMember {
  id: string;
  business_id: string;
  user_id: string;
  employee_id?: string;
  full_name: string;
  role: string;
  skills: string[];
  hourly_rate?: number;
  is_active: boolean;
  phone_number?: string;
  profile_picture_url?: string;
  current_location?: LocationData;
  availability_schedule?: OperatingHours;
  performance_rating: number;
  total_services_completed: number;
}

// ========== TYPE C: INQUIRE & CONSULT ==========
export interface TypeCBusiness extends BusinessBase {
  interaction_type: 'type_c';
  consultation_fee?: number;
  consultation_duration_minutes?: number;
  supports_remote_consultation: boolean;
  supports_site_visit: boolean;
  specializations: string[];
  years_of_experience?: number;
  certifications?: string[];
  portfolio_images?: string[];
  client_testimonials?: Testimonial[];
}

export interface ConsultationInquiry {
  id: string;
  inquiry_number: string;
  customer_id: string;
  business_id: string;
  business: TypeCBusiness;
  inquiry_type: string;
  detailed_requirements: string;
  budget_range?: string;
  timeline?: string;
  preferred_contact_method: 'phone' | 'email' | 'whatsapp' | 'video_call';
  attachments: string[];
  site_visit_required: boolean;
  site_address?: Address;
  preferred_consultation_dates?: Date[];
  urgency_level: 'low' | 'medium' | 'high';
  status: InquiryStatus;
  business_response?: string;
  quoted_amount?: number;
  proposal_document?: string;
  follow_up_date?: Date;
  conversion_probability: number; // 0-100
  lead_source: string;
  status_updates: InquiryStatusUpdate[];
  created_at: Date;
  updated_at: Date;
}

export interface InquiryStatusUpdate {
  status: InquiryStatus;
  message: string;
  timestamp: Date;
  attachments?: string[];
}

export interface Testimonial {
  id: string;
  client_name: string;
  project_type: string;
  rating: number;
  comment: string;
  project_images?: string[];
  completion_date: Date;
  verified: boolean;
}

// ========== REVIEWS & RATINGS ==========
export interface Review {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_profile_picture?: string;
  business_id: string;
  order_id?: string;
  service_request_id?: string;
  inquiry_id?: string;
  staff_id?: string;
  rating: number; // 1-5
  comment?: string;
  photos?: string[];
  verified_purchase: boolean;
  helpful_count: number;
  response_from_business?: string;
  response_date?: Date;
  created_at: Date;
}

// ========== CHAT & MESSAGING ==========
export interface ChatThread {
  id: string;
  participants: string[]; // User IDs
  business_id: string;
  order_id?: string;
  service_request_id?: string;
  inquiry_id?: string;
  last_message?: ChatMessage;
  unread_count: Record<string, number>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  message_type: 'text' | 'image' | 'file' | 'location' | 'system';
  content: string;
  metadata?: {
    file_url?: string;
    file_name?: string;
    file_size?: number;
    location?: LocationData;
    image_url?: string;
  };
  is_read: boolean;
  read_by: Record<string, Date>;
  created_at: Date;
}

// ========== PAYMENTS & TRANSACTIONS ==========
export interface PaymentTransaction {
  id: string;
  transaction_id: string;
  user_id: string;
  business_id?: string;
  order_id?: string;
  service_request_id?: string;
  inquiry_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_gateway: string;
  gateway_transaction_id?: string;
  status: PaymentStatus;
  failure_reason?: string;
  commission_amount?: number;
  business_payout_amount?: number;
  created_at: Date;
  updated_at: Date;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  reference_type?: 'order' | 'service_request' | 'refund' | 'cashback' | 'topup';
  reference_id?: string;
  balance_before: number;
  balance_after: number;
  created_at: Date;
}

// ========== NOTIFICATIONS ==========
export interface NotificationMessage {
  id: string;
  recipient_id: string;
  type: 'order_update' | 'service_update' | 'inquiry_update' | 'payment_update' | 'chat_message' | 'promotion' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  deep_link?: string;
  is_read: boolean;
  created_at: Date;
}

// ========== ANALYTICS & REPORTS ==========
export interface BusinessAnalytics {
  business_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: Date;
  end_date: Date;
  total_orders?: number;
  total_service_requests?: number;
  total_inquiries?: number;
  total_revenue: number;
  avg_order_value?: number;
  avg_service_value?: number;
  conversion_rate: number;
  customer_satisfaction: number;
  repeat_customer_rate: number;
  top_performing_items?: Array<{
    id: string;
    name: string;
    count: number;
    revenue: number;
  }>;
}

// ========== API RESPONSES ==========
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    has_more?: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ========== NAVIGATION TYPES ==========
export type RootStackParamList = {
  Auth: undefined;
  Customer: undefined;
  Business: undefined;
  Admin: undefined;
  Onboarding: undefined;
};

export type CustomerStackParamList = {
  Home: undefined;
  BusinessList: { 
    category?: string; 
    interaction_type?: BusinessInteractionType;
    location?: LocationData;
  };
  BusinessDetail: { 
    businessId: string; 
    interaction_type: BusinessInteractionType;
  };
  ProductList: { businessId: string };
  ProductDetail: { productId: string; businessId: string };
  ServiceList: { businessId: string };
  ServiceDetail: { serviceId: string; businessId: string };
  Cart: undefined;
  Checkout: { cartItems: CartItem[] };
  OrderTracking: { orderId: string };
  ServiceBooking: { serviceId: string; businessId: string };
  ServiceTracking: { serviceRequestId: string };
  InquiryForm: { businessId: string; inquiryType?: string };
  InquiryTracking: { inquiryId: string };
  Chat: { threadId: string };
  Profile: undefined;
  Settings: undefined;
  LocationPicker: { 
    onLocationSelect: (location: LocationData) => void;
  };
  MapView: {
    businesses?: BusinessBase[];
    center?: LocationData;
    radius?: number;
  };
};

export type BusinessStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
  ProductManagement: undefined;
  ServiceManagement: undefined;
  OrderManagement: undefined;
  ServiceRequestManagement: undefined;
  InquiryManagement: undefined;
  Analytics: undefined;
  Settings: undefined;
  StaffManagement: undefined;
  ChatList: undefined;
};

// ========== UTILITY TYPES ==========
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export default {};