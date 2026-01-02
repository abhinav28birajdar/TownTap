import { Stack } from 'expo-router';

export default function BusinessCustomersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
