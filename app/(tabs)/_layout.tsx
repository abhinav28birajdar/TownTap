import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuthStore } from '../../src/stores/authStore';

// Centered icon component with proper alignment and theme support
const TabIcon = ({ name, color, size = 24 }: { name: any; color: string; size?: number }) => (
  <View style={{ 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 32,
    height: 32,
  }}>
    <Ionicons name={name} size={size} color={color} />
  </View>
);

export default function TabLayout() {
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const isBusinessUser = user?.profile?.user_type === 'business_owner';

  // Customer Tabs
  const customerTabs = [
    {
      name: 'index',
      title: 'Home',
      icon: 'home',
    },
    {
      name: 'explore',
      title: 'Explore',
      icon: 'search',
    },
    {
      name: 'orders',
      title: 'My Orders',
      icon: 'bag',
    },
    {
      name: 'profile',
      title: 'Profile',
      icon: 'person',
    },
  ];

  // Business Owner Tabs
  const businessTabs = [
    {
      name: 'index',
      title: 'Dashboard',
      icon: 'analytics',
    },
    {
      name: 'explore',
      title: 'Customers',
      icon: 'people',
    },
    {
      name: 'orders',
      title: 'Orders',
      icon: 'receipt',
    },
    {
      name: 'profile',
      title: 'Profile',
      icon: 'person',
    },
  ];

  const tabs = isBusinessUser ? businessTabs : customerTabs;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.iconActive,
        tabBarInactiveTintColor: theme.icon,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 80 : 60,
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
      }}>
      
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => (
              <TabIcon name={tab.icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
