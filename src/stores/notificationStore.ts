// FILE: src/stores/notificationStore.ts
// PURPOSE: Zustand store for notification management with real-time updates
// RESPONSIBILITIES: Notification display, read/unread state, filtering, persistence
// UI/UX MANDATES: Real-time updates, badge counts, notification history, auto-cleanup

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationType } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isInitialized: boolean;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getUnreadNotifications: () => Notification[];
  setUnreadCount: (count: number) => void;
  setInitialized: (initialized: boolean) => void;
}

export const notificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isInitialized: false,

      setNotifications: (notifications) => {
        set({
          notifications,
          unreadCount: notifications.filter(n => !n.is_read).length,
        });
      },

      addNotification: (notification) => {
        const { notifications } = get();
        
        // Check if notification already exists to avoid duplicates
        const exists = notifications.some(n => n.id === notification.id);
        if (exists) return;
        
        const newNotifications = [notification, ...notifications];
        
        // Keep only last 100 notifications
        const trimmedNotifications = newNotifications.slice(0, 100);
        const unreadCount = trimmedNotifications.filter(n => !n.is_read).length;

        set({
          notifications: trimmedNotifications,
          unreadCount,
        });
      },

      markAsRead: (notificationId) => {
        const { notifications } = get();
        const newNotifications = notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        );
        
        const unreadCount = newNotifications.filter(n => !n.is_read).length;

        set({
          notifications: newNotifications,
          unreadCount,
        });
      },

      markAllAsRead: () => {
        const { notifications } = get();
        const newNotifications = notifications.map(notification => ({
          ...notification,
          is_read: true,
        }));

        set({
          notifications: newNotifications,
          unreadCount: 0,
        });
      },

      removeNotification: (notificationId) => {
        const { notifications } = get();
        const newNotifications = notifications.filter(n => n.id !== notificationId);
        const unreadCount = newNotifications.filter(n => !n.is_read).length;

        set({
          notifications: newNotifications,
          unreadCount,
        });
      },

      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      getNotificationsByType: (type) => {
        const { notifications } = get();
        return notifications.filter(notification => notification.type === type);
      },

      getUnreadNotifications: () => {
        const { notifications } = get();
        return notifications.filter(notification => !notification.is_read);
      },
      
      setUnreadCount: (count) => {
        set({ unreadCount: count });
      },
      
      setInitialized: (initialized) => {
        set({ isInitialized: initialized });
      }
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        isInitialized: state.isInitialized,
      }),
    }
  )
);