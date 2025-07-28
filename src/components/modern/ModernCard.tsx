import React from 'react';
import {
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../context/ModernThemeContext';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
}) => {
  const { theme } = useTheme();

  const getCardStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
    };

    const paddingValue = {
      none: 0,
      small: theme.spacing.sm,
      medium: theme.spacing.md,
      large: theme.spacing.lg,
    }[padding];

    baseStyle.padding = paddingValue;

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...theme.shadows.medium,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      default:
        return {
          ...baseStyle,
          ...theme.shadows.small,
        };
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[getCardStyles(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </CardComponent>
  );
};
