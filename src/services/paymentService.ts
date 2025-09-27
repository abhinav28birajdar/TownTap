import { supabase } from '../lib/supabase';
import { Linking, Alert } from 'react-native';
import { EdgeFunctionsService } from './edgeFunctionsService';

// Payment method types for Indian market
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'upi' | 'wallet' | 'card' | 'netbanking' | 'emi';
  app_scheme?: string; // For deep linking to apps
  supported: boolean;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: 'INR';
  business_id: string;
  customer_id: string;
  service_type: 'order' | 'service_request' | 'rental' | 'consultation';
  reference_id: string;
  description: string;
  customer_details: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: any;
}

export interface PaymentResult {
  success: boolean;
  payment_id?: string;
  order_id?: string;
  signature?: string;
  error?: string;
  method?: string;
}

// Popular payment methods in India
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'razorpay',
    name: 'Razorpay',
    icon: '💳',
    type: 'card',
    supported: true,
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: '📱',
    type: 'upi',
    app_scheme: 'phonepe://',
    supported: true,
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    icon: '💰',
    type: 'upi',
    app_scheme: 'tez://',
    supported: true,
  },
  {
    id: 'paytm',
    name: 'Paytm',
    icon: '🛒',
    type: 'wallet',
    app_scheme: 'paytmmp://',
    supported: true,
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: '🏦',
    type: 'upi',
    supported: true,
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: '🏛️',
    type: 'netbanking',
    supported: true,
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: '💳',
    type: 'card',
    supported: true,
  },
  {
    id: 'emi',
    name: 'EMI Options',
    icon: '📊',
    type: 'emi',
    supported: true,
  },
];

export class PaymentService {
  private static razorpayKeyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';

  /**
   * Initialize payment system
   */
  static async initialize(): Promise<void> {
    try {
      // Initialize Razorpay SDK if needed
      console.log('Payment service initialized');
    } catch (error) {
      console.error('Payment service initialization failed:', error);
    }
  }

