import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import customer screens when they exist
// import HomeScreen from '../screens/customer/HomeScreen';
// import ExploreScreen from '../screens/customer/ExploreScreen';
// import ProfileScreen from '../screens/customer/ProfileScreen';

import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ModernThemeContext';

// Temporary placeholder screens
const HomeScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Home Screen</Text>
    </View>
  );
};

const ExploreScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Explore Screen</Text>
    </View>
  );
};

const ProfileScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Profile Screen</Text>
    </View>
  );
};

export type CustomerTabParamList = {
  Home: undefined;
  Explore: undefined;
  Profile: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerTabs: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: () => null, // Add icon when available
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarIcon: () => null, // Add icon when available
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: () => null, // Add icon when available
        }}
      />
    </Tab.Navigator>
  );
};

const CustomerStack: React.FC = () => {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CustomerStack;