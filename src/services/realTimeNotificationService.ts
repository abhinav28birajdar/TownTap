import { supabase } from '../lib/supabase';
import { EdgeFunctionsService } from './edgeFunctionsService';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TownTapNotification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  action_url?: string;
  is_read: boolean;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
  image_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'booking' | 'payment' | 'service' | 'chat' | 'system' | 'promotional';
}

export type NotificationType = 
  // Booking related
  | 'booking_confirmed' | 'booking_cancelled' | 'booking_modified' | 'service_started' 
  | 'service_completed' | 'service_cancelled' | 'provider_assigned' | 'provider_arrived'
  // Payment related  
  | 'payment_pending' | 'payment_success' | 'payment_failed' | 'payment_refunded'
  // Chat related
  | 'new_message' | 'chat_started' 
  // Business related
  | 'business_verified' | 'business_rejected' | 'new_review' | 'review_response'
  // System related
  | 'welcome' | 'account_updated' | 'security_alert' | 'app_update'
  // Promotional
  | 'special_offer' | 'discount_available' | 'new_service_available';

export interface NotificationPreferences {
  user_id: string;
  // Push notifications
  push_notifications: boolean;
  booking_notifications: boolean;
  payment_notifications: boolean;
  chat_notifications: boolean;
  promotional_notifications: boolean;
  // Email notifications
  email_notifications: boolean;
  email_booking_updates: boolean;
  email_payment_receipts: boolean;
  email_weekly_summary: boolean;
  // SMS notifications
  sms_notifications: boolean;
  sms_booking_confirmations: boolean;
  sms_payment_alerts: boolean;
  sms_security_alerts: boolean;
  // Timing preferences
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // HH:MM format
  quiet_hours_end: string;   // HH:MM format
  timezone: string;
  // Sound preferences
  notification_sound: string;
  vibration_enabled: boolean;
  led_enabled: boolean;
}

export class RealTimeNotificationService {
  private static instance: RealTimeNotificationService;
  private subscriptions: Map<string, any> = new Map();
  private notificationQueue: TownTapNotification[] = [];
  private isProcessingQueue = false;

  static getInstance(): RealTimeNotificationService {
    if (!RealTimeNotificationService.instance) {
      RealTimeNotificationService.instance = new RealTimeNotificationService();
    }
    return RealTimeNotificationService.instance;
  }

  /**
   * Initialize comprehensive notification system
   */
  async initialize(userId: string): Promise<void> {
    try {
      console.log('🔔 Initializing TownTap Notification System...');

      // Request notification permissions
      await this.requestPermissions();

      // Register FCM token
      await this.registerFCMToken(userId);

      // Load notification preferences
      await this.loadNotificationPreferences(userId);

      // Setup real-time listeners
      await this.setupRealTimeListeners(userId);

      // Configure notification handler
      this.configureNotificationHandler();

      // Setup background notification handling
      this.setupBackgroundNotificationHandling();

      // Process any queued notifications
      this.processNotificationQueue();

      console.log('✅ TownTap Notification System initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize notification system:', error);
    }
  }

