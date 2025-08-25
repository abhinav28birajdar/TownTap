// FILE: src/navigation/AuthStack.tsx
// PURPOSE: Authentication flow navigation

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Auth screens
import AuthScreen from '../screens/auth/AuthScreen';
import CategorySelectionScreen from '../screens/auth/CategorySelectionScreen';
import DemoLoginScreen from '../screens/auth/DemoLoginScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Navigation types
import { AuthStackParamList } from '../types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="AuthLanding"
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
        name="AuthLanding" 
        options={{ headerShown: false }}
      >
        {(props) => <AuthScreen {...props} userType="customer" onClose={() => {}} />}
      </Stack.Screen>
      
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ 
          title: t.auth.signIn,
          headerBackTitle: t.common.back,
        }}
      />
      
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ 
          title: t.auth.createAccount,
          headerBackTitle: t.common.back,
        }}
      />
      
      <Stack.Screen 
        name="CategorySelection" 
        component={CategorySelectionScreen}
        options={{ 
          title: t.auth.chooseRole,
          headerBackTitle: t.common.back,
        }}
      />
      
      <Stack.Screen 
        name="DemoLogin" 
        component={DemoLoginScreen}
        options={{ 
          title: t.auth.demoLogin,
          headerBackTitle: t.common.back,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
