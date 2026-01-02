import { Stack } from 'expo-router';

export default function CustomerMessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
