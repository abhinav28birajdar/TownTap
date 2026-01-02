import { Stack } from 'expo-router';

export default function CustomerBookingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
