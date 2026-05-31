import {create} from 'zustand';
import {User} from '../types';
import {tokenStorage} from '../services/tokenStorage';
import {authApi} from '../api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const response = await authApi.login(email, password);
    const {tokens, user} = response.data.data;
    await tokenStorage.saveTokens(tokens.accessToken, tokens.refreshToken);
    set({user, isAuthenticated: true});
  },

  logout: async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      await tokenStorage.clearTokens();
      set({user: null, isAuthenticated: false});
    }
  },

  restoreSession: async () => {
    set({isLoading: true});
    try {
      const accessToken = await tokenStorage.getAccessToken();
      if (!accessToken) {
        set({isAuthenticated: false, isLoading: false});
        return;
      }
      const response = await authApi.me();
      set({user: response.data.data, isAuthenticated: true});
    } catch {
      await tokenStorage.clearTokens();
      set({user: null, isAuthenticated: false});
    } finally {
      set({isLoading: false});
    }
    get; // satisfy linter
  },
}));
