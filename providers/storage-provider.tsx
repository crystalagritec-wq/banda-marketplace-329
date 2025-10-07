import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useMemo } from 'react';

export const [StorageProvider, useStorage] = createContextHook(() => {
  const setItem = useCallback(async (key: string, value: string) => {
    if (!key?.trim() || key.length > 100) {
      throw new Error('Invalid key');
    }
    if (!value?.trim() || value.length > 10000) {
      throw new Error('Invalid value');
    }
    
    try {
      await AsyncStorage.setItem(key.trim(), value.trim());
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }, []);

  const getItem = useCallback(async (key: string): Promise<string | null> => {
    if (!key?.trim() || key.length > 100) {
      return null;
    }
    
    try {
      return await AsyncStorage.getItem(key.trim());
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }, []);

  const removeItem = useCallback(async (key: string) => {
    if (!key?.trim() || key.length > 100) {
      throw new Error('Invalid key');
    }
    
    try {
      await AsyncStorage.removeItem(key.trim());
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }, []);

  return useMemo(() => ({
    setItem,
    getItem,
    removeItem
  }), [setItem, getItem, removeItem]);
});