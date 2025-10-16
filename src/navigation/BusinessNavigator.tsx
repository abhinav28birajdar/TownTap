import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import BusinessDashboardScreen from '../screens/business/BusinessDashboardScreen';
import BusinessRegistrationScreen from '../screens/business/BusinessRegistrationScreen';

const Stack = createNativeStackNavigator();

const BusinessNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Dashboard" component={BusinessDashboardScreen} />
      <Stack.Screen name="Registration" component={BusinessRegistrationScreen} />
    </Stack.Navigator>
  );
};

export default BusinessNavigator;