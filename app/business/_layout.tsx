import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ModernThemeContext';

export default function BusinessLayout() {
  const { theme } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme?.colors?.background || '#f5f5f5',
        },
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{ title: 'Business Dashboard' }} 
      />
      <Stack.Screen 
        name="registration" 
        options={{ title: 'Create Business' }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ title: 'Edit Business' }} 
      />
      <Stack.Screen 
        name="analytics" 
        options={{ title: 'Analytics' }} 
      />
      <Stack.Screen 
        name="orders" 
        options={{ title: 'Orders' }} 
      />
      <Stack.Screen 
        name="reviews" 
        options={{ title: 'Reviews' }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ title: 'Business Profile' }} 
      />
      <Stack.Screen 
        name="service-settings" 
        options={{ title: 'Service Settings' }} 
      />
      <Stack.Screen 
        name="hours" 
        options={{ title: 'Business Hours' }} 
      />
      <Stack.Screen 
        name="payment-settings" 
        options={{ title: 'Payment Settings' }} 
      />
    </Stack>
  );
}