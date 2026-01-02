import { Stack } from 'expo-router';

export default function BusinessPhotosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
