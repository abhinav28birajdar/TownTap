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

export interface ProductCategory {
  id: string;
  name: string;
  icon_url?: string | null;
  description?: string | null;
  interaction_type: BusinessInteractionType;
  is_active: boolean;
  parent_category_id?: string | null;
}

export interface StaffMember {
  id: string;
  business_id: string;
  profile_id: string;
  roles: StaffRole[];
  is_active: boolean;
  current_location?: Coordinates;
  status?: 'online' | 'offline' | 'on_task' | 'on_break';
  hourly_rate?: number;
}

// --- Products & Services ---
export interface ProductVariantOption {
  name: string;
  values: string[];
}

export interface ProductVariantSelection {
  [optionName: string]: string;
}

export interface ShopProduct {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  image_urls?: string[];
  price: number;
  discount_price?: number;
  stock_quantity?: number;
  unit: string;
  is_available: boolean;
  category_id?: string;
  variant_options?: ProductVariantOption[];
  created_at?: string;
  updated_at?: string;
}

export interface ShopService {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  image_urls?: string[];
  base_price?: number;
  estimated_time_mins?: number;
  is_available: boolean;
  category_id?: string;
  pricing_model?: 'fixed' | 'per_hour' | 'per_visit_callout_fee' | 'quote_required';
  created_at?: string;
  updated_at?: string;
}

