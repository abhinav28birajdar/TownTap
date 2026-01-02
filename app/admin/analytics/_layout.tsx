import { Stack } from 'expo-router';

export default function AdminAnalyticsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
