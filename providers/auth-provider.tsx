import createContextHook from '@nkzw/create-context-hook';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStorage } from '@/providers/storage-provider';
import { authService, AuthResult, CreateUserData, SocialAuthData } from '@/services/auth';
import { User as SupabaseUser, testDatabaseConnection } from '@/lib/supabase';

export type UserRole = 'buyer' | 'vendor' | 'driver' | 'service_provider' | 'admin';

export interface User {
  id: string; // Unique userID - primary identifier
  email: string;
  name: string;
  role: UserRole;
  phone: string; // Phone is primary authenticator
  location?: string;
  avatar?: string;
  isElite?: boolean;
  linkedProviders?: string[]; // Array of linked social provider IDs
  lastDevice?: string;
  lastLogin?: number;
  reputationScore?: number;
  membershipTier?: 'basic' | 'premium' | 'elite';
  kycStatus?: 'pending' | 'verified' | 'rejected';
  trustScore?: number;
  tier?: 'none' | 'verified' | 'gold' | 'premium' | 'elite';
}

// Convert Supabase user to local user format
function convertSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.user_id,
    email: supabaseUser.email || '',
    name: supabaseUser.full_name || '',
    role: (supabaseUser.user_role || 'buyer') as UserRole,
    phone: supabaseUser.phone || '',
    location: undefined,
    avatar: supabaseUser.photo_url || undefined,
    isElite: supabaseUser.tier === 'elite',
    linkedProviders: supabaseUser.provider_id ? [supabaseUser.provider_id] : [],
    lastDevice: supabaseUser.device_id || undefined,
    lastLogin: supabaseUser.last_login ? new Date(supabaseUser.last_login).getTime() : undefined,
    reputationScore: supabaseUser.reputation_score,
    membershipTier: supabaseUser.tier === 'none' ? 'basic' : 
                   supabaseUser.tier === 'verified' ? 'basic' :
                   supabaseUser.tier === 'gold' ? 'premium' : 'elite',
    kycStatus: supabaseUser.kyc_status,
    trustScore: supabaseUser.reputation_score,
    tier: supabaseUser.tier
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PhoneValidationRules {
  [countryCode: string]: {
    format: RegExp;
    example: string;
    errorMessage: string;
  };
}

