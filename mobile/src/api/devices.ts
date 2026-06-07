import {apiClient} from './client';

export const devicesApi = {
  registerToken: (fcmToken: string, platform: 'ios' | 'android') =>
    apiClient.post('/devices/register-token', {fcmToken, platform}),

  unregisterToken: (fcmToken: string) =>
    apiClient.delete('/devices/register-token', {data: {fcmToken}}),
};
