import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    if (disabled || loading) {
      return {
        ...baseStyle,
        ...styles.disabledButton,
        ...style,
      };
    }

    return {
      ...baseStyle,
      ...styles[`${variant}Button`],
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.buttonText,
      ...styles[`${size}Text`],
    };

    if (disabled || loading) {
      return {
        ...baseTextStyle,
        ...styles.disabledText,
        ...textStyle,
      };
    }

    return {
      ...baseTextStyle,
      ...styles[`${variant}Text`],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={getButtonStyle()}
    >
      {loading && <ActivityIndicator size="small" color={getTextStyle().color} style={styles.loader} />}
      {!loading && icon && icon}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  // Size variants
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },

  // Color variants
  primaryButton: {
    backgroundColor: '#667eea',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: '#667eea',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },

  // Text styles
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Text color variants
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#495057',
  },
  outlineText: {
    color: '#667eea',
  },
  ghostText: {
    color: '#667eea',
  },
  dangerText: {
    color: '#ffffff',
  },

  // Disabled styles
  disabledButton: {
    backgroundColor: '#e9ecef',
    borderColor: '#dee2e6',
  },
  disabledText: {
    color: '#6c757d',
  },

  loader: {
    marginRight: 8,
  },
});

export default Button;
