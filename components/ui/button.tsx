import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  gradient?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  gradient = false,
  icon,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
    };

    // Size
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = Spacing.sm;
        baseStyle.paddingHorizontal = Spacing.md;
        break;
      case 'large':
        baseStyle.paddingVertical = Spacing.md + 2;
        baseStyle.paddingHorizontal = Spacing.lg;
        break;
      default:
        baseStyle.paddingVertical = Spacing.md;
        baseStyle.paddingHorizontal = Spacing.lg;
    }

    // Variant
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = Colors.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = Colors.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = Colors.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: FontWeight.semibold,
      textAlign: 'center',
    };

    switch (size) {
      case 'small':
        baseStyle.fontSize = FontSize.sm;
        break;
      case 'large':
        baseStyle.fontSize = FontSize.lg;
        break;
      default:
        baseStyle.fontSize = FontSize.md;
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
        baseStyle.color = Colors.background;
        break;
      case 'outline':
      case 'ghost':
        baseStyle.color = Colors.primary;
        break;
    }

    return baseStyle;
  };

  const containerStyle = getContainerStyle();
  const textStyle = getTextStyle();

  if (gradient && (variant === 'primary' || variant === 'secondary')) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[{ borderRadius: BorderRadius.lg }, style]}
        {...props}
      >
        <LinearGradient
          colors={
            variant === 'primary'
              ? [Colors.primary, Colors.primaryDark]
              : [Colors.secondary, Colors.secondaryDark]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={containerStyle}
        >
          {loading ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <>
              {icon}
              <Text style={textStyle}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[containerStyle, style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.background}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
