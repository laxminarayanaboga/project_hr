import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Directory: undefined;
  Leave: undefined;
  Attendance: undefined;
  Settings: undefined;
};

export type DirectoryStackParamList = {
  EmployeeList: undefined;
  EmployeeProfile: {employeeId: string};
};

export type LeaveStackParamList = {
  LeaveDashboard: undefined;
  LeaveRequest: undefined;
  MyLeaveHistory: undefined;
  LeaveApprovalQueue: undefined;
  TeamLeaveCalendar: undefined;
};

export type AttendanceStackParamList = {
  ClockIn: undefined;
  WeeklyHours: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  NotificationPreferences: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type EmployeeListScreenProps = NativeStackScreenProps<DirectoryStackParamList, 'EmployeeList'>;
export type EmployeeProfileScreenProps = NativeStackScreenProps<DirectoryStackParamList, 'EmployeeProfile'>;
export type LeaveRequestScreenProps = NativeStackScreenProps<LeaveStackParamList, 'LeaveRequest'>;
export type MainTabProps = BottomTabScreenProps<MainTabParamList>;
