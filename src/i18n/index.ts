import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  hi: { translation: hi },
};

// Get device locale safely
const deviceLocale = getLocales()[0]?.languageCode || 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: deviceLocale,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper function to get current language
export const getCurrentLanguage = () => i18n.language;

// Helper function to change language
export const changeLanguage = (lang: string) => i18n.changeLanguage(lang);

// Available languages
export const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'hi', name: 'हिंदी' },
];