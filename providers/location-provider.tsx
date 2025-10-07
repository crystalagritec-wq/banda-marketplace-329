import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useStorage } from '@/providers/storage-provider';
import { GeoCoordinates, Product } from '@/constants/products';
import { calculateDistance, calculateDeliveryFee, calculateTimeConsciousETA } from '@/utils/geo-distance';
import { kenyanCountiesComplete } from '@/constants/kenya-locations-complete';
class SimpleEventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

const locationEmitter = new SimpleEventEmitter();


export interface UserLocation {
  coordinates: GeoCoordinates;
  label?: string;
  address?: string;
  city?: string;
  county?: string;
  countyId?: string;
  subCounty?: string;
  subCountyId?: string;
  ward?: string;
  wardId?: string;
  timestamp: number;
}

export interface DeliveryPreview {
  distanceKm: number;
  deliveryFee: number;
  estimatedTime: string;
  nearestSeller?: {
    sellerId: string;
    sellerName: string;
    distance: number;
  };
}

export interface OptimalDeliveryOption {
  providerId: string;
  providerName: string;
  vehicleType: 'boda' | 'van' | 'truck' | 'pickup';
  totalFee: number;
  estimatedTime: string;
  distanceKm: number;
  reason: string;
}

const LOCATION_STORAGE_KEY = 'banda_user_location';

