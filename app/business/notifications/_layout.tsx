import { Stack } from 'expo-router';

export default function BusinessNotificationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
