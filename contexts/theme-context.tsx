import { ColorScheme, ThemeColors } from '@/constants/colors';
import { Theme as ThemeMode, useTheme } from '@/hooks/use-theme';
import React, { createContext, useContext } from 'react';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, colorScheme, colors, setTheme, toggleTheme, isDark } = useTheme();

  const value: ThemeContextType = {
    themeMode: theme,
    colorScheme,
    colors,
    isDark,
    setThemeMode: setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}

// Alias for convenience - components can use useTheme from context
export { useThemeContext as useTheme };

// Convenience hook for quick color access
export function useColors() {
  const { colors } = useThemeContext();
  return colors;
}
