import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { ColorsEnhanced, ColorScheme, ThemeColors } from '@/constants/colors-enhanced';

const THEME_STORAGE_KEY = '@towntap:theme_mode';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
}

export function useThemeMode() {
  const systemColorScheme = Appearance.getColorScheme() || 'light';
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      if (themeMode === 'system') {
        setColorScheme(newColorScheme || 'light');
      }
    });

    return () => subscription.remove();
  }, [themeMode]);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        const mode = saved as ThemeMode;
        setThemeModeState(mode);
        
        if (mode === 'system') {
          setColorScheme(systemColorScheme);
        } else {
          setColorScheme(mode);
        }
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
      
      if (mode === 'system') {
        const current = Appearance.getColorScheme() || 'light';
        setColorScheme(current);
      } else {
        setColorScheme(mode);
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(next);
  }, [themeMode, setThemeMode]);

  const colors = ColorsEnhanced[colorScheme];
  const isDark = colorScheme === 'dark';

  return {
    themeMode,
    colorScheme,
    colors,
    isDark,
    setThemeMode,
    toggleTheme,
  };
}

export type { ThemeMode, ThemeConfig };
