import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar} from 'react-native';
import RNBootSplash from 'react-native-bootsplash';

// Context Providers
import {ThemeProvider} from './context/ModernThemeContext';

// Stores
import {useAuthStore} from './stores/authStore';

// Navigation
import AppNavigator from './navigation/AppNavigator';

const Stack = createNativeStackNavigator();

const App = () => {
  const {initialize} = useAuthStore();

  useEffect(() => {
    const init = async () => {
      // Initialize auth store
      await initialize();
      
      // Hide splash screen
      await RNBootSplash.hide({fade: true});
    };

    init();
  }, [initialize]);

  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;