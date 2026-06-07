import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SettingsStackParamList} from './types';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationPreferencesScreen from '../screens/notifications/NotificationPreferencesScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{title: 'Settings'}} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{title: 'Notifications'}} />
    </Stack.Navigator>
  );
}
