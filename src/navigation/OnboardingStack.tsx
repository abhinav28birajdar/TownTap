import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import onboarding screens when they exist
// import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
// import UserTypeSelectionScreen from '../screens/onboarding/UserTypeSelectionScreen';
// import PersonalInfoScreen from '../screens/onboarding/PersonalInfoScreen';

import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ModernThemeContext';

// Temporary placeholder screens
const WelcomeScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Welcome Screen</Text>
    </View>
  );
};

const UserTypeSelectionScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>User Type Selection</Text>
    </View>
  );
};

const PersonalInfoScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Personal Info Screen</Text>
    </View>
  );
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  UserTypeSelection: undefined;
  PersonalInfo: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{ title: 'Welcome to TownTap' }}
      />
      <Stack.Screen 
        name="UserTypeSelection" 
        component={UserTypeSelectionScreen}
        options={{ title: 'Choose Account Type' }}
      />
      <Stack.Screen 
        name="PersonalInfo" 
        component={PersonalInfoScreen}
        options={{ title: 'Personal Information' }}
      />
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

export default OnboardingStack;