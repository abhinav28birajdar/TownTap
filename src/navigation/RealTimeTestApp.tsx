import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import { ModernThemeProvider, useTheme } from '../context/ModernThemeContext';
import RealTimeHomeScreen from '../screens/customer/RealTimeHomeScreen';

const Tab = createBottomTabNavigator();

const TabNavigatorContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'RealTimeHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="RealTimeHome"
        component={RealTimeHomeScreen}
        options={{
          title: 'Real-time Discovery',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Search"
        component={() => (
          <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <text>Search Screen - Coming Soon</text>
          </div>
        )}
        options={{
          title: 'Search',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={() => (
          <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <text>Profile Screen - Coming Soon</text>
          </div>
        )}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const RealTimeTestApp: React.FC = () => {
  return (
    <ModernThemeProvider>
      <NavigationContainer>
        <TabNavigatorContent />
      </NavigationContainer>
    </ModernThemeProvider>
  );
};

export default RealTimeTestApp;
