import Geolocation from 'react-native-geolocation-service';
import {Platform, PermissionsAndroid} from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const locationService = {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'HRApp needs your location when clocking in.',
        buttonPositive: 'Allow',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  },

  getCurrentPosition(): Promise<Coordinates | null> {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        position =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => resolve(null),
        {enableHighAccuracy: false, timeout: 10000},
      );
    });
  },
};
