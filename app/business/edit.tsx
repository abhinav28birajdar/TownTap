import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function BusinessEdit() {
  const router = useRouter();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Business Edit Screen</Text>
      <Text>This screen is under development</Text>
    </View>
  );
}