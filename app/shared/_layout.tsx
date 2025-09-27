import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ModernThemeContext';

export default function SharedLayout() {
  const { theme } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        gestureEnabled: true,
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: theme?.colors?.background || '#f5f5f5',
        },
        headerTintColor: theme?.colors?.text || '#000',
        contentStyle: {
          backgroundColor: theme?.colors?.background || '#f5f5f5',
        },
      }}
    >
      <Stack.Screen 
        name="notification-settings" 
        options={{ title: 'Notification Settings' }} 
      />
    </Stack>
  );
}