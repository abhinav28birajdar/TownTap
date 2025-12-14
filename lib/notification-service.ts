import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BookingRow, BusinessRow, MessageRow, ReviewRow } from './realtime-service';

// Check if running in Expo Go (push notifications not supported in Expo Go SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification behavior (only if not in Expo Go)
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface NotificationData {
  type: 'booking' | 'message' | 'review' | 'business_update' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  categoryId?: string;
  sound?: 'default' | 'custom';
  vibration?: boolean;
  badge?: number;
}

export interface NotificationPreferences {
  bookings: boolean;
  messages: boolean;
  reviews: boolean;
  businessUpdates: boolean;
  marketing: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string; // HH:mm format
}

class NotificationService {
  private notificationListener: any;
  private responseListener: any;
  private pushToken: string | null = null;
  private preferences: NotificationPreferences = {
    bookings: true,
    messages: true,
    reviews: true,
    businessUpdates: true,
    marketing: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  };

  constructor() {
    this.initializeNotifications();
  }

  /**
   * Initialize notification system
   */
  private async initializeNotifications(): Promise<void> {
    try {
      // Skip initialization in Expo Go (push notifications not supported)
      if (isExpoGo) {
        console.log('⚠️ Push notifications are not available in Expo Go. Use a development build for full notification support.');
        return;
      }

      // Load preferences
      await this.loadPreferences();

      // Request permissions
      await this.requestPermissions();

      // Set up notification categories
      await this.setupNotificationCategories();

      // Set up listeners
      this.setupNotificationListeners();

      // Register for push notifications
      await this.registerForPushNotifications();

    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Skip in Expo Go
      if (isExpoGo) {
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Register for push notifications and get token
   */
  async registerForPushNotifications(): Promise<string | null> {
    // Early return to prevent native module errors
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    if (!projectId || projectId === 'your-project-id' || projectId.trim() === '') {
      // Silently skip - app works fine without push notifications
      return null;
    }

    try {

      // Skip push notification registration in Expo Go
      if (Platform.OS !== 'web' && !(__DEV__ && process.env.EXPO_PUBLIC_SKIP_PUSH !== 'false')) {
        console.log('📱 Push notifications require a development build - skipping in Expo Go');
        return null;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.pushToken = token;
      await AsyncStorage.setItem('pushToken', token);
      
      return token;
    } catch (error) {
      // Silently handle all push notification errors - app works without them
      // No console.error to avoid alarming users
      return null;
    }
  }

  /**
   * Set up notification categories with actions
   */
  private async setupNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync('booking', [
        {
          identifier: 'accept',
          buttonTitle: 'Accept',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'decline',
          buttonTitle: 'Decline',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'view',
          buttonTitle: 'View Details',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('message', [
        {
          identifier: 'reply',
          buttonTitle: 'Quick Reply',
          options: {
            opensAppToForeground: false,
          },
          textInput: {
            submitButtonTitle: 'Send',
            placeholder: 'Type your message...',
          },
        },
        {
          identifier: 'view',
          buttonTitle: 'View Chat',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('review', [
        {
          identifier: 'view',
          buttonTitle: 'View Review',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'respond',
          buttonTitle: 'Respond',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to setup notification categories:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  private setupNotificationListeners(): void {
    // Listener for when notification is received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification received
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    // Update badge count
    this.updateBadgeCount(1);
    
    // You can add custom logic here for when notifications are received
    // For example, updating local state or triggering data refresh
  }

  /**
   * Handle notification response (when user taps notification)
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { notification, actionIdentifier } = response;
    const notificationData = notification.request.content.data;

    // Handle different action identifiers
    switch (actionIdentifier) {
      case 'accept':
        this.handleBookingAccept(notificationData);
        break;
      case 'decline':
        this.handleBookingDecline(notificationData);
        break;
      case 'reply':
        this.handleQuickReply(response);
        break;
      case 'view':
        this.handleViewAction(notificationData);
        break;
      default:
        // Default action (tap notification)
        this.handleDefaultAction(notificationData);
        break;
    }
  }

  /**
   * Show local notification
   */
  async showNotification(notificationData: NotificationData): Promise<void> {
    try {
      // Check if notifications are enabled for this type
      if (!this.shouldShowNotification(notificationData.type)) {
        return;
      }

      // Check quiet hours
      if (this.isQuietHours()) {
        return;
      }

      const content: Notifications.NotificationContentInput = {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        sound: this.preferences.soundEnabled ? (notificationData.sound || 'default') : undefined,
        badge: notificationData.badge,
        categoryIdentifier: notificationData.categoryId,
        priority: this.mapPriority(notificationData.priority || 'normal'),
      };

      await Notifications.scheduleNotificationAsync({
        content,
        trigger: null, // Show immediately
      });

    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Show booking notification
   */
  async showBookingNotification(booking: BookingRow, type: 'new' | 'updated' | 'cancelled'): Promise<void> {
    const titles = {
      new: '🎉 New Booking Request',
      updated: '📋 Booking Updated',
      cancelled: '❌ Booking Cancelled',
    };

    const bodies = {
      new: `New booking request from customer`,
      updated: `Your booking has been updated`,
      cancelled: `Booking has been cancelled`,
    };

    await this.showNotification({
      type: 'booking',
      title: titles[type],
      body: bodies[type],
      data: { bookingId: booking.id, type },
      categoryId: 'booking',
      priority: 'high',
    });
  }

  /**
   * Show message notification
   */
  async showMessageNotification(message: MessageRow, senderName: string): Promise<void> {
    await this.showNotification({
      type: 'message',
      title: `💬 ${senderName}`,
      body: message.content || 'New message received',
      data: { messageId: message.id },
      categoryId: 'message',
      priority: 'high',
    });
  }

  /**
   * Show review notification
   */
  async showReviewNotification(review: ReviewRow, customerName: string): Promise<void> {
    const rating = '⭐'.repeat(Math.floor(review.rating || 0));
    
    await this.showNotification({
      type: 'review',
      title: `${rating} New Review`,
      body: `${customerName} left a ${review.rating}-star review`,
      data: { reviewId: review.id, businessId: review.business_id },
      categoryId: 'review',
      priority: 'normal',
    });
  }

  /**
   * Show business update notification
   */
  async showBusinessUpdateNotification(business: BusinessRow, updateType: string): Promise<void> {
    const titles = {
      status_change: business.is_open ? '🟢 Business is now Open' : '🔴 Business is now Closed',
      profile_update: '📝 Business Profile Updated',
    };

    await this.showNotification({
      type: 'business_update',
      title: titles[updateType as keyof typeof titles] || '📢 Business Update',
      body: `${business.name} has been updated`,
      data: { businessId: business.id, updateType },
      priority: 'normal',
    });
  }

  /**
   * Update badge count
   */
  async updateBadgeCount(increment: number): Promise<void> {
    try {
      const currentBadge = await Notifications.getBadgeCountAsync();
      const newBadge = Math.max(0, currentBadge + increment);
      await Notifications.setBadgeCountAsync(newBadge);
    } catch (error) {
      console.error('Failed to update badge count:', error);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Failed to clear badge count:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  /**
   * Get notification preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(newPreferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      this.preferences = { ...this.preferences, ...newPreferences };
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }

  /**
   * Check if notification should be shown based on preferences
   */
  private shouldShowNotification(type: string): boolean {
    switch (type) {
      case 'booking':
        return this.preferences.bookings;
      case 'message':
        return this.preferences.messages;
      case 'review':
        return this.preferences.reviews;
      case 'business_update':
        return this.preferences.businessUpdates;
      default:
        return true;
    }
  }

  /**
   * Check if currently in quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.preferences.quietHoursEnabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { quietHoursStart, quietHoursEnd } = this.preferences;
    
    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (quietHoursStart > quietHoursEnd) {
      return currentTime >= quietHoursStart || currentTime <= quietHoursEnd;
    }
    
    // Handle same-day quiet hours (e.g., 12:00 to 14:00)
    return currentTime >= quietHoursStart && currentTime <= quietHoursEnd;
  }

  /**
   * Map priority to platform-specific value
   */
  private mapPriority(priority: string): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'low':
        return Notifications.AndroidNotificationPriority.LOW;
      case 'high':
        return Notifications.AndroidNotificationPriority.HIGH;
      default:
        return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  /**
   * Handle booking accept action
   */
  private handleBookingAccept(data: any): void {
    // Implement booking accept logic
    console.log('Booking accepted:', data);
  }

  /**
   * Handle booking decline action
   */
  private handleBookingDecline(data: any): void {
    // Implement booking decline logic
    console.log('Booking declined:', data);
  }

  /**
   * Handle quick reply action
   */
  private handleQuickReply(response: any): void {
    // Implement quick reply logic
    console.log('Quick reply:', response);
  }

  /**
   * Handle view action
   */
  private handleViewAction(data: any): void {
    // Implement view navigation logic
    console.log('View action:', data);
  }

  /**
   * Handle default notification tap
   */
  private handleDefaultAction(data: any): void {
    // Implement default navigation logic
    console.log('Default action:', data);
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();

export default notificationService;