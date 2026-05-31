jest.mock('react-native-biometrics', () => {
  const isSensorAvailable = jest.fn();
  const simplePrompt = jest.fn();
  const MockClass = jest.fn().mockImplementation(() => ({
    isSensorAvailable,
    simplePrompt,
  }));
  (MockClass as any).__isSensorAvailable = isSensorAvailable;
  (MockClass as any).__simplePrompt = simplePrompt;
  return {
    __esModule: true,
    default: MockClass,
    BiometryTypes: {
      FaceID: 'FaceID',
      TouchID: 'TouchID',
      Biometrics: 'Biometrics',
    },
  };
});

import ReactNativeBiometrics from 'react-native-biometrics';
import {biometricService} from '../../src/services/biometricService';

const MockRNB = ReactNativeBiometrics as jest.MockedClass<typeof ReactNativeBiometrics>;
const getInstance = () => MockRNB.mock.results[0]?.value as {
  isSensorAvailable: jest.Mock;
  simplePrompt: jest.Mock;
};

describe('biometricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockRNB.mockClear();
  });

  describe('isAvailable', () => {
    it('returns true when sensor available', async () => {
      MockRNB.mockImplementationOnce(() => ({
        isSensorAvailable: jest.fn().mockResolvedValue({available: true, biometryType: 'FaceID'}),
        simplePrompt: jest.fn(),
        getBiometryType: jest.fn(),
        createKeys: jest.fn(),
        biometricKeysExist: jest.fn(),
        deleteKeys: jest.fn(),
        createSignature: jest.fn(),
      }));
      expect(await biometricService.isAvailable()).toBe(true);
    });

    it('returns false when sensor not available', async () => {
      MockRNB.mockImplementationOnce(() => ({
        isSensorAvailable: jest.fn().mockResolvedValue({available: false}),
        simplePrompt: jest.fn(),
        getBiometryType: jest.fn(),
        createKeys: jest.fn(),
        biometricKeysExist: jest.fn(),
        deleteKeys: jest.fn(),
        createSignature: jest.fn(),
      }));
      expect(await biometricService.isAvailable()).toBe(false);
    });
  });

  describe('getFriendlyName', () => {
    it('returns Face ID label', () => {
      expect(biometricService.getFriendlyName('FaceID')).toBe('Face ID');
    });

    it('returns Touch ID label', () => {
      expect(biometricService.getFriendlyName('TouchID')).toBe('Touch ID');
    });

    it('returns Fingerprint for generic biometrics', () => {
      expect(biometricService.getFriendlyName('Biometrics')).toBe('Fingerprint');
    });

    it('returns generic label for null', () => {
      expect(biometricService.getFriendlyName(null)).toBe('Biometrics');
    });
  });
});
