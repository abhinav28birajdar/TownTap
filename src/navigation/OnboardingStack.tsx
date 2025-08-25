// FILE: src/navigation/OnboardingStack.tsx
// PURPOSE: Onboarding flow for new users

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Onboarding screens
import ModernOnboardingScreen from '../screens/onboarding/ModernOnboardingScreen';

// Navigation types
import { OnboardingStackParamList } from '../types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingStack: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="OnboardingWelcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="OnboardingWelcome" 
        component={ModernOnboardingScreen as React.ComponentType<any>}
      />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
