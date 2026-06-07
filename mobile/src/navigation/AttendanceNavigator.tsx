import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AttendanceStackParamList} from './types';
import ClockInScreen from '../screens/attendance/ClockInScreen';
import WeeklyHoursScreen from '../screens/attendance/WeeklyHoursScreen';

const Stack = createNativeStackNavigator<AttendanceStackParamList>();

export default function AttendanceNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ClockIn" component={ClockInScreen} options={{title: 'Attendance'}} />
      <Stack.Screen name="WeeklyHours" component={WeeklyHoursScreen} options={{title: 'Weekly Hours'}} />
    </Stack.Navigator>
  );
}
