import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from './en';
import hi from './hi';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // Get saved language preference
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      
      // Fallback to device locale
      const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
      
      // Check if we support the device language
      const supportedLanguages = ['en', 'hi'];
      const selectedLanguage = supportedLanguages.includes(deviceLocale) 
        ? deviceLocale 
        : 'en'; // Default to English
      
      callback(selectedLanguage);
    } catch (error) {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('language', language);
    } catch (error) {
      console.error('Failed to cache language:', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR as any)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: __DEV__,
    
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper function to change language
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem('language', language);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

// Helper function to get current language
export const getCurrentLanguage = () => i18n.language;

// Helper function to get available languages
export const getAvailableLanguages = () => ['en', 'hi'];