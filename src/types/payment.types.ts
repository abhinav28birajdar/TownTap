// Payment types for the application

// Payment method types
export type PaymentMethod = 
  | 'razorpay_card'
  | 'razorpay_netbanking'
  | 'razorpay_upi'
  | 'upi_intent'
  | 'wallet'
  | 'cod';

// Payment status types
export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

// Payment error types
export type PaymentError = {
  code: string;
  message: string;
  details?: any;
};

// Transaction types
export type TransactionType = 
  | 'payment'
  | 'refund'
  | 'wallet_credit'
  | 'wallet_debit'
  | 'payout';

// UPI app types
export type UPIApp = 
  | 'google_pay'
  | 'phone_pe'
  | 'paytm'
  | 'bhim'
  | 'other';

// Transaction details
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  customer_id: string;
  business_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// Wallet transaction
export interface WalletTransaction extends Transaction {
  wallet_id: string;
  balance_before: number;
  balance_after: number;
}

// Payment request payload
export interface PaymentRequest {
  amount: number;
  currency: string;
  customerId: string;
  businessId?: string;
  orderId?: string;
  description?: string;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
}

// Payment response
export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentId?: string;
  status: PaymentStatus;
  error?: PaymentError;
  receipt_url?: string;
  metadata?: Record<string, any>;
}
