import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import CustomerTabNavigator from './CustomerTabNavigator';
import BusinessNavigator from './BusinessNavigator';
import SharedNavigator from './SharedNavigator';

// Store
import {useAuthStore} from '../stores/authStore';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const {user, hasCompletedOnboarding} = useAuthStore();

  // If user hasn't completed onboarding, show onboarding
  if (!hasCompletedOnboarding) {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }

  // If user is not authenticated, show auth screens
  if (!user) {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    );
  }

  // Main app navigation based on user type
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
      <Stack.Screen name="Business" component={BusinessNavigator} />
      <Stack.Screen name="Shared" component={SharedNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;