import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeoCoordinates } from '@/constants/products';

export interface UnifiedAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  country: string;
  county?: string;
  countyId?: string;
  subCounty?: string;
  subCountyId?: string;
  ward?: string;
  wardId?: string;
  coordinates: GeoCoordinates;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

const UNIFIED_ADDRESSES_KEY = 'banda_unified_addresses';

export const [AddressProvider, useAddresses] = createContextHook(() => {
  const [addresses, setAddresses] = useState<UnifiedAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stored = await AsyncStorage.getItem(UNIFIED_ADDRESSES_KEY);
      
      if (stored) {
        const parsed = JSON.parse(stored) as UnifiedAddress[];
        console.log('[AddressProvider] Loaded addresses:', parsed.length);
        setAddresses(parsed);
      } else {
        console.log('[AddressProvider] No addresses found, initializing empty');
        setAddresses([]);
      }
    } catch (err) {
      console.error('[AddressProvider] Load error:', err);
      setError('Failed to load addresses');
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const saveAddresses = useCallback(async (newAddresses: UnifiedAddress[]) => {
    try {
      await AsyncStorage.setItem(UNIFIED_ADDRESSES_KEY, JSON.stringify(newAddresses));
      console.log('[AddressProvider] Saved addresses:', newAddresses.length);
      return true;
    } catch (err) {
      console.error('[AddressProvider] Save error:', err);
      setError('Failed to save addresses');
      return false;
    }
  }, []);

  const addAddress = useCallback(async (address: Omit<UnifiedAddress, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!address.name?.trim()) {
      setError('Address name is required');
      return null;
    }
    if (!address.address?.trim()) {
      setError('Street address is required');
      return null;
    }
    if (!address.phone?.trim()) {
      setError('Phone number is required');
      return null;
    }
    if (!address.coordinates) {
      setError('Location coordinates are required');
      return null;
    }
    if (!address.county || !address.subCounty || !address.ward) {
      setError('Complete location (County, Sub-County, Ward) is required');
      return null;
    }

    const now = Date.now();
    const newAddress: UnifiedAddress = {
      ...address,
      id: `addr_${now}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    let updatedAddresses = [...addresses];
    
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: false,
      }));
    }
    
    if (updatedAddresses.length === 0) {
      newAddress.isDefault = true;
    }
    
    updatedAddresses.push(newAddress);
    
    const saved = await saveAddresses(updatedAddresses);
    if (saved) {
      setAddresses(updatedAddresses);
      setError(null);
      console.log('[AddressProvider] Added address:', newAddress.id);
      return newAddress;
    }
    
    return null;
  }, [addresses, saveAddresses]);

  const updateAddress = useCallback(async (addressId: string, updates: Partial<Omit<UnifiedAddress, 'id' | 'createdAt'>>) => {
    const addressIndex = addresses.findIndex(addr => addr.id === addressId);
    
    if (addressIndex === -1) {
      setError('Address not found');
      return false;
    }

    let updatedAddresses = [...addresses];
    
    if (updates.isDefault === true) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));
    }
    
    updatedAddresses[addressIndex] = {
      ...updatedAddresses[addressIndex],
      ...updates,
      updatedAt: Date.now(),
    };
    
    const saved = await saveAddresses(updatedAddresses);
    if (saved) {
      setAddresses(updatedAddresses);
      setError(null);
      console.log('[AddressProvider] Updated address:', addressId);
      return true;
    }
    
    return false;
  }, [addresses, saveAddresses]);

  const deleteAddress = useCallback(async (addressId: string) => {
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    
    if (!addressToDelete) {
      setError('Address not found');
      return false;
    }

    let updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    
    if (addressToDelete.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }
    
    const saved = await saveAddresses(updatedAddresses);
    if (saved) {
      setAddresses(updatedAddresses);
      setError(null);
      console.log('[AddressProvider] Deleted address:', addressId);
      return true;
    }
    
    return false;
  }, [addresses, saveAddresses]);

  const setDefaultAddress = useCallback(async (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
      updatedAt: addr.id === addressId ? Date.now() : addr.updatedAt,
    }));
    
    const saved = await saveAddresses(updatedAddresses);
    if (saved) {
      setAddresses(updatedAddresses);
      setError(null);
      console.log('[AddressProvider] Set default address:', addressId);
      return true;
    }
    
    return false;
  }, [addresses, saveAddresses]);

  const getDefaultAddress = useCallback(() => {
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
  }, [addresses]);

  const getAddressById = useCallback((addressId: string) => {
    return addresses.find(addr => addr.id === addressId) || null;
  }, [addresses]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(() => ({
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    getAddressById,
    clearError,
    reload: loadAddresses,
  }), [
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    getAddressById,
    clearError,
    loadAddresses,
  ]);
});
