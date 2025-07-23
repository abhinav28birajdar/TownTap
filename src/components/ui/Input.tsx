import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'small' | 'medium' | 'large';
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = 'outlined',
  size = 'medium',
  required = false,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const getContainerStyle = (): ViewStyle => {
    return {
      ...styles.container,
      ...containerStyle,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle = {
      ...styles.inputContainer,
      ...styles[`${variant}Container`],
      ...styles[`${size}Container`],
    };

    if (isFocused) {
      return {
        ...baseStyle,
        ...styles[`${variant}Focused`],
      };
    }

    if (error) {
      return {
        ...baseStyle,
        ...styles[`${variant}Error`],
      };
    }

    return baseStyle;
  };

  const getInputStyle = (): TextStyle => {
    return {
      ...styles.input,
      ...styles[`${size}Input`],
      ...inputStyle,
    };
  };

  const handleRightIconPress = () => {
    if (secureTextEntry) {
      setIsSecure(!isSecure);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const getRightIcon = () => {
    if (secureTextEntry) {
      return isSecure ? 'eye-off' : 'eye';
    }
    return rightIcon;
  };

  return (
    <View style={getContainerStyle()}>
      {label && (
        <Text style={[styles.label, styles[`${size}Label`], labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={styles[`${size}Icon`].fontSize} 
            color={isFocused ? '#667eea' : '#6c757d'} 
            style={styles.leftIcon} 
          />
        )}
        
        <TextInput
          {...props}
          style={getInputStyle()}
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor="#9ca3af"
        />
        
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity onPress={handleRightIconPress} style={styles.rightIconContainer}>
            <Ionicons 
              name={getRightIcon() as keyof typeof Ionicons.glyphMap} 
              size={styles[`${size}Icon`].fontSize} 
              color={isFocused ? '#667eea' : '#6c757d'} 
              style={styles.rightIcon} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.error, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  label: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  
  required: {
    color: '#dc3545',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  
  input: {
    flex: 1,
    fontFamily: 'System',
    color: '#374151',
  },
  
  leftIcon: {
    marginRight: 12,
  },
  
  rightIconContainer: {
    padding: 4,
  },
  
  rightIcon: {
    marginLeft: 12,
  },
  
  error: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  
  // Variant styles
  outlinedContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  
  filledContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  underlinedContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  
  // Focused states
  outlinedFocused: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  
  filledFocused: {
    backgroundColor: '#f3f4f6',
    borderColor: '#667eea',
  },
  
  underlinedFocused: {
    borderBottomColor: '#667eea',
    borderBottomWidth: 2,
  },
  
  // Error states
  outlinedError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  
  filledError: {
    borderColor: '#dc3545',
  },
  
  underlinedError: {
    borderBottomColor: '#dc3545',
  },
  
  // Size variants
  smallContainer: {
    minHeight: 36,
  },
  
  mediumContainer: {
    minHeight: 44,
  },
  
  largeContainer: {
    minHeight: 52,
  },
  
  smallInput: {
    fontSize: 14,
    paddingVertical: 8,
  },
  
  mediumInput: {
    fontSize: 16,
    paddingVertical: 12,
  },
  
  largeInput: {
    fontSize: 18,
    paddingVertical: 16,
  },
  
  smallLabel: {
    fontSize: 14,
  },
  
  mediumLabel: {
    fontSize: 16,
  },
  
  largeLabel: {
    fontSize: 18,
  },
  
  smallIcon: {
    fontSize: 16,
  },
  
  mediumIcon: {
    fontSize: 20,
  },
  
  largeIcon: {
    fontSize: 24,
  },
});

export default Input;
