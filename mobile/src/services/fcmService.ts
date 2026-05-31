import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import {devicesApi} from '../api/devices';

export const fcmService = {
  async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  },

  async getToken(): Promise<string | null> {
    try {
      return await messaging().getToken();
    } catch {
      return null;
    }
  },

  async registerWithBackend(): Promise<void> {
    const token = await this.getToken();
    if (!token) {
      return;
    }
    const platform = Platform.OS as 'ios' | 'android';
    await devicesApi.registerToken(token, platform);
  },

  onTokenRefresh(callback: (token: string) => void): () => void {
    return messaging().onTokenRefresh(callback);
  },

  onMessage(
    callback: (message: {
      notification?: {title?: string; body?: string};
      data?: Record<string, string>;
    }) => void,
  ): () => void {
    return messaging().onMessage(async remoteMessage => {
      callback({
        notification: remoteMessage.notification,
        data: remoteMessage.data as Record<string, string>,
      });
    });
  },

  setBackgroundMessageHandler(): void {
    messaging().setBackgroundMessageHandler(async () => {});
  },
};
