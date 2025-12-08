import { ColorScheme, ColorsEnhanced, ThemeColors } from '@/constants/colors-enhanced';
import { ThemeMode, useThemeMode } from '@/hooks/use-theme-mode';
import React, { createContext, useContext } from 'react';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeMode();

  return (
    <ThemeContext.Provider value={theme}>
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

// Convenience hook for quick color access
export function useColors() {
  const { colors } = useThemeContext();
  return colors;
}
