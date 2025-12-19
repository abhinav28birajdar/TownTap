/**
 * Design tokens for TownTap app
 * Includes comprehensive color palette for light and dark modes
 */

export type ColorScheme = 'light' | 'dark';

const BaseColors = {
  light: {
    // Nature-inspired Primary Colors
    primary: '#415D43', // Deep forest green - Primary Action
    primaryLight: '#5A7C5D', // Lighter forest green
    primaryDark: '#29422B', // Very dark green
    primaryForeground: '#FFFFFF',
    
    // Nature Secondary Colors
    secondary: '#29422B', // Very dark green - Dark Accent
    secondaryLight: '#415D43', // Deep forest green
    secondaryDark: '#1C2F1E', // Darkest green
    secondaryForeground: '#FFFFFF',
    
    // Nature Accent Colors
    accent: '#A1CCA5', // Sage green - Secondary Background
    accentLight: '#B8D9BB', // Lighter sage
    accentDark: '#7FB584', // Darker sage
    accentForeground: '#29422B',
    
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
    
    // Info colors
    info: '#3B82F6', // Blue 500
    infoLight: '#60A5FA', // Blue 400
    infoDark: '#2563EB', // Blue 600
    infoForeground: '#FFFFFF',
    
    // Neutral colors with nature palette
    background: '#DAF8DC', // Pale mint green - Primary Background
    foreground: '#29422B', // Very dark green - Text/Headers
    
    card: '#FFFFFF',
    cardForeground: '#29422B',
    
    popover: '#FFFFFF',
    popoverForeground: '#29422B',
    
    // Grays with nature tint
    muted: '#E8F5E9', // Very light green tint
    mutedForeground: '#415D43', // Deep forest green
    
    border: '#C8E6C9', // Light green border
    input: '#F1F8F4', // Very light mint
    ring: '#415D43', // Deep forest green
    
    // Text hierarchy with nature colors
    text: '#29422B', // Very dark green - Primary text
    textSecondary: '#415D43', // Deep forest green - Secondary text
    textTertiary: '#5A7C5D', // Medium green - Tertiary text
    textDisabled: '#A1CCA5', // Sage green - Disabled text
    
    // Surface colors
    surface: '#FFFFFF',
    surfaceSecondary: '#DAF8DC', // Pale mint green
    surfaceTertiary: '#E8F5E9', // Very light green
    
    // Additional UI colors
    cardBorder: '#E2E8F0', // Light border for cards
    textInverse: '#FFFFFF', // Inverse text color
    inputPlaceholder: '#9CA3AF', // Placeholder text color
    
    // Overlay
    overlay: 'rgba(41, 66, 43, 0.4)',
    
    // Tab colors
    tabIconDefault: '#A1CCA5', // Sage green
    tabIconSelected: '#415D43', // Deep forest green - Primary
  },
  dark: {
    // Nature-inspired Primary Colors (adjusted for dark mode)
    primary: '#5A7C5D', // Lighter forest green - Primary Action
    primaryLight: '#7FB584', // Even lighter green
    primaryDark: '#415D43', // Deep forest green
    primaryForeground: '#FFFFFF',
    
    // Nature Secondary Colors (adjusted for dark mode)
    secondary: '#5A7C5D', // Lighter forest green for dark mode
    secondaryLight: '#7FB584', // Even lighter
    secondaryDark: '#415D43', // Deep forest green
    secondaryForeground: '#FFFFFF',
    
    // Nature Accent Colors (adjusted for dark mode)
    accent: '#7FB584', // Adjusted sage green for dark mode
    accentLight: '#A1CCA5', // Sage green
    accentDark: '#5A7C5D', // Darker green
    accentForeground: '#1C2F1E',
    
    // Success, Warning, Error (adjusted for dark mode)
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
    
    // Info colors (dark mode)
    info: '#60A5FA', // Blue 400
    infoLight: '#93C5FD', // Blue 300
    infoDark: '#3B82F6', // Blue 500
    infoForeground: '#0F172A',
    
    // Neutral colors with dark nature palette
    background: '#1C2F1E', // Very dark green
    foreground: '#E8F5E9', // Very light green
    
    card: '#29422B', // Very dark green card
    cardForeground: '#E8F5E9',
    
    popover: '#29422B', // Very dark green
    popoverForeground: '#E8F5E9',
    
    // Grays with dark nature tint
    muted: '#29422B', // Very dark green
    mutedForeground: '#A1CCA5', // Sage green
    
    border: '#415D43', // Deep forest green
    input: '#415D43', // Deep forest green
    ring: '#0560C2',
    
    // Text hierarchy with nature colors (dark mode)
    text: '#E8F5E9', // Very light green - Primary text
    textSecondary: '#C8E6C9', // Light green - Secondary text
    textTertiary: '#A1CCA5', // Sage green - Tertiary text
    textDisabled: '#5A7C5D', // Medium green - Disabled text
    
    // Surface colors
    surface: '#29422B', // Very dark green
    surfaceSecondary: '#415D43', // Deep forest green
    surfaceTertiary: '#5A7C5D', // Medium green
    
    // Additional UI colors
    cardBorder: '#415D43', // Dark border for cards
    textInverse: '#1C2F1E', // Inverse text color (dark)
    inputPlaceholder: '#6B7280', // Placeholder text color
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',
    
    // Tab colors
    tabIconDefault: '#A1CCA5', // Sage green
    tabIconSelected: '#0560C2', // Bright blue
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

// Export the base colors with light/dark themes
export const Colors = BaseColors;

// Type for theme colors
export type ThemeColors = typeof Colors.light;

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
