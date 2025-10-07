import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ServiceProviderType = 'individual' | 'organization';

export type ServiceCategory = 
  | 'agriculture'
  | 'veterinary'
  | 'fisheries'
  | 'training'
  | 'pest_control'
  | 'construction'
  | 'survey'
  | 'security'
  | 'transport'
  | 'equipment_rental'
  | 'consultation'
  | 'other';

export interface Equipment {
  id: string;
  type: string;
  name: string;
  ownershipType: 'owned' | 'leased' | 'financed';
  maintenanceStatus: 'excellent' | 'good' | 'fair' | 'needs_service';
  availability: 'available' | 'in_use' | 'maintenance';
  photos: string[];
  specifications?: Record<string, string>;
}

export interface ServiceInboardingState {
  step: number;
  progress: number;
  providerType: ServiceProviderType | null;
  
  personalDetails: {
    fullName: string;
    idNumber: string;
    phone: string;
    email: string;
    address: string;
    profilePhoto: string;
  };
  
  organizationDetails: {
    businessName: string;
    registrationNumber: string;
    taxId: string;
    contactPerson: string;
    email: string;
    logo: string;
  };
  
  serviceTypes: ServiceCategory[];
  
  verification: {
    idDocument: string;
    license: string;
    certificates: string[];
    professionalCredentials: string[];
  };
  
  equipment: Equipment[];
  
  availability: {
    operatingHours: {
      monday: { start: string; end: string; closed: boolean };
      tuesday: { start: string; end: string; closed: boolean };
      wednesday: { start: string; end: string; closed: boolean };
      thursday: { start: string; end: string; closed: boolean };
      friday: { start: string; end: string; closed: boolean };
      saturday: { start: string; end: string; closed: boolean };
      sunday: { start: string; end: string; closed: boolean };
    };
    serviceAreas: string[];
    discoverable: boolean;
    instantRequests: boolean;
  };
  
  payment: {
    method: 'agripay' | 'mpesa' | 'bank' | null;
    accountDetails: string;
    termsAccepted: boolean;
  };
  
  badges: {
    verified: boolean;
    pending: boolean;
    equipmentVerified: boolean;
    goodConduct: boolean;
  };
  
  completedAt: string | null;
}

const STORAGE_KEY = 'banda_service_inboarding_state';

const defaultOperatingHours = {
  start: '08:00',
  end: '17:00',
  closed: false,
};

