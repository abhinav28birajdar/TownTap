// FILE: src/types/index.ts
// PURPOSE: Centralized declaration of ALL TypeScript types, interfaces, and enums used across the application.

// --- Global Enums & Core Types ---
export type UserType = 'customer' | 'business' | 'business_owner' | 'business_staff' | 'admin' | 'staff';
export type BusinessInteractionType = 'type_a' | 'type_b' | 'type_c';
export type BusinessStatus = 'pending_approval' | 'active' | 'inactive' | 'suspended';
export type PaymentMethod = 'CARD' | 'NETBANKING' | 'UPI_COLLECT' | 'UPI_INTENT' | 'WALLET' | 'COD' | 'CASH_ON_SITE';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'refunded' | 'authorized' | 'captured';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled_by_customer' | 'cancelled_by_business' | 'payment_failed' | 'refunded' | 'disputed';
export type ServiceRequestStatus = 'pending' | 'accepted' | 'rejected_by_business' | 'quoted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled_by_customer' | 'cancelled_by_business' | 'disputed';
export type InquiryStatus = 'new' | 'reviewed' | 'contacted_by_business' | 'proposal_sent' | 'closed_success' | 'closed_fail' | 'archived';
export type AppLanguage = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn' | 'ml' | 'pa' | 'bn';
export type NotificationType = 
  // Customer notifications
  | 'service_request_status'  // Updates on service request status changes
  | 'booking_confirmation'    // Booking confirmed by service provider
  | 'service_reminder'        // Reminder about upcoming service
  | 'payment_status'          // Payment success/failure notifications
  | 'service_provider_arrival' // Service provider is arriving soon
  | 'new_message'             // New chat message
  | 'promo'                   // Promotional offers
  | 'system_alert'            // System-level alerts
  | 'new_review_response'     // Business responded to user's review
  
  // Business owner notifications
  | 'new_service_request'     // New service booking request 
  | 'booking_cancelled'       // Customer cancelled booking
  | 'low_stock'               // Inventory alerts for businesses
  | 'payout_status'           // Payment settlement status
  | 'new_review'              // Customer left a new review
  | 'business_verification'   // Account verification status updates
  | 'business_analytics'      // Weekly/monthly business analytics alerts
  | 'area_demand'             // High demand alerts for certain services in an area
;
export type StaffRole = 'manager' | 'delivery_driver' | 'service_technician' | 'cashier';

