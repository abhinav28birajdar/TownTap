import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './en';
import { hi } from './hi';

// Language detection
const getDeviceLanguage = () => {
  const locale = Localization.getLocales()[0];
  const languageCode = locale.languageCode;
  
  // Support only English and Hindi for now
  return ['en', 'hi'].includes(languageCode || '') ? (languageCode || 'en') : 'en';
};

// Language persistence
const languageDetector: any = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // Try to get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        // Fallback to device language
        const deviceLanguage = getDeviceLanguage();
        callback(deviceLanguage || 'en');
      }
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('en'); // Fallback to English
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  },
};

// Initialize i18next
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    // Resources
    resources: {
      en: {
        translation: en,
      },
      hi: {
        translation: hi,
      },
    },

    // Fallback language
    fallbackLng: 'en',

    // Debug mode (set to false in production)
    debug: __DEV__,

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React options
    react: {
      useSuspense: false, // Important for React Native
    },

    // Default namespace
    defaultNS: 'translation',

    // Detect RTL languages (Hindi is LTR, but useful for future)
    initImmediate: false,
  });

// Helper functions
export const i18nHelpers = {
  // Change language
  changeLanguage: async (language: 'en' | 'hi') => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  },

  // Get current language
  getCurrentLanguage: () => i18n.language,

  // Check if current language is RTL
  isRTL: () => i18n.dir() === 'rtl',

  // Get supported languages
  getSupportedLanguages: () => ['en', 'hi'],

  // Get language name
  getLanguageName: (code: 'en' | 'hi') => {
    const names = {
      en: 'English',
      hi: 'हिंदी',
    };
    return names[code] || 'Unknown';
  },

  // Format number with locale
  formatNumber: (number: number, language?: 'en' | 'hi') => {
    const locale = language || i18n.language;
    const localeMap = {
      en: 'en-IN', // Indian English for currency
      hi: 'hi-IN', // Hindi (India)
    };
    return new Intl.NumberFormat(localeMap[locale as keyof typeof localeMap]).format(number);
  },

  // Format currency
  formatCurrency: (amount: number, language?: 'en' | 'hi') => {
    const locale = language || i18n.language;
    const localeMap = {
      en: 'en-IN',
      hi: 'hi-IN',
    };
    return new Intl.NumberFormat(localeMap[locale as keyof typeof localeMap], {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  },

  // Format date
  formatDate: (date: Date | string, language?: 'en' | 'hi') => {
    const locale = language || i18n.language;
    const localeMap = {
      en: 'en-IN',
      hi: 'hi-IN',
    };
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(localeMap[locale as keyof typeof localeMap], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  },

  // Format time
  formatTime: (date: Date | string, language?: 'en' | 'hi') => {
    const locale = language || i18n.language;
    const localeMap = {
      en: 'en-IN',
      hi: 'hi-IN',
    };
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(localeMap[locale as keyof typeof localeMap], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  },
};

export default i18n;
