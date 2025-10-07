import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LogisticsRole = 'owner' | 'driver';

export type OwnershipType = 'owned' | 'financed';

export interface VehicleDetails {
  type: string;
  registrationNumber: string;
  color: string;
  capacity: string;
  photos: string[];
  ownershipType: OwnershipType;
}

export interface OwnerDetails {
  fullName: string;
  phone: string;
  kraPin: string;
  areaOfOperation: string;
  vehicles: VehicleDetails[];
  assignedDriver?: string;
}

export interface DriverDetails {
  fullName: string;
  phone: string;
  selfieUri: string;
  nationalIdUri: string;
  driverLicenseUri: string;
  licenseClass: string;
  allowDiscovery: boolean;
  goodConductUri?: string;
  availability: 'active' | 'idle';
}

export interface OwnerVerification {
  logbookUri?: string;
  insuranceUri?: string;
  ntsaInspectionUri?: string;
  maintenanceStatus?: string;
  verified: boolean;
}

export interface DriverVerification {
  goodConductUri?: string;
  qrVerified: boolean;
  backgroundCheckPassed: boolean;
  verified: boolean;
}

interface LogisticsInboardingState {
  role: LogisticsRole | null;
  progress: number;
  ownerDetails: OwnerDetails | null;
  driverDetails: DriverDetails | null;
  ownerVerification: OwnerVerification | null;
  driverVerification: DriverVerification | null;
  termsAccepted: boolean;
  quickStartComplete: boolean;
  fullVerificationComplete: boolean;
}

const STORAGE_KEY = '@banda_logistics_inboarding';

export const [LogisticsInboardingProvider, useLogisticsInboarding] = createContextHook(() => {
  const [state, setState] = useState<LogisticsInboardingState>({
    role: null,
    progress: 0,
    ownerDetails: null,
    driverDetails: null,
    ownerVerification: null,
    driverVerification: null,
    termsAccepted: false,
    quickStartComplete: false,
    fullVerificationComplete: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load logistics inboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async (newState: LogisticsInboardingState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('Failed to save logistics inboarding state:', error);
    }
  };

  const setRole = useCallback((role: LogisticsRole) => {
    saveState({ ...state, role, progress: 10 });
  }, [state]);

  const setOwnerDetails = useCallback((details: OwnerDetails) => {
    saveState({ ...state, ownerDetails: details, progress: 60 });
  }, [state]);

  const setDriverDetails = useCallback((details: DriverDetails) => {
    saveState({ ...state, driverDetails: details, progress: 60 });
  }, [state]);

  const acceptTerms = useCallback(() => {
    saveState({ ...state, termsAccepted: true, progress: 70 });
  }, [state]);

  const completeQuickStart = useCallback(() => {
    saveState({ ...state, quickStartComplete: true, progress: 100 });
  }, [state]);

  const setOwnerVerification = useCallback((verification: OwnerVerification) => {
    const fullVerificationComplete = verification.verified;
    saveState({
      ...state,
      ownerVerification: verification,
      fullVerificationComplete,
    });
  }, [state]);

  const setDriverVerification = useCallback((verification: DriverVerification) => {
    const fullVerificationComplete = verification.verified;
    saveState({
      ...state,
      driverVerification: verification,
      fullVerificationComplete,
    });
  }, [state]);

  const updateProgress = useCallback((progress: number) => {
    saveState({ ...state, progress });
  }, [state]);

  const resetInboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setState({
        role: null,
        progress: 0,
        ownerDetails: null,
        driverDetails: null,
        ownerVerification: null,
        driverVerification: null,
        termsAccepted: false,
        quickStartComplete: false,
        fullVerificationComplete: false,
      });
    } catch (error) {
      console.error('Failed to reset logistics inboarding:', error);
    }
  }, []);

  return useMemo(() => ({
    ...state,
    isLoading,
    setRole,
    setOwnerDetails,
    setDriverDetails,
    acceptTerms,
    completeQuickStart,
    setOwnerVerification,
    setDriverVerification,
    updateProgress,
    resetInboarding,
  }), [state, isLoading, setRole, setOwnerDetails, setDriverDetails, acceptTerms, completeQuickStart, setOwnerVerification, setDriverVerification, updateProgress, resetInboarding]);
});
