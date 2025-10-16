/**
 * FILE: src/components/ui/LoadingSpinner.tsx
 * PURPOSE: Reusable loading spinner component to reduce duplication
 * RESPONSIBILITIES: Provide consistent loading states across the app
 */

import React from 'react';
import { 
  View, 
  ActivityIndicator, 
  Text, 
  StyleSheet,
  ViewStyle 
} from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#007AFF',
  text,
  fullScreen = false,
  style,
}) => {
  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  return (
    <View style={[containerStyle, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoadingSpinner;