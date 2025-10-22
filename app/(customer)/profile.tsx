import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useAuthStore } from '@/lib/stores';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/welcome');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const profileItems = [
    { title: 'Personal Information', icon: 'person', route: '/profile/personal' },
    { title: 'Addresses', icon: 'location', route: '/profile/addresses' },
    { title: 'Payment Methods', icon: 'card', route: '/profile/payments' },
    { title: 'Wallet', icon: 'wallet', route: '/profile/wallet' },
    { title: 'Notifications', icon: 'notifications', route: '/profile/notifications' },
    { title: 'Settings', icon: 'settings', route: '/profile/settings' },
    { title: 'Help & Support', icon: 'help-circle', route: '/profile/help' },
    { title: 'About', icon: 'information-circle', route: '/profile/about' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-8 bg-primary-500">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
              <Ionicons name="person" size={32} color="white" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-white text-xl font-bold">{user?.name}</Text>
              <Text className="text-white/80 text-base">{user?.email}</Text>
              <Text className="text-white/80 text-sm">{user?.phone}</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Items */}
        <View className="px-6 py-4">
          {profileItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center py-4 border-b border-gray-100"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name={item.icon as any} size={20} color="#6B7280" />
              </View>
              <Text className="flex-1 ml-4 text-gray-800 text-base">
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <View className="px-6 py-4">
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center py-4"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
              <Ionicons name="log-out" size={20} color="#EF4444" />
            </View>
            <Text className="flex-1 ml-4 text-red-500 text-base font-medium">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}