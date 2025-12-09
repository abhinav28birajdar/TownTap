import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Spacing } from '../../constants/spacing';
import { BorderRadius, ComponentSizes } from '../../constants/theme';
import { getThemeColors, useTheme } from '../../hooks/use-theme';
import { Text } from './Text';

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'filled' | 'bordered';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  hint,
  error,
  required = false,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const [isFocused, setIsFocused] = useState(false);
  const sizeConfig = ComponentSizes.input[size];
  
  const hasError = !!error;
  
  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: BorderRadius.lg,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      height: sizeConfig.height,
    };
    
    switch (variant) {
      case 'filled':
        baseStyle.backgroundColor = colors.input;
        baseStyle.borderWidth = 0;
        break;
      case 'bordered':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = hasError ? colors.error : isFocused ? colors.primary : colors.border;
        break;
      default:
        baseStyle.backgroundColor = colors.input;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = hasError ? colors.error : isFocused ? colors.primary : 'transparent';
    }
    
    return baseStyle;
  };
  
  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      fontSize: sizeConfig.fontSize,
      color: colors.text,
      paddingVertical: 0, // Remove default padding
    };
  };
  
  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  const renderIcon = (icon: React.ReactNode | string, iconColor: string) => {
    if (typeof icon === 'string') {
      return <Ionicons name={icon as any} size={20} color={iconColor} />;
    }
    return icon;
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text
            variant="label-medium"
            style={[
              {
                color: hasError ? colors.error : colors.text,
              },
              labelStyle,
            ]}
          >
            {label}
            {required && (
              <Text style={{ color: colors.error }}> *</Text>
            )}
          </Text>
        </View>
      )}
      
      <MotiView
        animate={{
          borderColor: hasError ? colors.error : isFocused ? colors.primary : colors.border,
        }}
        transition={{
          type: 'timing',
          duration: 200,
        }}
        style={getInputContainerStyle()}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            {renderIcon(leftIcon, colors.textSecondary)}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {renderIcon(rightIcon, colors.textSecondary)}
          </TouchableOpacity>
        )}
      </MotiView>
      
      {(hint || error) && (
        <View style={styles.helperContainer}>
          <Text
            variant="body-small"
            style={{
              color: hasError ? colors.error : colors.textSecondary,
            }}
          >
            {error || hint}
          </Text>
        </View>
      )}
    </View>
  );
});

// TextArea component for multiline input
interface TextAreaProps extends InputProps {
  rows?: number;
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(({
  rows = 4,
  ...props
}, ref) => {
  return (
    <Input
      ref={ref}
      multiline
      textAlignVertical="top"
      style={{
        height: rows * 24 + 24, // Approximate line height calculation
      }}
      {...props}
    />
  );
});

// SearchInput component with search icon
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  onClear,
  value,
  onChangeText,
  ...props
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const handleChangeText = (text: string) => {
    onChangeText?.(text);
    onSearch?.(text);
  };
  
  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
  };
  
  return (
    <Input
      value={value}
      onChangeText={handleChangeText}
      leftIcon={
        <Text style={{ color: colors.textTertiary }}>🔍</Text>
      }
      rightIcon={
        value ? (
          <TouchableOpacity onPress={handleClear}>
            <Text style={{ color: colors.textTertiary }}>✕</Text>
          </TouchableOpacity>
        ) : undefined
      }
      onRightIconPress={value ? handleClear : undefined}
      placeholder="Search..."
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelContainer: {
    marginBottom: Spacing.xs,
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
    padding: Spacing.xs, // Increase touch area
  },
  helperContainer: {
    marginTop: Spacing.xs,
  },
});

Input.displayName = 'Input';
TextArea.displayName = 'TextArea';

export default Input;
