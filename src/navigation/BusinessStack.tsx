// FILE: src/navigation/BusinessStack.tsx
// PURPOSE: Business app navigation with tabs and business management screens

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Business screens
import AIContentGeneratorScreen from '../screens/business/AIContentGeneratorScreen';
import AnalyticsScreen from '../screens/business/AnalyticsScreen';
import BusinessDashboardScreen from '../screens/business/BusinessDashboardScreen';
import BusinessOrdersScreen from '../screens/business/BusinessOrdersScreen';
import BusinessProductsScreen from '../screens/business/BusinessProductsScreen';
import BusinessProfileScreen from '../screens/business/BusinessProfileScreen';

// Navigation types
import { BusinessStackParamList, BusinessTabParamList } from '../types';

const Stack = createNativeStackNavigator<BusinessStackParamList>();
const Tab = createBottomTabNavigator<BusinessTabParamList>();

// Business Tab Navigator
const BusinessTabs: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'speedometer' : 'speedometer-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Products':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'business' : 'business-outline';
              break;
            default:
              iconName = 'speedometer-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 },
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={BusinessDashboardScreen} 
        options={{ 
          title: t.navigation.dashboard,
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={BusinessOrdersScreen} 
        options={{ 
          title: t.navigation.orders,
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={BusinessProductsScreen} 
        options={{ 
          title: t.navigation.products,
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ 
          title: t.navigation.analytics,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={BusinessProfileScreen} 
        options={{ 
          title: t.navigation.profile,
        }}
      />
    </Tab.Navigator>
  );
};

// Business Stack Navigator
const BusinessStack: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="BusinessTabs" 
        component={BusinessTabs} 
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="AIContentGenerator" 
        component={AIContentGeneratorScreen}
        options={{ 
          title: t.screens.aiContentGenerator,
          headerBackTitle: t.common.back,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default BusinessStack;
