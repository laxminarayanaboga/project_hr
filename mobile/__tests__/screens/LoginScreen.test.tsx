jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));
jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn().mockResolvedValue({available: false}),
    simplePrompt: jest.fn(),
  })),
  BiometryTypes: {FaceID: 'FaceID', TouchID: 'TouchID', Biometrics: 'Biometrics'},
}));
jest.mock('react-native-config', () => ({API_BASE_URL: 'http://localhost:8080/api/v1'}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
}));

const mockLogin = jest.fn();
jest.mock('../../src/store/authStore', () => ({
  useAuthStore: () => ({login: mockLogin}),
}));

import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import LoginScreen from '../../src/screens/auth/LoginScreen';

describe('LoginScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders email and password inputs', () => {
    const {getByTestId} = render(<LoginScreen />);
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
  });

  it('shows alert when fields are empty', async () => {
    const {getByTestId} = render(<LoginScreen />);
    fireEvent.press(getByTestId('login-button'));
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login with email and password', async () => {
    mockLogin.mockResolvedValue(undefined);
    const {getByTestId} = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows no biometric button when biometrics unavailable', () => {
    const {queryByTestId} = render(<LoginScreen />);
    expect(queryByTestId('biometric-button')).toBeNull();
  });
});
