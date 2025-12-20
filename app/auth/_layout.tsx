import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="sign-in" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="sign-up" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="role-selection" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="reset-password" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="otp-verification" 
        options={{
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