export const [LocationProvider, useLocation] = createContextHook(() => {
  const storage = useStorage();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  const loadSavedLocation = useCallback(async () => {
    try {
      const saved = await storage.getItem(LOCATION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserLocation(parsed);
        console.log('[Location] Loaded saved location:', parsed.label || parsed.city);
      }
    } catch (error) {
      console.error('[Location] Failed to load saved location:', error);
    }
  }, [storage]);

  useEffect(() => {
    loadSavedLocation();
  }, [loadSavedLocation]);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        if ('geolocation' in navigator) {
          navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            const granted = result.state === 'granted';
            setLocationPermission(granted);
            resolve(granted);
          }).catch(() => {
            setLocationPermission(false);
            resolve(false);
          });
        } else {
          setLocationPermission(false);
          resolve(false);
        }
      });
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermission(granted);
      return granted;
    } catch (error) {
      console.error('[Location] Permission request failed:', error);
      setLocationPermission(false);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    setIsLoadingLocation(true);
    
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to get accurate delivery estimates and find nearby sellers.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return null;
      }

      if (Platform.OS === 'web') {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const location: UserLocation = {
                coordinates: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
                label: 'Current Location',
                timestamp: Date.now(),
              };
              
              setUserLocation(location);
              await storage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
              setIsLoadingLocation(false);
              locationEmitter.emit('locationChanged', location);
              resolve(location);
            },
            (error) => {
              console.error('[Location] Web geolocation error:', error);
              setIsLoadingLocation(false);
              resolve(null);
            }
          );
        });
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLoc: UserLocation = {
        coordinates: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
        label: 'Current Location',
        timestamp: Date.now(),
      };

      setUserLocation(userLoc);
      await storage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(userLoc));
      setIsLoadingLocation(false);
      locationEmitter.emit('locationChanged', userLoc);
      
      console.log('[Location] Got current location:', userLoc.coordinates);
      return userLoc;
    } catch (error) {
      console.error('[Location] Failed to get current location:', error);
      setIsLoadingLocation(false);
      return null;
    }
  }, [requestLocationPermission, storage]);

  const setManualLocation = useCallback(async (location: UserLocation) => {
    const enrichedLocation = { ...location };
    
    if (location.countyId && !location.coordinates) {
      const county = kenyanCountiesComplete.find(c => c.id === location.countyId);
      if (county?.coordinates) {
        enrichedLocation.coordinates = {
          lat: county.coordinates.latitude,
          lng: county.coordinates.longitude,
        };
        console.log('[Location] ✅ Enriched location with county coordinates:', county.name, enrichedLocation.coordinates);
      } else {
        console.warn('[Location] ⚠️ County found but no coordinates available');
      }
    }
    
    if (!enrichedLocation.coordinates) {
      console.error('[Location] ❌ Cannot set location without coordinates');
      throw new Error('Location must have valid coordinates');
    }
    
    setUserLocation(enrichedLocation);
    await storage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(enrichedLocation));
    console.log('[Location] Set manual location:', enrichedLocation.label || enrichedLocation.city);
    console.log('[Location] Broadcasting location change event');
    locationEmitter.emit('locationChanged', enrichedLocation);
  }, [storage]);

  const getDeliveryPreview = useCallback((
    product: Product,
    buyerLocation?: UserLocation
  ): DeliveryPreview | null => {
    const location = buyerLocation || userLocation;
    if (!location || !product.coordinates) {
      return null;
    }

    const distanceKm = calculateDistance(location.coordinates, product.coordinates);
    const deliveryFee = calculateDeliveryFee(distanceKm);
    
    const eta = calculateTimeConsciousETA(distanceKm, 'van');

    return {
      distanceKm,
      deliveryFee,
      estimatedTime: eta.etaText,
      nearestSeller: {
        sellerId: `seller-${product.vendor.toLowerCase().replace(/\s+/g, '-')}`,
        sellerName: product.vendor,
        distance: distanceKm,
      },
    };
  }, [userLocation]);

  const getOptimalDeliveryOption = useCallback((
    sellers: {
      sellerId: string;
      sellerName: string;
      coordinates: GeoCoordinates;
      orderValue: number;
    }[],
    buyerLocation?: UserLocation
  ): OptimalDeliveryOption | null => {
    const location = buyerLocation || userLocation;
    if (!location || sellers.length === 0) {
      return null;
    }

    const totalDistance = sellers.reduce((sum, seller) => {
      return sum + calculateDistance(location.coordinates, seller.coordinates);
    }, 0);
    const avgDistance = totalDistance / sellers.length;

    const totalValue = sellers.reduce((sum, seller) => sum + seller.orderValue, 0);

    let vehicleType: 'boda' | 'van' | 'truck' | 'pickup' = 'van';
    let reason = 'Balanced speed and capacity';

    if (avgDistance < 10 && totalValue < 2000) {
      vehicleType = 'boda';
      reason = 'Fast delivery for nearby orders';
    } else if (totalValue > 10000 || sellers.length > 3) {
      vehicleType = 'truck';
      reason = 'Large order requires truck capacity';
    } else if (avgDistance > 50) {
      vehicleType = 'pickup';
      reason = 'Long distance delivery';
    }

    const baseFee = calculateDeliveryFee(avgDistance);
    const vehicleMultipliers = {
      boda: 1.0,
      van: 1.3,
      truck: 1.8,
      pickup: 1.4,
    };

    const totalFee = Math.round(baseFee * vehicleMultipliers[vehicleType] * sellers.length);
    
    const eta = calculateTimeConsciousETA(avgDistance, vehicleType);

    return {
      providerId: `provider-${vehicleType}-optimal`,
      providerName: `TradeGuard ${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}`,
      vehicleType,
      totalFee,
      estimatedTime: eta.etaText,
      distanceKm: avgDistance,
      reason,
    };
  }, [userLocation]);

  const getNearestSellers = useCallback((
    products: Product[],
    radiusKm: number = 50,
    buyerLocation?: UserLocation
  ): (Product & { distanceKm: number; deliveryFee: number })[] => {
    const location = buyerLocation || userLocation;
    if (!location) {
      return [];
    }

    const productsWithDistance = products
      .filter(p => p.coordinates)
      .map(product => {
        const distanceKm = calculateDistance(location.coordinates, product.coordinates);
        const deliveryFee = calculateDeliveryFee(distanceKm);
        return {
          ...product,
          distanceKm,
          deliveryFee,
        };
      })
      .filter(p => p.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return productsWithDistance;
  }, [userLocation]);

  const subscribeToLocationChanges = useCallback((callback: (location: UserLocation) => void) => {
    locationEmitter.on('locationChanged', callback);
    return () => {
      locationEmitter.off('locationChanged', callback);
    };
  }, []);

  const value = useMemo(() => ({
    userLocation,
    isLoadingLocation,
    locationPermission,
    getCurrentLocation,
    setManualLocation,
    getDeliveryPreview,
    getOptimalDeliveryOption,
    getNearestSellers,
    requestLocationPermission,
    subscribeToLocationChanges,
  }), [
    userLocation,
    isLoadingLocation,
    locationPermission,
    getCurrentLocation,
    setManualLocation,
    getDeliveryPreview,
    getOptimalDeliveryOption,
    getNearestSellers,
    requestLocationPermission,
    subscribeToLocationChanges,
  ]);

  return value;
});
