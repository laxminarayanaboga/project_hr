import {apiClient} from './client';
import {ApiResponse, AuthTokens, User} from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<AuthTokens & {user: User}>>(
      '/auth/login',
      {email, password},
    ),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', {refreshToken}),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', {refreshToken}),

  me: () => apiClient.get<ApiResponse<User>>('/auth/me'),
};
