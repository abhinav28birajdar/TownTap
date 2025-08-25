import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type NotificationChannel = {
  id: string;
  name: string;
  importance: Notifications.AndroidImportance;
  description?: string;
};

type NotificationPreference = {
  enabled: boolean;
  channel: string;
  type: 'order_updates' | 'chat_messages' | 'promotions' | 'system';
};

const DEFAULT_CHANNELS: NotificationChannel[] = [
  {
    id: 'order_updates',
    name: 'Order Updates',
    importance: Notifications.AndroidImportance.HIGH,
    description: 'Get updates about your orders',
  },
  {
    id: 'chat_messages',
    name: 'Messages',
    importance: Notifications.AndroidImportance.HIGH,
    description: 'Get notified when you receive new messages',
  },
  {
    id: 'promotions',
    name: 'Promotions',
    importance: Notifications.AndroidImportance.DEFAULT,
    description: 'Stay updated with offers and promotions',
  },
  {
    id: 'system',
    name: 'System Notifications',
    importance: Notifications.AndroidImportance.LOW,
    description: 'Important system updates and information',
  },
];

export function useNotifications() {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize notifications
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Sync preferences when user changes
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const initializeNotifications = async () => {
    try {
      setIsLoading(true);

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setIsEnabled(finalStatus === 'granted');

      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted!');
      }

      // Set up notification channels for Android
      if (Platform.OS === 'android') {
        await setupNotificationChannels();
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      setToken(tokenData.data);

      // Register token with backend if user is logged in
      if (user && tokenData.data) {
        await registerDeviceToken(tokenData.data);
      }

    } catch (err: any) {
      console.error('Error initializing notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setupNotificationChannels = async () => {
    try {
      await Promise.all(
        DEFAULT_CHANNELS.map(channel =>
          Notifications.setNotificationChannelAsync(channel.id, {
            name: channel.name,
            importance: channel.importance,
            description: channel.description,
            enableVibrate: true,
            enableLights: true,
          })
        )
      );
    } catch (err) {
      console.error('Error setting up notification channels:', err);
    }
  };

  const registerDeviceToken = async (token: string) => {
    try {
      const { error } = await supabase.functions.invoke('register-fcm-token', {
        body: { token, userId: user?.id },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error registering device token:', err);
    }
  };

  const loadPreferences = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        setPreferences(data.map(pref => ({
          enabled: pref.enabled,
          channel: pref.channel_id,
          type: pref.notification_type,
        })));
      } else {
        // Set default preferences
        const defaultPreferences = DEFAULT_CHANNELS.map(channel => ({
          enabled: true,
          channel: channel.id,
          type: channel.id as NotificationPreference['type'],
        }));
        setPreferences(defaultPreferences);
        await savePreferences(defaultPreferences);
      }
    } catch (err: any) {
      console.error('Error loading notification preferences:', err);
      setError(err.message);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreference[]) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(
          newPreferences.map(pref => ({
            user_id: user.id,
            channel_id: pref.channel,
            notification_type: pref.type,
            enabled: pref.enabled,
          }))
        );

      if (error) throw error;

      setPreferences(newPreferences);
    } catch (err: any) {
      console.error('Error saving notification preferences:', err);
      setError(err.message);
    }
  };

  const updatePreference = async (type: NotificationPreference['type'], enabled: boolean) => {
    try {
      const newPreferences = preferences.map(pref =>
        pref.type === type ? { ...pref, enabled } : pref
      );

      await savePreferences(newPreferences);
    } catch (err: any) {
      console.error('Error updating notification preference:', err);
      setError(err.message);
    }
  };

  const sendLocalNotification = async (
    title: string,
    body: string,
    data?: any,
    options?: Partial<Notifications.NotificationRequestInput>
  ) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...options,
        },
        trigger: null,
      });
    } catch (err: any) {
      console.error('Error sending local notification:', err);
      setError(err.message);
    }
  };

  return {
    isEnabled,
    preferences,
    token,
    isLoading,
    error,
    updatePreference,
    sendLocalNotification,
  };
}
