import { Stack } from 'expo-router';

export default function BusinessOwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="dashboard" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="notifications" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="profile" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="add-product" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="add-service" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="orders" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="services" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="analytics" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="customers" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="customer-details" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="order-details" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="earnings" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="revenue-reports" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="calendar" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="pricing-management" 
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="service-categories" 
        options={{
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