export const [ServiceInboardingProvider, useServiceInboarding] = createContextHook(() => {
  const [state, setState] = useState<ServiceInboardingState>({
    step: 1,
    progress: 0,
    providerType: null,
    personalDetails: {
      fullName: '',
      idNumber: '',
      phone: '',
      email: '',
      address: '',
      profilePhoto: '',
    },
    organizationDetails: {
      businessName: '',
      registrationNumber: '',
      taxId: '',
      contactPerson: '',
      email: '',
      logo: '',
    },
    serviceTypes: [],
    verification: {
      idDocument: '',
      license: '',
      certificates: [],
      professionalCredentials: [],
    },
    equipment: [],
    availability: {
      operatingHours: {
        monday: { ...defaultOperatingHours },
        tuesday: { ...defaultOperatingHours },
        wednesday: { ...defaultOperatingHours },
        thursday: { ...defaultOperatingHours },
        friday: { ...defaultOperatingHours },
        saturday: { ...defaultOperatingHours },
        sunday: { ...defaultOperatingHours, closed: true },
      },
      serviceAreas: [],
      discoverable: true,
      instantRequests: true,
    },
    payment: {
      method: null,
      accountDetails: '',
      termsAccepted: false,
    },
    badges: {
      verified: false,
      pending: true,
      equipmentVerified: false,
      goodConduct: false,
    },
    completedAt: null,
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
        console.error('[ServiceInboarding] Error loading state:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadState();
  }, []);

  const saveState = useCallback(async (newState: ServiceInboardingState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
      console.log('[ServiceInboarding] State saved, progress:', newState.progress);
    } catch (error) {
      console.error('[ServiceInboarding] Error saving state:', error);
    }
  }, []);

  const calculateProgress = useCallback((currentState: ServiceInboardingState): number => {
    let progress = 0;
    
    if (currentState.providerType) progress += 10;
    
    if (currentState.providerType === 'individual') {
      const { fullName, idNumber, phone, email } = currentState.personalDetails;
      if (fullName && idNumber && phone && email) progress += 10;
    } else if (currentState.providerType === 'organization') {
      const { businessName, registrationNumber, taxId, contactPerson } = currentState.organizationDetails;
      if (businessName && registrationNumber && taxId && contactPerson) progress += 10;
    }
    
    if (currentState.serviceTypes.length > 0) progress += 20;
    
    const { idDocument, license, certificates } = currentState.verification;
    if (idDocument) progress += 10;
    if (license) progress += 10;
    if (certificates.length > 0) progress += 10;
    
    if (currentState.equipment.length > 0) progress += 10;
    
    if (currentState.availability.serviceAreas.length > 0) progress += 10;
    
    if (currentState.payment.method && currentState.payment.termsAccepted) progress += 10;
    
    return Math.min(progress, 100);
  }, []);

  const setProviderType = useCallback((type: ServiceProviderType) => {
    const newState = { ...state, providerType: type, step: 2 };
    newState.progress = calculateProgress(newState);
    saveState(newState);
  }, [state, saveState, calculateProgress]);

  const updatePersonalDetails = useCallback((details: Partial<ServiceInboardingState['personalDetails']>) => {
    const newState = {
      ...state,
      personalDetails: { ...state.personalDetails, ...details },
    };
    newState.progress = calculateProgress(newState);
    saveState(newState);
  }, [state, saveState, calculateProgress]);

  const updateOrganizationDetails = useCallback((details: Partial<ServiceInboardingState['organizationDetails']>) => {
    const newState = {
      ...state,
      organizationDetails: { ...state.organizationDetails, ...details },
    };
    newState.progress = calculateProgress(newState);
    saveState(newState);
  }, [state, saveState, calculateProgress]);

  const setServiceTypes = useCallback((types: ServiceCategory[]) => {
    const newState = { ...state, serviceTypes: types };
    newState.progress = calculateProgress(newState);
    saveState(newState);
  }, [state, saveState, calculateProgress]);

  const updateVerification = useCallback((verification: Partial<ServiceInboardingState['verification']>) => {
    const newState = {
      ...state,
      verification: { ...state.verification, ...verification },
    };
    newState.progress = calculateProgress(newState);
    saveState(newState);
  }, [state, saveState, calculateProgress]);

  const addEquipment = useCallback((equipment: Equipment) => {
    const newState = {
      ...state,
      equipment: [...state.equipment, equipment],
    };
    newState.progress = calculateProgress(newState);
    saveState(newState);
  }, [state, saveState, calculateProgress]);

  const removeEquipment = useCallback((equipmentId: string) => {
    const newState = {
      ...state,
      equipment: state.equipment.filter(e => e.id !== equipmentId),
    };
    newState.progress = calculateProgress(newState);
    saveState(newState);
  }, [state, saveState, calculateProgress]);

  const updateAvailability = useCallback((availability: Partial<ServiceInboardingState['availability']>) => {
    const newState = {
      ...state,
      availability: { ...state.availability, ...availability },
    };
    newState.progress = calculateProgress(newState);
    saveState(newState);
  }, [state, saveState, calculateProgress]);

  const updatePayment = useCallback((payment: Partial<ServiceInboardingState['payment']>) => {
    const newState = {
      ...state,
      payment: { ...state.payment, ...payment },
    };
    newState.progress = calculateProgress(newState);
    saveState(newState);
  }, [state, saveState, calculateProgress]);

  const nextStep = useCallback(() => {
    const newState = { ...state, step: state.step + 1 };
    saveState(newState);
  }, [state, saveState]);

  const previousStep = useCallback(() => {
    const newState = { ...state, step: Math.max(1, state.step - 1) };
    saveState(newState);
  }, [state, saveState]);

  const completeInboarding = useCallback(async () => {
    const newState = {
      ...state,
      completedAt: new Date().toISOString(),
      progress: 100,
      badges: {
        ...state.badges,
        pending: false,
        verified: true,
      },
    };
    await saveState(newState);
    console.log('[ServiceInboarding] Inboarding completed');
  }, [state, saveState]);

  const resetInboarding = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState({
      step: 1,
      progress: 0,
      providerType: null,
      personalDetails: {
        fullName: '',
        idNumber: '',
        phone: '',
        email: '',
        address: '',
        profilePhoto: '',
      },
      organizationDetails: {
        businessName: '',
        registrationNumber: '',
        taxId: '',
        contactPerson: '',
        email: '',
        logo: '',
      },
      serviceTypes: [],
      verification: {
        idDocument: '',
        license: '',
        certificates: [],
        professionalCredentials: [],
      },
      equipment: [],
      availability: {
        operatingHours: {
          monday: { ...defaultOperatingHours },
          tuesday: { ...defaultOperatingHours },
          wednesday: { ...defaultOperatingHours },
          thursday: { ...defaultOperatingHours },
          friday: { ...defaultOperatingHours },
          saturday: { ...defaultOperatingHours },
          sunday: { ...defaultOperatingHours, closed: true },
        },
        serviceAreas: [],
        discoverable: true,
        instantRequests: true,
      },
      payment: {
        method: null,
        accountDetails: '',
        termsAccepted: false,
      },
      badges: {
        verified: false,
        pending: true,
        equipmentVerified: false,
        goodConduct: false,
      },
      completedAt: null,
    });
  }, []);

  return useMemo(() => ({
    state,
    isLoading,
    setProviderType,
    updatePersonalDetails,
    updateOrganizationDetails,
    setServiceTypes,
    updateVerification,
    addEquipment,
    removeEquipment,
    updateAvailability,
    updatePayment,
    nextStep,
    previousStep,
    completeInboarding,
    resetInboarding,
  }), [
    state,
    isLoading,
    setProviderType,
    updatePersonalDetails,
    updateOrganizationDetails,
    setServiceTypes,
    updateVerification,
    addEquipment,
    removeEquipment,
    updateAvailability,
    updatePayment,
    nextStep,
    previousStep,
    completeInboarding,
    resetInboarding,
  ]);
});
