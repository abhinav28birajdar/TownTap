import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { supabase } from '../lib/supabase';
import { PaymentMethod, PaymentStatus } from '../types/payment.types';

type PaymentDetails = {
  amount: number;
  currency: string;
  orderId?: string;
  customerId: string;
  businessId: string;
  description: string;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  businessName?: string;
  upiId?: string;
};

type PaymentResult = {
  success: boolean;
  paymentId?: string;
  error?: string;
  status: PaymentStatus;
  transactionId?: string;
};

type UPIDeepLink = {
  payTmLink?: string;
  googlePayLink?: string;
  phonePeLink?: string;
  bhimLink?: string;
};

const UPI_APPS = {
  GOOGLE_PAY: {
    scheme: 'gpay://',
    package: 'com.google.android.apps.nbu.paisa.user',
  },
  PHONE_PE: {
    scheme: 'phonepe://',
    package: 'com.phonepe.app',
  },
  PAYTM: {
    scheme: 'paytm://',
    package: 'net.one97.paytm',
  },
  BHIM: {
    scheme: 'bhim://',
    package: 'in.org.npci.upiapp',
  },
};

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(async (
    details: PaymentDetails
  ): Promise<PaymentResult> => {
    try {
      setIsLoading(true);
      setError(null);

      // Create payment record and get checkout info
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'process-checkout-payment',
        {
          body: details,
        }
      );

      if (checkoutError) throw checkoutError;

      let paymentResult: PaymentResult;

      switch (details.paymentMethod) {
        case 'razorpay_card':
        case 'razorpay_netbanking':
          paymentResult = await handleRazorpayPayment(checkoutData);
          break;
        case 'upi_intent':
        case 'razorpay_upi':
          paymentResult = await handleUPIPayment(checkoutData);
          break;
        case 'wallet':
          paymentResult = await handleWalletPayment(details);
          break;
        case 'cod':
          paymentResult = await handleCODPayment(details);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      return paymentResult;
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message,
        status: 'failed',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRazorpayPayment = async (checkoutData: any): Promise<PaymentResult> => {
    try {
      const options = {
        ...checkoutData.razorpay,
        prefill: {
          email: checkoutData.customer_email,
          contact: checkoutData.customer_phone,
          name: checkoutData.customer_name,
        },
        theme: {
          color: '#2196F3',
        },
      };

      const result = await RazorpayCheckout.open(options);

      // Verify payment with backend
      const { data: verificationData, error: verificationError } = await supabase.functions.invoke(
        'verify-razorpay-payment',
        {
          body: {
            ...result,
            orderId: checkoutData.order_id,
          },
        }
      );

      if (verificationError) throw verificationError;

      return {
        success: true,
        paymentId: result.razorpay_payment_id,
        status: 'completed',
        transactionId: verificationData.transaction_id,
      };
    } catch (err: any) {
      throw new Error(err.message || 'Razorpay payment failed');
    }
  };

  const handleUPIPayment = async (checkoutData: any): Promise<PaymentResult> => {
    try {
      const upiLinks: UPIDeepLink = checkoutData.upi_deep_links;

      // Show UPI app selection dialog
      return new Promise((resolve) => {
        Alert.alert(
          'Choose UPI App',
          'Select your preferred UPI payment app',
          [
            {
              text: 'Google Pay',
              onPress: async () => {
                const success = await openUPIApp(upiLinks.googlePayLink, UPI_APPS.GOOGLE_PAY);
                resolve({
                  success,
                  status: success ? 'pending' : 'failed',
                  error: success ? undefined : 'Failed to open Google Pay',
                });
              },
            },
            {
              text: 'PhonePe',
              onPress: async () => {
                const success = await openUPIApp(upiLinks.phonePeLink, UPI_APPS.PHONE_PE);
                resolve({
                  success,
                  status: success ? 'pending' : 'failed',
                  error: success ? undefined : 'Failed to open PhonePe',
                });
              },
            },
            {
              text: 'Paytm',
              onPress: async () => {
                const success = await openUPIApp(upiLinks.payTmLink, UPI_APPS.PAYTM);
                resolve({
                  success,
                  status: success ? 'pending' : 'failed',
                  error: success ? undefined : 'Failed to open Paytm',
                });
              },
            },
            {
              text: 'BHIM',
              onPress: async () => {
                const success = await openUPIApp(upiLinks.bhimLink, UPI_APPS.BHIM);
                resolve({
                  success,
                  status: success ? 'pending' : 'failed',
                  error: success ? undefined : 'Failed to open BHIM',
                });
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                resolve({
                  success: false,
                  status: 'cancelled',
                  error: 'Payment cancelled',
                });
              },
            },
          ],
          { cancelable: true }
        );
      });
    } catch (err: any) {
      throw new Error(err.message || 'UPI payment failed');
    }
  };

  const handleWalletPayment = async (details: PaymentDetails): Promise<PaymentResult> => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'process-wallet-payment',
        {
          body: {
            amount: details.amount,
            customerId: details.customerId,
            orderId: details.orderId,
          },
        }
      );

      if (error) throw error;

      return {
        success: true,
        status: 'completed',
        transactionId: data.transaction_id,
      };
    } catch (err: any) {
      throw new Error(err.message || 'Wallet payment failed');
    }
  };

  const handleCODPayment = async (details: PaymentDetails): Promise<PaymentResult> => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'confirm-cod-payment',
        {
          body: {
            orderId: details.orderId,
            amount: details.amount,
          },
        }
      );

      if (error) throw error;

      return {
        success: true,
        status: 'pending',
        transactionId: data.transaction_id,
      };
    } catch (err: any) {
      throw new Error(err.message || 'Failed to confirm COD payment');
    }
  };

  const openUPIApp = async (deepLink: string, app: { scheme: string; package: string }): Promise<boolean> => {
    try {
      const canOpen = await Linking.canOpenURL(deepLink);
      if (!canOpen) {
        throw new Error(`Cannot open ${app.scheme}`);
      }

      await Linking.openURL(deepLink);
      return true;
    } catch (err) {
      console.error(`Error opening ${app.scheme}:`, err);
      return false;
    }
  };

  const addFundsToWallet = useCallback(async (
    amount: number,
    customerId: string,
    paymentMethod: 'RAZORPAY' | 'UPI'
  ): Promise<PaymentResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: topupData, error: topupError } = await supabase.functions.invoke(
        'add-funds-to-wallet',
        {
          body: {
            amount,
            customerId,
            paymentMethod,
          },
        }
      );

      if (topupError) throw topupError;

      if (paymentMethod === 'RAZORPAY') {
        return handleRazorpayPayment(topupData);
      } else {
        return handleUPIPayment(topupData);
      }
    } catch (err: any) {
      console.error('Error adding funds to wallet:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message,
        status: 'failed',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    processPayment,
    addFundsToWallet,
    isLoading,
    error,
  };
}
