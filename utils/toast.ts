/**
 * Toast Notification Utility
 * Simple toast messages for user feedback
 */

import { Alert, Platform, ToastAndroid } from 'react-native';

export const Toast = {
  show(message: string, duration: 'short' | 'long' = 'short') {
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        message,
        duration === 'short' ? ToastAndroid.SHORT : ToastAndroid.LONG
      );
    } else {
      // For iOS, use Alert as fallback
      Alert.alert('', message);
    }
  },

  success(message: string) {
    this.show(`✓ ${message}`);
  },

  error(message: string) {
    this.show(`✗ ${message}`, 'long');
  },

  info(message: string) {
    this.show(`ℹ ${message}`);
  },

  warning(message: string) {
    this.show(`⚠ ${message}`);
  },
};
