import { MotiView } from 'moti';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from 'react-native';
import { Spacing } from '../../constants/spacing';
import { BorderRadius, ComponentSizes, Shadows } from '../../constants/theme';
import { getThemeColors, useTheme } from '../../hooks/use-theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'default' | 'error' | 'warning' | 'success' | 'info';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'large';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
  title?: string; // Support for title prop as alternative to children
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  children,
  title,
  onPress,
  ...props
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  // Normalize size - treat 'large' as 'lg'
  const normalizedSize = size === 'large' ? 'lg' : size;
  const sizeConfig = ComponentSizes.button[normalizedSize];
  
  // Support both children and title prop
  const content = children || title;
  
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 44, // Accessibility minimum touch target
      ...Shadows.small,
    };
    
    if (fullWidth) {
      baseStyle.width = '100%';
    }
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
          ...Shadows.small,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        };
      case 'destructive':
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: colors.error,
          borderWidth: 0,
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: colors.success,
          borderWidth: 0,
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: colors.warning,
          borderWidth: 0,
        };
      case 'info':
        return {
          ...baseStyle,
          backgroundColor: colors.info,
          borderWidth: 0,
        };
      case 'default':
        return {
          ...baseStyle,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return baseStyle;
    }
  };
  
  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.primaryForeground;
      case 'secondary':
        return colors.secondaryForeground;
      case 'outline':
        return colors.text;
      case 'ghost':
        return colors.primary;
      case 'destructive':
        return colors.errorForeground;
      default:
        return colors.text;
    }
  };
  
  const getTextVariant = () => {
    return normalizedSize === 'lg' ? 'label-large' : 'label-medium';
  };
  
  const isDisabled = disabled || loading;
  
  const buttonStyle = getButtonStyle();
  const finalButtonStyle: ViewStyle = {
    ...buttonStyle,
    opacity: isDisabled ? 0.6 : 1,
  };
  
  const handlePress = (event: any) => {
    if (!loading && !disabled && onPress) {
      onPress(event);
    }
  };
  
  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.95 }}
      transition={{
        type: 'timing',
        duration: 150,
      }}
    >
      <TouchableOpacity
        style={[finalButtonStyle, style]}
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.8}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={getTextColor()}
          />
        ) : (
          <>
            {leftIcon && (
              <View style={styles.leftIcon}>
                {leftIcon}
              </View>
            )}
            
            <Text
              variant={getTextVariant()}
              style={[
                { 
                  color: getTextColor(),
                  fontSize: sizeConfig.fontSize,
                },
                ...(textStyle ? [textStyle] : []),
              ]}
              weight="medium"
            >
              {content}
            </Text>
            
            {rightIcon && (
              <View style={styles.rightIcon}>
                {rightIcon}
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    </MotiView>
  );
};

// Icon Button Component
interface IconButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  icon: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  style,
  ...props
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const sizeConfig = ComponentSizes.button[size];
  
  const buttonStyle: ViewStyle = {
    width: sizeConfig.height,
    height: sizeConfig.height,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variant === 'ghost' ? 'transparent' : colors.primary,
  };
  
  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'timing',
        duration: 150,
      }}
    >
      <TouchableOpacity
        style={[buttonStyle, style]}
        activeOpacity={0.7}
        {...props}
      >
        {icon}
      </TouchableOpacity>
    </MotiView>
  );
};

// Floating Action Button
interface FABProps extends Omit<TouchableOpacityProps, 'style'> {
  icon: React.ReactNode;
  size?: 'md' | 'lg';
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  icon,
  size = 'lg',
  style,
  ...props
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const fabSize = size === 'lg' ? 56 : 48;
  
  const fabStyle: ViewStyle = {
    width: fabSize,
    height: fabSize,
    borderRadius: fabSize / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    ...Shadows.large,
  };
  
  return (
    <MotiView
      from={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 150,
      }}
    >
      <TouchableOpacity
        style={[fabStyle, style]}
        activeOpacity={0.8}
        {...props}
      >
        {icon}
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
  },
});

export default Button;
