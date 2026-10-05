import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Coordinates } from '../types';

// Coordenadas por defecto (Bogotá - Parque de la 93 / Zona Rosa)
export const DEFAULT_COORDINATES: Coordinates = {
  latitude: 4.6735,
  longitude: -74.0525,
};

export class LocationService {
  /**
   * Solicita permisos de ubicación al usuario
   */
  public static async requestLocationPermissions(): Promise<{
    granted: boolean;
    status: Location.PermissionStatus;
  }> {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.geolocation) {
        return { granted: false, status: Location.PermissionStatus.DENIED };
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === Location.PermissionStatus.GRANTED;

      return { granted, status };
    } catch {
      return { granted: false, status: Location.PermissionStatus.DENIED };
    }
  }

  /**
   * Obtiene la ubicación GPS actual del dispositivo
   */
  public static async getCurrentLocation(): Promise<Coordinates | null> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      return null;
    }
  }

  /**
   * Se suscribe a actualizaciones periódicas de ubicación GPS en tiempo real
   */
  public static async watchLocation(
    onLocationUpdate: (coords: Coordinates) => void
  ): Promise<Location.LocationSubscription | null> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        return null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          onLocationUpdate({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );

      return subscription;
    } catch {
      return null;
    }
  }
}
