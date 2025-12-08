import { Typography } from '@/constants/theme';
import { useColors } from '@/contexts/theme-context';
import React, { memo } from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

type TextVariant = 
  | 'displayLarge' 
  | 'displayMedium' 
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success' | 'warning' | 'accent';

interface ThemedTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';
  align?: 'left' | 'center' | 'right' | 'justify';
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

const variantStyles: Record<TextVariant, any> = {
  displayLarge: { fontSize: 57, lineHeight: 64, fontWeight: '700' },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: '700' },
  displaySmall: { fontSize: 36, lineHeight: 44, fontWeight: '700' },
  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '600' },
  headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: '600' },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '500' },
};

export const ThemedText = memo(({
  variant = 'bodyMedium',
  color = 'primary',
  weight,
  align = 'left',
  style,
  ...props
}: ThemedTextProps) => {
  const colors = useColors();

  const colorMap: Record<TextColor, string> = {
    primary: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    inverse: colors.textInverse,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    accent: colors.accent,
  };

  return (
    <RNText
      style={[
        variantStyles[variant],
        { color: colorMap[color] },
        weight && { fontWeight: Typography.weights[weight] },
        { textAlign: align },
        style,
      ]}
      {...props}
    />
  );
});

ThemedText.displayName = 'ThemedText';