// --- Notification System Types ---
export interface NotificationPreferences {
  service_updates: boolean;
  chat_messages: boolean;
  promotional: boolean;
  payments: boolean;
  reminders: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  do_not_disturb: {
    enabled: boolean;
    start_time?: string; // HH:MM format
    end_time?: string;   // HH:MM format
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  action_data?: {
    screen?: string;
    params?: Record<string, any>;
    deeplink?: string;
  };
  reference_id?: string; // ID of the related entity (order_id, message_id, etc.)
  reference_type?: 'order' | 'service_request' | 'message' | 'review' | 'payment' | 'system';
  image_url?: string;
  created_at: string;
  expires_at?: string;
}

// Extend UserProfile to include notification preferences
export interface NotificationSettingsUpdate {
  notification_preferences?: NotificationPreferences;
  fcm_token?: string;
  whatsapp_notifications_enabled?: boolean;
  phone_number_verified?: boolean;
  email_verified?: boolean;
}

// --- Authentication & User Profiles ---
export interface SignInCredentials {
  email?: string;
  password?: string;
  phoneNumber?: string;
}

export interface SignUpCredentials {
  fullName: string;
  email: string;
  password: string;
  userType: UserType;
  phoneNumber?: string;
}

export interface UserProfile {
  id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  email: string;
  phone_number?: string | null;
  user_type: UserType;
  fcm_token?: string | null;
  locale?: AppLanguage;
  profile_picture_url?: string | null;
  wallet_balance?: number;
  loyalty_points?: number;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

// Additional Auth-related Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpForm {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  user_type: UserType;
  phone_number?: string;
  terms_accepted: boolean;
}

export interface OnboardingData {
  user_id: string;
  user_type: UserType;
  business_categories?: string[];
  service_radius?: number;
  location_preferences?: Coordinates;
  notification_preferences?: {
    orders: boolean;
    promotions: boolean;
    messages: boolean;
  };
}

export interface Profile extends UserProfile {}

export interface ProfileInsert {
  id: string;
  full_name?: string;
  email: string;
  phone_number?: string;
  user_type: UserType;
  fcm_token?: string;
  locale?: AppLanguage;
  profile_picture_url?: string;
  wallet_balance?: number;
  loyalty_points?: number;
  onboarding_completed?: boolean;
}

export interface ProfileUpdate {
  full_name?: string;
  phone_number?: string;
  fcm_token?: string;
  locale?: AppLanguage;
  profile_picture_url?: string;
  wallet_balance?: number;
  loyalty_points?: number;
  onboarding_completed?: boolean;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  profile?: UserProfile;
  created_at: string;
  updated_at: string;
}

// --- Business Related ---
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location extends Coordinates {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

export interface FullAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface OperatingHours {
  Monday: { open: string; close: string; is_closed: boolean; split_shifts?: { open: string; close: string; }[] };
  Tuesday: { open: string; close: string; is_closed: boolean; split_shifts?: { open: string; close: string; }[] };
  Wednesday: { open: string; close: string; is_closed: boolean; split_shifts?: { open: string; close: string; }[] };
  Thursday: { open: string; close: string; is_closed: boolean; split_shifts?: { open: string; close: string; }[] };
  Friday: { open: string; close: string; is_closed: boolean; split_shifts?: { open: string; close: string; }[] };
  Saturday: { open: string; close: string; is_closed: boolean; split_shifts?: { open: string; close: string; }[] };
  Sunday: { open: string; close: string; is_closed: boolean; split_shifts?: { open: string; close: string; }[] };
}

export interface BusinessRegistrationData {
  businessName: string;
  business_name: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  category: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  businessType: BusinessInteractionType;
  specializedCategories: string[];
  operatingHours: OperatingHours;
  hours: OperatingHours;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  social_media: {
    facebook?: string;
    instagram?: string;
  };
  logoFile?: ImagePickerAsset;
  logo_file?: ImagePickerAsset;
  bannerFile?: ImagePickerAsset;
  banner_file?: ImagePickerAsset;
  gallery_files?: ImagePickerAsset[];
  gstin?: string;
  businessLicenseUrl?: string;
}

export interface BusinessProfileDetail extends Omit<BusinessRegistrationData, 'logoFile' | 'bannerFile'> {
  id: string;
  logo_url?: string | null;
  banner_url?: string | null;
  is_approved: boolean;
  status: BusinessStatus;
  avg_rating: number;
  total_reviews: number;
  bank_account_info_encrypted?: string | null;
  payout_enabled: boolean;
  delivery_radius_km?: number | null;
  service_area_polygon?: any | null;
  min_order_value?: number | null;
  delivery_charge?: number | null;
  created_at: string;
  updated_at: string;
}

// Additional business types needed by components
export interface BusinessProfile {
  id: string;
  name: string;
  business_name?: string;
  description?: string;
  category: string;
  subcategory?: string;
  phone: string;
  phone_number?: string;
  email?: string;
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  distance?: number;
  image_url?: string;
  logo_url?: string;
  rating?: number;
  total_reviews?: number;
  is_verified: boolean;
  is_active: boolean;
  is_open?: boolean;
  delivery_available?: boolean;
  landmark?: string;
  website_url?: string;
  pincode?: string;
  whatsapp_number?: string;
  services?: string;
  operating_hours?: any;
  created_at?: string;
  updated_at?: string;
  gallery_images?: string[];
  owner_id?: string;
  banner_url?: string;
}

export interface BusinessCategory {
  id: string;
  name: string;
  value: string;
  description?: string;
  icon?: string;
}

export interface BusinessStats {
  total_orders: number;
  monthlyOrders: number;
  totalOrders: number;
  pending_orders: number;
  total_revenue: number;
  avg_rating: number;
  total_reviews: number;
  active_products: number;
  totalViews?: number;
  monthlyViews?: number;
  rating?: number;
  reviewCount?: number;
  favoriteCount?: number;
  shareCount?: number;
}

// --- Business Types ---
export interface Business {
  id: string;
  name: string;
  business_name?: string;
  description?: string;
  category: string;
  subcategory?: string;
  phone: string;
  phone_number?: string;
  email?: string;
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  image_url?: string;
  logo_url?: string;
  rating?: number;
  total_reviews?: number;
  is_verified: boolean;
  is_active: boolean;
  is_open?: boolean;
  delivery_available?: boolean;
  landmark?: string;
  website_url?: string;
  pincode?: string;
  whatsapp_number?: string;
  services?: string;
  operating_hours?: any;
  created_at?: string;
  updated_at?: string;
}

// --- Image Picker Asset ---
export interface ImagePickerAsset {
  assetId?: string | null;
  base64?: string | null;
  duration?: number | null;
  exif?: any;
  height: number;
  md5?: string | null;
  mediaType: 'image' | 'video';
  mimeType?: string | null;
  uri: string;
  width: number;
  fileName?: string | null;
  fileSize?: number | null;
}

// --- Navigation Types ---
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      Auth: NavigatorScreenParams<AuthStackParamList>;
      Customer: NavigatorScreenParams<CustomerStackParamList>;
      Business: NavigatorScreenParams<BusinessStackParamList>;
      Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
      CustomerWelcome: { userEmail: string };
      UniversalSearchModal: undefined;
      NotificationsModal: undefined;
      DisputeModal: { orderId?: string; serviceRequestId?: string };
    }
  }
}

export type RootStackParamList = {
  Auth: undefined;
  Customer: undefined;
  Business: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  AuthLanding: undefined;
  Login: undefined;
  SignUp: undefined;
  CategorySelection: undefined;
  DemoLogin: undefined;
  ForgotPassword: undefined;
  OTPVerification: { phoneNumber?: string; purpose?: 'signIn' | 'signUp' | 'resetPassword' };
};

export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  BusinessDetail: { businessId: string };
  ProductDetail: { productId: string; businessId?: string };
  Cart: undefined;
  Checkout: { cartId?: string; orderDetails?: any; orderId?: string };
  OrderTracking: { orderId: string; businessId?: string };
  Chat: { threadId?: string; businessId?: string };
  AIAssistant: { initialQuery?: string };
};

export type BusinessStackParamList = {
  BusinessTabs: NavigatorScreenParams<BusinessTabParamList>;
  AIContentGenerator: undefined;
  BusinessDetails: { category: any; subcategory: any; };
};

export type CustomerTabParamList = {
  Home: undefined;
  Explore: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type BusinessTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Products: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export type CustomerHomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<CustomerTabParamList, 'Home'>,
  NativeStackNavigationProp<CustomerStackParamList>
>;

// --- UI Component Types ---
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

// --- API Response Types ---
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// --- Form State Types ---
export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: FormError[];
  isSubmitting: boolean;
  isDirty: boolean;
}