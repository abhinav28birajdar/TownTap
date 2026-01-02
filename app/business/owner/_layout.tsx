import { Stack } from 'expo-router';

export default function BusinessOwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
