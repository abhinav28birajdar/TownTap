import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import React from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, DIMENSIONS } from '../../config/constants';
import { ButtonProps } from '../../types';

interface ButtonStyles {
  container: ViewStyle;
  text: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const getButtonStyles = (): ButtonStyles => {
    const baseContainer: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: DIMENSIONS.BORDER_RADIUS.md,
      paddingHorizontal: DIMENSIONS.PADDING.lg,
    };

    const baseText: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size variations
    const sizeStyles = {
      sm: {
        container: { 
          paddingVertical: DIMENSIONS.PADDING.sm,
          paddingHorizontal: DIMENSIONS.PADDING.md,
          minHeight: 36,
        },
        text: { fontSize: 14 },
      },
      md: {
        container: { 
          paddingVertical: DIMENSIONS.PADDING.md,
          minHeight: 48,
        },
        text: { fontSize: 16 },
      },
      lg: {
        container: { 
          paddingVertical: DIMENSIONS.PADDING.lg,
          minHeight: 56,
        },
        text: { fontSize: 18 },
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        container: {
          backgroundColor: disabled ? COLORS.gray[300] : COLORS.primary,
          borderWidth: 0,
        },
        text: {
          color: disabled ? COLORS.gray[500] : COLORS.white,
        },
      },
      secondary: {
        container: {
          backgroundColor: disabled ? COLORS.gray[100] : COLORS.secondary,
          borderWidth: 0,
        },
        text: {
          color: disabled ? COLORS.gray[500] : COLORS.white,
        },
      },
      outline: {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled ? COLORS.gray[300] : COLORS.primary,
        },
        text: {
          color: disabled ? COLORS.gray[500] : COLORS.primary,
        },
      },
      ghost: {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 0,
        },
        text: {
          color: disabled ? COLORS.gray[500] : COLORS.primary,
        },
      },
    };

    return {
      container: {
        ...baseContainer,
        ...sizeStyles[size].container,
        ...variantStyles[variant].container,
      },
      text: {
        ...baseText,
        ...sizeStyles[size].text,
        ...variantStyles[variant].text,
      },
    };
  };

  const styles = getButtonStyles();

  return (
    <MotiView
      animate={{
        scale: disabled || loading ? 1 : 1,
      }}
      transition={{
        type: 'timing',
        duration: 150,
      }}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        onPressIn={() => {
          if (!disabled && !loading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white} 
          />
        ) : (
          <>
            {icon && (
              <Text style={[styles.text, { marginRight: 8 }]}>
                {icon}
              </Text>
            )}
            <Text style={styles.text}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </MotiView>
  );
};

export default Button;
