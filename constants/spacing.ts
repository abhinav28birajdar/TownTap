/**
 * Spacing constants following 8pt grid system
 * All values are in pixels
 */

export const spacing = {
  // Base units (8pt grid)
  '0': 0,
  '0.5': 2,   // 0.125rem
  '1': 4,     // 0.25rem
  '1.5': 6,   // 0.375rem
  '2': 8,     // 0.5rem
  '2.5': 10,  // 0.625rem
  '3': 12,    // 0.75rem
  '3.5': 14,  // 0.875rem
  '4': 16,    // 1rem
  '5': 20,    // 1.25rem
  '6': 24,    // 1.5rem
  '7': 28,    // 1.75rem
  '8': 32,    // 2rem
  '9': 36,    // 2.25rem
  '10': 40,   // 2.5rem
  '12': 48,   // 3rem
  '16': 64,   // 4rem
  '20': 80,   // 5rem
  '24': 96,   // 6rem
  '32': 128,  // 8rem
  '40': 160,  // 10rem
  '48': 192,  // 12rem
  '56': 224,  // 14rem
  '64': 256,  // 16rem
  
  // Semantic spacing
  none: 0,
  xs: 4,      // Extra small
  sm: 8,      // Small
  md: 16,     // Medium
  lg: 24,     // Large
  xl: 32,     // Extra large
  xxl: 40,    // 2x Extra large (legacy)
  '2xl': 40,  // 2x Extra large
  '3xl': 48,  // 3x Extra large
  '4xl': 64,  // 4x Extra large
  '5xl': 80,  // 5x Extra large
  
  // Component specific
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  card: {
    padding: 16,
    margin: 8,
  },
  screen: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
} as const;

// Type-safe spacing keys
export type SpacingKey = keyof typeof spacing;

// Helper function to get spacing value
export const getSpacing = (key: SpacingKey): number => {
  return spacing[key] as number;
};

// Screen dimensions and safe area
export const layout = {
  window: {
    minWidth: 320,
    maxWidth: 768, // Tablet breakpoint
  },
  header: {
    height: 56,
  },
  tabBar: {
    height: 80,
  },
  bottomSheet: {
    snapPoints: ['25%', '50%', '90%'],
  },
} as const;

// Legacy exports for backward compatibility
export const Spacing = spacing;
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;
