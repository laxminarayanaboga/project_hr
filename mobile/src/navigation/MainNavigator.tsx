import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {MainTabParamList} from './types';
import DirectoryNavigator from './DirectoryNavigator';
import LeaveNavigator from './LeaveNavigator';
import AttendanceNavigator from './AttendanceNavigator';
import SettingsNavigator from './SettingsNavigator';
import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const icon = (label: string) =>
  ({tabBarIcon: () => <Text>{label}</Text>} as const);

export default function MainNavigator() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home" component={HomeScreen} {...icon('🏠')} />
      <Tab.Screen name="Directory" component={DirectoryNavigator} {...icon('👥')} />
      <Tab.Screen name="Leave" component={LeaveNavigator} {...icon('📅')} />
      <Tab.Screen name="Attendance" component={AttendanceNavigator} {...icon('⏱️')} />
      <Tab.Screen name="Settings" component={SettingsNavigator} {...icon('⚙️')} />
    </Tab.Navigator>
  );
}
