import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LeaveStackParamList} from './types';
import LeaveDashboardScreen from '../screens/leave/LeaveDashboardScreen';
import LeaveRequestScreen from '../screens/leave/LeaveRequestScreen';
import MyLeaveHistoryScreen from '../screens/leave/MyLeaveHistoryScreen';
import LeaveApprovalQueueScreen from '../screens/leave/LeaveApprovalQueueScreen';
import TeamLeaveCalendarScreen from '../screens/leave/TeamLeaveCalendarScreen';

const Stack = createNativeStackNavigator<LeaveStackParamList>();

export default function LeaveNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LeaveDashboard" component={LeaveDashboardScreen} options={{title: 'Leave'}} />
      <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} options={{title: 'Request Leave'}} />
      <Stack.Screen name="MyLeaveHistory" component={MyLeaveHistoryScreen} options={{title: 'My Leave History'}} />
      <Stack.Screen name="LeaveApprovalQueue" component={LeaveApprovalQueueScreen} options={{title: 'Approval Queue'}} />
      <Stack.Screen name="TeamLeaveCalendar" component={TeamLeaveCalendarScreen} options={{title: 'Team Calendar'}} />
    </Stack.Navigator>
  );
}
