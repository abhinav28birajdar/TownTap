import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../context/ModernThemeContext';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'link';
  lightColor?: string;
  darkColor?: string;
};

export function ThemedText({
  style,
  type = 'default',
  lightColor,
  darkColor,
  ...props
}: ThemedTextProps) {
  const { theme, isDark } = useTheme();
  
  const color = isDark ? darkColor : lightColor;

  return (
    <Text
      style={[
        { color: color ?? theme.colors.text },
        type === 'title' && { fontSize: 32, fontWeight: 'bold' },
        type === 'subtitle' && { fontSize: 20, fontWeight: '600' },
        type === 'link' && { color: theme.colors.primary },
        style,
      ]}
      {...props}
    />
  );
}
