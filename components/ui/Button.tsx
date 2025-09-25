import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  TouchableOpacityProps 
} from 'react-native';
import { useTheme } from '../../src/context/ModernThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = theme.spacing.xs;
        baseStyle.paddingHorizontal = theme.spacing.sm;
        baseStyle.minHeight = 32;
        break;
      case 'large':
        baseStyle.paddingVertical = theme.spacing.md;
        baseStyle.paddingHorizontal = theme.spacing.lg;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingVertical = theme.spacing.sm;
        baseStyle.paddingHorizontal = theme.spacing.md;
        baseStyle.minHeight = 44;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = theme.colors.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      default: // primary
        baseStyle.backgroundColor = theme.colors.primary;
    }

    // Full width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Disabled state
    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size text styles
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = theme.fontSize.sm;
        break;
      case 'large':
        baseTextStyle.fontSize = theme.fontSize.lg;
        break;
      default: // medium
        baseTextStyle.fontSize = theme.fontSize.md;
    }

    // Variant text styles
    switch (variant) {
      case 'outline':
        baseTextStyle.color = theme.colors.primary;
        break;
      case 'ghost':
        baseTextStyle.color = theme.colors.primary;
        break;
      default: // primary, secondary
        baseTextStyle.color = '#FFFFFF';
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : '#FFFFFF'}
          style={{ marginRight: theme.spacing.xs }}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;