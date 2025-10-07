import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { useAuth, User, UserRole } from '@/providers/auth-provider';
import { User as SupabaseUser } from '@/lib/supabase';

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

export function useDeepLinking() {
  const { setUser } = useAuth();
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    // Handle initial URL when app is opened from a deep link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && isMountedRef.current) {
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('❌ Error getting initial URL:', error);
      }
    };

    // Handle URL when app is already running
    const handleUrlChange = ({ url }: { url: string }) => {
      if (isMountedRef.current) {
        handleDeepLink(url);
      }
    };

    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep link received:', url);
      
      // Handle OAuth callback
      if (url.includes('banda://auth/callback')) {
        try {
          const result = await authService.handleOAuthCallback(url);
          
          if (result.success && result.user && isMountedRef.current) {
            console.log('✅ OAuth callback successful');
            const localUser = convertSupabaseUser(result.user);
            setUser(localUser);
            setTimeout(() => {
              router.replace('/(tabs)/marketplace');
            }, 100);
          } else {
            console.error('❌ OAuth callback failed:', result.error);
            setTimeout(() => {
              router.replace('/(auth)/signin');
            }, 100);
          }
        } catch (error) {
          console.error('❌ Deep link OAuth error:', error);
          setTimeout(() => {
            router.replace('/(auth)/signin');
          }, 100);
        }
      }
      
      // Handle other deep links as needed
      // You can add more URL patterns here
    };

    // Delay initial URL handling to ensure component is mounted
    const timer = setTimeout(() => {
      handleInitialURL();
    }, 100);
    
    const subscription = Linking.addEventListener('url', handleUrlChange);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      subscription?.remove();
    };
  }, [setUser]);
}