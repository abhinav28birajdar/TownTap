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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          role: 'customer' | 'business_owner' | 'admin'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'business_owner' | 'admin'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'business_owner' | 'admin'
          avatar_url?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          created_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          category_id: string | null
          address: string | null
          latitude: number | null
          longitude: number | null
          opening_hours: Json | null
          phone: string | null
          avatar_url: string | null
          avg_rating: number
          total_reviews: number
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          category_id?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          opening_hours?: Json | null
          phone?: string | null
          avatar_url?: string | null
          avg_rating?: number
          total_reviews?: number
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          category_id?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          opening_hours?: Json | null
          phone?: string | null
          avatar_url?: string | null
          avg_rating?: number
          total_reviews?: number
          is_verified?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          business_id: string
          title: string | null
          description: string | null
          price: number | null
          duration_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          title?: string | null
          description?: string | null
          price?: number | null
          duration_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          title?: string | null
          description?: string | null
          price?: number | null
          duration_minutes?: number | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          business_id: string
          service_id: string | null
          status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_for: string | null
          price: number | null
          payment_method: string | null
          payment_status: 'unpaid' | 'paid' | 'refunded'
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          business_id: string
          service_id?: string | null
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_for?: string | null
          price?: number | null
          payment_method?: string | null
          payment_status?: 'unpaid' | 'paid' | 'refunded'
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          business_id?: string
          service_id?: string | null
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_for?: string | null
          price?: number | null
          payment_method?: string | null
          payment_status?: 'unpaid' | 'paid' | 'refunded'
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string | null
          customer_id: string
          business_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          customer_id: string
          business_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          customer_id?: string
          business_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          booking_id: string | null
          business_id: string
          latitude: number | null
          longitude: number | null
          speed: number | null
          accuracy: number | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          business_id: string
          latitude?: number | null
          longitude?: number | null
          speed?: number | null
          accuracy?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          business_id?: string
          latitude?: number | null
          longitude?: number | null
          speed?: number | null
          accuracy?: number | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          booking_id: string | null
          amount: number | null
          provider: string | null
          provider_payment_id: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          amount?: number | null
          provider?: string | null
          provider_payment_id?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          amount?: number | null
          provider?: string | null
          provider_payment_id?: string | null
          status?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          data?: Json | null
          created_at?: string
        }
      }
    }
  }
}