// --- Orders, Service Requests & Inquiries ---
export interface CartItem {
  id: string;
  type: 'product' | 'service';
  productId?: string;
  serviceId?: string;
  businessId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image_url?: string;
  customizations?: any;
  addedAt: Date;
  product?: Product | null;
  service?: Service | null;
  variant_selected?: ProductVariantSelection;
  variations?: any[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  business_id: string;
  total_amount: number;
  delivery_charge: number;
  platform_commission_amount: number;
  order_status: OrderStatus;
  status: OrderStatus; // alias for order_status for compatibility
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  delivery_option: 'delivery' | 'pickup' | 'dine_in';
  delivery_address: FullAddress;
  customer_notes?: string;
  pickup_time_slot?: string;
  delivery_eta?: string;
  assigned_staff_id?: string;
  current_staff_location?: Coordinates;
  payment_id?: string;
  created_at: string;
  updated_at: string;
  business_details?: Pick<BusinessProfileDetail, 'businessName' | 'logo_url' | 'contactPhone' | 'addressLine1'>;
  customer_details?: Pick<UserProfile, 'full_name' | 'phone_number'>;
  items?: OrderItem[];
  payment_details?: Payment;
}

export interface OrderInsert {
  customer_id: string;
  business_id: string;
  total_amount: number;
  delivery_charge: number;
  platform_commission_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  delivery_option: 'delivery' | 'pickup' | 'dine_in';
  delivery_address: FullAddress;
  customer_notes?: string;
  pickup_time_slot?: string;
  delivery_eta?: string;
  assigned_staff_id?: string;
  current_staff_location?: Coordinates;
  payment_id?: string;
}

export interface OrderWithDetails extends Order {
  business: BusinessProfileDetail;
  customer: UserProfile;
  order_items: OrderItemWithDetails[];
}

export interface CheckoutData {
  items: CartItem[];
  business_id: string;
  delivery_option: 'delivery' | 'pickup' | 'dine_in';
  delivery_address?: FullAddress;
  payment_method: PaymentMethod;
  customer_notes?: string;
  pickup_time_slot?: string;
  total_amount: number;
  delivery_charge: number;
  platform_commission_amount: number;
  subtotal?: number;
  deliveryFee?: number;
  taxes?: number;
  discount?: number;
  total?: number;
  specialInstructions?: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_details: Pick<ShopProduct, 'name' | 'image_urls' | 'price' | 'unit'>;
  quantity: number;
  price_at_order: number;
  variant_details?: ProductVariantSelection;
}

export interface OrderItemInsert {
  order_id: string;
  product_id?: string;
  service_id?: string;
  quantity: number;
  price_at_order: number;
  variant_details?: ProductVariantSelection;
}

export interface OrderItemWithDetails extends OrderItem {
  product?: ShopProduct;
  service?: Service;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  business_id: string;
  service_id?: string;
  service_details_snapshot?: Pick<ShopService, 'name' | 'description' | 'base_price'>;
  problem_description?: string;
  photos_urls?: string[];
  videos_urls?: string[];
  service_address: FullAddress;
  latitude: number;
  longitude: number;
  preferred_date: string;
  preferred_time_slot?: string;
  request_status: ServiceRequestStatus;
  quoted_price?: number;
  actual_charge?: number;
  assigned_staff_id?: string;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_id?: string;
  created_at: string;
  updated_at: string;
  business_details?: Pick<BusinessProfileDetail, 'businessName' | 'logo_url' | 'contactPhone'>;
  customer_details?: Pick<UserProfile, 'full_name' | 'phone_number'>;
}

export interface Inquiry {
  id: string;
  customer_id: string;
  business_id: string;
  inquiry_type: string;
  details?: string;
  attachments_urls?: string[];
  budget_range?: string;
  preferred_contact_method?: string;
  preferred_contact_time?: string;
  inquiry_status: InquiryStatus;
  created_at: string;
  updated_at: string;
  business_details?: Pick<BusinessProfileDetail, 'businessName' | 'logo_url' | 'contactPhone'>;
  customer_details?: Pick<UserProfile, 'full_name' | 'phone_number'>;
}

export interface Notification {
  id: string;
  recipient_profile_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

// --- Messaging System ---
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'location' | 'order_update';
  attachments?: string[];
  order_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageInsert {
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'location' | 'order_update';
  attachments?: string[];
  order_id?: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  business_id: string;
  subject?: string;
  status: 'active' | 'archived' | 'closed';
  last_message_at: string;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  last_message?: Message;
}

export interface ConversationInsert {
  customer_id: string;
  business_id: string;
  subject?: string;
  status?: 'active' | 'archived' | 'closed';
}

// --- Payments & Wallet ---
export interface Payment {
  id: string;
  order_id?: string;
  service_request_id?: string;
  user_id: string;
  business_id?: string;
  amount: number;
  currency: string;
  provider: string;
  method: string;
  status: PaymentStatus;
  gateway_reference_id?: string;
  webhook_payload?: any;
  error_details?: any;
  created_at: string;
  updated_at: string;
}

export interface PaymentInsert {
  order_id?: string;
  service_request_id?: string;
  user_id: string;
  business_id?: string;
  amount: number;
  currency: string;
  provider: string;
  method: string;
  status: PaymentStatus;
  gateway_reference_id?: string;
  webhook_payload?: any;
}

export interface PaymentUpdate {
  status?: PaymentStatus;
  gateway_reference_id?: string;
  webhook_payload?: any;
  error_details?: any;
  updated_at?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  payment_method_types: string[];
  client_secret: string;
  status: string;
  created_at: string;
}

export interface Refund {
  id: string;
  payment_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gateway_reference_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RefundInsert {
  payment_id: string;
  amount: number;
  reason: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  gateway_reference_id?: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description?: string;
  related_entity_type?: 'order' | 'deposit' | 'refund' | 'service_request' | 'loyalty_redemption';
  related_entity_id?: string;
  created_at: string;
}

// --- Reviews ---
export interface Review {
  id: string;
  customer_id: string;
  business_id: string;
  order_id?: string;
  service_request_id?: string;
  rating: number;
  comment?: string;
  media_urls?: string[];
  created_at: string;
  updated_at: string;
  customer_details?: Pick<UserProfile, 'full_name' | 'profile_picture_url'>;
}

export interface ReviewInsert {
  customer_id: string;
  business_id: string;
  order_id?: string;
  service_request_id?: string;
  rating: number;
  comment?: string;
  media_urls?: string[];
}

export interface ReviewUpdate {
  rating?: number;
  comment?: string;
  media_urls?: string[];
  updated_at?: string;
}

// --- AI Related ---
export type AIContentType = 'PROMOTIONAL_CAPTION' | 'OFFER_HEADLINE' | 'PRODUCT_DESCRIPTION' | 'RESPONSE_TEMPLATE' | 'REMINDER_MESSAGE' | 'PERFORMANCE_SUMMARY' | 'CHAT_RESPONSE';
export type AITone = 'FESTIVE' | 'FORMAL' | 'CASUAL' | 'URGENT' | 'EMPATHETIC' | 'PROFESSIONAL' | 'CONVERSATIONAL';
export type AIPlatform = 'INSTAGRAM' | 'WHATSAPP' | 'FACEBOOK' | 'WEBSITE' | 'EMAIL' | 'SMS' | 'IN_APP_CHAT' | 'OTHER';

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggested_shops?: BusinessProfileDetail[];
  type?: 'text' | 'image_upload' | 'business_card';
}

export interface AISavedContent {
  id: string;
  business_id: string;
  content_type: AIContentType;
  platform: AIPlatform;
  tone: AITone;
  language: AppLanguage;
  generated_text: string;
  notes?: string;
  is_favorite: boolean;
  created_at: string;
}

export interface AIInsightsSummary {
  summaryText: string;
  actionableTips: string[];
  keyMetrics: {
    totalSales: number;
    totalOrders: number;
    newCustomers: number;
    avgRating: number;
  };
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

// --- Common UI Props ---
export interface CommonButtonProps {
  onPress: () => void;
  title?: string;
  isLoading?: boolean;
  leftIconName?: string;
  rightIconName?: string;
  children?: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
}

export interface CommonInputProps {
  label?: string;
  isOptional?: boolean;
  errorMessage?: string;
  leftElement?: JSX.Element;
  rightElement?: JSX.Element;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
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

export type CustomerMainStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  ShopDetail: { businessId: string };
  ProductDetail: { productId: string; businessId?: string };
  ServiceBooking: { serviceId: string; businessId?: string; initialProblemDescription?: string; initialMedia?: string[] };
  AIChat: { initialQuery?: string };
  Checkout: { cartId?: string; orderDetails?: any; orderId?: string };
  OrderTracking: { orderId: string; businessId?: string };
  SubmitReview: { entityId: string; entityType: 'business' | 'order' | 'serviceRequest' };
  Notifications: undefined;
  SavedAddresses: undefined;
  PaymentMethods: undefined;
  Wallet: undefined;
  ReferralProgram: undefined;
  LoyaltyProgram: undefined;
  DisputeResolution: { orderId?: string; serviceRequestId?: string };
  CustomerChatSupport: { threadId?: string };
  ChangePassword: { email?: string; userId?: string };
  ChangeEmail: { currentEmail: string };
  ProfileEdit: undefined;
};

// ...existing code...

export type BusinessMainStackParamList = {
  BusinessTabs: NavigatorScreenParams<BusinessTabParamList>;
  BusinessRegistration: { userId: string };
  ManageProducts: undefined;
  ManageServices: undefined;
  OrderRequestDetail: { requestId: string; requestType: 'order' | 'serviceRequest' };
  AIContentGenerator: undefined;
  AIContentLibrary: undefined;
  StaffManagement: undefined;
  PromotionManagement: undefined;
  BusinessProfileSettings: undefined;
  BusinessCustomerManagement: undefined;
  AIInsightsReport: undefined;
  ManageInvoices: undefined;
  BusinessChatSupport: { threadId?: string };
};

export type StaffTabParamList = {
  Tasks: undefined;
  LiveMap: undefined;
  Profile: undefined;
};

export type StaffMainStackParamList = {
  StaffTabs: NavigatorScreenParams<StaffTabParamList>;
  TaskDetail: { taskId: string };
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

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  borderRadius?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  style?: any;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
}

// --- Location Types ---
export interface LocationRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface BusinessLocation {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  rating?: number;
  isOpen: boolean;
  distance?: number;
  imageUrl?: string;
}

// --- Product and Service Types ---
export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  image_url?: string;
  is_available: boolean;
  stock_quantity?: number;
  unit?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  hourly_rate: number;
  currency: string;
  category: string;
  subcategory?: string;
  duration_minutes?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// --- Business Types ---
export interface Business {
  id: string;
  name: string;
  business_name?: string; // alias for name
  description?: string;
  category: string;
  subcategory?: string;
  phone: string;
  phone_number?: string; // alias for phone
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

// --- API Response Types ---
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number; // alias for total_count for compatibility
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
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

// --- Location Types ---
export interface LocationPermissionState {
  granted: boolean;
  canAskAgain?: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface LocationSearchFilters {
  radius_km?: number;
  category_id?: string;
  business_type?: BusinessInteractionType;
  min_rating?: number;
  is_open_now?: boolean;
  has_delivery?: boolean;
  price_range?: 'low' | 'medium' | 'high';
}

// --- Chat Types ---
export interface ChatThread {
  id: string;
  participants: string[];
  last_message?: ChatMessage;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  content: string;
  metadata?: any;
  created_at: string;
}

// --- Analytics Types ---
export interface BusinessMetrics {
  period: string;
  total_revenue: number;
  total_orders: number;
  new_customers: number;
  avg_rating: number;
  cancellation_rate: number;
}

export interface CustomerInsights {
  repeat_customers: number;
  avg_order_value: number;
  top_products: Array<{ product_id: string; name: string; sales_count: number }>;
  busiest_hours: Array<{ hour: number; order_count: number }>;
}
