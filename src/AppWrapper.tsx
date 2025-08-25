// FILE: src/AppWrapper.tsx
// PURPOSE: Renders global context providers & RootNavigator

import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NativeBaseProvider } from 'native-base';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import { ThemeProvider } from './context/ThemeContext';

// Navigation
import RootNavigator from './navigation';

// Theme
import { theme } from './config/theme';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function AppWrapper() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <NativeBaseProvider theme={theme}>
            <ThemeProvider>
              <LanguageProvider>
                <AuthProvider>
                  <LocationProvider>
                    <CartProvider>
                      <NavigationContainer>
                        <RootNavigator />
                      </NavigationContainer>
                    </CartProvider>
                  </LocationProvider>
                </AuthProvider>
              </LanguageProvider>
            </ThemeProvider>
          </NativeBaseProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
