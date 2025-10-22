import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl font-bold text-gray-800">Chats</Text>
        <Text className="text-gray-600 mt-2">Your conversations will appear here</Text>
      </View>
    </SafeAreaView>
  );
}