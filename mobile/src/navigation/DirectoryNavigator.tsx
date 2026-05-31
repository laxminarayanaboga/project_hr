import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {DirectoryStackParamList} from './types';
import EmployeeListScreen from '../screens/employees/EmployeeListScreen';
import EmployeeProfileScreen from '../screens/employees/EmployeeProfileScreen';

const Stack = createNativeStackNavigator<DirectoryStackParamList>();

export default function DirectoryNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EmployeeList" component={EmployeeListScreen} options={{title: 'Directory'}} />
      <Stack.Screen name="EmployeeProfile" component={EmployeeProfileScreen} options={{title: 'Profile'}} />
    </Stack.Navigator>
  );
}
