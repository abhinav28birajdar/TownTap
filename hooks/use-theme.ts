import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      colorScheme: 'light',
      
      setTheme: (theme: Theme) => {
        const systemColorScheme = Appearance.getColorScheme();
        const resolvedColorScheme = 
          theme === 'system' 
            ? systemColorScheme || 'light'
            : theme;
            
        set({ 
          theme, 
          colorScheme: resolvedColorScheme as ColorScheme 
        });
      },
      
      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      
      initialize: () => {
        const { theme } = get();
        const systemColorScheme = Appearance.getColorScheme();
        const resolvedColorScheme = 
          theme === 'system' 
            ? systemColorScheme || 'light'
            : theme;
            
        set({ colorScheme: resolvedColorScheme as ColorScheme });
        
        // Listen to system theme changes
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
          const { theme } = get();
          if (theme === 'system') {
            set({ colorScheme: (colorScheme || 'light') as ColorScheme });
          }
        });
        
        return subscription;
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// Hook for easy theme access
export const useTheme = () => {
  const { theme, colorScheme, setTheme, toggleTheme } = useThemeStore();
  const Colors = require('../constants/colors').Colors;
  
  return {
    theme,
    colorScheme,
    colors: Colors[colorScheme],
    setTheme,
    toggleTheme,
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
  };
};

// Theme utilities
export const getThemeColors = (colorScheme: ColorScheme) => {
  const Colors = require('../constants/colors').Colors;
  return Colors[colorScheme];
};

export const getThemeValue = <T>(
  lightValue: T, 
  darkValue: T, 
  colorScheme: ColorScheme
): T => {
  return colorScheme === 'dark' ? darkValue : lightValue;
};