import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, PressableProps } from 'react-native';

interface HapticTabProps extends PressableProps {
  children: React.ReactNode;
}

export const HapticTab: React.FC<HapticTabProps> = ({ children, onPress, ...props }) => {
  const handlePress = (event: any) => {
    // Trigger haptic feedback on tab press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <Pressable onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
};