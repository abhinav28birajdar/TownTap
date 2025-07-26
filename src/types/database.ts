// Database Types for Supabase

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone_number: string | null;
          user_type: 'customer' | 'business_owner' | 'admin';
          fcm_token: string | null;
          locale: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone_number?: string | null;
          user_type: 'customer' | 'business_owner' | 'admin';
          fcm_token?: string | null;
          locale?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          phone_number?: string | null;
          user_type?: 'customer' | 'business_owner' | 'admin';
          fcm_token?: string | null;
          locale?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          description: string | null;
          address_line1: string;
          city: string;
          state: string;
          zip_code: string;
          latitude: number;
          longitude: number;
          contact_phone: string;
          operating_hours: Json;
          delivery_radius_km: number | null;
          business_type: 'type_a' | 'type_b' | 'type_c';
          specialized_categories: string[];
          is_approved: boolean;
          status: string;
          avg_rating: number | null;
          total_reviews: number;
          bank_account_info_encrypted: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          logo_url?: string | null;
          description?: string | null;
          address_line1: string;
          city: string;
          state: string;
          zip_code: string;
          latitude: number;
          longitude: number;
          contact_phone: string;
          operating_hours: Json;
          delivery_radius_km?: number | null;
          business_type: 'type_a' | 'type_b' | 'type_c';
          specialized_categories?: string[];
          is_approved?: boolean;
          status?: string;
          avg_rating?: number | null;
          total_reviews?: number;
          bank_account_info_encrypted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          description?: string | null;
          address_line1?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          latitude?: number;
          longitude?: number;
          contact_phone?: string;
          operating_hours?: Json;
          delivery_radius_km?: number | null;
          business_type?: 'type_a' | 'type_b' | 'type_c';
          specialized_categories?: string[];
          is_approved?: boolean;
          status?: string;
          avg_rating?: number | null;
          total_reviews?: number;
          bank_account_info_encrypted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon_url: string | null;
          description: string | null;
          interaction_type: 'type_a' | 'type_b' | 'type_c';
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          icon_url?: string | null;
          description?: string | null;
          interaction_type: 'type_a' | 'type_b' | 'type_c';
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          icon_url?: string | null;
          description?: string | null;
          interaction_type?: 'type_a' | 'type_b' | 'type_c';
          is_active?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          image_urls: string[];
          price: number;
          discount_price: number | null;
          stock_quantity: number;
          unit: string;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          image_urls?: string[];
          price: number;
          discount_price?: number | null;
          stock_quantity: number;
          unit: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          image_urls?: string[];
          price?: number;
          discount_price?: number | null;
          stock_quantity?: number;
          unit?: string;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          image_urls: string[];
          base_price: number;
          estimated_time_mins: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          image_urls?: string[];
          base_price: number;
          estimated_time_mins: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          image_urls?: string[];
          base_price?: number;
          estimated_time_mins?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          business_id: string;
          total_amount: number;
          delivery_charge: number;
          platform_commission_amount: number;
          order_status: string;
          payment_status: string;
          payment_method: string;
          delivery_option: string;
          delivery_address_json: Json;
          order_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          business_id: string;
          total_amount: number;
          delivery_charge?: number;
          platform_commission_amount?: number;
          order_status?: string;
          payment_status?: string;
          payment_method: string;
          delivery_option: string;
          delivery_address_json: Json;
          order_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          business_id?: string;
          total_amount?: number;
          delivery_charge?: number;
          platform_commission_amount?: number;
          order_status?: string;
          payment_status?: string;
          payment_method?: string;
          delivery_option?: string;
          delivery_address_json?: Json;
          order_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_order: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_order: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price_at_order?: number;
        };
      };
      service_requests: {
        Row: {
          id: string;
          customer_id: string;
          business_id: string;
          service_id: string | null;
          problem_description: string;
          photos_urls: string[];
          service_address_json: Json;
          preferred_date: string | null;
          preferred_time_slot: string | null;
          request_status: string;
          quoted_price: number | null;
          actual_charge: number | null;
          payment_status: string;
          scheduled_timestamp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          business_id: string;
          service_id?: string | null;
          problem_description: string;
          photos_urls?: string[];
          service_address_json: Json;
          preferred_date?: string | null;
          preferred_time_slot?: string | null;
          request_status?: string;
          quoted_price?: number | null;
          actual_charge?: number | null;
          payment_status?: string;
          scheduled_timestamp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          business_id?: string;
          service_id?: string | null;
          problem_description?: string;
          photos_urls?: string[];
          service_address_json?: Json;
          preferred_date?: string | null;
          preferred_time_slot?: string | null;
          request_status?: string;
          quoted_price?: number | null;
          actual_charge?: number | null;
          payment_status?: string;
          scheduled_timestamp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          customer_id: string;
          business_id: string;
          inquiry_type: string;
          details: string;
          attachments_urls: string[];
          budget_range: string | null;
          preferred_contact_method: string;
          inquiry_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          business_id: string;
          inquiry_type: string;
          details: string;
          attachments_urls?: string[];
          budget_range?: string | null;
          preferred_contact_method: string;
          inquiry_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          business_id?: string;
          inquiry_type?: string;
          details?: string;
          attachments_urls?: string[];
          budget_range?: string | null;
          preferred_contact_method?: string;
          inquiry_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          customer_id: string;
          business_id: string;
          order_id: string | null;
          service_request_id: string | null;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          business_id: string;
          order_id?: string | null;
          service_request_id?: string | null;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          business_id?: string;
          order_id?: string | null;
          service_request_id?: string | null;
          rating?: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_prompts_history: {
        Row: {
          id: string;
          profile_id: string;
          feature_type: string;
          input_prompt: string;
          ai_response: string;
          meta_data: Json;
          cost: number | null;
          language: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          feature_type: string;
          input_prompt: string;
          ai_response: string;
          meta_data?: Json;
          cost?: number | null;
          language: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          feature_type?: string;
          input_prompt?: string;
          ai_response?: string;
          meta_data?: Json;
          cost?: number | null;
          language?: string;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          profile_id: string;
          label: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          zip_code: string;
          latitude: number;
          longitude: number;
          is_default: boolean;
        };
        Insert: {
          id?: string;
          profile_id: string;
          label: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          zip_code: string;
          latitude: number;
          longitude: number;
          is_default?: boolean;
        };
        Update: {
          id?: string;
          profile_id?: string;
          label?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          zip_code?: string;
          latitude?: number;
          longitude?: number;
          is_default?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_businesses_within_radius: {
        Args: {
          lat: number;
          lng: number;
          radius_km: number;
        };
        Returns: {
          id: string;
          name: string;
          distance_km: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Business = Database['public']['Tables']['businesses']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type ServiceRequest = Database['public']['Tables']['service_requests']['Row'];
export type Inquiry = Database['public']['Tables']['inquiries']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type AIPromptHistory = Database['public']['Tables']['ai_prompts_history']['Row'];
export type Address = Database['public']['Tables']['addresses']['Row'];
