import { Stack } from 'expo-router';

export default function CustomerCategoriesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
