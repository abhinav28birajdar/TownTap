import { supabase } from '../lib/supabase';
import {
    PaginatedResponse,
    Payment,
    PaymentInsert,
    PaymentUpdate,
    Refund,
    RefundInsert
} from '../types';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export interface PaymentGatewayConfig {
  razorpay?: {
    keyId: string;
    keySecret: string;
  };
  stripe?: {
    publishableKey: string;
    secretKey: string;
  };
}

export class PaymentService {
  // =====================================================
  // PAYMENT PROCESSING
  // =====================================================

  static async createPayment(paymentData: PaymentInsert): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select(`
          *,
          order:orders!payments_order_id_fkey (
            id,
            order_number,
            total_amount
          ),
          customer:profiles!payments_customer_id_fkey (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data as Payment;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create payment');
    }
  }

  static async updatePayment(paymentId: string, updates: PaymentUpdate): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select(`
          *,
          order:orders!payments_order_id_fkey (
            id,
            order_number,
            total_amount
          ),
          customer:profiles!payments_customer_id_fkey (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data as Payment;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update payment');
    }
  }

  static async getPayment(paymentId: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          order:orders!payments_order_id_fkey (
            id,
            order_number,
            total_amount
          ),
          customer:profiles!payments_customer_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('id', paymentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data as Payment;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch payment');
    }
  }

