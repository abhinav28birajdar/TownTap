import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../context/ModernThemeContext';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme } = useTheme();

  const getButtonStyles = () => {
    const baseStyle = {
      flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row' as any,
      alignItems: 'center' as any,
      justifyContent: 'center' as any,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: size === 'small' ? theme.spacing.sm : size === 'large' ? theme.spacing.xl : theme.spacing.lg,
      paddingVertical: size === 'small' ? theme.spacing.xs : size === 'large' ? theme.spacing.md : theme.spacing.sm,
      ...theme.shadows.small,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.border : theme.colors.buttonPrimary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.borderLight : theme.colors.buttonSecondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.colors.border : theme.colors.buttonPrimary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyles = () => {
    const baseTextStyle = {
      ...theme.typography.button,
      marginLeft: icon && iconPosition === 'left' ? theme.spacing.xs : 0,
      marginRight: icon && iconPosition === 'right' ? theme.spacing.xs : 0,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: disabled ? theme.colors.textTertiary : theme.colors.buttonText,
        };
      case 'secondary':
        return {
          ...baseTextStyle,
          color: disabled ? theme.colors.textTertiary : theme.colors.text,
        };
      case 'outline':
      case 'ghost':
        return {
          ...baseTextStyle,
          color: disabled ? theme.colors.textTertiary : theme.colors.buttonPrimary,
        };
      default:
        return baseTextStyle;
    }
  };

  const iconColor = variant === 'primary' 
    ? (disabled ? theme.colors.textTertiary : theme.colors.buttonText)
    : (disabled ? theme.colors.textTertiary : theme.colors.buttonPrimary);

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <TouchableOpacity
      style={[
        getButtonStyles(),
        fullWidth && { width: '100%' },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={iconColor}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={iconSize} color={iconColor} />
          )}
          <Text style={[getTextStyles(), textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={iconSize} color={iconColor} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
