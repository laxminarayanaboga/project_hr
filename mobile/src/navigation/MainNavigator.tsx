import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {MainTabParamList} from './types';
import DirectoryNavigator from './DirectoryNavigator';
import LeaveNavigator from './LeaveNavigator';
import AttendanceNavigator from './AttendanceNavigator';
import SettingsNavigator from './SettingsNavigator';
import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG: Record<string, {emoji: string; label: string}> = {
  Home:       {emoji: '🏠', label: 'Home'},
  Directory:  {emoji: '👥', label: 'Directory'},
  Leave:      {emoji: '📅', label: 'Leave'},
  Attendance: {emoji: '⏱️', label: 'Attendance'},
  Settings:   {emoji: '⚙️', label: 'Settings'},
};

function CustomTabBar({state, navigation}: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const {emoji, label} = TAB_CONFIG[route.name] ?? {emoji: '●', label: route.name};

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}>
            <Text allowFontScaling={false} style={styles.emoji}>{emoji}</Text>
            <Text
              allowFontScaling={false}
              style={[styles.label, {color: focused ? '#4361ee' : '#8e8e93'}]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    height: 72,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {fontSize: 24},
  label: {fontSize: 10, marginTop: 3, fontWeight: '500'},
});

export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Directory" component={DirectoryNavigator} />
      <Tab.Screen name="Leave" component={LeaveNavigator} />
      <Tab.Screen name="Attendance" component={AttendanceNavigator} />
      <Tab.Screen name="Settings" component={SettingsNavigator} />
    </Tab.Navigator>
  );
}
