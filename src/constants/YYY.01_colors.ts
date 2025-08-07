// =====================================================
// ENHANCED TOWNTAP - UNIFIED COLOR PALETTE
// Consistent theming across Customer & Business apps
// =====================================================

export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE', 
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main Primary
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary Colors
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B', // Main Secondary
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Success Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Main Success
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Warning Colors
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main Warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error Colors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main Error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Info Colors
  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9', // Main Info
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // Neutral Colors (Grays)
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Business Category Colors
  category: {
    food: '#FF6B6B',
    grocery: '#4ECDC4',
    pharmacy: '#45B7D1',
    electronics: '#96CEB4',
    fashion: '#FFEAA7',
    beauty: '#DDA0DD',
    home: '#98D8C8',
    automotive: '#F7DC6F',
    education: '#BB8FCE',
    health: '#85C1E9',
    services: '#F8C471',
    entertainment: '#F1948A',
  },

  // Special Purpose Colors
  special: {
    online: '#22C55E',
    offline: '#6B7280',
    delivering: '#3B82F6',
    preparing: '#F59E0B',
    completed: '#10B981',
    cancelled: '#EF4444',
    pending: '#8B5CF6',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    dark: '#1E293B',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text Colors
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
    disabled: '#CBD5E1',
  },

  // Border Colors
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
    focus: '#3B82F6',
    error: '#EF4444',
  },

  // Shadow Colors
  shadow: {
    sm: 'rgba(0, 0, 0, 0.05)',
    md: 'rgba(0, 0, 0, 0.1)',
    lg: 'rgba(0, 0, 0, 0.15)',
    xl: 'rgba(0, 0, 0, 0.2)',
  },
} as const;

// Theme Mode Colors
export const LightTheme = {
  background: Colors.background.primary,
  surface: Colors.background.secondary,
  card: Colors.background.primary,
  text: Colors.text.primary,
  textSecondary: Colors.text.secondary,
  primary: Colors.primary[500],
  secondary: Colors.secondary[500],
  success: Colors.success[500],
  warning: Colors.warning[500],
  error: Colors.error[500],
  info: Colors.info[500],
  border: Colors.border.light,
  shadow: Colors.shadow.md,
} as const;

export const DarkTheme = {
  background: Colors.secondary[900],
  surface: Colors.secondary[800],
  card: Colors.secondary[800],
  text: Colors.text.inverse,
  textSecondary: Colors.secondary[300],
  primary: Colors.primary[400],
  secondary: Colors.secondary[400],
  success: Colors.success[400],
  warning: Colors.warning[400],
  error: Colors.error[400],
  info: Colors.info[400],
  border: Colors.secondary[700],
  shadow: 'rgba(0, 0, 0, 0.3)',
} as const;

export type ThemeColors = typeof LightTheme;
export type ColorKey = keyof typeof Colors;
