import { supabase } from '../lib/supabase';
import { Business, CartItem, CheckoutData, Coordinates, Order, Product, Review, Service } from '../types';

export interface BusinessProfileDetail extends Omit<Business, 'services'> {
  products?: Product[];
  services?: Service[];
  reviews?: Review[];
  distance?: number;
}

export interface ShopProduct extends Product {
  business?: Business;
}

export interface PaymentMethodOption {
  type: 'card' | 'netbanking' | 'upi_collect' | 'upi_intent' | 'wallet' | 'cod';
  label: string;
  icon: string;
  enabled: boolean;
}

export interface UPIPaymentDetails {
  vpa?: string;
  upiAppName?: 'google_pay' | 'phonepe' | 'paytm' | 'bhim' | 'other';
}

export interface PaymentResponse {
  success: boolean;
  orderId?: string;
  razorpayOrderId?: string;
  upiDeepLink?: string;
  error?: string;
}

export const customerService = {
  // =====================================================
  // BUSINESS DISCOVERY & PROFILES
  // =====================================================

  /**
   * Get business details by ID with all related data
   */
  getBusinessById: async (businessId: string): Promise<BusinessProfileDetail | null> => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          products!products_business_id_fkey(*),
          services!services_business_id_fkey(*),
          reviews!reviews_business_id_fkey(
            *,
            profiles!reviews_customer_id_fkey(full_name, avatar_url)
          )
        `)
        .eq('id', businessId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching business:', error);
      throw new Error(error.message || 'Failed to fetch business details');
    }
  },

  /**
   * Get products for a specific business
   */
  getBusinessProducts: async (businessId: string): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching business products:', error);
      throw new Error(error.message || 'Failed to fetch products');
    }
  },

  /**
   * Get services for a specific business
   */
  getBusinessServices: async (businessId: string): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching business services:', error);
      throw new Error(error.message || 'Failed to fetch services');
    }
  },

  /**
   * Discover nearby businesses with AI-powered filtering
   */
  getNearbyBusinesses: async (
    coords: Coordinates,
    options: {
      categories?: string[];
      searchKeyword?: string;
      radiusKm?: number;
      businessType?: 'shop' | 'service' | 'consultation';
      isOpen?: boolean;
      featured?: boolean;
      limit?: number;
    } = {}
  ): Promise<BusinessProfileDetail[]> => {
    try {
      const {
        categories = [],
        searchKeyword,
        radiusKm = 20,
        businessType,
        isOpen,
        featured,
        limit = 50
      } = options;

      // Use PostGIS function for geo-location based search
      const { data, error } = await supabase.rpc('get_nearby_businesses', {
        user_lat: coords.latitude,
        user_lng: coords.longitude,
        radius_km: radiusKm,
        category_filter: categories.length > 0 ? categories[0] : null,
        limit_count: limit
      });

      if (error) {
        console.error('Error fetching nearby businesses:', error);
        throw error;
      }

      // Apply additional client-side filters if needed
      let filteredData = data || [];

      if (searchKeyword) {
        filteredData = filteredData.filter((business: any) => 
          business.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          business.description?.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      }

      if (isOpen !== undefined) {
        filteredData = filteredData.filter((business: any) => business.is_open === isOpen);
      }

      return filteredData;
    } catch (error: any) {
      console.error('Error discovering businesses:', error);
      throw new Error(error.message || 'Failed to discover businesses');
    }
  },

  /**
   * AI-powered business search with natural language
   */
  searchBusinessesWithAI: async (
    query: string,
    coords: Coordinates,
    options: { limit?: number } = {}
  ): Promise<BusinessProfileDetail[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai_business_search', {
        body: JSON.stringify({
          query,
          coordinates: coords,
          limit: options.limit || 20
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;
      return data?.businesses || [];
    } catch (error: any) {
      console.error('Error in AI business search:', error);
      throw new Error(error.message || 'Failed to search businesses');
    }
  },

  // =====================================================
  // CART & ORDER MANAGEMENT
  // =====================================================

  /**
   * Add item to cart (local storage + optional sync)
   */
  addToCart: async (
    productId: string,
    quantity: number,
    customerId: string,
    options: {
      variations?: string[];
      specialInstructions?: string;
    } = {}
  ): Promise<void> => {
    try {
      const cartItem = {
        customer_id: customerId,
        product_id: productId,
        quantity,
        variations: options.variations || [],
        special_instructions: options.specialInstructions,
        added_at: new Date().toISOString()
      };

      const { error } = await supabase.from('cart_items').upsert(cartItem, {
        onConflict: 'customer_id,product_id'
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      throw new Error(error.message || 'Failed to add item to cart');
    }
  },

  /**
   * Get cart items for customer
   */
  getCartItems: async (customerId: string): Promise<CartItem[]> => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products!cart_items_product_id_fkey(
            *,
            businesses!products_business_id_fkey(name, business_name)
          )
        `)
        .eq('customer_id', customerId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      throw new Error(error.message || 'Failed to fetch cart items');
    }
  },

  /**
   * Update cart item quantity
   */
  updateCartItemQuantity: async (
    customerId: string,
    productId: string,
    quantity: number
  ): Promise<void> => {
    try {
      if (quantity <= 0) {
        await customerService.removeCartItem(customerId, productId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('customer_id', customerId)
        .eq('product_id', productId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      throw new Error(error.message || 'Failed to update cart item');
    }
  },

  /**
   * Remove item from cart
   */
  removeCartItem: async (customerId: string, productId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', customerId)
        .eq('product_id', productId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error removing cart item:', error);
      throw new Error(error.message || 'Failed to remove cart item');
    }
  },

  /**
   * Clear entire cart
   */
  clearCart: async (customerId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', customerId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      throw new Error(error.message || 'Failed to clear cart');
    }
  },

  // =====================================================
  // PAYMENT INTEGRATION (RAZORPAY + UPI)
  // =====================================================

  /**
   * Create order and initiate payment process
   */
  createOrderAndInitiatePayment: async (
    orderData: CheckoutData,
    paymentMethod: 'card' | 'netbanking' | 'upi_collect' | 'upi_intent' | 'wallet' | 'cod',
    paymentDetails?: UPIPaymentDetails
  ): Promise<PaymentResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('process_checkout_payment', {
        body: JSON.stringify({
          orderData,
          paymentMethod,
          paymentDetails: paymentDetails || {}
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error processing payment:', error);
      throw new Error(error.message || 'Failed to process payment');
    }
  },

  /**
   * Verify payment status and complete order
   */
  verifyPaymentAndCompleteOrder: async (
    paymentId: string,
    razorpayPaymentId?: string,
    razorpaySignature?: string
  ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify_payment_signature', {
        body: JSON.stringify({
          payment_id: paymentId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      throw new Error(error.message || 'Failed to verify payment');
    }
  },

  // =====================================================
  // WALLET MANAGEMENT
  // =====================================================

  /**
   * Get wallet balance for user
   */
  getWalletBalance: async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('wallet_balances')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.balance || 0;
    } catch (error: any) {
      console.error('Error fetching wallet balance:', error);
      throw new Error(error.message || 'Failed to fetch wallet balance');
    }
  },

  /**
   * Add funds to wallet via Razorpay
   */
  addFundsToWallet: async (
    userId: string,
    amount: number
  ): Promise<{ razorpayOrderId: string; amount: number }> => {
    try {
      const { data, error } = await supabase.functions.invoke('initiate_wallet_deposit', {
        body: JSON.stringify({ userId, amount }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error adding funds to wallet:', error);
      throw new Error(error.message || 'Failed to add funds to wallet');
    }
  },

  /**
   * Get wallet transaction history
   */
  getWalletTransactions: async (
    userId: string,
    limit: number = 50
  ): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching wallet transactions:', error);
      throw new Error(error.message || 'Failed to fetch wallet transactions');
    }
  },

  // =====================================================
  // REVIEWS & RATINGS
  // =====================================================

  /**
   * Submit review for business
   */
  submitReview: async (reviewData: {
    business_id: string;
    customer_id: string;
    order_id?: string;
    rating: number;
    comment?: string;
    images?: string[];
  }): Promise<Review> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error submitting review:', error);
      throw new Error(error.message || 'Failed to submit review');
    }
  },

  /**
   * Get reviews for business
   */
  getBusinessReviews: async (
    businessId: string,
    options: { limit?: number; rating?: number } = {}
  ): Promise<Review[]> => {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_customer_id_fkey(full_name, avatar_url)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (options.rating) {
        query = query.eq('rating', options.rating);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching business reviews:', error);
      throw new Error(error.message || 'Failed to fetch reviews');
    }
  },

  // =====================================================
  // ORDER TRACKING
  // =====================================================

  /**
   * Get order history for customer
   */
  getOrderHistory: async (
    customerId: string,
    options: { limit?: number; status?: string } = {}
  ): Promise<Order[]> => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          businesses!orders_business_id_fkey(name, business_name),
          order_items!order_items_order_id_fkey(*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching order history:', error);
      throw new Error(error.message || 'Failed to fetch order history');
    }
  },

  /**
   * Get real-time order status
   */
  subscribeToOrderUpdates: (
    orderId: string,
    callback: (payload: any) => void
  ) => {
    return supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        callback
      )
      .subscribe();
  },

  // =====================================================
  // LOYALTY & REWARDS
  // =====================================================

  /**
   * Get customer loyalty points
   */
  getLoyaltyPoints: async (customerId: string): Promise<{ total_points: number; tier: string }> => {
    try {
      const { data, error } = await supabase
        .from('customer_loyalty')
        .select('total_points, tier')
        .eq('customer_id', customerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || { total_points: 0, tier: 'bronze' };
    } catch (error: any) {
      console.error('Error fetching loyalty points:', error);
      throw new Error(error.message || 'Failed to fetch loyalty points');
    }
  },

  /**
   * Apply referral code
   */
  applyReferralCode: async (
    customerId: string,
    referralCode: string
  ): Promise<{ success: boolean; bonus?: number; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('apply_referral_code', {
        body: JSON.stringify({ customerId, referralCode }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error applying referral code:', error);
      throw new Error(error.message || 'Failed to apply referral code');
    }
  }
};

export default customerService;
