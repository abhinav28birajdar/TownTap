// =====================================================
// ENHANCED TOWNTAP - COMPREHENSIVE THEME SYSTEM
// Unified design language with AI-powered customization
// =====================================================

import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base spacing system (8pt grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Typography system
export const typography = {
  // Font families
  fonts: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
    light: Platform.select({
      ios: 'System',
      android: 'Roboto-Light',
      default: 'System',
    }),
  },
  
  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    h4: 28,
    h3: 32,
    h2: 36,
    h1: 40,
    display: 48,
  },
  
  // Line heights
  lineHeights: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 36,
    h4: 40,
    h3: 44,
    h2: 48,
    h1: 52,
    display: 56,
  },
  
  // Font weights
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

// Color palette
const colors = {
  // Primary brand colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main primary
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Secondary colors
  secondary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Main secondary
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  // Accent colors
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main accent
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  
  // Neutral grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Light theme
export const lightTheme = {
  name: 'light',
  colors: {
    // Main brand colors
    primary: colors.primary[500],
    primaryLight: colors.primary[100],
    primaryDark: colors.primary[700],
    secondary: colors.secondary[500],
    secondaryLight: colors.secondary[100],
    accent: colors.accent[500],
    accentLight: colors.accent[100],
    
    // Background colors
    background: colors.white,
    backgroundSecondary: colors.gray[50],
    surface: colors.white,
    surfaceSecondary: colors.gray[50],
    
    // Text colors
    text: colors.gray[900],
    textSecondary: colors.gray[600],
    textTertiary: colors.gray[400],
    textInverse: colors.white,
    
    // Border colors
    border: colors.gray[200],
    borderLight: colors.gray[100],
    borderDark: colors.gray[300],
    
    // Status colors
    success: colors.success[500],
    successLight: colors.success[100],
    warning: colors.warning[500],
    warningLight: colors.warning[100],
    error: colors.error[500],
    errorLight: colors.error[100],
    info: colors.info[500],
    infoLight: colors.info[100],
    
    // Special colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Component specific colors
    card: colors.white,
    input: colors.gray[50],
    inputBorder: colors.gray[300],
    placeholder: colors.gray[400],
    disabled: colors.gray[300],
    disabledText: colors.gray[400],
    
    // Tab bar colors
    tabBarActive: colors.primary[500],
    tabBarInactive: colors.gray[400],
    tabBarBackground: colors.white,
    
    // Header colors
    headerBackground: colors.white,
    headerText: colors.gray[900],
    
    // AI related colors
    aiPrimary: '#7C3AED',
    aiSecondary: '#A78BFA',
    aiBackground: '#F3F4F6',
  },
  spacing,
  typography,
  
  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 50,
    circle: 999,
  },
  
  // Shadows
  shadows: {
    xs: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 1,
    },
    sm: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
  },
  
  // Opacity levels
  opacity: {
    disabled: 0.6,
    pressed: 0.7,
    overlay: 0.8,
    transparent: 0.0,
  },
  
  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
  },
  
  // Layout dimensions
  layout: {
    screenWidth,
    screenHeight,
    headerHeight: Platform.select({ ios: 44, android: 56, default: 56 }),
    tabBarHeight: Platform.select({ ios: 83, android: 56, default: 56 }),
    safeAreaTop: Platform.select({ ios: 44, android: 0, default: 0 }),
    safeAreaBottom: Platform.select({ ios: 34, android: 0, default: 0 }),
  },
};

// Dark theme
export const darkTheme = {
  ...lightTheme,
  name: 'dark',
  colors: {
    // Main brand colors (slightly adjusted for dark mode)
    primary: colors.primary[400],
    primaryLight: colors.primary[800],
    primaryDark: colors.primary[300],
    secondary: colors.secondary[400],
    secondaryLight: colors.secondary[800],
    accent: colors.accent[400],
    accentLight: colors.accent[800],
    
    // Background colors
    background: colors.gray[900],
    backgroundSecondary: colors.gray[800],
    surface: colors.gray[800],
    surfaceSecondary: colors.gray[700],
    
    // Text colors
    text: colors.gray[100],
    textSecondary: colors.gray[300],
    textTertiary: colors.gray[500],
    textInverse: colors.gray[900],
    
    // Border colors
    border: colors.gray[700],
    borderLight: colors.gray[800],
    borderDark: colors.gray[600],
    
    // Status colors
    success: colors.success[400],
    successLight: colors.success[900],
    warning: colors.warning[400],
    warningLight: colors.warning[900],
    error: colors.error[400],
    errorLight: colors.error[900],
    info: colors.info[400],
    infoLight: colors.info[900],
    
    // Special colors
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    // Component specific colors
    card: colors.gray[800],
    input: colors.gray[700],
    inputBorder: colors.gray[600],
    placeholder: colors.gray[500],
    disabled: colors.gray[600],
    disabledText: colors.gray[500],
    
    // Tab bar colors
    tabBarActive: colors.primary[400],
    tabBarInactive: colors.gray[500],
    tabBarBackground: colors.gray[900],
    
    // Header colors
    headerBackground: colors.gray[900],
    headerText: colors.gray[100],
    
    // AI related colors
    aiPrimary: '#8B5CF6',
    aiSecondary: '#A78BFA',
    aiBackground: colors.gray[800],
  },
};

