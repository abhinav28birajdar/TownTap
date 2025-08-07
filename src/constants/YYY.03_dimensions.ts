// =====================================================
// ENHANCED TOWNTAP - DIMENSIONS & SPACING SYSTEM
// Consistent spacing, sizing, and layout dimensions
// =====================================================

export const Spacing = {
  // Base unit for spacing (4px)
  unit: 4,
  
  // Spacing scale following 4px grid system
  0: 0,
  1: 4,    // 1 unit
  2: 8,    // 2 units
  3: 12,   // 3 units
  4: 16,   // 4 units (base)
  5: 20,   // 5 units
  6: 24,   // 6 units
  8: 32,   // 8 units
  10: 40,  // 10 units
  12: 48,  // 12 units
  16: 64,  // 16 units
  20: 80,  // 20 units
  24: 96,  // 24 units
  32: 128, // 32 units
  40: 160, // 40 units
  48: 192, // 48 units
  56: 224, // 56 units
  64: 256, // 64 units
} as const;

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 999, // For pill-shaped buttons and circular elements
} as const;

export const BorderWidth = {
  0: 0,
  1: 1,
  2: 2,
  4: 4,
  8: 8,
} as const;

export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
} as const;

export const Layout = {
  // Screen edge margins
  screenPadding: Spacing[4], // 16px
  screenPaddingHorizontal: Spacing[4], // 16px
  screenPaddingVertical: Spacing[6], // 24px
  
  // Container max widths
  containerMaxWidth: 1200,
  cardMaxWidth: 400,
  
  // Header heights
  headerHeight: 56,
  tabBarHeight: 60,
  statusBarHeight: 44, // iOS safe area
  
  // Common component dimensions
  buttonHeight: {
    small: 32,
    medium: 40,
    large: 48,
    extraLarge: 56,
  },
  
  inputHeight: {
    small: 32,
    medium: 40,
    large: 48,
  },
  
  cardPadding: Spacing[4], // 16px
  cardMargin: Spacing[3], // 12px
  
  // Avatar sizes
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
    '3xl': 96,
  },
  
  // Business card dimensions
  businessCard: {
    width: 280,
    height: 200,
    imageHeight: 120,
  },
  
  // Product card dimensions
  productCard: {
    width: 160,
    height: 220,
    imageHeight: 120,
  },
  
  // Service card dimensions
  serviceCard: {
    width: '100%',
    minHeight: 100,
  },
} as const;

export const Shadows = {
  // Shadow presets for consistent elevation
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export const Breakpoints = {
  // Responsive breakpoints for tablets/larger screens
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

export const ZIndex = {
  // Z-index hierarchy
  behind: -1,
  base: 0,
  dropdown: 1000,
  overlay: 2000,
  modal: 3000,
  popover: 4000,
  tooltip: 5000,
  toast: 6000,
} as const;

export const Opacity = {
  // Opacity scale
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
} as const;

export const AnimationDuration = {
  // Animation timing constants
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
} as const;

export const AnimationEasing = {
  // Animation easing functions
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  spring: 'spring',
} as const;

// Helper functions for responsive design
export const getResponsiveValue = <T>(
  values: { sm?: T; md?: T; lg?: T; xl?: T },
  screenWidth: number,
  defaultValue: T
): T => {
  if (screenWidth >= Breakpoints.xl && values.xl !== undefined) return values.xl;
  if (screenWidth >= Breakpoints.lg && values.lg !== undefined) return values.lg;
  if (screenWidth >= Breakpoints.md && values.md !== undefined) return values.md;
  if (screenWidth >= Breakpoints.sm && values.sm !== undefined) return values.sm;
  return defaultValue;
};

export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;
export type IconSizeKey = keyof typeof IconSizes;