// Phone validation rules by country
const PHONE_RULES: PhoneValidationRules = {
  '+254': { // Kenya
    format: /^(0[71]\d{8}|[71]\d{8})$/,
    example: '0712345678',
    errorMessage: 'Phone number must be 10 digits starting with 07'
  },
  '+255': { // Tanzania
    format: /^(0[67]\d{8}|[67]\d{8})$/,
    example: '0612345678',
    errorMessage: 'Phone number must be 10 digits starting with 06 or 07'
  },
  '+256': { // Uganda
    format: /^(0[7]\d{8}|[7]\d{8})$/,
    example: '0712345678',
    errorMessage: 'Phone number must be 10 digits starting with 07'
  },
  '+250': { // Rwanda
    format: /^(0[7]\d{8}|[7]\d{8})$/,
    example: '0712345678',
    errorMessage: 'Phone number must be 10 digits starting with 07'
  },
  '+211': { // South Sudan
    format: /^(0[9]\d{7}|[9]\d{7})$/,
    example: '091234567',
    errorMessage: 'Phone number must be 9 digits starting with 09'
  },
  '+251': { // Ethiopia
    format: /^(0[9]\d{7}|[9]\d{7})$/,
    example: '091234567',
    errorMessage: 'Phone number must be 9 digits starting with 09'
  }
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getItem, setItem, removeItem } = useStorage();

  const normalizeIdentifier = useCallback((identifier: string) => {
    const trimmed = (identifier ?? '').trim();
    const isEmail = trimmed.includes('@');
    if (isEmail) return trimmed.toLowerCase();
    return trimmed.replace(/\D/g, '');
  }, []);

  const getVerifiedIdentifiers = useCallback(async (): Promise<string[]> => {
    try {
      const listStr = await getItem('banda_verified_identifiers');
      if (!listStr) return [];
      const parsed = JSON.parse(listStr) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((v) => typeof v === 'string');
      }
      return [];
    } catch (e) {
      console.error('Error reading verified identifiers:', e);
      return [];
    }
  }, [getItem]);

  const markIdentifierVerified = useCallback(async (identifier: string) => {
    try {
      const norm = normalizeIdentifier(identifier);
      const current = await getVerifiedIdentifiers();
      if (!current.includes(norm)) {
        const updated = [...current, norm];
        await setItem('banda_verified_identifiers', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Error marking identifier verified:', e);
    }
  }, [getVerifiedIdentifiers, normalizeIdentifier, setItem]);

  const isIdentifierVerified = useCallback(async (identifier: string): Promise<boolean> => {
    const norm = normalizeIdentifier(identifier);
    const list = await getVerifiedIdentifiers();
    return list.includes(norm);
  }, [getVerifiedIdentifiers, normalizeIdentifier]);

  const loadStoredUser = useCallback(async () => {
    try {
      console.log('🔍 Loading stored user data...');
      
      // Test database connection first
      const dbTest = await testDatabaseConnection();
      if (!dbTest.success) {
        console.warn('⚠️ Database connection issue:', dbTest.error);
        // Show user-friendly message but continue with local auth
        if (dbTest.error?.includes('schema not set up') || dbTest.error?.includes('Table not found')) {
          console.log('📋 Database schema needs to be set up. Please check SUPABASE_ROLES_SCHEMA.sql');
        } else if (dbTest.error?.includes('Network') || dbTest.error?.includes('Failed to fetch')) {
          console.log('🌐 Network connectivity issue. App will work in offline mode.');
        }
        // Continue with local auth even if database is not available
      }
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Storage timeout')), 5000)
      );
      const [storedUser, authTimestamp, rememberMeStored] = await Promise.race([
        Promise.all([
          getItem('banda_user'),
          getItem('banda_auth_timestamp'),
          getItem('banda_remember_me')
        ]),
        timeoutPromise
      ]) as [string | null, string | null, string | null];
      if (storedUser && authTimestamp) {
        const userData = JSON.parse(storedUser);
        const timestamp = parseInt(authTimestamp);
        const now = Date.now();
        const isRemembered = rememberMeStored === 'true';
        const sessionDuration = isRemembered 
          ? 30 * 24 * 60 * 60 * 1000
          : 3 * 24 * 60 * 60 * 1000;
        console.log(`🕒 Session check: Remember me ${isRemembered ? 'enabled' : 'disabled'}, duration: ${sessionDuration / (24 * 60 * 60 * 1000)} days`);
        if (now - timestamp < sessionDuration) {
          if (userData.id && userData.email && userData.name && userData.role) {
            setUser(userData);
            console.log('✅ User session restored:', userData.name);
          } else {
            console.log('❌ Invalid user data structure, clearing');
            await Promise.all([
              removeItem('banda_user'),
              removeItem('banda_auth_timestamp'),
              removeItem('banda_remember_me')
            ]);
          }
        } else {
          console.log('⏰ User session expired, clearing data');
          await Promise.all([
            removeItem('banda_user'),
            removeItem('banda_auth_timestamp'),
            removeItem('banda_remember_me')
          ]);
        }
      } else {
        console.log('ℹ️ No stored user data found');
      }
    } catch (error) {
      console.error('❌ Error loading stored user:', error);
      try {
        await Promise.all([
          removeItem('banda_user'),
          removeItem('banda_auth_timestamp'),
          removeItem('banda_remember_me')
        ]);
      } catch (clearError) {
        console.error('Error clearing corrupted data:', clearError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getItem, removeItem]);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const generateUserId = useCallback((): string => {
    // Generate unique user ID with timestamp and random components
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    return `banda_${timestamp}_${randomPart}`;
  }, []);

  // Validation functions
  const validateFullName = useCallback((name: string): ValidationError | null => {
    const trimmed = name.trim();
    if (!trimmed) return { field: 'fullName', message: 'Full name is required' };
    if (trimmed.length < 2) return { field: 'fullName', message: 'Full name too short' };
    if (trimmed.length > 50) return { field: 'fullName', message: 'Full name too long' };
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) return { field: 'fullName', message: 'Special characters are not allowed' };
    return null;
  }, []);

  const validateEmail = useCallback((email: string): ValidationError | null => {
    const trimmed = email.trim();
    if (!trimmed) return { field: 'email', message: 'Email is required' };
    if (trimmed.length > 100) return { field: 'email', message: 'Email too long' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { field: 'email', message: 'Invalid email format' };
    return null;
  }, []);

  const validatePhone = useCallback((phone: string, countryCode: string): ValidationError | null => {
    const trimmed = phone.trim();
    if (!trimmed) return { field: 'phone', message: 'Phone number is required' };
    
    const rules = PHONE_RULES[countryCode];
    if (!rules) {
      // Generic validation for unsupported countries
      const cleanPhone = trimmed.replace(/\D/g, '');
      if (cleanPhone.length < 8 || cleanPhone.length > 12) {
        return { field: 'phone', message: 'Phone number must be 8-12 digits' };
      }
      return null;
    }
    
    const cleanPhone = trimmed.replace(/\D/g, '');
    if (!rules.format.test(cleanPhone)) {
      return { field: 'phone', message: rules.errorMessage };
    }
    
    return null;
  }, []);

  const validatePassword = useCallback((password: string): ValidationError | null => {
    if (!password) return { field: 'password', message: 'Password is required' };
    if (password.length < 8) return { field: 'password', message: 'Password too weak' };
    if (password.length > 20) return { field: 'password', message: 'Password too long' };
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) return { field: 'password', message: 'Password must include letters and numbers' };
    return null;
  }, []);

  const validateOTP = useCallback((otp: string): ValidationError | null => {
    if (!otp) return { field: 'otp', message: 'OTP is required' };
    if (otp.length !== 6) return { field: 'otp', message: 'OTP must be 6 digits' };
    if (!/^\d{6}$/.test(otp)) return { field: 'otp', message: 'OTP must be 6 digits' };
    return null;
  }, []);

  // Normalize phone number with country code
  const normalizePhoneNumber = useCallback((phone: string, countryCode: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    // Remove leading zero if present and add country code
    const normalizedPhone = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    return `${countryCode}${normalizedPhone}`;
  }, []);

  const checkUserByProviderID = useCallback(async (providerID: string) => {
    // Simulate database lookup by providerID (primary method for social auth)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo: 30% chance user exists by providerID
    const userExists = Math.random() > 0.7;
    
    if (userExists) {
      // Simulate some users having incomplete profiles (no name)
      const hasCompleteName = Math.random() > 0.2;
      
      return {
        id: generateUserId(),
        email: 'existing@example.com',
        name: hasCompleteName ? 'Existing Social User' : '', // Some users may not have names
        role: 'buyer' as UserRole,
        phone: '+254700000000',
        linkedProviders: [providerID],
        lastDevice: 'demo_device_123',
        lastLogin: Date.now() - (Math.random() * 15 * 24 * 60 * 60 * 1000), // Random last login within 15 days
        reputationScore: Math.floor(Math.random() * 100),
        membershipTier: 'basic' as const,
        kycStatus: 'verified' as const,
        trustScore: Math.floor(Math.random() * 100)
      };
    }
    
    return null;
  }, [generateUserId]);

  const checkUserByEmail = useCallback(async (email: string) => {
    // Simulate database lookup by email (fallback method)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo: 20% chance user exists by email only
    const userExists = Math.random() > 0.8;
    
    if (userExists) {
      return {
        id: generateUserId(),
        email: email,
        name: 'Email User',
        role: 'buyer' as UserRole,
        phone: '+254700000000',
        linkedProviders: [],
        lastDevice: 'demo_device_123',
        lastLogin: Date.now() - (Math.random() * 15 * 24 * 60 * 60 * 1000),
        reputationScore: Math.floor(Math.random() * 100),
        membershipTier: 'basic' as const,
        kycStatus: 'pending' as const,
        trustScore: Math.floor(Math.random() * 100)
      };
    }
    
    return null;
  }, [generateUserId]);

  const isDeviceTrusted = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const trustedDevices = await getItem(`trusted_devices_${userId}`);
      if (!trustedDevices) return false;
      
      const devices = JSON.parse(trustedDevices);
      const currentDeviceId = 'demo_device_123'; // In real app, get actual device ID
      
      return devices.includes(currentDeviceId);
    } catch {
      return false;
    }
  }, [getItem]);

  const markDeviceTrusted = useCallback(async (userId: string) => {
    try {
      const currentDeviceId = 'demo_device_123'; // In real app, get actual device ID
      const trustedDevices = await getItem(`trusted_devices_${userId}`);
      
      let devices = [];
      if (trustedDevices) {
        devices = JSON.parse(trustedDevices);
      }
      
      if (!devices.includes(currentDeviceId)) {
        devices.push(currentDeviceId);
        await setItem(`trusted_devices_${userId}`, JSON.stringify(devices));
      }
    } catch (error) {
      console.error('Error marking device as trusted:', error);
    }
  }, [getItem, setItem]);

  const completeLogin = useCallback(async (userData: User, rememberMe: boolean = false) => {
    const updatedUser = {
      ...userData,
      lastLogin: Date.now(),
      lastDevice: 'demo_device_123'
    };
    
    await setItem('banda_user', JSON.stringify(updatedUser));
    await setItem('banda_auth_timestamp', Date.now().toString());
    
    if (rememberMe) {
      await setItem('banda_remember_me', 'true');
    } else {
      await removeItem('banda_remember_me');
    }
    
    await markDeviceTrusted(updatedUser.id);
    setUser(updatedUser);
    
    
    console.log('✅ Login completed successfully:', updatedUser.name);
  }, [setItem, removeItem, markDeviceTrusted]);

  const socialLogin = useCallback(async (provider: string, userData: { fullName: string; email: string; photo?: string; providerID: string }, additionalData?: { phone?: string }, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      console.log(`🔐 Social login attempt with ${provider}:`, userData.providerID);
      
      const socialData: SocialAuthData = {
        fullName: userData.fullName,
        email: userData.email,
        photo: userData.photo || '',
        providerID: userData.providerID,
        providerType: provider as 'google' | 'facebook' | 'apple'
      };
      
      const result = await authService.handleSocialAuth(socialData);
      
      if (result.success && result.user) {
        const localUser = convertSupabaseUser(result.user);
        await completeLogin(localUser, rememberMe);
        
        // Check if user needs role selection (new users with default buyer role)
        if (localUser.role === 'buyer' && result.user.tier === 'none') {
          return { 
            success: true, 
            requiresRoleSelection: true, 
            user: localUser,
            message: result.message 
          };
        }
        
        return { success: true, requiresOTP: false, message: result.message };
      } else if (result.requiresProfile) {
        console.log('📝 New social user - requires profile completion');
        return { 
          success: false, 
          requiresRegistration: true, 
          userData 
        };
      } else if (result.requiresOTP && result.user) {
        console.log('🛡️ Requiring OTP verification for security');
        const localUser = convertSupabaseUser(result.user);
        return { 
          success: false, 
          requiresOTP: true, 
          user: localUser,
          reason: 'security_check'
        };
      } else {
        // Check if it's a database configuration error
        if (result.error?.includes('Database not configured')) {
          console.error('❌ Database setup required');
          throw new Error('Database setup required. Please configure your Supabase database tables.');
        }
        throw new Error(result.error || 'Social login failed');
      }
    } catch (error) {
      console.error('❌ Social login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [completeLogin]);

  const login = useCallback(async (identifier: string, otpCode: string, role: UserRole, additionalData?: { fullName?: string; whatsapp?: string }, rememberMe: boolean = false) => {
    if (!identifier?.trim()) {
      throw new Error('Email or phone number is required');
    }
    if (!otpCode?.trim()) {
      throw new Error('OTP code is required');
    }
    if (identifier.length > 100) {
      throw new Error('Invalid identifier format');
    }
    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      throw new Error('OTP must be exactly 6 digits');
    }
    try {
      setIsLoading(true);
      console.log('🔐 Authenticating user:', identifier.substring(0, 3) + '***', 'with OTP:', '***' + otpCode.slice(-2));
      
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        // Handle email-based login (fallback to old method for now)
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 1500);
        });
        const validCodes = ['123456', '000000', '111111', '999999'];
        const sanitizedOtp = otpCode.trim();
        if (!validCodes.includes(sanitizedOtp)) {
          throw new Error('Invalid OTP code. Please try: 123456');
        }
        const isElite = identifier.toLowerCase().includes('elite');
        const userData: User = {
          id: generateUserId(),
          email: identifier.trim(),
          name: additionalData?.fullName || identifier.split('@')[0],
          role,
          phone: additionalData?.whatsapp || '+254700000000',
          location: 'Nairobi, Kenya',
          isElite,
          lastLogin: Date.now(),
          lastDevice: 'demo_device_123'
        };
        
        await completeLogin(userData, rememberMe);
        await markIdentifierVerified(identifier);
      } else {
        // Handle phone-based login with Supabase
        const result = await authService.verifyOTP(identifier, otpCode, 'sms');
        
        if (result.success && result.user) {
          const localUser = convertSupabaseUser(result.user);
          await completeLogin(localUser, rememberMe);
          await markIdentifierVerified(identifier);
        } else {
          throw new Error(result.error || 'OTP verification failed');
        }
      }
      
      console.log('✅ Login completed, navigation handled by congratulations screen');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [completeLogin, generateUserId, markIdentifierVerified]);

  const emailPasswordLogin = useCallback(async (identifier: string, password: string, rememberMe: boolean = false, role: UserRole = 'buyer') => {
    if (!identifier?.trim()) {
      throw new Error('Email is required');
    }
    if (!identifier.includes('@')) {
      throw new Error('Please enter a valid email');
    }
    if (!password?.trim()) {
      throw new Error('Password is required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    try {
      setIsLoading(true);
      console.log('🔐 Password login attempt for:', identifier.substring(0, 3) + '***');
      const verified = await isIdentifierVerified(identifier);
      if (!verified) {
        console.log('🛡️ First-time sign-in on this device. Requiring OTP.');
        router.push({
          pathname: '/(auth)/otp-verification',
          params: {
            identifier: identifier.trim(),
            method: 'email',
            mode: 'signin',
            rememberMe: rememberMe.toString(),
          } as any,
        } as any);
        return;
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 1200));
      const isElite = identifier.toLowerCase().includes('elite');
      const userData: User = {
        id: generateUserId(),
        email: identifier.trim(),
        name: identifier.split('@')[0],
        role,
        phone: '+254700000000',
        location: 'Nairobi, Kenya',
        isElite
      };
      await setItem('banda_user', JSON.stringify(userData));
      await setItem('banda_auth_timestamp', Date.now().toString());
      if (rememberMe) {
        await setItem('banda_remember_me', 'true');
        console.log('✅ Remember me enabled - extended session duration');
      } else {
        await removeItem('banda_remember_me');
        console.log('ℹ️ Remember me disabled - standard session duration');
      }
      setUser(userData);
      console.log('✅ Password login successful:', userData.name);
      try {
        router.replace('/(tabs)/marketplace' as any);
      } catch (navError) {
        console.error('Navigation error:', navError);
        setTimeout(() => {
          router.replace('/(tabs)/marketplace' as any);
        }, 100);
      }
    } catch (error) {
      console.error('❌ Password login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateUserId, isIdentifierVerified, setItem, removeItem]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🚪 Logging out user:', user?.name);
      await Promise.all([
        removeItem('banda_user'),
        removeItem('banda_auth_timestamp'),
        removeItem('banda_remember_me'),
        removeItem('onboarding_seen')
      ]);
      setUser(null);
      console.log('✅ User logged out successfully');
      try {
        router.replace('/(auth)/welcome' as any);
      } catch (navError) {
        console.error('Navigation error:', navError);
        setTimeout(() => {
          router.replace('/(auth)/welcome' as any);
        }, 100);
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      setUser(null);
      router.replace('/(auth)/welcome' as any);
    } finally {
      setIsLoading(false);
    }
  }, [removeItem, user?.name]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    await setItem('banda_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, [user, setItem]);

  const createUser = useCallback(async (userData: CreateUserData) => {
    try {
      const result = await authService.createUser(userData);
      if (result.success && result.user) {
        const localUser = convertSupabaseUser(result.user);
        await completeLogin(localUser, false);
        
        // New users should go to role selection
        return { 
          success: true, 
          message: result.message,
          requiresRoleSelection: true 
        };
      }
      
      // Check if it's a database configuration error
      if (result.error?.includes('Database not configured')) {
        console.error('❌ Database setup required');
        return { 
          success: false, 
          error: 'Database setup required. Please configure your Supabase database tables first.' 
        };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('❌ Create user error:', error);
      return { 
        success: false, 
        error: 'Failed to create account. Please try again.' 
      };
    }
  }, [completeLogin]);

  const sendOTP = useCallback(async (phone: string, countryCode: string) => {
    try {
      const result = await authService.sendOTP(phone, 'sms', countryCode);
      
      // Check if it's a database configuration error
      if (result.error?.includes('Database not configured')) {
        console.error('❌ Database setup required');
        return { 
          success: false, 
          error: 'Database setup required. Please configure your Supabase database tables first.' 
        };
      }
      
      return result;
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      return { 
        success: false, 
        error: 'Failed to send OTP. Please try again.' 
      };
    }
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    login,
    socialLogin,
    emailPasswordLogin,
    logout,
    updateProfile,
    setUser, // Add setUser method for OAuth callbacks
    isAuthenticated: !!user,
    isIdentifierVerified,
    completeLogin,
    generateUserId,
    // Validation functions
    validateFullName,
    validateEmail,
    validatePhone,
    validatePassword,
    validateOTP,
    normalizePhoneNumber,
    // Phone validation rules
    PHONE_RULES,
    // Supabase auth service
    authService,
    // User creation
    createUser,
    // Send OTP
    sendOTP,
  }), [user, isLoading, login, socialLogin, emailPasswordLogin, logout, updateProfile, setUser, isIdentifierVerified, completeLogin, generateUserId, validateFullName, validateEmail, validatePhone, validatePassword, validateOTP, normalizePhoneNumber, createUser, sendOTP]);
});
