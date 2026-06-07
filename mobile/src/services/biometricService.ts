import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';

export const biometricService = {
  async isAvailable(): Promise<boolean> {
    const {available} = await new ReactNativeBiometrics().isSensorAvailable();
    return available;
  },

  async getBiometryType(): Promise<string | null> {
    const {biometryType} = await new ReactNativeBiometrics().isSensorAvailable();
    return biometryType ?? null;
  },

  async authenticate(promptMessage: string): Promise<boolean> {
    const {success} = await new ReactNativeBiometrics().simplePrompt({promptMessage});
    return success;
  },

  getFriendlyName(biometryType: string | null): string {
    if (biometryType === BiometryTypes.FaceID) {
      return 'Face ID';
    }
    if (biometryType === BiometryTypes.TouchID) {
      return 'Touch ID';
    }
    if (biometryType === BiometryTypes.Biometrics) {
      return 'Fingerprint';
    }
    return 'Biometrics';
  },
};
