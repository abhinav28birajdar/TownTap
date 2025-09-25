import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ModernThemeContext';
import { AuthStackParamList } from '../types';

// Import auth screens
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import DemoLoginScreen from '../screens/auth/DemoLoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="AuthLanding"
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
        name="AuthLanding" 
        component={AuthLandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ title: 'Reset Password' }}
      />
      <Stack.Screen 
        name="DemoLogin" 
        component={DemoLoginScreen}
        options={{ title: 'Demo Accounts' }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;