  /**
   * Create payment order
   */
  static async createPaymentOrder(orderDetails: Omit<PaymentOrder, 'id'>): Promise<PaymentOrder> {
    try {
      const { data, error } = await supabase
        .from('payment_orders')
        .insert({
          ...orderDetails,
          status: 'created',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Create payment order failed:', error);
      throw error;
    }
  }

  /**
   * Get supported payment methods
   */
  static getSupportedPaymentMethods(): PaymentMethod[] {
    return PAYMENT_METHODS.filter(method => method.supported);
  }

  /**
   * Check if app is installed for deep linking
   */
  static async isAppInstalled(appScheme: string): Promise<boolean> {
    try {
      return await Linking.canOpenURL(appScheme);
    } catch {
      return false;
    }
  }

  /**
   * Process payment with Razorpay
   */
  static async processRazorpayPayment(
    order: PaymentOrder,
    paymentMethod?: string
  ): Promise<PaymentResult> {
    try {
      // Create Razorpay order
      const razorpayOrder = await this.createRazorpayOrder(order);

      // Configure Razorpay options
      const options = {
        description: order.description,
        image: 'https://your-logo-url.com/logo.png',
        currency: order.currency,
        key: this.razorpayKeyId,
        amount: order.amount * 100, // Convert to paise
        name: 'TownTap',
        order_id: razorpayOrder.id,
        prefill: {
          email: order.customer_details.email,
          contact: order.customer_details.contact,
          name: order.customer_details.name,
        },
        theme: { color: '#007AFF' },
        method: paymentMethod ? { [paymentMethod]: true } : undefined,
      };

      // This would open Razorpay checkout
      // For React Native, you'd use react-native-razorpay library
      console.log('Razorpay options:', options);

      // Simulate successful payment for demo
      const paymentResult: PaymentResult = {
        success: true,
        payment_id: `pay_${Date.now()}`,
        order_id: razorpayOrder.id,
        signature: `signature_${Date.now()}`,
        method: paymentMethod || 'card',
      };

      // Update payment status
      await this.updatePaymentStatus(order.id, 'completed', paymentResult);

      return paymentResult;
    } catch (error) {
      console.error('Razorpay payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  /**
   * Process UPI payment with app routing
   */
  static async processUPIPayment(
    order: PaymentOrder,
    upiApp: 'phonepe' | 'gpay' | 'paytm' | 'upi'
  ): Promise<PaymentResult> {
    try {
      const paymentMethod = PAYMENT_METHODS.find(method => method.id === upiApp);
      
      if (!paymentMethod) {
        throw new Error('UPI app not supported');
      }

      // Check if app is installed
      if (paymentMethod.app_scheme) {
        const isInstalled = await this.isAppInstalled(paymentMethod.app_scheme);
        
        if (!isInstalled) {
          Alert.alert(
            'App Not Installed',
            `${paymentMethod.name} is not installed. Please install the app or choose another payment method.`,
            [{ text: 'OK' }]
          );
          return { success: false, error: 'App not installed' };
        }
      }

      // Generate UPI payment URL
      const upiUrl = this.generateUPIUrl(order, upiApp);

      // Open UPI app
      const canOpen = await Linking.canOpenURL(upiUrl);
      
      if (canOpen) {
        await Linking.openURL(upiUrl);
        
        // Return pending status - actual verification would happen via webhook
        return {
          success: true,
          payment_id: `upi_${Date.now()}`,
          order_id: order.id,
          method: upiApp,
        };
      } else {
        throw new Error('Cannot open UPI app');
      }
    } catch (error) {
      console.error('UPI payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'UPI payment failed',
      };
    }
  }

  /**
   * Generate UPI payment URL
   */
  private static generateUPIUrl(order: PaymentOrder, upiApp: string): string {
    const params = new URLSearchParams({
      pa: 'merchant@upi', // Replace with actual merchant UPI ID
      pn: 'TownTap',
      mc: '5411', // Merchant category code
      tid: order.id,
      tr: order.reference_id,
      tn: order.description,
      am: order.amount.toString(),
      cu: order.currency,
    });

    // App-specific URL schemes
    switch (upiApp) {
      case 'phonepe':
        return `phonepe://pay?${params.toString()}`;
      case 'gpay':
        return `tez://upi/pay?${params.toString()}`;
      case 'paytm':
        return `paytmmp://pay?${params.toString()}`;
      default:
        return `upi://pay?${params.toString()}`;
    }
  }

  /**
   * Create Razorpay order
   */
  private static async createRazorpayOrder(order: PaymentOrder): Promise<any> {
    try {
      // Call Supabase Edge Function to create Razorpay order
      const { data } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: order.amount * 100, // Convert to paise
          currency: order.currency,
          receipt: order.id,
          notes: {
            business_id: order.business_id,
            customer_id: order.customer_id,
            service_type: order.service_type,
            reference_id: order.reference_id,
          },
        },
      });

      return data;
    } catch (error) {
      console.error('Create Razorpay order failed:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    orderId: string,
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    paymentResult?: PaymentResult
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('payment_orders')
        .update({
          status,
          payment_id: paymentResult?.payment_id,
          signature: paymentResult?.signature,
          payment_method: paymentResult?.method,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      // Send notification to customer
      if (status === 'completed') {
        await EdgeFunctionsService.sendNotification({
          recipient_id: (await this.getOrderDetails(orderId)).customer_id,
          type: 'payment_success',
          title: 'Payment Successful! ✅',
          message: 'Your payment has been processed successfully.',
          data: { order_id: orderId, amount: (await this.getOrderDetails(orderId)).amount },
          send_push: true,
          send_email: true,
        });
      } else if (status === 'failed') {
        await EdgeFunctionsService.sendNotification({
          recipient_id: (await this.getOrderDetails(orderId)).customer_id,
          type: 'payment_failed',
          title: 'Payment Failed ❌',
          message: 'Your payment could not be processed. Please try again.',
          data: { order_id: orderId },
          send_push: true,
        });
      }
    } catch (error) {
      console.error('Update payment status failed:', error);
      throw error;
    }
  }

  /**
   * Get order details
   */
  private static async getOrderDetails(orderId: string): Promise<PaymentOrder> {
    const { data, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Process refund
   */
  static async processRefund(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<boolean> {
    try {
      const { data } = await supabase.functions.invoke('process-refund', {
        body: {
          payment_id: paymentId,
          amount: amount ? amount * 100 : undefined, // Convert to paise
          notes: {
            reason: reason || 'Customer requested refund',
            processed_by: 'system',
          },
        },
      });

      if (data.success) {
        // Update payment status to refunded
        await supabase
          .from('payment_orders')
          .update({
            status: 'refunded',
            refund_id: data.refund_id,
            updated_at: new Date().toISOString(),
          })
          .eq('payment_id', paymentId);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Process refund failed:', error);
      return false;
    }
  }

  /**
   * Get payment history for user
   */
  static async getPaymentHistory(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<PaymentOrder[]> {
    try {
      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get payment history failed:', error);
      return [];
    }
  }

  /**
   * Get business payment history
   */
  static async getBusinessPaymentHistory(
    businessId: string,
    limit = 20,
    offset = 0
  ): Promise<PaymentOrder[]> {
    try {
      const { data, error } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get business payment history failed:', error);
      return [];
    }
  }

  /**
   * Verify payment signature (for Razorpay)
   */
  static async verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> {
    try {
      const { data } = await supabase.functions.invoke('verify-payment', {
        body: {
          order_id: orderId,
          payment_id: paymentId,
          signature,
        },
      });

      return data.verified || false;
    } catch (error) {
      console.error('Verify payment signature failed:', error);
      return false;
    }
  }

  /**
   * Check payment status
   */
  static async checkPaymentStatus(paymentId: string): Promise<string> {
    try {
      const { data } = await supabase.functions.invoke('check-payment-status', {
        body: { payment_id: paymentId },
      });

      return data.status || 'unknown';
    } catch (error) {
      console.error('Check payment status failed:', error);
      return 'unknown';
    }
  }

  /**
   * Get payment analytics for business
   */
  static async getPaymentAnalytics(businessId: string, period = '30d'): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('payment_orders')
        .select('amount, status, created_at, payment_method')
        .eq('business_id', businessId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Calculate analytics
      const analytics = {
        total_revenue: 0,
        total_transactions: data?.length || 0,
        successful_payments: 0,
        failed_payments: 0,
        refunded_payments: 0,
        payment_methods: {} as Record<string, number>,
        daily_revenue: {} as Record<string, number>,
      };

      data?.forEach((payment: any) => {
        if (payment.status === 'completed') {
          analytics.total_revenue += payment.amount;
          analytics.successful_payments++;
        } else if (payment.status === 'failed') {
          analytics.failed_payments++;
        } else if (payment.status === 'refunded') {
          analytics.refunded_payments++;
        }

        // Payment method breakdown
        if (payment.payment_method) {
          analytics.payment_methods[payment.payment_method] = 
            (analytics.payment_methods[payment.payment_method] || 0) + 1;
        }

        // Daily revenue
        const date = payment.created_at.split('T')[0];
        if (payment.status === 'completed') {
          analytics.daily_revenue[date] = 
            (analytics.daily_revenue[date] || 0) + payment.amount;
        }
      });

      return analytics;
    } catch (error) {
      console.error('Get payment analytics failed:', error);
      return null;
    }
  }
}

// Payment method helpers
export const PaymentMethodHelper = {
  getMethodIcon: (methodId: string): string => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    return method?.icon || '💳';
  },

  getMethodName: (methodId: string): string => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    return method?.name || 'Unknown';
  },

  canOpenApp: async (methodId: string): Promise<boolean> => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    if (!method?.app_scheme) return false;
    return await PaymentService.isAppInstalled(method.app_scheme);
  },
};