jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

import * as Keychain from 'react-native-keychain';
import {tokenStorage} from '../../src/services/tokenStorage';

const mockKeychain = Keychain as jest.Mocked<typeof Keychain>;

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveTokens', () => {
    it('saves both access and refresh tokens to keychain', async () => {
      await tokenStorage.saveTokens('access123', 'refresh456');
      expect(mockKeychain.setGenericPassword).toHaveBeenCalledTimes(2);
      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        'hrapp_access_token',
        'access123',
        {service: 'hrapp_access_token'},
      );
      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        'hrapp_refresh_token',
        'refresh456',
        {service: 'hrapp_refresh_token'},
      );
    });
  });

  describe('getAccessToken', () => {
    it('returns access token when stored', async () => {
      mockKeychain.getGenericPassword.mockResolvedValueOnce({
        username: 'hrapp_access_token',
        password: 'access123',
        service: 'hrapp_access_token',
        storage: '',
      });
      const result = await tokenStorage.getAccessToken();
      expect(result).toBe('access123');
    });

    it('returns null when not stored', async () => {
      mockKeychain.getGenericPassword.mockResolvedValueOnce(false);
      const result = await tokenStorage.getAccessToken();
      expect(result).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('returns refresh token when stored', async () => {
      mockKeychain.getGenericPassword.mockResolvedValueOnce({
        username: 'hrapp_refresh_token',
        password: 'refresh456',
        service: 'hrapp_refresh_token',
        storage: '',
      });
      const result = await tokenStorage.getRefreshToken();
      expect(result).toBe('refresh456');
    });
  });

  describe('clearTokens', () => {
    it('clears both tokens from keychain', async () => {
      await tokenStorage.clearTokens();
      expect(mockKeychain.resetGenericPassword).toHaveBeenCalledTimes(2);
    });
  });
});
