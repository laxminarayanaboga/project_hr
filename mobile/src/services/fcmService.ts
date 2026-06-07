import {Platform} from 'react-native';
import {devicesApi} from '../api/devices';

const getMessaging = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-firebase/messaging').default;
  } catch {
    return null;
  }
};

const isFirebaseAvailable = (): boolean => {
  try {
    const m = getMessaging();
    if (!m) {
      return false;
    }
    m(); // triggers initialization check
    return true;
  } catch {
    return false;
  }
};

export const fcmService = {
  async requestPermission(): Promise<boolean> {
    try {
      const messaging = getMessaging();
      if (!messaging) {
        return false;
      }
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch {
      return false;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const messaging = getMessaging();
      if (!messaging) {
        return null;
      }
      return await messaging().getToken();
    } catch {
      return null;
    }
  },

  async registerWithBackend(): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) {
        return;
      }
      const platform = Platform.OS as 'ios' | 'android';
      await devicesApi.registerToken(token, platform);
    } catch {
      // Non-fatal — FCM not configured yet
    }
  },

  onTokenRefresh(callback: (token: string) => void): () => void {
    try {
      const messaging = getMessaging();
      if (!messaging) {
        return () => {};
      }
      return messaging().onTokenRefresh(callback);
    } catch {
      return () => {};
    }
  },

  onMessage(
    callback: (message: {
      notification?: {title?: string; body?: string};
      data?: Record<string, string>;
    }) => void,
  ): () => void {
    try {
      const messaging = getMessaging();
      if (!messaging) {
        return () => {};
      }
      return messaging().onMessage(async (remoteMessage: any) => {
        callback({
          notification: remoteMessage.notification,
          data: remoteMessage.data as Record<string, string>,
        });
      });
    } catch {
      return () => {};
    }
  },

  setBackgroundMessageHandler(): void {
    try {
      const messaging = getMessaging();
      if (!messaging) {
        return;
      }
      messaging().setBackgroundMessageHandler(async () => {});
    } catch {
      // Firebase not configured — skip
    }
  },
};
