import { StyleSheet, Text, type TextProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';

// Material Design style type names mapped to our internal types
type MaterialType = 'titleLarge' | 'titleMedium' | 'titleSmall' | 'bodyLarge' | 'bodyMedium' | 'bodySmall' | 'labelLarge' | 'labelMedium' | 'labelSmall';
type InternalType = 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'overline' | 'body1' | 'body2' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: InternalType;
  variant?: MaterialType; // Alias for Material Design naming convention
  animated?: boolean;
  gradient?: boolean;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'heavy';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
};

// Map Material Design variant names to internal type names
const variantToType: Record<MaterialType, InternalType> = {
  titleLarge: 'h2',
  titleMedium: 'h4',
  titleSmall: 'h6',
  bodyLarge: 'body1',
  bodyMedium: 'body2',
  bodySmall: 'caption',
  labelLarge: 'defaultSemiBold',
  labelMedium: 'default',
  labelSmall: 'caption',
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type,
  variant,
  animated = false,
  weight,
  size,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  // Use variant if provided, otherwise use type, default to 'default'
  const effectiveType: InternalType = variant ? variantToType[variant] : (type || 'default');

  const getTypeStyles = () => {
    switch (effectiveType) {
      case 'h1': return styles.h1;
      case 'h2': return styles.h2;
      case 'h3': return styles.h3;
      case 'h4': return styles.h4;
      case 'h5': return styles.h5;
      case 'h6': return styles.h6;
      case 'title': return styles.title;
      case 'subtitle': return styles.subtitle;
      case 'body1': return styles.body1;
      case 'body2': return styles.body2;
      case 'caption': return styles.caption;
      case 'overline': return styles.overline;
      case 'defaultSemiBold': return styles.defaultSemiBold;
      case 'link': return styles.link;
      default: return styles.default;
    }
  };

  const getWeightStyles = () => {
    if (!weight) return {};
    switch (weight) {
      case 'light': return { fontWeight: '300' as const };
      case 'normal': return { fontWeight: '400' as const };
      case 'medium': return { fontWeight: '500' as const };
      case 'semibold': return { fontWeight: '600' as const };
      case 'bold': return { fontWeight: '700' as const };
      case 'heavy': return { fontWeight: '800' as const };
      default: return {};
    }
  };

  const getSizeStyles = () => {
    if (!size) return {};
    switch (size) {
      case 'xs': return { fontSize: 12 };
      case 'sm': return { fontSize: 14 };
      case 'md': return { fontSize: 16 };
      case 'lg': return { fontSize: 18 };
      case 'xl': return { fontSize: 20 };
      case '2xl': return { fontSize: 24 };
      case '3xl': return { fontSize: 30 };
      case '4xl': return { fontSize: 36 };
      default: return {};
    }
  };

  const TextComponent = animated ? Animated.Text : Text;

  return (
    <TextComponent
      style={[
        { color },
        getTypeStyles(),
        getWeightStyles(),
        getSizeStyles(),
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  // Headers
  h1: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
    letterSpacing: -1,
  },
  h2: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  h4: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
  },
  h5: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  h6: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  // Body text
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    textDecorationLine: 'underline',
  },
});
