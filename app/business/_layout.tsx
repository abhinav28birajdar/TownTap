import { Stack } from 'expo-router';

export default function BusinessLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
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
    </Stack>
  );
}