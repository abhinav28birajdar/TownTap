import { useAuthStore } from '@/lib/stores';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function IndexScreen() {
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on user type
        if (user.user_type === 'customer') {
          router.replace('/(customer)/home');
        } else if (user.user_type === 'business') {
          router.replace('/(business)/dashboard');
        } else {
          router.replace('/welcome');
        }
      } else {
        router.replace('/welcome');
      }
    }
  }, [user, loading]);

  // Show loading screen while determining auth state
  return (
    <View className="flex-1 justify-center items-center bg-primary-500">
      <Text className="text-white text-2xl font-bold">LocalMart</Text>
      <Text className="text-white/80 text-base mt-2">Loading...</Text>
    </View>
  );
}