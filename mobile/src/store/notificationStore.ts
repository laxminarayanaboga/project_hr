import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';

const PREFS_KEY = 'hrapp_notification_prefs';

export interface NotificationPreferences {
  leaveApproved: boolean;
  leaveRejected: boolean;
  leaveSubmitted: boolean;
  reviewReminders: boolean;
}

const defaults: NotificationPreferences = {
  leaveApproved: true,
  leaveRejected: true,
  leaveSubmitted: true,
  reviewReminders: true,
};

interface NotificationState {
  prefs: NotificationPreferences;
  load: () => Promise<void>;
  update: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>(set => ({
  prefs: defaults,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      if (raw) {
        set({prefs: {...defaults, ...JSON.parse(raw)}});
      }
    } catch {}
  },

  update: async newPrefs => {
    set(state => {
      const merged = {...state.prefs, ...newPrefs};
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(merged)).catch(() => {});
      return {prefs: merged};
    });
  },
}));
