// FILE: src/config/theme.ts
// PURPOSE: Defines NativeBase custom theme ensuring consistent UI across all components

import { extendTheme } from 'native-base';

export const theme = extendTheme({
  colors: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3', // Main brand color
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
    secondary: {
      50: '#FFF3E0',
      100: '#FFE0B2',
      200: '#FFCC80',
      300: '#FFB74D',
      400: '#FFA726',
      500: '#FF9800', // Secondary accent
      600: '#FB8C00',
      700: '#F57C00',
      800: '#EF6C00',
      900: '#E65100',
    },
    success: {
      50: '#E8F5E8',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50', // Success green
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
    },
    error: {
      50: '#FFEBEE',
      100: '#FFCDD2',
      200: '#EF9A9A',
      300: '#E57373',
      400: '#EF5350',
      500: '#F44336', // Error red
      600: '#E53935',
      700: '#D32F2F',
      800: '#C62828',
      900: '#B71C1C',
    },
    warning: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#FFC107', // Warning yellow
      600: '#FFB300',
      700: '#FFA000',
      800: '#FF8F00',
      900: '#FF6F00',
    },
    info: {
      50: '#E1F5FE',
      100: '#B3E5FC',
      200: '#81D4FA',
      300: '#4FC3F7',
      400: '#29B6F6',
      500: '#03A9F4', // Info blue
      600: '#039BE5',
      700: '#0288D1',
      800: '#0277BD',
      900: '#01579B',
    },
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    // Semantic colors
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
    shadow: '#000000',
  },
  fonts: {
    heading: 'Poppins-Bold',
    body: 'Poppins-Regular',
    mono: 'SpaceMono-Regular',
  },
  fontSizes: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  space: {
    px: 1,
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
  },
  sizes: {
    full: '100%',
    '3xs': 224,
    '2xs': 256,
    xs: 320,
    sm: 384,
    md: 448,
    lg: 512,
    xl: 576,
    '2xl': 672,
  },
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'lg',
        _text: {
          fontWeight: '600',
        },
      },
      variants: {
        solid: (props: any) => ({
          bg: `${props.colorScheme}.500`,
          _pressed: {
            bg: `${props.colorScheme}.600`,
          },
          _disabled: {
            bg: 'gray.300',
          },
        }),
        outline: (props: any) => ({
          borderWidth: 2,
          borderColor: `${props.colorScheme}.500`,
          bg: 'transparent',
          _text: {
            color: `${props.colorScheme}.500`,
          },
          _pressed: {
            bg: `${props.colorScheme}.50`,
          },
        }),
        ghost: (props: any) => ({
          bg: 'transparent',
          _text: {
            color: `${props.colorScheme}.500`,
          },
          _pressed: {
            bg: `${props.colorScheme}.50`,
          },
        }),
      },
      sizes: {
        sm: {
          px: 3,
          py: 2,
          _text: {
            fontSize: 'sm',
          },
        },
        md: {
          px: 4,
          py: 3,
          _text: {
            fontSize: 'md',
          },
        },
        lg: {
          px: 6,
          py: 4,
          _text: {
            fontSize: 'lg',
          },
        },
      },
      defaultProps: {
        colorScheme: 'primary',
        size: 'md',
        variant: 'solid',
      },
    },
    Input: {
      baseStyle: {
        borderRadius: 'md',
        borderWidth: 1,
        borderColor: 'gray.300',
        px: 4,
        py: 3,
        fontSize: 'md',
        _focus: {
          borderColor: 'primary.500',
          bg: 'white',
        },
        _invalid: {
          borderColor: 'error.500',
        },
      },
      variants: {
        outline: {
          bg: 'white',
        },
        filled: {
          bg: 'gray.100',
          borderColor: 'transparent',
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Card: {
      baseStyle: {
        bg: 'white',
        borderRadius: 'lg',
        p: 4,
        shadow: 'sm',
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 2,
        py: 1,
        _text: {
          fontSize: 'xs',
          fontWeight: '600',
        },
      },
      variants: {
        solid: (props: any) => ({
          bg: `${props.colorScheme}.500`,
          _text: {
            color: 'white',
          },
        }),
        outline: (props: any) => ({
          borderWidth: 1,
          borderColor: `${props.colorScheme}.500`,
          bg: 'transparent',
          _text: {
            color: `${props.colorScheme}.500`,
          },
        }),
        subtle: (props: any) => ({
          bg: `${props.colorScheme}.100`,
          _text: {
            color: `${props.colorScheme}.800`,
          },
        }),
      },
      defaultProps: {
        colorScheme: 'primary',
        variant: 'solid',
      },
    },
  },
});
