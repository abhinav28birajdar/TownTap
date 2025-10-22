// Database Types for LocalMart

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone?: string
          name: string
          user_type: 'customer' | 'business' | 'staff' | 'admin'
          avatar_url?: string
          current_location_geom?: string
          preferences?: Json
          fcm_token?: string
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string
          name: string
          user_type?: 'customer' | 'business' | 'staff' | 'admin'
          avatar_url?: string
          current_location_geom?: string
          preferences?: Json
          fcm_token?: string
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string
          name?: string
          user_type?: 'customer' | 'business' | 'staff' | 'admin'
          avatar_url?: string
          current_location_geom?: string
          preferences?: Json
          fcm_token?: string
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          description?: string
          category_type: string[]
          business_email?: string
          business_phone?: string
          location_geom: string
          service_area_geom?: string
          address: string
          logo_url?: string
          cover_image_url?: string
          operating_hours: Json
          avg_rating: number
          total_reviews: number
          realtime_status: 'online' | 'offline' | 'busy'
          accepts_cod: boolean
          has_offers: boolean
          is_approved: boolean
          is_verified: boolean
          commission_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string
          category_type: string[]
          business_email?: string
          business_phone?: string
          location_geom: string
          service_area_geom?: string
          address: string
          logo_url?: string
          cover_image_url?: string
          operating_hours?: Json
          avg_rating?: number
          total_reviews?: number
          realtime_status?: 'online' | 'offline' | 'busy'
          accepts_cod?: boolean
          has_offers?: boolean
          is_approved?: boolean
          is_verified?: boolean
          commission_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string
          category_type?: string[]
          business_email?: string
          business_phone?: string
          location_geom?: string
          service_area_geom?: string
          address?: string
          logo_url?: string
          cover_image_url?: string
          operating_hours?: Json
          avg_rating?: number
          total_reviews?: number
          realtime_status?: 'online' | 'offline' | 'busy'
          accepts_cod?: boolean
          has_offers?: boolean
          is_approved?: boolean
          is_verified?: boolean
          commission_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          business_id: string
          name: string
          description?: string
          price: number
          discount_price?: number
          category: string
          subcategory?: string
          images: string[]
          stock_quantity: number
          is_available: boolean
          variants?: Json
          sku?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string
          price: number
          discount_price?: number
          category: string
          subcategory?: string
          images?: string[]
          stock_quantity?: number
          is_available?: boolean
          variants?: Json
          sku?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string
          price?: number
          discount_price?: number
          category?: string
          subcategory?: string
          images?: string[]
          stock_quantity?: number
          is_available?: boolean
          variants?: Json
          sku?: string
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          description?: string
          base_price: number
          pricing_model: 'fixed' | 'hourly' | 'custom'
          estimated_duration: number
          category: string
          subcategory?: string
          images: string[]
          is_available: boolean
          requires_appointment: boolean
          is_queue_based: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string
          base_price: number
          pricing_model?: 'fixed' | 'hourly' | 'custom'
          estimated_duration?: number
          category: string
          subcategory?: string
          images?: string[]
          is_available?: boolean
          requires_appointment?: boolean
          is_queue_based?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string
          base_price?: number
          pricing_model?: 'fixed' | 'hourly' | 'custom'
          estimated_duration?: number
          category?: string
          subcategory?: string
          images?: string[]
          is_available?: boolean
          requires_appointment?: boolean
          is_queue_based?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Additional types for application
export type UserType = 'customer' | 'business' | 'staff' | 'admin';
export type BusinessStatus = 'online' | 'offline' | 'busy';
export type TransactionType = 'order' | 'service' | 'consultation' | 'rental';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  user_type: UserType;
  avatar_url?: string;
  current_location_geom?: string;
  preferences?: Record<string, any>;
  fcm_token?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  category_type: string[];
  business_email?: string;
  business_phone?: string;
  location_geom: string;
  service_area_geom?: string;
  address: string;
  logo_url?: string;
  cover_image_url?: string;
  operating_hours: Record<string, any>;
  avg_rating: number;
  total_reviews: number;
  realtime_status: BusinessStatus;
  accepts_cod: boolean;
  has_offers: boolean;
  is_approved: boolean;
  is_verified: boolean;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  category: string;
  subcategory?: string;
  images: string[];
  stock_quantity: number;
  is_available: boolean;
  variants?: Record<string, any>;
  sku?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  base_price: number;
  pricing_model: 'fixed' | 'hourly' | 'custom';
  estimated_duration: number;
  category: string;
  subcategory?: string;
  images: string[];
  is_available: boolean;
  requires_appointment: boolean;
  is_queue_based: boolean;
  created_at: string;
  updated_at: string;
}