import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../src/context/ModernThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: theme.spacing.sm,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = theme.spacing.xs;
        baseStyle.paddingHorizontal = theme.spacing.sm;
        baseStyle.minHeight = 36;
        break;
      case 'large':
        baseStyle.paddingVertical = theme.spacing.md;
        baseStyle.paddingHorizontal = theme.spacing.md;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingVertical = theme.spacing.sm;
        baseStyle.paddingHorizontal = theme.spacing.sm;
        baseStyle.minHeight = 44;
    }

    // Variant styles
    switch (variant) {
      case 'filled':
        baseStyle.backgroundColor = theme.colors.surface;
        break;
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.border);
        baseStyle.backgroundColor = theme.colors.background;
        break;
      default: // default
        baseStyle.borderBottomWidth = 1;
        baseStyle.borderBottomColor = error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.border);
        baseStyle.backgroundColor = 'transparent';
    }

    return baseStyle;
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: theme.colors.text,
      fontSize: size === 'small' ? theme.fontSize.sm : (size === 'large' ? theme.fontSize.lg : theme.fontSize.md),
    };

    return baseStyle;
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
      color: error ? theme.colors.error : theme.colors.text,
      marginBottom: theme.spacing.xs,
    };
  };

  const getHelperTextStyle = (): TextStyle => {
    return {
      fontSize: theme.fontSize.xs,
      color: error ? theme.colors.error : theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    };
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <View style={{ marginRight: theme.spacing.xs }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && (
          <View style={{ marginLeft: theme.spacing.xs }}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

export default Input;