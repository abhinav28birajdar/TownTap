import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ title: 'Welcome' }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ title: 'Sign In' }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ title: 'Sign Up' }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ title: 'Reset Password' }} 
      />
    </Stack>
  );
}