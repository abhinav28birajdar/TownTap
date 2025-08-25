// FILE: src/context/LanguageContext.tsx
// PURPOSE: Provides i18n language context with dynamic translation switching

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Translation, translations } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: Translation;
  isRTL: boolean;
  availableLanguages: { code: Language; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

const LANGUAGE_STORAGE_KEY = 'user_language';
const DEFAULT_LANGUAGE: Language = 'en';

// RTL languages
const RTL_LANGUAGES: Language[] = ['hi']; // Add more RTL languages as needed

// Available languages with metadata
const AVAILABLE_LANGUAGES = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिन्दी' },
  // Add more languages as translations are added
];

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved language on app start
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && savedLanguage in translations) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Error loading saved language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLanguage();
  }, []);

  const setLanguage = async (newLanguage: Language): Promise<void> => {
    try {
      if (newLanguage in translations) {
        setLanguageState(newLanguage);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      } else {
        console.warn(`Language '${newLanguage}' not supported`);
      }
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const isRTL = RTL_LANGUAGES.includes(language);
  const t = translations[language];

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
    availableLanguages: AVAILABLE_LANGUAGES,
  };

  // Don't render children until language is loaded
  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
