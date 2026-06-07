import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar, LogBox} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Firebase initialises at startup and emits non-actionable warnings in dev
LogBox.ignoreLogs([
  'firebase',
  'Firebase',
  '@firebase',
  'RNFBMessaging',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
