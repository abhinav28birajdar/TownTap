import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'round';
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  padding = 'medium',
  margin = 'none',
  borderRadius = 'medium',
  disabled = false,
}) => {
  const getCardStyle = (): ViewStyle => {
    return {
      ...styles.card,
      ...styles[`${variant}Card`],
      ...styles[`${padding}Padding`],
      ...styles[`${margin}Margin`],
      ...styles[`${borderRadius}BorderRadius`],
      ...(disabled && styles.disabledCard),
      ...style,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={getCardStyle()}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={getCardStyle()}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
  },
  
  // Variant styles
  elevatedCard: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  outlinedCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  filledCard: {
    backgroundColor: '#f9fafb',
  },
  
  // Padding variants
  nonePadding: {
    padding: 0,
  },
  
  smallPadding: {
    padding: 8,
  },
  
  mediumPadding: {
    padding: 16,
  },
  
  largePadding: {
    padding: 24,
  },
  
  // Margin variants
  noneMargin: {
    margin: 0,
  },
  
  smallMargin: {
    margin: 8,
  },
  
  mediumMargin: {
    margin: 16,
  },
  
  largeMargin: {
    margin: 24,
  },
  
  // Border radius variants
  noneBorderRadius: {
    borderRadius: 0,
  },
  
  smallBorderRadius: {
    borderRadius: 4,
  },
  
  mediumBorderRadius: {
    borderRadius: 8,
  },
  
  largeBorderRadius: {
    borderRadius: 16,
  },
  
  roundBorderRadius: {
    borderRadius: 50,
  },
  
  // Disabled state
  disabledCard: {
    opacity: 0.6,
  },
});

export default Card;
