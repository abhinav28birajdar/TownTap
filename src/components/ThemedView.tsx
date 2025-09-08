import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../context/ModernThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...props
}: ThemedViewProps) {
  const { theme, isDark } = useTheme();
  
  const backgroundColor = isDark ? darkColor : lightColor;

  return (
    <View
      style={[
        { backgroundColor: backgroundColor ?? theme.colors.background },
        style,
      ]}
      {...props}
    />
  );
}
