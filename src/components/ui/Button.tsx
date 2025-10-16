/**
 * FILE: src/components/ui/Button.tsx
 * PURPOSE: Reusable button component with consistent styling and variants
 * RESPONSIBILITIES: Provide consistent button styles across the app
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textColor = variant === 'primary' ? '#fff' : 
                   variant === 'secondary' ? '#fff' : 
                   variant === 'outline' ? '#007AFF' : '#007AFF';

  const iconColor = loading ? '#999' : textColor;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'secondary' ? '#fff' : '#007AFF'} 
          size="small" 
        />
      ) : (
        <>
          {leftIcon && (
            <Ionicons 
              name={leftIcon as any} 
              size={18} 
              color={iconColor} 
              style={styles.leftIcon}
            />
          )}
          <Text style={[styles.text, { color: textColor }, textStyle]}>
            {title}
          </Text>
          {rightIcon && (
            <Ionicons 
              name={rightIcon as any} 
              size={18} 
              color={iconColor} 
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  
  // Variants
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#6c757d',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  small: {
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // States
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;