module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^react-native-config$': '<rootDir>/__mocks__/react-native-config.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-keychain|react-native-biometrics|react-native-geolocation-service|@react-native-firebase|@react-native-async-storage|react-native-config|react-native-screens|react-native-safe-area-context|date-fns|zustand)/)',
  ],
};