// Theme type
export type Theme = typeof lightTheme;

// Default theme
export const defaultTheme = lightTheme;

// Theme variants for business categories
export const categoryThemes = {
  restaurant: {
    primary: '#EF4444', // Red
    accent: '#F97316',  // Orange
  },
  grocery: {
    primary: '#22C55E', // Green
    accent: '#84CC16',  // Lime
  },
  healthcare: {
    primary: '#3B82F6', // Blue
    accent: '#06B6D4',  // Cyan
  },
  electronics: {
    primary: '#8B5CF6', // Purple
    accent: '#A855F7',  // Violet
  },
  fashion: {
    primary: '#EC4899', // Pink
    accent: '#F472B6',  // Rose
  },
  beauty: {
    primary: '#A855F7', // Violet
    accent: '#EC4899',  // Pink
  },
  services: {
    primary: '#F59E0B', // Amber
    accent: '#EAB308',  // Yellow
  },
  education: {
    primary: '#3B82F6', // Blue
    accent: '#1D4ED8',  // Blue dark
  },
  automotive: {
    primary: '#374151', // Gray
    accent: '#6B7280',  // Gray light
  },
  professional: {
    primary: '#1F2937', // Gray dark
    accent: '#4B5563',  // Gray medium
  },
};

// Utility functions for theme
export const getThemeColor = (theme: Theme, colorPath: string, fallback?: string) => {
  const pathArray = colorPath.split('.');
  let value: any = theme.colors;
  
  for (const key of pathArray) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Theme color not found: ${colorPath}`);
      return fallback || theme.colors.primary;
    }
  }
  
  return value;
};

export const rgba = (color: string, alpha: number) => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  // If it's already an rgba color, replace the alpha
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/g, `${alpha})`);
  }
  
  return color;
};

export const lighten = (color: string, amount: number) => {
  // Simple lightening by mixing with white
  return rgba(color, 1 - amount);
};

export const darken = (color: string, amount: number) => {
  // Simple darkening by reducing opacity
  return rgba(color, amount);
};

// Responsive design helpers
export const responsive = {
  isSmallScreen: screenWidth < 375,
  isMediumScreen: screenWidth >= 375 && screenWidth < 768,
  isLargeScreen: screenWidth >= 768,
  isTablet: screenWidth >= 768,
  
  // Get responsive value
  scale: (size: number) => {
    const baseWidth = 375; // iPhone X width as base
    return (size * screenWidth) / baseWidth;
  },
  
  // Font scaling
  fontScale: (size: number) => {
    const scale = screenWidth / 375;
    const newSize = size * scale;
    
    // Limit scaling to prevent too small or too large fonts
    if (newSize < 10) return 10;
    if (newSize > 30) return 30;
    
    return Math.round(newSize);
  },
};

// Common component styles
export const commonStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  safeContainer: {
    flex: 1,
    paddingTop: lightTheme.layout.safeAreaTop,
    paddingBottom: lightTheme.layout.safeAreaBottom,
  },
  
  // Layout styles
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  column: {
    flexDirection: 'column' as const,
  },
  
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  spaceBetween: {
    justifyContent: 'space-between' as const,
  },
  
  spaceAround: {
    justifyContent: 'space-around' as const,
  },
  
  // Text styles
  textCenter: {
    textAlign: 'center' as const,
  },
  
  textLeft: {
    textAlign: 'left' as const,
  },
  
  textRight: {
    textAlign: 'right' as const,
  },
  
  // Margin and padding utilities
  p0: { padding: 0 },
  p1: { padding: spacing.xs },
  p2: { padding: spacing.sm },
  p3: { padding: spacing.md },
  p4: { padding: spacing.lg },
  p5: { padding: spacing.xl },
  
  m0: { margin: 0 },
  m1: { margin: spacing.xs },
  m2: { margin: spacing.sm },
  m3: { margin: spacing.md },
  m4: { margin: spacing.lg },
  m5: { margin: spacing.xl },
  
  // Positioning
  absolute: {
    position: 'absolute' as const,
  },
  
  relative: {
    position: 'relative' as const,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  fullHeight: {
    height: '100%',
  },
  
  // Border utilities
  borderRadius: lightTheme.borderRadius.md,
  roundedFull: { borderRadius: 999 },
  
  // Opacity utilities
  opacity50: { opacity: 0.5 },
  opacity75: { opacity: 0.75 },
  
  // Common animations
  fadeIn: {
    opacity: 1,
  },
  
  fadeOut: {
    opacity: 0,
  },
};

export default lightTheme;
