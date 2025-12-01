import { Platform } from 'react-native';

/**
 * Typography scale following Material Design and iOS Human Interface Guidelines
 */
export const Typography = {
  // Font families
  fonts: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto_medium',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto_medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto_bold',
      default: 'System',
    }),
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
  
  // Font sizes (following 8pt grid)
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  
  // Line heights
  lineHeights: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 56,
    '6xl': 64,
    '7xl': 80,
    '8xl': 108,
    '9xl': 144,
  },
  
  // Text styles
  styles: {
    // Display styles
    display: {
      large: {
        fontSize: 72,
        lineHeight: 80,
        fontWeight: '700',
        letterSpacing: -0.5,
      },
      medium: {
        fontSize: 60,
        lineHeight: 64,
        fontWeight: '700',
        letterSpacing: -0.5,
      },
      small: {
        fontSize: 48,
        lineHeight: 56,
        fontWeight: '700',
        letterSpacing: -0.25,
      },
    },
    
    // Headline styles
    headline: {
      large: {
        fontSize: 36,
        lineHeight: 40,
        fontWeight: '600',
        letterSpacing: -0.25,
      },
      medium: {
        fontSize: 30,
        lineHeight: 36,
        fontWeight: '600',
        letterSpacing: 0,
      },
      small: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '600',
        letterSpacing: 0,
      },
    },
    
    // Title styles
    title: {
      large: {
        fontSize: 20,
        lineHeight: 32,
        fontWeight: '500',
        letterSpacing: 0,
      },
      medium: {
        fontSize: 18,
        lineHeight: 28,
        fontWeight: '500',
        letterSpacing: 0.15,
      },
      small: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        letterSpacing: 0.1,
      },
    },
    
    // Body styles
    body: {
      large: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
        letterSpacing: 0.15,
      },
      medium: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        letterSpacing: 0.25,
      },
      small: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400',
        letterSpacing: 0.4,
      },
    },
    
    // Label styles
    label: {
      large: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        letterSpacing: 0.1,
      },
      medium: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
        letterSpacing: 0.5,
      },
      small: {
        fontSize: 10,
        lineHeight: 16,
        fontWeight: '500',
        letterSpacing: 0.5,
      },
    },
  },
} as const;

/**
 * Spacing system following 8pt grid
 */
export const Spacing = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '14': 56,
  '16': 64,
  '18': 72,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
  '36': 144,
  '40': 160,
  '44': 176,
  '48': 192,
  '52': 208,
  '56': 224,
  '60': 240,
  '64': 256,
  '72': 288,
  '80': 320,
  '96': 384,
} as const;

/**
 * Border radius system
 */
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

/**
 * Breakpoints for responsive design
 */
export const Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Animation durations and easing
 */
export const Animation = {
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
  },
  easing: {
    linear: [0.0, 0.0, 1.0, 1.0],
    easeIn: [0.4, 0.0, 1.0, 1.0],
    easeOut: [0.0, 0.0, 0.2, 1.0],
    easeInOut: [0.4, 0.0, 0.2, 1.0],
    spring: [0.68, -0.55, 0.265, 1.55],
  },
} as const;

/**
 * Icon sizes
 */
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
} as const;

/**
 * Component sizes
 */
export const ComponentSizes = {
  button: {
    sm: {
      height: 32,
      paddingHorizontal: 12,
      fontSize: 14,
    },
    md: {
      height: 40,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    lg: {
      height: 48,
      paddingHorizontal: 24,
      fontSize: 18,
    },
  },
  input: {
    sm: {
      height: 32,
      paddingHorizontal: 12,
      fontSize: 14,
    },
    md: {
      height: 40,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    lg: {
      height: 48,
      paddingHorizontal: 16,
      fontSize: 18,
    },
  },
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
    '3xl': 96,
  },
} as const;
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
