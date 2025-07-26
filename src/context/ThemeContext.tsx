import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark' | 'auto';

interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  tabBar: string;
  tabBarBorder: string;
  icon: string;
  iconActive: string;
}

const lightTheme: ThemeColors = {
  primary: '#2563eb',
  secondary: '#10b981',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',
  icon: '#64748b',
  iconActive: '#2563eb',
};

const darkTheme: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#06d6a0',
  success: '#4ade80',
  warning: '#fbbf24',
  danger: '#f87171',
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#475569',
  shadow: 'rgba(0, 0, 0, 0.3)',
  tabBar: '#1e293b',
  tabBarBorder: '#475569',
  icon: '#94a3b8',
  iconActive: '#3b82f6',
};

interface ThemeContextType {
  colorScheme: ColorScheme;
  theme: ThemeColors;
  isDark: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('auto');

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
    const currentEffectiveScheme = getEffectiveScheme();
    setColorScheme(currentEffectiveScheme === 'dark' ? 'light' : 'dark');
  };

  const getEffectiveScheme = (): 'light' | 'dark' => {
    if (colorScheme === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return colorScheme as 'light' | 'dark';
  };

  const effectiveScheme = getEffectiveScheme();
  const theme = effectiveScheme === 'dark' ? darkTheme : lightTheme;
  const isDark = effectiveScheme === 'dark';

  const value: ThemeContextType = {
    colorScheme,
    theme,
    isDark,
    setColorScheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { darkTheme, lightTheme };
export type { ColorScheme, ThemeColors };

