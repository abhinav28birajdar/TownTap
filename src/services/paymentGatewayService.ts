import { supabase } from '../lib/supabase';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export interface UPIConfig {
  googlePayDeepLink: string;
  phonepeDeepLink: string;
  paytmDeepLink: string;
  bhimDeepLink: string;
}

export interface PaymentGatewayService {
  // =====================================================
  // RAZORPAY INTEGRATION
  // =====================================================

  /**
   * Create Razorpay order for card/netbanking payments
   */
  createRazorpayOrder: (
    amount: number,
    currency: string,
    orderId: string,
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    }
  ) => Promise<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    receipt: string;
  }>;

  /**
   * Create UPI payment intent link
   */
  createUPIIntent: (
    amount: number,
    orderId: string,
    vpa: string,
    merchantName: string,
    upiApp?: 'google_pay' | 'phonepe' | 'paytm' | 'bhim'
  ) => Promise<{
    upiDeepLink: string;
    qrCodeData: string;
  }>;

  /**
   * Verify payment signature from Razorpay
   */
  verifyPaymentSignature: (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) => Promise<boolean>;

  /**
   * Process wallet payment
   */
  processWalletPayment: (
    userId: string,
    amount: number,
    orderId: string
  ) => Promise<{
    success: boolean;
    newBalance: number;
    transactionId: string;
  }>;

  /**
   * Initiate payout to business
   */
  initiatePayout: (
    businessId: string,
    amount: number,
    accountDetails: {
      accountNumber: string;
      ifsc: string;
      beneficiaryName: string;
    }
  ) => Promise<{
    payoutId: string;
    status: 'initiated' | 'processing' | 'success' | 'failed';
  }>;
}

export const paymentGatewayService: PaymentGatewayService = {
  createRazorpayOrder: async (amount, currency, orderId, customerInfo) => {
    try {
      const { data, error } = await supabase.functions.invoke('create_razorpay_order', {
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency,
          receipt: orderId,
          notes: {
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            customer_phone: customerInfo.phone,
            order_id: orderId
          }
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  },

  createUPIIntent: async (amount, orderId, vpa, merchantName, upiApp) => {
    try {
      const upiParams = new URLSearchParams({
        pa: vpa, // Payment address (VPA)
        pn: merchantName, // Payee name
        am: amount.toString(), // Amount
        tr: orderId, // Transaction reference
        tn: `Payment for Order ${orderId}`, // Transaction note
        cu: 'INR' // Currency
      });

      let baseUrl = 'upi://pay?';
      
      // App-specific deep links
      switch (upiApp) {
        case 'google_pay':
          baseUrl = 'tez://upi/pay?';
          break;
        case 'phonepe':
          baseUrl = 'phonepe://pay?';
          break;
        case 'paytm':
          baseUrl = 'paytmmp://pay?';
          break;
        case 'bhim':
          baseUrl = 'bhim://pay?';
          break;
        default:
          baseUrl = 'upi://pay?';
      }

      const upiDeepLink = baseUrl + upiParams.toString();
      
      // Generate QR code data
      const qrCodeData = `upi://pay?${upiParams.toString()}`;

      return {
        upiDeepLink,
        qrCodeData
      };
    } catch (error: any) {
      console.error('Error creating UPI intent:', error);
      throw new Error(error.message || 'Failed to create UPI payment link');
    }
  },

  verifyPaymentSignature: async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify_payment_signature', {
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;
      return data?.isValid || false;
    } catch (error: any) {
      console.error('Error verifying payment signature:', error);
      throw new Error(error.message || 'Failed to verify payment');
    }
  },

  processWalletPayment: async (userId, amount, orderId) => {
    try {
      const { data, error } = await supabase.functions.invoke('process_wallet_payment', {
        body: JSON.stringify({
          user_id: userId,
          amount,
          order_id: orderId
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error processing wallet payment:', error);
      throw new Error(error.message || 'Failed to process wallet payment');
    }
  },

  initiatePayout: async (businessId, amount, accountDetails) => {
    try {
      const { data, error } = await supabase.functions.invoke('initiate_business_payout', {
        body: JSON.stringify({
          business_id: businessId,
          amount: amount * 100, // Convert to paise
          account_details: accountDetails
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error initiating payout:', error);
      throw new Error(error.message || 'Failed to initiate payout');
    }
  }
};

export default paymentGatewayService;