  static async getOrderPayments(orderId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          customer:profiles!payments_customer_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order payments');
    }
  }

  // =====================================================
  // PAYMENT INTENT CREATION
  // =====================================================

  static async createPaymentIntent(
    orderId: string,
    amount: number,
    currency: string = 'INR',
    paymentMethod: 'razorpay' | 'stripe' = 'razorpay'
  ): Promise<PaymentIntent> {
    try {
      // Get order details
      const { data: order } = await supabase
        .from('orders')
        .select(`
          *,
          customer:profiles!orders_customer_id_fkey (
            id,
            name,
            email,
            phone
          ),
          business:businesses!orders_business_id_fkey (
            id,
            name
          )
        `)
        .eq('id', orderId)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      if (paymentMethod === 'razorpay') {
        return await this.createRazorpayPaymentIntent(order, amount, currency);
      } else {
        return await this.createStripePaymentIntent(order, amount, currency);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create payment intent');
    }
  }

  private static async createRazorpayPaymentIntent(
    order: any,
    amount: number,
    currency: string
  ): Promise<PaymentIntent> {
    try {
      // This would integrate with Razorpay API
      // For now, return a mock response
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        status: 'created'
      };

      // In a real implementation, you would call Razorpay API:
      // const Razorpay = require('razorpay');
      // const instance = new Razorpay({
      //   key_id: process.env.RAZORPAY_KEY_ID,
      //   key_secret: process.env.RAZORPAY_KEY_SECRET,
      // });
      
      // const order = await instance.orders.create({
      //   amount: amount * 100,
      //   currency,
      //   receipt: `order_${orderId}`,
      //   notes: {
      //     order_id: orderId,
      //     customer_id: order.customer_id
      //   }
      // });

      return paymentIntent;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create Razorpay payment intent');
    }
  }

  private static async createStripePaymentIntent(
    order: any,
    amount: number,
    currency: string
  ): Promise<PaymentIntent> {
    try {
      // This would integrate with Stripe API
      // For now, return a mock response
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount: amount * 100, // Stripe expects amount in cents
        currency: currency.toLowerCase(),
        status: 'requires_payment_method',
        clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36)}`
      };

      // In a real implementation, you would call Stripe API:
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: amount * 100,
      //   currency: currency.toLowerCase(),
      //   metadata: {
      //     order_id: orderId,
      //     customer_id: order.customer_id
      //   }
      // });

      return paymentIntent;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create Stripe payment intent');
    }
  }

  // =====================================================
  // PAYMENT CONFIRMATION
  // =====================================================

  static async confirmPayment(
    paymentId: string,
    paymentIntentId: string,
    gateway: 'razorpay' | 'stripe',
    gatewayResponse: Record<string, any>
  ): Promise<Payment> {
    try {
      // Verify payment with gateway
      const isValid = await this.verifyPaymentWithGateway(paymentIntentId, gateway, gatewayResponse);
      
      if (!isValid) {
        throw new Error('Payment verification failed');
      }

      // Update payment status
      const payment = await this.updatePayment(paymentId, {
        status: 'completed',
        gateway_payment_id: paymentIntentId,
        gateway_response: gatewayResponse,
        paid_at: new Date().toISOString()
      });

      // Update order status
      await supabase
        .from('orders')
        .update({ 
          payment_status: 'completed',
          status: 'confirmed'
        })
        .eq('id', payment.order_id);

      return payment;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to confirm payment');
    }
  }

  private static async verifyPaymentWithGateway(
    paymentIntentId: string,
    gateway: 'razorpay' | 'stripe',
    gatewayResponse: Record<string, any>
  ): Promise<boolean> {
    try {
      if (gateway === 'razorpay') {
        return this.verifyRazorpayPayment(paymentIntentId, gatewayResponse);
      } else {
        return this.verifyStripePayment(paymentIntentId, gatewayResponse);
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  private static verifyRazorpayPayment(
    paymentIntentId: string,
    gatewayResponse: Record<string, any>
  ): boolean {
    try {
      // In a real implementation, you would verify with Razorpay
      // const crypto = require('crypto');
      // const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      // hmac.update(gatewayResponse.razorpay_order_id + "|" + gatewayResponse.razorpay_payment_id);
      // const generated_signature = hmac.digest('hex');
      // return generated_signature === gatewayResponse.razorpay_signature;
      
      // For now, assume payment is valid if required fields are present
      return !!(gatewayResponse.razorpay_payment_id && gatewayResponse.razorpay_signature);
    } catch (error: any) {
      return false;
    }
  }

  private static verifyStripePayment(
    paymentIntentId: string,
    gatewayResponse: Record<string, any>
  ): boolean {
    try {
      // In a real implementation, you would verify with Stripe
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      // return paymentIntent.status === 'succeeded';
      
      // For now, assume payment is valid if status is succeeded
      return gatewayResponse.status === 'succeeded';
    } catch (error: any) {
      return false;
    }
  }

  // =====================================================
  // REFUNDS
  // =====================================================

  static async createRefund(refundData: RefundInsert): Promise<Refund> {
    try {
      const { data, error } = await supabase
        .from('refunds')
        .insert(refundData)
        .select(`
          *,
          payment:payments!refunds_payment_id_fkey (
            id,
            amount,
            gateway,
            gateway_payment_id
          ),
          order:orders!refunds_order_id_fkey (
            id,
            order_number
          )
        `)
        .single();

      if (error) throw error;
      return data as Refund;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create refund');
    }
  }

  static async processRefund(refundId: string): Promise<Refund> {
    try {
      const { data: refund } = await supabase
        .from('refunds')
        .select(`
          *,
          payment:payments!refunds_payment_id_fkey (
            id,
            amount,
            gateway,
            gateway_payment_id
          )
        `)
        .eq('id', refundId)
        .single();

      if (!refund) {
        throw new Error('Refund not found');
      }

      // Process refund with gateway
      const gatewayRefundId = await this.processGatewayRefund(
        refund.payment.gateway,
        refund.payment.gateway_payment_id,
        refund.amount
      );

      // Update refund status
      const { data: updatedRefund, error } = await supabase
        .from('refunds')
        .update({
          status: 'completed',
          gateway_refund_id: gatewayRefundId,
          processed_at: new Date().toISOString()
        })
        .eq('id', refundId)
        .select(`
          *,
          payment:payments!refunds_payment_id_fkey (
            id,
            amount,
            gateway,
            gateway_payment_id
          ),
          order:orders!refunds_order_id_fkey (
            id,
            order_number
          )
        `)
        .single();

      if (error) throw error;
      return updatedRefund as Refund;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to process refund');
    }
  }

  private static async processGatewayRefund(
    gateway: string,
    gatewayPaymentId: string,
    amount: number
  ): Promise<string> {
    try {
      if (gateway === 'razorpay') {
        // const Razorpay = require('razorpay');
        // const instance = new Razorpay({
        //   key_id: process.env.RAZORPAY_KEY_ID,
        //   key_secret: process.env.RAZORPAY_KEY_SECRET,
        // });
        // const refund = await instance.payments.refund(gatewayPaymentId, {
        //   amount: amount * 100
        // });
        // return refund.id;
        
        return `refund_${Date.now()}`;
      } else if (gateway === 'stripe') {
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // const refund = await stripe.refunds.create({
        //   payment_intent: gatewayPaymentId,
        //   amount: amount * 100
        // });
        // return refund.id;
        
        return `re_${Date.now()}`;
      }
      
      throw new Error(`Unsupported gateway: ${gateway}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to process gateway refund');
    }
  }

  // =====================================================
  // PAYMENT HISTORY & ANALYTICS
  // =====================================================

  static async getCustomerPaymentHistory(
    customerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Payment>> {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          order:orders!payments_order_id_fkey (
            id,
            order_number,
            total_amount,
            business:businesses!orders_business_id_fkey (
              id,
              name
            )
          )
        `, { count: 'exact' })
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Payment[],
        count: count || 0,
        hasMore: (count || 0) > from + limit,
        nextCursor: (count || 0) > from + limit ? (page + 1).toString() : undefined
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch payment history');
    }
  }

  static async getBusinessPaymentHistory(
    businessId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Payment>> {
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          order:orders!payments_order_id_fkey (
            id,
            order_number,
            total_amount
          ),
          customer:profiles!payments_customer_id_fkey (
            id,
            name,
            email
          )
        `, { count: 'exact' })
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Payment[],
        count: count || 0,
        hasMore: (count || 0) > from + limit,
        nextCursor: (count || 0) > from + limit ? (page + 1).toString() : undefined
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch business payment history');
    }
  }

  static async getPaymentAnalytics(businessId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, status, created_at, gateway')
        .eq('business_id', businessId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const totalPayments = payments.length;
      const completedPayments = payments.filter(p => p.status === 'completed');
      const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const averageOrderValue = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0;

      const gatewayBreakdown = payments.reduce((acc, payment) => {
        acc[payment.gateway] = (acc[payment.gateway] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dailyRevenue = payments.reduce((acc, payment) => {
        if (payment.status === 'completed') {
          const date = payment.created_at.split('T')[0];
          acc[date] = (acc[date] || 0) + payment.amount;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        totalPayments,
        completedPayments: completedPayments.length,
        failedPayments: payments.filter(p => p.status === 'failed').length,
        totalRevenue,
        averageOrderValue,
        gatewayBreakdown,
        dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
          date,
          revenue
        })).sort((a, b) => a.date.localeCompare(b.date))
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get payment analytics');
    }
  }

  // =====================================================
  // PAYMENT METHODS MANAGEMENT
  // =====================================================

  static async savePaymentMethod(
    customerId: string,
    paymentMethodData: Omit<PaymentMethod, 'id'>
  ): Promise<PaymentMethod> {
    try {
      // In a real implementation, this would save payment method to gateway
      // and store reference in database
      const paymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        ...paymentMethodData
      };

      // Store payment method reference in database
      // This would require a payment_methods table
      
      return paymentMethod;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save payment method');
    }
  }

  static async getCustomerPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      // In a real implementation, this would fetch from payment methods table
      // or gateway API
      return [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch payment methods');
    }
  }

  static async deletePaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    try {
      // In a real implementation, this would delete from gateway and database
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete payment method');
    }
  }
}

export default PaymentService;
