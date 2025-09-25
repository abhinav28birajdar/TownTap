import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import TabBarBackground from '../../components/ui/TabBarBackground';
import { HapticTab } from '../../src/components/HapticTab';
import { useTheme } from '../../src/context/ModernThemeContext';
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
  const { user, userProfile } = useAuthStore();
  const { theme } = useTheme();
  const isBusinessUser = userProfile?.user_type === 'business_owner';

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
        tabBarActiveTintColor: theme.colors.iconActive,
        tabBarInactiveTintColor: theme.colors.iconInactive,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 68,
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
          ...theme.shadows.small,
        },
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontWeight: '500',
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