  /**
   * Request notification permissions with detailed explanation
   */
  private async requestPermissions(): Promise<void> {
    if (!Device.isDevice) {
      console.log('Push notifications are not available on simulator');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: true,
          allowProvisional: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowVibrate: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return;
    }

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      await this.createNotificationChannels();
    }
  }

  /**
   * Create notification channels for Android
   */
  private async createNotificationChannels(): Promise<void> {
    const channels = [
      {
        id: 'booking_notifications',
        name: 'Booking Updates',
        description: 'Notifications about your service bookings',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'booking_sound.wav',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
      },
      {
        id: 'payment_notifications', 
        name: 'Payment Alerts',
        description: 'Payment confirmations and receipts',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'payment_sound.wav',
        vibrationPattern: [0, 200, 100, 200],
        lightColor: '#34C759',
      },
      {
        id: 'chat_notifications',
        name: 'Messages',
        description: 'New messages from service providers',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'message_sound.wav',
        vibrationPattern: [0, 100],
        lightColor: '#FF9500',
      },
      {
        id: 'service_notifications',
        name: 'Service Updates',
        description: 'Updates about your booked services',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'service_sound.wav',
        vibrationPattern: [0, 300, 200, 300],
        lightColor: '#FF2D92',
      },
      {
        id: 'system_notifications',
        name: 'System Alerts',
        description: 'Important system and security alerts',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'alert_sound.wav',
        vibrationPattern: [0, 500, 300, 500],
        lightColor: '#FF3B30',
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, channel);
    }
  }

  /**
   * Register FCM token for push notifications
   */
  private async registerFCMToken(userId: string): Promise<void> {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Update user profile with FCM token
      await supabase
        .from('profiles')
        .update({
          fcm_token: token,
          device_type: Platform.OS,
          app_version: '1.0.0', // Get from app.json
          last_active: new Date().toISOString(),
        })
        .eq('id', userId);

      console.log('FCM token registered:', token);
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  }

  /**
   * Load user notification preferences
   */
  private async loadNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        await AsyncStorage.setItem('notification_preferences', JSON.stringify(data));
        return data;
      }

      // Create default preferences if none exist
      const defaultPreferences: Omit<NotificationPreferences, 'user_id'> = {
        push_notifications: true,
        booking_notifications: true,
        payment_notifications: true,
        chat_notifications: true,
        promotional_notifications: false,
        email_notifications: true,
        email_booking_updates: true,
        email_payment_receipts: true,
        email_weekly_summary: false,
        sms_notifications: false,
        sms_booking_confirmations: true,
        sms_payment_alerts: true,
        sms_security_alerts: true,
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        timezone: 'Asia/Kolkata',
        notification_sound: 'default',
        vibration_enabled: true,
        led_enabled: true,
      };

      await this.updateNotificationPreferences(userId, defaultPreferences);
      return { user_id: userId, ...defaultPreferences };
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      return null;
    }
  }

  /**
   * Setup real-time listeners for different notification types
   */
  private async setupRealTimeListeners(userId: string): Promise<void> {
    // Personal notifications
    const personalSub = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => this.handleNewNotification(payload.new as TownTapNotification)
      )
      .subscribe();
    
    this.subscriptions.set('personal_notifications', personalSub);

    // Booking updates
    const bookingsSub = supabase
      .channel(`user_bookings:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public', 
          table: 'service_requests',
          filter: `customer_id=eq.${userId}`,
        },
        (payload) => this.handleBookingUpdate(payload)
      )
      .subscribe();

    this.subscriptions.set('booking_updates', bookingsSub);

    // Payment updates
    const paymentsSub = supabase
      .channel(`user_payments:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_orders',
          filter: `customer_id=eq.${userId}`,
        },
        (payload) => this.handlePaymentUpdate(payload)
      )
      .subscribe();

    this.subscriptions.set('payment_updates', paymentsSub);

    // Chat notifications
    const chatSub = supabase
      .channel(`user_chats:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => this.handleNewMessage(payload.new)
      )
      .subscribe();

    this.subscriptions.set('chat_notifications', chatSub);

    console.log('Real-time listeners setup complete');
  }

  /**
   * Configure notification handler for foreground notifications
   */
  private configureNotificationHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const preferences = await this.getStoredPreferences();
        
        // Check quiet hours
        if (preferences && this.isQuietHours(preferences)) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: true,
          };
        }

        return {
          shouldShowAlert: true,
          shouldPlaySound: preferences?.notification_sound !== 'none',
          shouldSetBadge: true,
        };
      },
    });
  }

  /**
   * Setup background notification handling
   */
  private setupBackgroundNotificationHandling(): void {
    // Handle notification tap/click
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      this.handleNotificationTap(data);
    });

    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification);
      // You can show custom in-app notification UI here
    });
  }

  /**
   * Handle new notification
   */
  private async handleNewNotification(notification: TownTapNotification): Promise<void> {
    console.log('New notification received:', notification);

    // Add to queue for processing
    this.notificationQueue.push(notification);
    
    // Process immediately if not already processing
    if (!this.isProcessingQueue) {
      this.processNotificationQueue();
    }

    // Show local notification
    await this.showLocalNotification(notification);
  }

  /**
   * Handle booking updates
   */
  private async handleBookingUpdate(payload: any): Promise<void> {
    const { eventType, new: newData, old: oldData } = payload;
    
    if (eventType === 'UPDATE' && newData.status !== oldData?.status) {
      const notification = this.createBookingNotification(newData);
      await this.sendNotification(notification);
    }
  }

  /**
   * Handle payment updates
   */
  private async handlePaymentUpdate(payload: any): Promise<void> {
    const { new: paymentData } = payload;
    
    if (paymentData.status === 'completed') {
      await EdgeFunctionsService.sendNotification({
        recipient_id: paymentData.customer_id,
        type: 'payment_success',
        title: 'Payment Successful! ✅',
        message: `₹${paymentData.amount} payment completed successfully`,
        data: { payment_id: paymentData.id, amount: paymentData.amount },
        send_push: true,
        send_email: true,
      });
    } else if (paymentData.status === 'failed') {
      await EdgeFunctionsService.sendNotification({
        recipient_id: paymentData.customer_id,
        type: 'payment_failed',
        title: 'Payment Failed ❌',
        message: 'Your payment could not be processed. Please try again.',
        data: { payment_id: paymentData.id },
        send_push: true,
      });
    }
  }

  /**
   * Handle new chat messages
   */
  private async handleNewMessage(messageData: any): Promise<void> {
    // Get sender info
    const { data: sender } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', messageData.sender_id)
      .single();

    await EdgeFunctionsService.sendChatNotification(
      messageData.receiver_id,
      messageData.chat_id,
      sender?.full_name || 'Someone',
      messageData.content
    );
  }

  /**
   * Show local notification
   */
  private async showLocalNotification(notification: TownTapNotification): Promise<void> {
    try {
      const preferences = await this.getStoredPreferences();
      
      // Check if notifications are enabled for this category
      if (!this.shouldShowNotification(notification, preferences)) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: notification.data,
          categoryIdentifier: notification.category,
          sound: preferences?.notification_sound || 'default',
        },
        trigger: null, // Show immediately
      });

      // Update badge count
      await this.updateBadgeCount();
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }

  /**
   * Process notification queue
   */
  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift();
        if (notification) {
          await this.processNotification(notification);
          // Small delay to prevent overwhelming
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('Error processing notification queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Process individual notification
   */
  private async processNotification(notification: TownTapNotification): Promise<void> {
    try {
      // Store in local database/cache for offline access
      await this.storeNotificationLocally(notification);
      
      // Update notification center UI
      // This would trigger UI updates through your state management
      
      console.log('Processed notification:', notification.id);
    } catch (error) {
      console.error('Failed to process notification:', error);
    }
  }

  /**
   * Create booking notification
   */
  private createBookingNotification(bookingData: any): TownTapNotification {
    let title = '';
    let message = '';
    
    switch (bookingData.status) {
      case 'confirmed':
        title = 'Booking Confirmed! ✅';
        message = 'Your service booking has been confirmed';
        break;
      case 'in_progress':
        title = 'Service Started 🔧';
        message = 'Your service provider has started working';
        break;
      case 'completed':
        title = 'Service Completed ✨';
        message = 'Your service has been completed successfully';
        break;
      case 'cancelled':
        title = 'Booking Cancelled ❌';
        message = 'Your service booking has been cancelled';
        break;
      default:
        title = 'Booking Update';
        message = `Your booking status: ${bookingData.status}`;
    }

    return {
      id: `booking_${bookingData.id}_${Date.now()}`,
      recipient_id: bookingData.customer_id,
      type: `booking_${bookingData.status}` as NotificationType,
      title,
      message,
      data: { booking_id: bookingData.id, status: bookingData.status },
      action_url: `/bookings/${bookingData.id}`,
      is_read: false,
      is_sent: false,
      created_at: new Date().toISOString(),
      priority: 'high',
      category: 'booking',
    };
  }

  /**
   * Send notification through Edge Function
   */
  private async sendNotification(notification: Omit<TownTapNotification, 'id' | 'created_at' | 'is_read' | 'is_sent'>): Promise<void> {
    await EdgeFunctionsService.sendNotification({
      recipient_id: notification.recipient_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      action_url: notification.action_url,
      send_push: true,
    });
  }

  /**
   * Check if notification should be shown based on preferences
   */
  private shouldShowNotification(notification: TownTapNotification, preferences: NotificationPreferences | null): boolean {
    if (!preferences) return true;

    // Check category preferences
    switch (notification.category) {
      case 'booking':
        return preferences.booking_notifications;
      case 'payment':
        return preferences.payment_notifications;
      case 'chat':
        return preferences.chat_notifications;
      case 'promotional':
        return preferences.promotional_notifications;
      case 'system':
        return true; // Always show system notifications
      default:
        return preferences.push_notifications;
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours_enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return currentTime >= preferences.quiet_hours_start || currentTime <= preferences.quiet_hours_end;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local storage
      await AsyncStorage.setItem('notification_preferences', JSON.stringify({ user_id: userId, ...preferences }));
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }

  /**
   * Get stored preferences from local storage
   */
  private async getStoredPreferences(): Promise<NotificationPreferences | null> {
    try {
      const stored = await AsyncStorage.getItem('notification_preferences');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Store notification locally for offline access
   */
  private async storeNotificationLocally(notification: TownTapNotification): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('local_notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      
      notifications.unshift(notification);
      // Keep only last 100 notifications
      if (notifications.length > 100) {
        notifications.splice(100);
      }
      
      await AsyncStorage.setItem('local_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to store notification locally:', error);
    }
  }

  /**
   * Update app badge count
   */
  private async updateBadgeCount(): Promise<void> {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('is_read', false);

      await Notifications.setBadgeCountAsync(count || 0);
    } catch (error) {
      console.error('Failed to update badge count:', error);
    }
  }

  /**
   * Handle notification tap
   */
  private handleNotificationTap(data: any): void {
    console.log('Notification tapped:', data);
    // Navigate to appropriate screen based on action_url or data
    // This would integrate with your navigation system
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      await this.updateBadgeCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(userId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      await AsyncStorage.removeItem('local_notifications');
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  /**
   * Cleanup subscriptions
   */
  cleanup(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}

// Export singleton instance
export const notificationService = RealTimeNotificationService.getInstance();