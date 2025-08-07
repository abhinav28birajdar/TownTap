// =====================================================
// ENHANCED TOWNTAP - TYPOGRAPHY SYSTEM
// Consistent text styling across the entire application
// =====================================================

export const FontFamilies = {
  // Primary font family (replace with your chosen font)
  primary: {
    light: 'System', // Replace with 'Poppins-Light' when font is added
    regular: 'System', // Replace with 'Poppins-Regular'
    medium: 'System', // Replace with 'Poppins-Medium'
    semiBold: 'System', // Replace with 'Poppins-SemiBold'
    bold: 'System', // Replace with 'Poppins-Bold'
  },
  
  // Monospace font for code/numbers
  mono: {
    regular: 'SpaceMono-Regular',
  },
  
  // System font fallback
  system: 'System',
} as const;

export const FontSizes = {
  // Text sizes following a modular scale
  xs: 12,    // Captions, labels
  sm: 14,    // Body text small, secondary text
  base: 16,  // Base body text
  lg: 18,    // Large body text, subtitles
  xl: 20,    // Small headings
  '2xl': 24, // Medium headings
  '3xl': 30, // Large headings
  '4xl': 36, // Extra large headings
  '5xl': 48, // Display text
  '6xl': 60, // Hero text
} as const;

export const FontWeights = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

export const LineHeights = {
  // Line heights for better readability
  tight: 1.2,
  snug: 1.3,
  normal: 1.4,
  relaxed: 1.5,
  loose: 1.6,
} as const;

export const LetterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

// Pre-defined text styles for consistent usage
export const TextStyles = {
  // Display styles for hero sections
  displayLarge: {
    fontSize: FontSizes['6xl'],
    fontFamily: FontFamilies.primary.bold,
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  
  displayMedium: {
    fontSize: FontSizes['5xl'],
    fontFamily: FontFamilies.primary.bold,
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  
  displaySmall: {
    fontSize: FontSizes['4xl'],
    fontFamily: FontFamilies.primary.bold,
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.snug,
    letterSpacing: LetterSpacing.normal,
  },

  // Heading styles
  headingLarge: {
    fontSize: FontSizes['3xl'],
    fontFamily: FontFamilies.primary.semiBold,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.snug,
    letterSpacing: LetterSpacing.normal,
  },
  
  headingMedium: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.primary.semiBold,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.snug,
    letterSpacing: LetterSpacing.normal,
  },
  
  headingSmall: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.primary.semiBold,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },

  // Subtitle styles
  subtitleLarge: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.primary.medium,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  subtitleMedium: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.primary.medium,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },

  // Body text styles
  bodyLarge: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.primary.regular,
    fontWeight: FontWeights.normal,
    lineHeight: LineHeights.relaxed,
    letterSpacing: LetterSpacing.normal,
  },
  
  bodyMedium: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.primary.regular,
    fontWeight: FontWeights.normal,
    lineHeight: LineHeights.relaxed,
    letterSpacing: LetterSpacing.normal,
  },
  
  bodySmall: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.primary.regular,
    fontWeight: FontWeights.normal,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },

  // Label styles
  labelLarge: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.primary.medium,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },
  
  labelMedium: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.primary.medium,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },
  
  labelSmall: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.primary.medium,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.wider,
  },

  // Button text styles
  buttonLarge: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.primary.semiBold,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },
  
  buttonMedium: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.primary.semiBold,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },
  
  buttonSmall: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.primary.semiBold,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },

  // Caption styles
  caption: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.primary.regular,
    fontWeight: FontWeights.normal,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },

  // Overline styles (for tags, labels)
  overline: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.primary.medium,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
  },

  // Monospace styles for numbers, codes
  mono: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mono.regular,
    fontWeight: FontWeights.normal,
    lineHeight: LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
} as const;

export type TextStyleKey = keyof typeof TextStyles;
export type FontSizeKey = keyof typeof FontSizes;
