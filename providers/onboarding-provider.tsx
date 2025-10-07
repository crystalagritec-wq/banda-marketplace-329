import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingStep = 
  | 'welcome'
  | 'intro_tour'
  | 'role_selection'
  | 'shop_profile'
  | 'shop_products'
  | 'shop_wallet'
  | 'shop_tutorial'
  | 'logistics_role'
  | 'logistics_owner'
  | 'logistics_driver'
  | 'logistics_delivery'
  | 'logistics_payment'
  | 'farm_profile'
  | 'farm_crops'
  | 'farm_workers'
  | 'farm_analytics'
  | 'service_profile'
  | 'service_offerings'
  | 'service_pricing'
  | 'service_availability'
  | 'complete';

export type BusinessRole = 'shop' | 'service' | 'logistics' | 'farm';
export type LogisticsRole = 'owner' | 'driver';

export interface OnboardingState {
  hasSeenOnboarding: boolean;
  currentStep: OnboardingStep;
  selectedRole: BusinessRole | null;
  logisticsRole: LogisticsRole | null;
  completedRoles: BusinessRole[];
  shopData: {
    name: string;
    category: string;
    logo: string;
    contact: string;
    products: number;
  };
  serviceData: {
    name: string;
    category: string;
    offerings: string[];
    pricing: Record<string, number>;
  };
  logisticsData: {
    role: LogisticsRole | null;
    ownerDetails?: {
      fullName: string;
      phone: string;
      kraPin: string;
      vehicles: {
        type: string;
        regNumber: string;
        color: string;
        capacity: string;
        ownershipType: 'owned' | 'financed';
        photos: string[];
      }[];
      baseLocation: string;
    };
    driverDetails?: {
      fullName: string;
      phone: string;
      idNumber: string;
      license: string;
      selfie: string;
      discoverable: boolean;
    };
  };
  farmData: {
    name: string;
    gpsPin: string;
    type: string[];
    crops: {
      name: string;
      plantingDate: string;
      tasks: string[];
    }[];
    workers: {
      name: string;
      role: string;
      tasks: string[];
    }[];
  };
}

const STORAGE_KEY = 'banda_onboarding_state';

export const [OnboardingProvider, useOnboarding] = createContextHook(() => {
  const [state, setState] = useState<OnboardingState>({
    hasSeenOnboarding: false,
    currentStep: 'welcome',
    selectedRole: null,
    logisticsRole: null,
    completedRoles: [],
    shopData: {
      name: '',
      category: '',
      logo: '',
      contact: '',
      products: 0,
    },
    serviceData: {
      name: '',
      category: '',
      offerings: [],
      pricing: {},
    },
    logisticsData: {
      role: null,
    },
    farmData: {
      name: '',
      gpsPin: '',
      type: [],
      crops: [],
      workers: [],
    },
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadState() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setState(parsed);
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  const saveState = useCallback(async (newState: OnboardingState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  }, []);

  const setCurrentStep = useCallback((step: OnboardingStep) => {
    saveState({ ...state, currentStep: step });
  }, [state, saveState]);

  const selectRole = useCallback((role: BusinessRole) => {
    saveState({ ...state, selectedRole: role });
  }, [state, saveState]);

  const completeRole = useCallback((role: BusinessRole) => {
    const completedRoles = [...state.completedRoles];
    if (!completedRoles.includes(role)) {
      completedRoles.push(role);
    }
    saveState({ 
      ...state, 
      completedRoles,
      selectedRole: null,
    });
  }, [state, saveState]);

  const updateShopData = useCallback((data: Partial<OnboardingState['shopData']>) => {
    saveState({
      ...state,
      shopData: { ...state.shopData, ...data },
    });
  }, [state, saveState]);

  const updateServiceData = useCallback((data: Partial<OnboardingState['serviceData']>) => {
    saveState({
      ...state,
      serviceData: { ...state.serviceData, ...data },
    });
  }, [state, saveState]);

  const updateLogisticsData = useCallback((data: Partial<OnboardingState['logisticsData']>) => {
    saveState({
      ...state,
      logisticsData: { ...state.logisticsData, ...data },
    });
  }, [state, saveState]);

  const updateFarmData = useCallback((data: Partial<OnboardingState['farmData']>) => {
    saveState({
      ...state,
      farmData: { ...state.farmData, ...data },
    });
  }, [state, saveState]);

  const markOnboardingComplete = useCallback(async () => {
    await saveState({
      ...state,
      hasSeenOnboarding: true,
      currentStep: 'complete',
    });
  }, [state, saveState]);

  const resetOnboarding = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState({
      hasSeenOnboarding: false,
      currentStep: 'welcome',
      selectedRole: null,
      logisticsRole: null,
      completedRoles: [],
      shopData: {
        name: '',
        category: '',
        logo: '',
        contact: '',
        products: 0,
      },
      serviceData: {
        name: '',
        category: '',
        offerings: [],
        pricing: {},
      },
      logisticsData: {
        role: null,
      },
      farmData: {
        name: '',
        gpsPin: '',
        type: [],
        crops: [],
        workers: [],
      },
    });
  }, []);

  const getShopProgress = useCallback((): number => {
    let progress = 0;
    const { name, category, contact, products } = state.shopData;
    
    if (name && category && contact) progress += 25;
    if (products > 0) progress += 25;
    progress += 50;
    
    return Math.min(progress, 100);
  }, [state.shopData]);

  const getRoleProgress = useCallback((role: BusinessRole): number => {
    switch (role) {
      case 'shop':
        return getShopProgress();
      case 'service':
        if (state.serviceData.offerings.length > 0) return 100;
        if (state.serviceData.name) return 50;
        return 0;
      case 'logistics':
        if (state.logisticsData.role === 'owner' && state.logisticsData.ownerDetails?.vehicles.length) return 100;
        if (state.logisticsData.role === 'driver' && state.logisticsData.driverDetails?.license) return 100;
        if (state.logisticsData.role) return 50;
        return 0;
      case 'farm':
        if (state.farmData.crops.length > 0) return 100;
        if (state.farmData.name) return 50;
        return 0;
      default:
        return 0;
    }
  }, [state, getShopProgress]);

  const getRoleStatus = useCallback((role: BusinessRole): 'active' | 'setup' | 'not_created' => {
    const progress = getRoleProgress(role);
    if (progress === 100) return 'active';
    if (progress > 0) return 'setup';
    return 'not_created';
  }, [getRoleProgress]);

  return useMemo(() => ({
    state,
    isLoading,
    setCurrentStep,
    selectRole,
    completeRole,
    updateShopData,
    updateServiceData,
    updateLogisticsData,
    updateFarmData,
    markOnboardingComplete,
    resetOnboarding,
    getRoleProgress,
    getRoleStatus,
    getShopProgress,
  }), [
    state,
    isLoading,
    setCurrentStep,
    selectRole,
    completeRole,
    updateShopData,
    updateServiceData,
    updateLogisticsData,
    updateFarmData,
    markOnboardingComplete,
    resetOnboarding,
    getRoleProgress,
    getRoleStatus,
    getShopProgress,
  ]);
});
