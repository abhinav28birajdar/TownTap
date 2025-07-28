import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, Theme } from '../theme/modernTheme';

type ColorScheme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  isDark: boolean;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('auto');
  
  const isDark = colorScheme === 'auto' ? systemColorScheme === 'dark' : colorScheme === 'dark';
  const theme = getTheme(isDark);

  useEffect(() => {
    loadColorScheme();
  }, []);

  const loadColorScheme = async () => {
    try {
      const savedScheme = await AsyncStorage.getItem('colorScheme');
      if (savedScheme && ['light', 'dark', 'auto'].includes(savedScheme)) {
        setColorSchemeState(savedScheme as ColorScheme);
      }
    } catch (error) {
      console.error('Error loading color scheme:', error);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      setColorSchemeState(scheme);
      await AsyncStorage.setItem('colorScheme', scheme);
    } catch (error) {
      console.error('Error saving color scheme:', error);
    }
  };

  const toggleTheme = () => {
    const newScheme = isDark ? 'light' : 'dark';
    setColorScheme(newScheme);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        colorScheme, 
        isDark, 
        toggleTheme, 
        setColorScheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
