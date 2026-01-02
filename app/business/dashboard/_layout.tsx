import { Stack } from 'expo-router';

export default function BusinessDashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
