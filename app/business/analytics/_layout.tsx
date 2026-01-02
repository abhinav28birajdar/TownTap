import { Stack } from 'expo-router';

export default function BusinessAnalyticsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
