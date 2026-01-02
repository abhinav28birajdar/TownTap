import { Stack } from 'expo-router';

export default function BusinessMessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
