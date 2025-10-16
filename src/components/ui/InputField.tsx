/**
 * FILE: src/components/ui/InputField.tsx
 * PURPOSE: Reusable input field component with consistent styling
 * RESPONSIBILITIES: Provide consistent form inputs across the app
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  required = false,
  style,
  ...textInputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = () => {
    setIsFocused(true);
    textInputProps.onFocus?.({} as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    textInputProps.onBlur?.({} as any);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon as any} 
            size={20} 
            color={isFocused ? '#007AFF' : '#999'} 
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[styles.input, style]}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#999"
          {...textInputProps}
        />
        
        {isPassword && (
          <TouchableOpacity 
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={rightIcon as any} 
              size={20} 
              color="#999" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    minHeight: 50,
  },
  inputContainerFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
  eyeIcon: {
    marginLeft: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default InputField;