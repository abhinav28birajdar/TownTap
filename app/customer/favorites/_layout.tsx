import { Stack } from 'expo-router';

export default function CustomerFavoritesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
