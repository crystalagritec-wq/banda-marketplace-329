import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useStorage } from '@/providers/storage-provider';
import * as LocalAuthentication from 'expo-local-authentication';

type AppLockMethod = 'none' | 'pin' | 'pattern';

interface AppLockContextType {
  isLocked: boolean;
  lockMethod: AppLockMethod;
  biometricsEnabled: boolean;
  setLockMethod: (method: AppLockMethod) => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  setPattern: (pattern: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  verifyPattern: (pattern: string) => Promise<boolean>;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  lockApp: () => void;
  unlockApp: () => void;
  checkBiometricSupport: () => Promise<boolean>;
}

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const { getItem, setItem } = useStorage();
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockMethod, setLockMethodState] = useState<AppLockMethod>('none');
  const [biometricsEnabled, setBiometricsEnabledState] = useState<boolean>(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const method = await getItem('app_lock_method');
        const biometrics = await getItem('app_lock_biometrics');
        
        if (method) {
          setLockMethodState(method as AppLockMethod);
          if (method !== 'none') {
            setIsLocked(true);
          }
        }
        
        if (biometrics) {
          setBiometricsEnabledState(biometrics === '1');
        }
      } catch (error) {
        console.error('Failed to load app lock settings:', error);
      }
    };
    
    loadSettings();
  }, [getItem]);

  const setLockMethod = useCallback(async (method: AppLockMethod) => {
    try {
      await setItem('app_lock_method', method);
      setLockMethodState(method);
      
      if (method === 'none') {
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
      
      console.log('✅ Lock method updated:', method);
    } catch (error) {
      console.error('Failed to set lock method:', error);
      throw error;
    }
  }, [setItem]);

  const setPin = useCallback(async (pin: string) => {
    try {
      await setItem('app_lock_pin', pin);
      console.log('✅ PIN set successfully');
    } catch (error) {
      console.error('Failed to set PIN:', error);
      throw error;
    }
  }, [setItem]);

  const setPattern = useCallback(async (pattern: string) => {
    try {
      await setItem('app_lock_pattern', pattern);
      console.log('✅ Pattern set successfully');
    } catch (error) {
      console.error('Failed to set pattern:', error);
      throw error;
    }
  }, [setItem]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const storedPin = await getItem('app_lock_pin');
      return storedPin === pin;
    } catch (error) {
      console.error('Failed to verify PIN:', error);
      return false;
    }
  }, [getItem]);

  const verifyPattern = useCallback(async (pattern: string): Promise<boolean> => {
    try {
      const storedPattern = await getItem('app_lock_pattern');
      return storedPattern === pattern;
    } catch (error) {
      console.error('Failed to verify pattern:', error);
      return false;
    }
  }, [getItem]);

  const setBiometricsEnabled = useCallback(async (enabled: boolean) => {
    try {
      await setItem('app_lock_biometrics', enabled ? '1' : '0');
      setBiometricsEnabledState(enabled);
      console.log('✅ Biometrics setting updated:', enabled);
    } catch (error) {
      console.error('Failed to set biometrics:', error);
      throw error;
    }
  }, [setItem]);

  const checkBiometricSupport = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return false;
    }
    
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Failed to check biometric support:', error);
      return false;
    }
  }, []);

  const authenticateWithBiometrics = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.log('⚠️ Biometrics not supported on web');
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to unlock Banda',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, []);

  const lockApp = useCallback(() => {
    if (lockMethod !== 'none') {
      setIsLocked(true);
      console.log('🔒 App locked');
    }
  }, [lockMethod]);

  const unlockApp = useCallback(() => {
    setIsLocked(false);
    console.log('🔓 App unlocked');
  }, []);

  const value: AppLockContextType = {
    isLocked,
    lockMethod,
    biometricsEnabled,
    setLockMethod,
    setPin,
    setPattern,
    verifyPin,
    verifyPattern,
    setBiometricsEnabled,
    authenticateWithBiometrics,
    lockApp,
    unlockApp,
    checkBiometricSupport,
  };

  return (
    <AppLockContext.Provider value={value}>
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within AppLockProvider');
  }
  return context;
}
