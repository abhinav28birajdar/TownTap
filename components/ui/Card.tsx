import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle, 
  ViewProps 
} from 'react-native';
import { useTheme } from '../../src/context/ModernThemeContext';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
    };

    // Padding styles
    switch (padding) {
      case 'none':
        // No padding
        break;
      case 'small':
        baseStyle.padding = theme.spacing.sm;
        break;
      case 'large':
        baseStyle.padding = theme.spacing.lg;
        break;
      default: // medium
        baseStyle.padding = theme.spacing.md;
    }

    // Variant styles
    switch (variant) {
      case 'elevated':
        Object.assign(baseStyle, theme.shadows.medium);
        break;
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.border;
        break;
      default: // default
        Object.assign(baseStyle, theme.shadows.small);
    }

    return baseStyle;
  };

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

export default Card;