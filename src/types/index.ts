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
export type AppLanguage = 'en' | 'hi';
export type NotificationType = 'order_status' | 'new_message' | 'promo' | 'system_alert' | 'low_stock' | 'payout_status' | 'new_review';
export type StaffRole = 'manager' | 'delivery_driver' | 'service_technician' | 'cashier';

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
  description: string;
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
  logoFile?: ImagePickerAsset;
  bannerFile?: ImagePickerAsset;
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