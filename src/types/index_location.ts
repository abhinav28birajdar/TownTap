// ============================================================================
// CORE USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  user_type: 'customer' | 'business_owner';
  avatar_url?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// LOCATION TYPES
// ============================================================================

export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationState {
  currentLocation: Location | null;
  permissionGranted: boolean;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// BUSINESS CATEGORY TYPES
// ============================================================================

export interface BusinessCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  created_at: string;
}

// ============================================================================
// BUSINESS TYPES
// ============================================================================

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface Business {
  id: string;
  owner_id: string;
  category_id: string;
  business_name: string;
  description?: string;
  phone_number: string;
  whatsapp_number?: string;
  email?: string;
  website_url?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  business_hours?: BusinessHours;
  services?: string[];
  images?: string[];
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Populated fields
  category?: BusinessCategory;
  owner?: UserProfile;
  distance_km?: number;
}

export interface BusinessRegistration {
  business_name: string;
  description: string;
  category_id: string;
  phone_number: string;
  whatsapp_number?: string;
  email?: string;
  website_url?: string;
  location: Location;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  business_hours?: BusinessHours;
  services?: string[];
  images?: string[];
}

export interface BusinessSearchFilters {
  category_id?: string;
  radius_km?: number;
  city?: string;
  rating_min?: number;
  is_verified?: boolean;
}

export interface BusinessSearchParams {
  location: Location;
  filters?: BusinessSearchFilters;
  limit?: number;
  offset?: number;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface Review {
  id: string;
  business_id: string;
  customer_id: string;
  rating: number;
  review_text?: string;
  images?: string[];
  created_at: string;
  
  // Populated fields
  customer?: UserProfile;
}

export interface ReviewFormData {
  business_id: string;
  rating: number;
  review_text?: string;
  images?: string[];
}

// ============================================================================
// FAVORITES TYPES
// ============================================================================

export interface Favorite {
  id: string;
  customer_id: string;
  business_id: string;
  created_at: string;
  
  // Populated fields
  business?: Business;
}

// ============================================================================
// MESSAGING TYPES
// ============================================================================

export interface Message {
  id: string;
  business_id: string;
  customer_id: string;
  message_text: string;
  customer_phone?: string;
  customer_name?: string;
  message_type: 'inquiry' | 'booking' | 'general';
  status: 'new' | 'read' | 'replied' | 'closed';
  created_at: string;
  
  // Populated fields
  business?: Business;
  customer?: UserProfile;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'customer' | 'business';
  message_text: string;
  created_at: string;
  is_read: boolean;
}

export interface MessageFormData {
  business_id: string;
  message_text: string;
  customer_phone?: string;
  customer_name?: string;
  message_type?: 'inquiry' | 'booking' | 'general';
}

export interface ChatConversation {
  business_id: string;
  business_name: string;
  business_image?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  messages: Message[];
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface BusinessAnalytics {
  id: string;
  business_id: string;
  date: string;
  views: number;
  inquiries: number;
  calls: number;
  messages: number;
  created_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  total_inquiries: number;
  total_calls: number;
  total_messages: number;
  daily_analytics: BusinessAnalytics[];
  popular_days: string[];
  peak_hours: string[];
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export interface NavigationParams {
  // Customer Navigation
  CustomerHome: undefined;
  BusinessDetail: { 
    businessId: string; 
    business?: Business; 
  };
  BusinessList: { 
    category?: string; 
    location?: Location; 
  };
  CategoryList: undefined;
  SearchResults: { 
    query: string; 
    location: Location; 
  };
  Reviews: { 
    businessId: string; 
  };
  WriteReview: { 
    businessId: string; 
    businessName: string; 
  };
  Chat: { 
    businessId: string; 
    businessName: string; 
  };
  
  // Business Owner Navigation
  BusinessDashboard: undefined;
  BusinessProfile: undefined;
  EditBusiness: { 
    businessId?: string; 
  };
  Messages: undefined;
  Analytics: undefined;
  
  // Shared Navigation
  Profile: undefined;
  Settings: undefined;
  Location: undefined;
  Notifications: undefined;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface NearbyBusinessesResponse {
  businesses: Business[];
  total_count: number;
  radius_km: number;
  center_location: Location;
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

export interface MapViewState {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers: Business[];
  selectedBusiness: Business | null;
}

// ============================================================================
// STORE TYPES
// ============================================================================

export interface RootState {
  auth: AuthState;
  location: LocationState;
  businesses: BusinessState;
  favorites: FavoriteState;
  messages: MessageState;
}

export interface BusinessState {
  nearbyBusinesses: Business[];
  searchResults: Business[];
  categories: BusinessCategory[];
  selectedBusiness: Business | null;
  loading: LoadingState;
  error: ErrorState;
}

export interface FavoriteState {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
}

export interface MessageState {
  conversations: ChatConversation[];
  currentMessages: Message[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
