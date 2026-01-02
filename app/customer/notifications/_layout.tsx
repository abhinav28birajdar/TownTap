import { Stack } from 'expo-router';

export default function CustomerNotificationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
