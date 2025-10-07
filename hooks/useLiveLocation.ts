import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface LiveLocationState {
  coords: Coordinates | null;
  isTracking: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

export function useLiveLocation(): LiveLocationState {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const webWatchId = useRef<number | null>(null);

  const start = useCallback(async () => {
    setError(null);

    if (Platform.OS === 'web') {
      try {
        if (!('geolocation' in navigator)) {
          setError('Geolocation not supported');
          return;
        }
        setIsTracking(true);
        webWatchId.current = navigator.geolocation.watchPosition(
          (pos) => {
            setCoords({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy ?? null,
            });
          },
          (err) => {
            setError(err.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
      } catch (e: any) {
        setError(e?.message ?? 'Unable to start geolocation');
      }
      return;
    }

    try {
      const ExpoLocation = await import('expo-location');
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }
      setIsTracking(true);
      await ExpoLocation.watchPositionAsync(
        { accuracy: ExpoLocation.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 5 },
        (loc) => {
          setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, accuracy: loc.coords.accuracy ?? null });
        }
      );
    } catch (e: any) {
      setError(e?.message ?? 'Unable to start location tracking');
    }
  }, []);

  const stop = useCallback(() => {
    if (Platform.OS === 'web') {
      if (webWatchId.current != null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(webWatchId.current);
      }
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web') {
        if (webWatchId.current != null && 'geolocation' in navigator) {
          navigator.geolocation.clearWatch(webWatchId.current);
        }
      }
    };
  }, []);

  return { coords, isTracking, error, start, stop };
}
