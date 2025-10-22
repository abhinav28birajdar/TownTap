import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useAuthStore } from '@/lib/stores';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function BusinessDashboardScreen() {
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-primary-500">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-base">Welcome back,</Text>
              <Text className="text-white text-xl font-bold">{user?.name}</Text>
              <Text className="text-white/80 text-sm">Business Owner</Text>
            </View>
            <View className="flex-row space-x-3">
              <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <Ionicons name="notifications" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSignOut}
                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
              >
                <Ionicons name="log-out" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Business Status */}
        <View className="px-6 py-4 bg-primary-500">
          <View className="bg-white/10 rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-base font-semibold">Business Status</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-success-400 rounded-full mr-2" />
                <Text className="text-white text-sm">Online</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-white/20 rounded-lg px-4 py-2 mt-3 self-start">
              <Text className="text-white text-sm font-medium">Go Offline</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Today's Overview</Text>
          <View className="flex-row justify-between">
            <View className="flex-1 bg-gray-50 rounded-xl p-4 mr-2">
              <Text className="text-2xl font-bold text-gray-800">12</Text>
              <Text className="text-sm text-gray-600">New Orders</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-xl p-4 mx-1">
              <Text className="text-2xl font-bold text-gray-800">₹2,450</Text>
              <Text className="text-sm text-gray-600">Revenue</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-xl p-4 ml-2">
              <Text className="text-2xl font-bold text-gray-800">8</Text>
              <Text className="text-sm text-gray-600">Pending</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            {[
              { name: 'New Order', icon: 'add-circle', color: '#22C55E' },
              { name: 'Inventory', icon: 'cube', color: '#F59E0B' },
              { name: 'Analytics', icon: 'bar-chart', color: '#8B5CF6' },
              { name: 'Customers', icon: 'people', color: '#EC4899' },
              { name: 'Marketing', icon: 'megaphone', color: '#06B6D4' },
              { name: 'Settings', icon: 'settings', color: '#6B7280' },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                className="w-28 items-center mb-4"
                activeOpacity={0.7}
              >
                <View
                  className="w-16 h-16 rounded-xl items-center justify-center mb-2"
                  style={{ backgroundColor: action.color + '20' }}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text className="text-xs text-gray-600 text-center">
                  {action.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Recent Activity</Text>
          {[1, 2, 3].map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row bg-gray-50 rounded-xl p-4 mb-3"
              activeOpacity={0.8}
            >
              <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center">
                <Ionicons name="receipt" size={20} color="#0EA5E9" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-gray-800 mb-1">
                  New order #ORD{1000 + item}
                </Text>
                <Text className="text-sm text-gray-600 mb-2">
                  Customer ordered 3 items • ₹450
                </Text>
                <Text className="text-xs text-gray-500">2 minutes ago</Text>
              </View>
              <View className="items-end justify-center">
                <View className="bg-warning-100 px-2 py-1 rounded-lg">
                  <Text className="text-warning-700 text-xs font-medium">Pending</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}