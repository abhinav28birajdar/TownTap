import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import PlaceholderScreen from '../components/PlaceholderScreen';
import { COLORS } from '../config/constants';
import { useAuthStore } from '../stores/authStore';

// Existing Screens
import AIContentGeneratorScreen from '../screens/business/AIContentGeneratorScreen';
import SimpleDashboardScreen from '../screens/business/SimpleDashboardScreen';
import SimpleHomeScreen from '../screens/customer/SimpleHomeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab bar icon component
const TabIcon = ({ icon, color }: { icon: string; color: string }) => (
  <Text style={{ fontSize: 24, color }}>{icon}</Text>
);

// Customer Tab Navigator
const CustomerTabs = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[200],
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="CustomerHome"
        component={SimpleHomeScreen}
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="CustomerOrders"
        options={{
          title: t('navigation.orders'),
          tabBarIcon: ({ color }) => <TabIcon icon="📦" color={color} />,
        }}
      >
        {() => <PlaceholderScreen title="Order History" icon="📦" />}
      </Tab.Screen>
      <Tab.Screen
        name="CustomerAI"
        options={{
          title: t('navigation.aiAssistant'),
          tabBarIcon: ({ color }) => <TabIcon icon="🤖" color={color} />,
        }}
      >
        {() => <PlaceholderScreen title="AI Assistant" icon="🤖" />}
      </Tab.Screen>
      <Tab.Screen
        name="CustomerProfile"
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      >
        {() => <PlaceholderScreen title="Profile" icon="👤" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// Business Tab Navigator
const BusinessTabs = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[200],
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="BusinessDashboard"
        component={SimpleDashboardScreen}
        options={{
          title: t('navigation.dashboard'),
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
        }}
      />
      <Tab.Screen
        name="BusinessOrders"
        options={{
          title: t('navigation.orders'),
          tabBarIcon: ({ color }) => <TabIcon icon="📦" color={color} />,
        }}
      >
        {() => <PlaceholderScreen title="Order Management" icon="📦" />}
      </Tab.Screen>
      <Tab.Screen
        name="BusinessAI"
        component={AIContentGeneratorScreen}
        options={{
          title: t('navigation.aiContent'),
          tabBarIcon: ({ color }) => <TabIcon icon="✨" color={color} />,
        }}
      />
      <Tab.Screen
        name="BusinessAnalytics"
        options={{
          title: t('navigation.analytics'),
          tabBarIcon: ({ color }) => <TabIcon icon="📈" color={color} />,
        }}
      >
        {() => <PlaceholderScreen title="Analytics" icon="📈" />}
      </Tab.Screen>
      <Tab.Screen
        name="BusinessProfile"
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      >
        {() => <PlaceholderScreen title="Business Profile" icon="👤" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DemoLogin" component={DemoLoginScreen} />
    </Stack.Navigator>
  );
};

// Main App Stack Navigator
const AppStack = () => {
  const { user } = useAuthStore();
  
  const isBusinessUser = user?.profile?.user_type === 'business_owner';
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={isBusinessUser ? BusinessTabs : CustomerTabs} 
      />
    </Stack.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const { user } = useAuthStore();
  
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
