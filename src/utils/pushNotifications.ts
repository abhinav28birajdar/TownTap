// FILE: src/utils/pushNotifications.ts
// PURPOSE: Centralizes all client-side push notification logic for Firebase Cloud Messaging

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Firebase is optional - only import if available
let messaging: any = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (error) {
  console.log('Firebase messaging not available:', error);
}

// Configuration for Foreground Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests user permission for push notifications and registers the device token.
 * This should be called once after a user successfully logs in.
 */
export const requestUserPermissionAndGetToken = async (userId: string): Promise<void> => {
  if (!userId) {
    console.error('Cannot register for push notifications without a user ID.');
    return;
  }

  if (!messaging) {
    console.log('Firebase messaging not available, skipping FCM registration');
    return;
  }

  try {
    let hasPermission: boolean;

    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      hasPermission =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } else {
      // For Android 13+, POST_NOTIFICATIONS permission is needed
      const { status } = await Notifications.requestPermissionsAsync();
      hasPermission = status === 'granted';
    }

    if (hasPermission) {
      console.log('Push notification permission granted.');
      await getAndRegisterFcmToken(userId);
    } else {
      console.log('Push notification permission denied.');
      // Optionally, show a gentle prompt explaining why notifications are useful
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

/**
 * Retrieves the FCM token from the device and saves it to the user's profile in Supabase.
 */
export const getAndRegisterFcmToken = async (userId: string): Promise<void> => {
  try {
    // Check if a token already exists to avoid unnecessary updates
    const existingToken = await messaging().getToken();
    if (!existingToken) {
      console.log("Could not get FCM token.");
      return;
    }

    console.log('Retrieved FCM Token:', existingToken);

    // Call a Supabase Edge Function to securely save the token
    const { error } = await supabase.functions.invoke('register_fcm_token', {
      body: JSON.stringify({ fcmToken: existingToken }),
    });

    if (error) {
      throw error;
    }

    console.log(`FCM token for user ${userId} has been successfully registered/updated.`);
  } catch (error) {
    console.error('Failed to get or register FCM token:', error);
  }
};

/**
 * Sets up listeners for incoming push notifications.
 * This should be initialized once, high up in your app component tree.
 */
export const setupNotificationListeners = () => {
  if (!messaging) {
    console.log('Firebase messaging not available, skipping notification listeners setup');
    return () => {}; // Return empty cleanup function
  }

  // Listener for when a notification is received while the app is in the foreground
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
    
    // Show custom in-app notification if needed
    if (remoteMessage.notification) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification.title || 'New notification',
          body: remoteMessage.notification.body || '',
          data: remoteMessage.data,
        },
        trigger: null, // Show immediately
      });
    }
  });

  // Listener for when a user taps on a notification and the app opens from background/quit state
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification caused app to open from background state:', remoteMessage.notification);
    if (remoteMessage.data) {
      handleNotificationNavigation(remoteMessage.data);
    }
  });

  // Check if the app was opened from a quit state by a notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage.notification);
        if (remoteMessage.data) {
          handleNotificationNavigation(remoteMessage.data);
        }
      }
    });

  return () => {
    unsubscribeForeground();
  };
};

/**
 * Handles navigation within the app based on the data payload of a push notification.
 */
const handleNotificationNavigation = (data: { [key: string]: string | object }) => {
  console.log('Handling navigation for notification data:', data);
  
  // Import navigation reference dynamically to avoid circular dependency
  try {
    const { navigationRef } = require('../navigation/index');

    if (navigationRef?.isReady()) {
      if (data.screen === 'OrderTracking' && data.orderId) {
        navigationRef.navigate('CustomerApp', {
          screen: 'OrderTracking',
          params: { orderId: data.orderId },
        });
      } else if (data.screen === 'Chat' && data.threadId) {
        navigationRef.navigate('CustomerApp', {
          screen: 'Chat',
          params: { threadId: data.threadId },
        });
      } else if (data.screen === 'BusinessOrders' && data.orderId) {
        navigationRef.navigate('BusinessApp', {
          screen: 'Orders',
          params: { orderId: data.orderId },
        });
      } else if (data.screen === 'Promotions') {
        navigationRef.navigate('CustomerApp', {
          screen: 'Promotions',
        });
      }
    }
  } catch (error) {
    console.error('Navigation error from notification:', error);
  }
};

/**
 * Clear all notifications for the app
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    console.log('All notifications cleared');
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

/**
 * Get notification permissions status
 */
export const getNotificationPermissionStatus = async (): Promise<string> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error getting notification permission status:', error);
    return 'unknown';
  }
};