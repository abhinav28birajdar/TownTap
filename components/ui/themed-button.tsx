import { BorderRadius, Shadows } from '@/constants/theme';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ThemedButtonProps extends Omit<PressableProps, 'style'> {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ThemedButton = memo(({
  title,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled = false,
  onPress,
  style,
  ...props
}: ThemedButtonProps) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const sizeStyles = {
    small: { height: 36, paddingHorizontal: 16 },
    medium: { height: 44, paddingHorizontal: 20 },
    large: { height: 52, paddingHorizontal: 24 },
  };

  const textSizes = {
    small: 14,
    medium: 16,
    large: 18,
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const getVariantStyles = () => {
    const isDisabled = disabled || loading;
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDisabled ? colors.textTertiary : colors.primary,
          borderWidth: 0,
          textColor: colors.textInverse,
        };
      case 'secondary':
        return {
          backgroundColor: isDisabled ? colors.textTertiary : colors.secondary,
          borderWidth: 0,
          textColor: colors.textInverse,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: isDisabled ? colors.borderLight : colors.border,
          textColor: isDisabled ? colors.textTertiary : colors.text,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          textColor: isDisabled ? colors.textTertiary : colors.primary,
        };
      case 'danger':
        return {
          backgroundColor: isDisabled ? colors.textTertiary : colors.error,
          borderWidth: 0,
          textColor: colors.textInverse,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        sizeStyles[size],
        {
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSizes[size]}
              color={variantStyles.textColor}
              style={title ? styles.iconLeft : undefined}
            />
          )}
          {title && (
            <Text
              style={[
                styles.text,
                {
                  fontSize: textSizes[size],
                  color: variantStyles.textColor,
                },
              ]}
            >
              {title}
            </Text>
          )}
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSizes[size]}
              color={variantStyles.textColor}
              style={title ? styles.iconRight : undefined}
            />
          )}
        </View>
      )}
    </AnimatedPressable>
  );
});

ThemedButton.displayName = 'ThemedButton';

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Shadows.small,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
