import { supabase } from '../lib/supabase';
import { Notification, NotificationPreferences, NotificationType } from '../types';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationStore } from '../stores/notificationStore';

/**
 * NotificationService - Handles all notification-related operations
 * Including real-time notifications, preferences, and push notifications
 */
export class NotificationService {
  private static realtimeSubscription: any = null;
  
  /**
   * Initialize notification system for the current user
   */
  static async initialize(userId: string): Promise<void> {
    try {
      // Register for push notifications
      await NotificationService.registerForPushNotifications(userId);
      
      // Fetch notification preferences
      await NotificationService.fetchNotificationPreferences(userId);
      
      // Setup real-time listener
      await NotificationService.setupRealtimeListener(userId);
      
      // Fetch unread notifications
      await NotificationService.fetchUnreadNotifications(userId);
      
      console.log('Notification system initialized successfully');
    } catch (error) {
      console.error('Error initializing notification system:', error);
    }
  }

  /**
   * Register device for push notifications
   */
  static async registerForPushNotifications(userId: string): Promise<void> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications are not available on simulator');
        return;
      }

      // Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notifications');
        return;
      }

      // Get expo push token
      const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Save token to database for the user
      await supabase
        .from('profiles')
        .update({
          fcm_token: expoPushToken,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  /**
   * Setup real-time listener for notifications
   */
  static async setupRealtimeListener(userId: string): Promise<void> {
    try {
      // Clean up existing subscription if any
      if (NotificationService.realtimeSubscription) {
        await NotificationService.realtimeSubscription.unsubscribe();
        NotificationService.realtimeSubscription = null;
      }

      // Set up new subscription
      NotificationService.realtimeSubscription = supabase
        .channel(`user-notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`,
          },
          (payload) => {
            const notification = payload.new as Notification;
            notificationStore.getState().addNotification(notification);
            
            // Show local notification if app is in background
            NotificationService.showLocalNotification(notification);
          }
        )
        .subscribe();

      console.log('Real-time notification listener setup complete');
    } catch (error) {
      console.error('Error setting up real-time notifications:', error);
    }
  }

  /**
   * Show a local notification
   */
  static async showLocalNotification(notification: Notification): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: { 
            action: notification.action_data,
            notificationId: notification.id,
          },
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  /**
   * Fetch user's notification preferences
   */
  static async fetchNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        await AsyncStorage.setItem('notification_preferences', JSON.stringify(data));
        return data as NotificationPreferences;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      // Update in database (upsert)
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      // Update local storage
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(preferences));
      
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  /**
   * Fetch unread notifications for a user
   */
  static async fetchUnreadNotifications(userId: string, limit = 20): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // Update store with fetched notifications
      notificationStore.getState().setNotifications(data as Notification[]);
      
      return data as Notification[];
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  /**
   * Fetch all notifications for a user
   */
  static async fetchAllNotifications(
    userId: string, 
    limit = 50, 
    offset = 0
  ): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data as Notification[];
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      return [];
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Update store
      notificationStore.getState().markAsRead(notificationId);
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Update store
      notificationStore.getState().markAllAsRead();
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Update store
      notificationStore.getState().removeNotification(notificationId);
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Send a notification to a user
   */
  static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    actionData?: any,
    referenceId?: string,
    referenceType?: string,
    imageUrl?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          recipient_id: userId,
          title,
          message,
          type,
          data: actionData || {},
          action_url: referenceId ? `/${referenceType}/${referenceId}` : undefined,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Get notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Update store
      notificationStore.getState().setUnreadCount(count || 0);
      
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Clean up notification subscriptions
   */
  static cleanup(): void {
    if (NotificationService.realtimeSubscription) {
      NotificationService.realtimeSubscription.unsubscribe();
      NotificationService.realtimeSubscription = null;
    }
  }
}