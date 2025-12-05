/**
 * Design tokens for TownTap app
 * Includes comprehensive color palette for light and dark modes
 */

export const Colors = {
  light: {
    // Primary brand colors
    primary: '#2563EB', // Blue 600
    primaryLight: '#3B82F6', // Blue 500
    primaryDark: '#1D4ED8', // Blue 700
    primaryForeground: '#FFFFFF',
    
    // Secondary colors
    secondary: '#7C3AED', // Violet 600
    secondaryLight: '#8B5CF6', // Violet 500
    secondaryDark: '#6D28D9', // Violet 700
    secondaryForeground: '#FFFFFF',
    
    // Accent colors
    accent: '#06B6D4', // Cyan 500
    accentLight: '#22D3EE', // Cyan 400
    accentDark: '#0891B2', // Cyan 600
    accentForeground: '#FFFFFF',
    
    // Success, Warning, Error
    success: '#10B981', // Emerald 500
    successLight: '#34D399', // Emerald 400
    successDark: '#059669', // Emerald 600
    successForeground: '#FFFFFF',
    
    warning: '#F59E0B', // Amber 500
    warningLight: '#FBBF24', // Amber 400
    warningDark: '#D97706', // Amber 600
    warningForeground: '#FFFFFF',
    
    error: '#EF4444', // Red 500
    errorLight: '#F87171', // Red 400
    errorDark: '#DC2626', // Red 600
    errorForeground: '#FFFFFF',
    
    // Neutral colors
    background: '#FFFFFF',
    foreground: '#0F172A', // Slate 900
    
    card: '#FFFFFF',
    cardForeground: '#0F172A',
    
    popover: '#FFFFFF',
    popoverForeground: '#0F172A',
    
    // Grays
    muted: '#F8FAFC', // Slate 50
    mutedForeground: '#64748B', // Slate 500
    
    border: '#E2E8F0', // Slate 200
    input: '#F1F5F9', // Slate 100
    ring: '#2563EB',
    
    // Text hierarchy
    text: '#0F172A', // Slate 900
    textSecondary: '#475569', // Slate 600
    textTertiary: '#94A3B8', // Slate 400
    textDisabled: '#CBD5E1', // Slate 300
    
    // Surface colors
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFC', // Slate 50
    surfaceTertiary: '#F1F5F9', // Slate 100
    
    // Overlay
    overlay: 'rgba(15, 23, 42, 0.4)',
    
    // Tab colors
    tabIconDefault: '#94A3B8', // Slate 400
    tabIconSelected: '#2563EB',
  },
  dark: {
    // Primary brand colors
    primary: '#3B82F6', // Blue 500
    primaryLight: '#60A5FA', // Blue 400
    primaryDark: '#2563EB', // Blue 600
    primaryForeground: '#FFFFFF',
    
    // Secondary colors
    secondary: '#8B5CF6', // Violet 500
    secondaryLight: '#A78BFA', // Violet 400
    secondaryDark: '#7C3AED', // Violet 600
    secondaryForeground: '#FFFFFF',
    
    // Accent colors
    accent: '#22D3EE', // Cyan 400
    accentLight: '#67E8F9', // Cyan 300
    accentDark: '#06B6D4', // Cyan 500
    accentForeground: '#0F172A',
    
    // Success, Warning, Error
    success: '#34D399', // Emerald 400
    successLight: '#6EE7B7', // Emerald 300
    successDark: '#10B981', // Emerald 500
    successForeground: '#0F172A',
    
    warning: '#FBBF24', // Amber 400
    warningLight: '#FCD34D', // Amber 300
    warningDark: '#F59E0B', // Amber 500
    warningForeground: '#0F172A',
    
    error: '#F87171', // Red 400
    errorLight: '#FCA5A5', // Red 300
    errorDark: '#EF4444', // Red 500
    errorForeground: '#FFFFFF',
    
    // Neutral colors
    background: '#0F172A', // Slate 900
    foreground: '#F8FAFC', // Slate 50
    
    card: '#1E293B', // Slate 800
    cardForeground: '#F8FAFC',
    
    popover: '#1E293B', // Slate 800
    popoverForeground: '#F8FAFC',
    
    // Grays
    muted: '#1E293B', // Slate 800
    mutedForeground: '#94A3B8', // Slate 400
    
    border: '#334155', // Slate 700
    input: '#334155', // Slate 700
    ring: '#3B82F6',
    
    // Text hierarchy
    text: '#F8FAFC', // Slate 50
    textSecondary: '#CBD5E1', // Slate 300
    textTertiary: '#94A3B8', // Slate 400
    textDisabled: '#64748B', // Slate 500
    
    // Surface colors
    surface: '#1E293B', // Slate 800
    surfaceSecondary: '#334155', // Slate 700
    surfaceTertiary: '#475569', // Slate 600
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',
    
    // Tab colors
    tabIconDefault: '#94A3B8', // Slate 400
    tabIconSelected: '#3B82F6',
  },
} as const;

// Semantic color mappings
export const SemanticColors = {
  // Status colors
  pending: '#F59E0B', // Amber
  accepted: '#10B981', // Emerald
  inProgress: '#3B82F6', // Blue
  completed: '#059669', // Emerald 600
  cancelled: '#EF4444', // Red
  declined: '#DC2626', // Red 600
  
  // Business categories
  restaurant: '#F59E0B', // Amber
  beauty: '#EC4899', // Pink
  fitness: '#10B981', // Emerald
  automotive: '#374151', // Gray
  home: '#6366F1', // Indigo
  health: '#EF4444', // Red
  education: '#8B5CF6', // Violet
  technology: '#06B6D4', // Cyan
  
  // Rating colors
  rating1: '#EF4444', // Red
  rating2: '#F97316', // Orange
  rating3: '#F59E0B', // Amber
  rating4: '#84CC16', // Lime
  rating5: '#22C55E', // Green
} as const;

// Gradient definitions
export const Gradients = {
  primary: ['#2563EB', '#3B82F6'],
  secondary: ['#7C3AED', '#8B5CF6'],
  accent: ['#06B6D4', '#22D3EE'],
  success: ['#059669', '#10B981'],
  warning: ['#D97706', '#F59E0B'],
  error: ['#DC2626', '#EF4444'],
  sunset: ['#F59E0B', '#F97316', '#EF4444'],
  ocean: ['#06B6D4', '#3B82F6', '#8B5CF6'],
  forest: ['#059669', '#10B981', '#22C55E'],
} as const;

// Shadow definitions
export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 8,
  },
} as const;

// Extended color palette for categories and UI elements
export const ExtendedColors = {
  // Blue palette
  blue: {
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
  // Green palette
  green: {
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
  // Orange palette
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  // Pink palette
  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
  // Purple palette
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },
  // Amber palette
  amber: {
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
} as const;

// Merge extended colors with main Colors for backward compatibility
const ColorsWithExtended = {
  ...Colors,
  ...ExtendedColors,
} as const;

// Export the merged colors
export { ColorsWithExtended as Colors };

// Category Colors
export const CategoryColors = {
  carpenter: '#F59E0B',
  plumber: '#3B82F6',
  electrician: '#EF4444',
  gardener: '#10B981',
  furniture: '#8B5CF6',
  cleaning: '#EC4899',
  stationery: '#F97316',
  catering: '#84CC16',
  barber: '#06B6D4',
  machineShop: '#64748B',
} as const;
