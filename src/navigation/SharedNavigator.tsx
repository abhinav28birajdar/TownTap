import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import NotificationSettingsScreen from '../screens/shared/NotificationSettingsScreen';

const Stack = createNativeStackNavigator();

const SharedNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{title: 'Notification Settings'}}
      />
    </Stack.Navigator>
  );
};

export default SharedNavigator;