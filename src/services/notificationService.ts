import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Notification interfaces
export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  category: 'order' | 'promotion' | 'loyalty' | 'referral' | 'business' | 'system';
  title: string;
  body: string;
  variables: string[]; // Variables that can be replaced in template
  isActive: boolean;
  businessId?: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  categories: {
    orderUpdates: boolean;
    promotions: boolean;
    loyaltyRewards: boolean;
    referralUpdates: boolean;
    businessUpdates: boolean;
    systemAlerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
  };
  frequency: {
    promotions: 'immediate' | 'daily' | 'weekly' | 'never';
    loyalty: 'immediate' | 'daily' | 'weekly' | 'never';
  };
  updated_at: string;
}

export interface NotificationMessage {
  id: string;
  userId: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  category: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduledFor?: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  readAt?: string;
  clickedAt?: string;
  businessId?: string;
  orderId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
  created_at: string;
}

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceInfo: {
    deviceId: string;
    deviceName: string;
    osVersion: string;
    appVersion: string;
  };
  isActive: boolean;
  lastUsed: string;
  created_at: string;
}

export class NotificationService {
  private static pushToken: string | null = null;

  // =====================================================
  // PUSH NOTIFICATION SETUP
  // =====================================================

  static async initializePushNotifications(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.pushToken = tokenData.data;

      // Configure notification handling
      await this.configureNotificationHandling();

      return this.pushToken;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return null;
    }
  }

  static async registerPushToken(userId: string): Promise<void> {
    try {
      const token = await this.initializePushNotifications();
      if (!token) return;

      const deviceInfo = {
        deviceId: Constants.deviceId || 'unknown',
        deviceName: Constants.deviceName || 'Unknown Device',
        osVersion: Device.osVersion || 'Unknown',
        appVersion: Constants.expoConfig?.version || '1.0.0'
      };

      // Check if token already exists for this user
      const { data: existing } = await supabase
        .from('push_tokens')
        .select('id')
        .eq('user_id', userId)
        .eq('token', token)
        .single();

      if (existing) {
        // Update existing token
        await supabase
          .from('push_tokens')
          .update({
            device_info: deviceInfo,
            is_active: true,
            last_used: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new token record
        await supabase
          .from('push_tokens')
          .insert({
            user_id: userId,
            token,
            platform: Platform.OS as 'ios' | 'android',
            device_info: deviceInfo,
            is_active: true,
            last_used: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  private static async configureNotificationHandling(): Promise<void> {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      this.handleNotificationTapped(response);
    });
  }

  private static handleNotificationReceived(notification: Notifications.Notification): void {
    // Update notification as received in database
    if (notification.request.content.data?.notificationId) {
      this.markNotificationDelivered(notification.request.content.data.notificationId as string);
    }
  }

  private static handleNotificationTapped(response: Notifications.NotificationResponse): void {
    // Update notification as clicked in database
    if (response.notification.request.content.data?.notificationId) {
      this.markNotificationClicked(response.notification.request.content.data.notificationId as string);
    }

    // Handle navigation based on notification type
    const data = response.notification.request.content.data;
    if (data?.screen) {
      // Navigate to specific screen
      // This would integrate with your navigation system
      console.log('Navigate to:', data.screen, data.params);
    }
  }

  // =====================================================
  // NOTIFICATION SENDING
  // =====================================================

  static async sendNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      type?: 'email' | 'push' | 'sms' | 'in_app';
      category?: string;
      data?: Record<string, any>;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      scheduledFor?: Date;
      expiresAt?: Date;
      businessId?: string;
      orderId?: string;
    }
  ): Promise<NotificationMessage> {
    try {
      // Create notification record
      const notificationRecord = {
        user_id: userId,
        type: notification.type || 'push',
        category: notification.category || 'system',
        title: notification.title,
        body: notification.body,
        data: notification.data,
        scheduled_for: notification.scheduledFor?.toISOString(),
        status: notification.scheduledFor ? 'pending' : 'pending',
        business_id: notification.businessId,
        order_id: notification.orderId,
        priority: notification.priority || 'normal',
        expires_at: notification.expiresAt?.toISOString(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notification_messages')
        .insert(notificationRecord)
        .select()
        .single();

      if (error) throw error;

      const notificationMessage = data as NotificationMessage;

      // Send immediately if not scheduled
      if (!notification.scheduledFor) {
        await this.deliverNotification(notificationMessage);
      }

      return notificationMessage;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send notification');
    }
  }

  private static async deliverNotification(notification: NotificationMessage): Promise<void> {
    try {
      switch (notification.type) {
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'email':
          await this.sendEmailNotification(notification);
          break;
        case 'sms':
          await this.sendSMSNotification(notification);
          break;
        case 'in_app':
          await this.sendInAppNotification(notification);
          break;
      }

      // Update notification status
      await supabase
        .from('notification_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', notification.id);
    } catch (error) {
      console.error('Failed to deliver notification:', error);
      
      // Update notification status to failed
      await supabase
        .from('notification_messages')
        .update({
          status: 'failed',
          sent_at: new Date().toISOString()
        })
        .eq('id', notification.id);
    }
  }

  private static async sendPushNotification(notification: NotificationMessage): Promise<void> {
    try {
      // Get user's push tokens
      const { data: tokens } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', notification.userId)
        .eq('is_active', true);

      if (!tokens || tokens.length === 0) {
        throw new Error('No active push tokens found');
      }

      // Prepare push notification payload
      const pushMessage = {
        to: tokens.map(t => t.token),
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: {
          ...notification.data,
          notificationId: notification.id,
          category: notification.category,
          priority: notification.priority
        },
        priority: notification.priority === 'urgent' ? 'high' : 'normal',
        channelId: 'default'
      };

      // Send via Expo push service
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pushMessage),
      });

      if (!response.ok) {
        throw new Error(`Push notification failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Push notification sent:', result);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send push notification');
    }
  }

  private static async sendEmailNotification(notification: NotificationMessage): Promise<void> {
    // Email sending would integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Email notification sent:', notification.title);
  }

  private static async sendSMSNotification(notification: NotificationMessage): Promise<void> {
    // SMS sending would integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log('SMS notification sent:', notification.title);
  }

  private static async sendInAppNotification(notification: NotificationMessage): Promise<void> {
    // In-app notifications are stored in database and shown in UI
    // Real-time updates via Supabase realtime subscriptions
    await supabase
      .from('in_app_notifications')
      .insert({
        user_id: notification.userId,
        notification_id: notification.id,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        is_read: false,
        created_at: new Date().toISOString()
      });
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  static async markNotificationDelivered(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notification_messages')
        .update({
          status: 'delivered',
          sent_at: new Date().toISOString()
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Failed to mark notification as delivered:', error);
    }
  }

  static async markNotificationClicked(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notification_messages')
        .update({
          clicked_at: new Date().toISOString()
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Failed to mark notification as clicked:', error);
    }
  }

  static async markNotificationRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notification_messages')
        .update({
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // =====================================================
  // ANALYTICS
  // =====================================================

  static async getNotificationAnalytics(businessId?: string, dateRange?: { from: string; to: string }) {
    try {
      let query = supabase
        .from('notification_messages')
        .select('*');

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from)
          .lte('created_at', dateRange.to);
      }

      const { data: notifications } = await query;

      if (!notifications) return null;

      const totalSent = notifications.filter(n => n.status === 'sent' || n.status === 'delivered').length;
      const totalDelivered = notifications.filter(n => n.status === 'delivered').length;
      const totalClicked = notifications.filter(n => n.clicked_at).length;
      const totalRead = notifications.filter(n => n.read_at).length;

      return {
        totalNotifications: notifications.length,
        totalSent,
        totalDelivered,
        totalClicked,
        totalRead,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        clickRate: totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0,
        readRate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0,
        byType: {
          push: notifications.filter(n => n.type === 'push').length,
          email: notifications.filter(n => n.type === 'email').length,
          sms: notifications.filter(n => n.type === 'sms').length,
          inApp: notifications.filter(n => n.type === 'in_app').length
        },
        byCategory: {
          order: notifications.filter(n => n.category === 'order').length,
          promotion: notifications.filter(n => n.category === 'promotion').length,
          loyalty: notifications.filter(n => n.category === 'loyalty').length,
          referral: notifications.filter(n => n.category === 'referral').length,
          business: notifications.filter(n => n.category === 'business').length,
          system: notifications.filter(n => n.category === 'system').length
        }
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get notification analytics');
    }
  }
}

export default NotificationService;
