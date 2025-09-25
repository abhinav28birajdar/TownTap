import { supabase } from '../lib/supabase';
import {
    CartItem,
    CheckoutData,
    Location,
    Order,
    OrderInsert,
    OrderItemInsert,
    OrderWithDetails,
    PaginatedResponse,
    PaymentIntent
} from '../types';
import { generateOrderNumber } from '../utils/helpers';

export class OrderService {
  // =====================================================
  // ORDER CREATION & MANAGEMENT
  // =====================================================

  static async createOrder(orderData: Omit<OrderInsert, 'order_number'>): Promise<Order> {
    try {
      const orderNumber = generateOrderNumber();
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          order_number: orderNumber
        })
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create order');
    }
  }

  static async createOrderWithItems(checkoutData: CheckoutData, customerId: string): Promise<OrderWithDetails> {
    try {
      // Start transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          business_id: checkoutData.items[0].businessId,
          order_number: generateOrderNumber(),
          order_type: this.determineOrderType(checkoutData.items),
          status: 'pending',
          service_address: checkoutData.delivery_address,
          subtotal: checkoutData.subtotal,
          delivery_fee: checkoutData.deliveryFee,
          tax_amount: checkoutData.taxes,
          discount_amount: checkoutData.discount,
          total_amount: checkoutData.total,
          payment_method: checkoutData.payment_method,
          payment_status: 'pending',
          special_instructions: checkoutData.specialInstructions,
          scheduled_date: checkoutData.scheduledDate,
          scheduled_time_slot: checkoutData.scheduledTime
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems: OrderItemInsert[] = checkoutData.items.map(item => ({
        order_id: order.id,
        product_id: item.productId || undefined,
        service_id: item.serviceId || undefined,
        quantity: item.quantity,
        price_at_order: item.price,
        variant_details: item.variant_selected
      }));

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) throw itemsError;

      // Create initial status record
      await this.addStatusUpdate(order.id, 'pending', 'Order created');

      return {
        ...order,
        items,
        business: null,
        customer: null
      } as OrderWithDetails;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create order with items');
    }
  }

  static async getOrderById(orderId: string): Promise<OrderWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          business:businesses(*),
          customer:profiles(*),
          items:order_items(*),
          status_history:order_status_history(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as OrderWithDetails;
    } catch (error: any) {
      if (error.message.includes('No rows')) return null;
      throw new Error(error.message || 'Failed to fetch order');
    }
  }

  static async updateOrderStatus(
    orderId: string, 
    status: Order['status'], 
    notes?: string,
    location?: Location
  ): Promise<Order> {
    try {
      // Update order status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) throw orderError;

      // Add status history record
      await this.addStatusUpdate(orderId, status, notes, location);

      return order as Order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  static async addStatusUpdate(
    orderId: string, 
    status: string, 
    notes?: string, 
    location?: Location
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          notes,
          location: location ? { latitude: location.latitude, longitude: location.longitude } : null,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add status update');
    }
  }

  // =====================================================
  // ORDER QUERIES
  // =====================================================

  static async getCustomerOrders(
    customerId: string,
    status?: Order['status'],
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<OrderWithDetails>> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          business:businesses(id, name, profile_image_url, phone),
          items:order_items(*)
        `, { count: 'exact' })
        .eq('customer_id', customerId);

      if (status) {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as OrderWithDetails[],
        count: count || 0,
        total_count: count || 0,
        page: page,
        limit: limit,
        has_more: (count || 0) > from + limit
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch customer orders');
    }
  }

  static async getBusinessOrders(
    businessId: string,
    status?: Order['status'],
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<OrderWithDetails>> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:profiles(id, full_name, phone, avatar_url),
          items:order_items(*)
        `, { count: 'exact' })
        .eq('business_id', businessId);

      if (status) {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as OrderWithDetails[],
        count: count || 0,
        total_count: count || 0,
        page: page,
        limit: limit,
        has_more: (count || 0) > from + limit
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch business orders');
    }
  }

  static async getPendingOrders(businessId: string): Promise<OrderWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:profiles(id, full_name, phone, avatar_url),
          items:order_items(*)
        `)
        .eq('business_id', businessId)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as OrderWithDetails[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch pending orders');
    }
  }

  static async getActiveOrders(customerId: string): Promise<OrderWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          business:businesses(id, name, profile_image_url, phone),
          items:order_items(*)
        `)
        .eq('customer_id', customerId)
        .in('status', ['accepted', 'in_progress', 'on_route', 'arrived'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrderWithDetails[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch active orders');
    }
  }

  // =====================================================
  // ORDER ACTIONS
  // =====================================================

  static async acceptOrder(orderId: string, estimatedTime?: string): Promise<Order> {
    try {
      const updates: Partial<Order> = {
        status: 'accepted'
      };

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      await this.addStatusUpdate(orderId, 'accepted', 'Order accepted by business');
      
      return data as Order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to accept order');
    }
  }

  static async rejectOrder(orderId: string, reason: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'rejected',
          cancellation_reason: reason
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      await this.addStatusUpdate(orderId, 'rejected', `Order rejected: ${reason}`);
      
      return data as Order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reject order');
    }
  }

  static async startOrder(orderId: string, location?: Location): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'in_progress',
          actual_start_time: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      await this.addStatusUpdate(orderId, 'in_progress', 'Work started', location);
      
      return data as Order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to start order');
    }
  }

  static async completeOrder(orderId: string, location?: Location): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          actual_completion_time: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      await this.addStatusUpdate(orderId, 'completed', 'Order completed', location);
      
      return data as Order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to complete order');
    }
  }

  static async cancelOrder(orderId: string, reason: string, refundAmount?: number): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancellation_reason: reason,
          refund_amount: refundAmount
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      await this.addStatusUpdate(orderId, 'cancelled', `Order cancelled: ${reason}`);
      
      return data as Order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel order');
    }
  }

  // =====================================================
  // PAYMENT INTEGRATION
  // =====================================================

  static async createPaymentIntent(orderId: string, amount: number): Promise<PaymentIntent> {
    try {
      // This would integrate with your payment processor (Stripe, Razorpay, etc.)
      // For now, returning a mock payment intent
      return {
        id: `pi_${Date.now()}`,
        amount,
        currency: 'INR',
        payment_method_types: ['card'],
        client_secret: `pi_${Date.now()}_secret`,
        status: 'pending',
        created_at: new Date().toISOString()
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create payment intent');
    }
  }

  static async confirmPayment(orderId: string, paymentId: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          payment_id: paymentId
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      await this.addStatusUpdate(orderId, 'payment_pending', 'Payment confirmed');
      
      return data as Order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to confirm payment');
    }
  }

  static async processRefund(orderId: string, amount: number, reason: string): Promise<Order> {
    try {
      // Process refund with payment processor
      // Update order with refund details
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'refunded',
          refund_amount: amount
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      await this.addStatusUpdate(orderId, 'cancelled', `Refund processed: ₹${amount} - ${reason}`);
      
      return data as Order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to process refund');
    }
  }

  // =====================================================
  // ORDER TRACKING
  // =====================================================

  static async updateServiceProviderLocation(orderId: string, location: Location): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          customer_location: {
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update location');
    }
  }

  static async getOrderStatusHistory(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select(`
          *,
          updated_by:profiles(full_name)
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order history');
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private static determineOrderType(items: CartItem[]): 'service' | 'product' | 'mixed' {
    const hasService = items.some(item => item.type === 'service');
    const hasProduct = items.some(item => item.type === 'product');
    
    if (hasService && hasProduct) return 'mixed';
    if (hasService) return 'service';
    return 'product';
  }

  static async getOrderStatistics(businessId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount, created_at')
        .eq('business_id', businessId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = {
        totalOrders: data.length,
        totalRevenue: data.reduce((sum, order) => sum + order.total_amount, 0),
        completedOrders: data.filter(order => order.status === 'completed').length,
        cancelledOrders: data.filter(order => order.status === 'cancelled').length,
        pendingOrders: data.filter(order => order.status === 'pending').length,
        averageOrderValue: data.length > 0 ? data.reduce((sum, order) => sum + order.total_amount, 0) / data.length : 0
      };

      return stats;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order statistics');
    }
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  static subscribeToOrderUpdates(orderId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`order_${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, callback)
      .subscribe();
  }

  static subscribeToBusinessOrders(businessId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`business_orders_${businessId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `business_id=eq.${businessId}`
      }, callback)
      .subscribe();
  }

  static subscribeToCustomerOrders(customerId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`customer_orders_${customerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `customer_id=eq.${customerId}`
      }, callback)
      .subscribe();
  }
}

export default OrderService;
