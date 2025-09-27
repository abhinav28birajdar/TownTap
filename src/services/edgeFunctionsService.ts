import { supabase } from '../lib/supabase';

interface PaymentWebhookPayload {
  payment_id: string;
  status: 'completed' | 'failed' | 'refunded' | 'disputed';
  amount: number;
  currency: string;
  metadata?: any;
}

interface NotificationPayload {
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  action_url?: string;
  send_push?: boolean;
  send_email?: boolean;
  send_sms?: boolean;
}

interface BusinessVerificationPayload {
  business_id: string;
  verification_type: 'document' | 'location' | 'identity';
  documents?: string[];
  location_verification?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  admin_notes?: string;
}

interface LocationUpdatePayload {
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  activity_type?: 'delivery' | 'service' | 'customer';
  related_id?: string;
  address?: string;
}

export class EdgeFunctionsService {
  private static async callFunction(functionName: string, payload: any) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      if (error) {
        console.error(`Edge function ${functionName} error:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Failed to call edge function ${functionName}:`, error);
      throw error;
    }
  }

  // Payment webhook processing
  static async processPaymentWebhook(payload: PaymentWebhookPayload) {
    return this.callFunction('payment-webhook', payload);
  }

  // Send notifications
  static async sendNotification(payload: NotificationPayload) {
    return this.callFunction('send-notification', payload);
  }

  // Business verification
  static async verifyBusiness(payload: BusinessVerificationPayload) {
    return this.callFunction('verify-business', payload);
  }

  // Location updates
  static async updateLocation(payload: LocationUpdatePayload) {
    return this.callFunction('update-location', payload);
  }

  // Convenience methods for common notification types
  static async sendOrderNotification(
    recipientId: string, 
    orderId: string, 
    title: string, 
    message: string,
    status: string
  ) {
    return this.sendNotification({
      recipient_id: recipientId,
      type: 'order_update',
      title,
      message,
      data: { order_id: orderId, status },
      action_url: `/orders/${orderId}`,
      send_push: true,
      send_email: false
    });
  }

  static async sendServiceNotification(
    recipientId: string, 
    serviceRequestId: string, 
    title: string, 
    message: string,
    status: string
  ) {
    return this.sendNotification({
      recipient_id: recipientId,
      type: 'service_update',
      title,
      message,
      data: { service_request_id: serviceRequestId, status },
      action_url: `/services/${serviceRequestId}`,
      send_push: true,
      send_email: false
    });
  }

  static async sendChatNotification(
    recipientId: string, 
    chatId: string, 
    senderName: string, 
    message: string
  ) {
    return this.sendNotification({
      recipient_id: recipientId,
      type: 'chat_message',
      title: `Message from ${senderName}`,
      message: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      data: { chat_id: chatId, sender_name: senderName },
      action_url: `/chats/${chatId}`,
      send_push: true,
      send_email: false
    });
  }

  static async sendWelcomeNotification(recipientId: string, userName: string) {
    return this.sendNotification({
      recipient_id: recipientId,
      type: 'welcome',
      title: 'Welcome to TownTap! 🎉',
      message: `Hi ${userName}! Start exploring local businesses and services in your community.`,
      data: { welcome: true },
      action_url: '/explore',
      send_push: true,
      send_email: true
    });
  }

  // Business verification convenience methods
  static async verifyBusinessDocuments(businessId: string, documents: string[]) {
    return this.verifyBusiness({
      business_id: businessId,
      verification_type: 'document',
      documents
    });
  }

  static async verifyBusinessLocation(
    businessId: string, 
    latitude: number, 
    longitude: number, 
    address: string
  ) {
    return this.verifyBusiness({
      business_id: businessId,
      verification_type: 'location',
      location_verification: { latitude, longitude, address }
    });
  }

  static async verifyBusinessIdentity(businessId: string, adminNotes?: string) {
    return this.verifyBusiness({
      business_id: businessId,
      verification_type: 'identity',
      admin_notes: adminNotes
    });
  }

  // Location tracking convenience methods
  static async trackDelivery(
    userId: string, 
    orderId: string, 
    latitude: number, 
    longitude: number,
    address?: string
  ) {
    return this.updateLocation({
      user_id: userId,
      latitude,
      longitude,
      activity_type: 'delivery',
      related_id: orderId,
      address
    });
  }

  static async trackServiceProvider(
    userId: string, 
    serviceRequestId: string, 
    latitude: number, 
    longitude: number,
    address?: string
  ) {
    return this.updateLocation({
      user_id: userId,
      latitude,
      longitude,
      activity_type: 'service',
      related_id: serviceRequestId,
      address
    });
  }

  static async updateCustomerLocation(
    userId: string, 
    latitude: number, 
    longitude: number,
    address?: string
  ) {
    return this.updateLocation({
      user_id: userId,
      latitude,
      longitude,
      activity_type: 'customer',
      address
    });
  }
}

// Export individual functions for easier imports
export const {
  processPaymentWebhook,
  sendNotification,
  verifyBusiness,
  updateLocation,
  sendOrderNotification,
  sendServiceNotification,
  sendChatNotification,
  sendWelcomeNotification,
  verifyBusinessDocuments,
  verifyBusinessLocation,
  verifyBusinessIdentity,
  trackDelivery,
  trackServiceProvider,
  updateCustomerLocation
} = EdgeFunctionsService;