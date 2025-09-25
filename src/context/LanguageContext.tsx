import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, availableLanguages } from '../i18n';

interface Language {
  code: string;
  name: string;
}

interface LanguageContextType {
  currentLanguage: string;
  availableLanguages: Language[];
  changeLanguage: (languageCode: string) => Promise<void>;
  loading: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'selected_language';

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      const initialLanguage = storedLanguage || getCurrentLanguage() || 'en';
      
      await changeLanguage(initialLanguage);
      setCurrentLanguage(initialLanguage);
    } catch (error) {
      console.error('Error loading stored language:', error);
      setCurrentLanguage('en');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLanguage = async (languageCode: string) => {
    try {
      setLoading(true);
      
      // Change the language in i18n
      await changeLanguage(languageCode);
      
      // Store the selected language
      await AsyncStorage.setItem(STORAGE_KEY, languageCode);
      
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    availableLanguages,
    changeLanguage: handleChangeLanguage,
    loading,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;