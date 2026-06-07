import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View} from 'react-native';
import {RootStackParamList} from './types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import {useAuthStore} from '../store/authStore';
import {fcmService} from '../services/fcmService';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const {isAuthenticated, isLoading, restoreSession} = useAuthStore();

  useEffect(() => {
    restoreSession();
    fcmService.setBackgroundMessageHandler();
  }, [restoreSession]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fcmService.requestPermission().then(granted => {
      if (granted) {
        fcmService.registerWithBackend().catch(() => {});
      }
    });
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
