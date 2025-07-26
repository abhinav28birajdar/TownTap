import { Business, Inquiry, Order, OrderItem, Product, Profile, Service, ServiceRequest } from './database';

// Re-export database types
export { Business, Inquiry, Order, OrderItem, Product, Profile, Service, ServiceRequest };

// Category Type
export interface Category {
  id: string;
  name: string;
  icon_url?: string;
  description?: string;
  interaction_type: 'type_a' | 'type_b' | 'type_c';
  is_active: boolean;
}

// User Authentication Types
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
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  id?: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  location: Location;
  isDefault?: boolean;
}

// Business Types
export interface BusinessProfile extends Business {
  categories?: any[];
  products?: Product[];
  services?: Service[];
  distance?: number;
  business_name?: string;
  category?: string;
  rating?: number;
  review_count?: number;
  is_open?: boolean;
}

export interface BusinessRegistration {
  name: string;
  description: string;
  businessType: 'type_a' | 'type_b' | 'type_c';
  categories: string[];
  address: Address;
  contactPhone: string;
  operatingHours: OperatingHours;
  deliveryRadius?: number;
  logoUrl?: string;
}

export interface OperatingHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

// Cart & Order Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  specialInstructions?: string;
}

export interface Cart {
  items: CartItem[];
  businessId: string;
  totalAmount: number;
  deliveryCharge: number;
}

// Extended Product type with business info
export interface ProductWithBusiness extends Product {
  business?: Business;
}

// Extended Profile type
export interface ExtendedProfile extends Profile {
  business_name?: string;
}

// Business Types Constants
export const BUSINESS_TYPES = {
  TYPE_A: 'type_a',
  TYPE_B: 'type_b', 
  TYPE_C: 'type_c',
  ORDER_BUY: 'type_a',
  BOOK_SERVICE: 'type_b',
  INQUIRE_CONSULT: 'type_c'
} as const;

export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[];
  business: Business;
  order_number?: string;
  status?: string;
  customer_name?: string;
}

// Service Request Types
export interface ServiceRequestForm {
  businessId: string;
  serviceId?: string;
  problemDescription: string;
  photos: string[];
  serviceAddress: Address;
  preferredDate?: string;
  preferredTimeSlot?: string;
}

export interface ServiceRequestWithDetails extends ServiceRequest {
  business: Business;
  service?: Service;
  customer: Profile;
}

// AI Types
export interface AIContentRequest {
  businessId: string;
  promptText: string;
  contentType: string;
  platform: string;
  tone: string;
  language: string;
}

export interface AIContentResponse {
  content: string;
  suggestions?: string[];
}

export interface AICustomerAssistantRequest {
  customerId: string;
  queryText: string;
  location: Location;
  language: string;
}

export interface AICustomerAssistantResponse {
  response: string;
  suggestedBusinesses?: BusinessProfile[];
}

export interface AIPerformanceInsight {
  summary: string;
  actionableTips: string[];
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    newCustomers: number;
    avgRating: number;
    periodComparison: {
      revenueChange: number;
      ordersChange: number;
      customersChange: number;
    };
  };
}

// Navigation Types
export interface RootStackParamList {
  // Auth Stack
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  
  // Customer Stack
  CustomerTabs: undefined;
  BusinessDetail: { businessId: string };
  ProductDetail: { productId: string };
  ServiceDetail: { serviceId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderTracking: { orderId: string };
  ServiceRequest: { businessId: string; serviceId?: string };
  AIAssistant: undefined;
  
  // Business Stack
  BusinessTabs: undefined;
  BusinessOnboarding: undefined;
  AIContentGenerator: undefined;
  OrderManagement: undefined;
  ServiceRequestManagement: undefined;
  Analytics: undefined;
  
  // Shared Stack
  Chat: { conversationId: string };
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
}

export interface CustomerTabParamList {
  Home: undefined;
  Search: undefined;
  Orders: undefined;
  Profile: undefined;
}

export interface BusinessTabParamList {
  Dashboard: undefined;
  Orders: undefined;
  AITools: undefined;
  Analytics: undefined;
  Profile: undefined;
}

// Search & Filter Types
export interface SearchFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  distance?: number;
  isOpen?: boolean;
  businessType?: 'type_a' | 'type_b' | 'type_c';
}

export interface SearchResult {
  businesses: BusinessProfile[];
  products: Product[];
  services: Service[];
  totalCount: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'order' | 'service_request' | 'inquiry' | 'general' | 'promotion';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: 'text' | 'image' | 'ai_suggestion';
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: Profile[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'cod';
  displayName: string;
  details: any;
  isDefault: boolean;
}

// Analytics Types
export interface BusinessAnalytics {
  period: 'daily' | 'weekly' | 'monthly';
  revenue: number;
  orders: number;
  customers: number;
  avgRating: number;
  topProducts: { product: Product; sales: number }[];
  topServices: { service: Service; bookings: number }[];
  customerFeedback: { positive: number; negative: number; neutral: number };
}

// Error Types
export interface APIError {
  message: string;
  code?: string;
  details?: any;
}

// Form Types
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
  userType: 'customer' | 'business';
  acceptTerms: boolean;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Utility Types
export interface ApiResponse<T> {
  data?: T;
  error?: APIError;
  loading?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  returnKeyType?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
}

export interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
  borderRadius?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
}
