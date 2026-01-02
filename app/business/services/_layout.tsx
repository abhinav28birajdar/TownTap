import { Stack } from 'expo-router';

export default function BusinessServicesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
