import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../context/ModernThemeContext';

interface ModernInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  isPassword?: boolean;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined',
  size = 'medium',
  style,
  isPassword = false,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const getContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
    };

    const heightValue = {
      small: 40,
      medium: 48,
      large: 56,
    }[size];

    baseStyle.height = heightValue;

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border,
          backgroundColor: theme.colors.surface,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceSecondary,
          borderWidth: 0,
        };
      default:
        return {
          ...baseStyle,
          borderBottomWidth: 1,
          borderColor: error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border,
          backgroundColor: 'transparent',
          borderRadius: 0,
        };
    }
  };

  const getTextInputStyles = () => ({
    flex: 1,
    ...theme.typography.body1,
    color: theme.colors.text,
    paddingHorizontal: leftIcon ? theme.spacing.sm : 0,
  });

  const iconColor = error 
    ? theme.colors.error 
    : isFocused 
      ? theme.colors.primary 
      : theme.colors.icon;

  const effectiveRightIcon = isPassword 
    ? (isPasswordVisible ? 'eye-off' : 'eye')
    : rightIcon;

  const handleRightIconPress = () => {
    if (isPassword) {
      setIsPasswordVisible(!isPasswordVisible);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  return (
    <View style={style}>
      {label && (
        <Text style={[
          theme.typography.body2,
          {
            color: error ? theme.colors.error : theme.colors.textSecondary,
            marginBottom: theme.spacing.xs,
            fontWeight: '500',
          }
        ]}>
          {label}
        </Text>
      )}
      
      <View style={getContainerStyles()}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={iconColor}
          />
        )}
        
        <TextInput
          {...textInputProps}
          style={getTextInputStyles()}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={isPassword && !isPasswordVisible}
        />
        
        {effectiveRightIcon && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={{ padding: theme.spacing.xs }}
          >
            <Ionicons
              name={effectiveRightIcon}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || hint) && (
        <Text style={[
          theme.typography.caption,
          {
            color: error ? theme.colors.error : theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
          }
        ]}>
          {error || hint}
        </Text>
      )}
    </View>
  );
};
