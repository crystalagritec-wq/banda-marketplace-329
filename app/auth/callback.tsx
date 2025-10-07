import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '@/services/auth';
import { useAuth } from '@/providers/auth-provider';
import { User as SupabaseUser } from '@/lib/supabase';

// Convert Supabase user to local user format
function convertSupabaseUser(supabaseUser: SupabaseUser) {
  return {
    id: supabaseUser.user_id,
    email: supabaseUser.email || '',
    name: supabaseUser.full_name || '',
    role: 'buyer' as const,
    phone: supabaseUser.phone || '',
    location: undefined,
    avatar: supabaseUser.photo_url || undefined,
    isElite: supabaseUser.tier === 'elite',
    linkedProviders: supabaseUser.provider_id ? [supabaseUser.provider_id] : [],
    lastDevice: supabaseUser.device_id || undefined,
    lastLogin: supabaseUser.last_login ? new Date(supabaseUser.last_login).getTime() : undefined,
    reputationScore: supabaseUser.reputation_score,
    membershipTier: supabaseUser.tier === 'none' ? 'basic' as const : 
                   supabaseUser.tier === 'verified' ? 'basic' as const :
                   supabaseUser.tier === 'gold' ? 'premium' as const : 'elite' as const,
    kycStatus: supabaseUser.kyc_status,
    trustScore: supabaseUser.reputation_score,
    tier: supabaseUser.tier
  };
}

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const { setUser } = useAuth();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      console.log('🔐 Processing OAuth callback...');
      
      // Get the full URL with fragments
      const url = typeof window !== 'undefined' ? window.location.href : '';
      
      if (!url) {
        throw new Error('No callback URL found');
      }

      const result = await authService.handleOAuthCallback(url);
      
      if (result.success && result.user) {
        setStatus('success');
        setMessage(result.message || 'Authentication successful!');
        const localUser = convertSupabaseUser(result.user);
        setUser(localUser);
        
        // Redirect to main app after a short delay
        setTimeout(() => {
          router.replace('/(tabs)/marketplace');
        }, 2000);
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('❌ OAuth callback error:', error);
      setStatus('error');
      setMessage(error?.message || 'Authentication failed. Please try again.');
      
      // Redirect back to sign in after error
      setTimeout(() => {
        router.replace('/(auth)/signin');
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color="#2ECC71" />
            <Text style={styles.title}>Authenticating...</Text>
            <Text style={styles.message}>{message}</Text>
          </>
        )}
        
        {status === 'success' && (
          <>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.title}>Success!</Text>
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.subMessage}>Redirecting to your dashboard...</Text>
          </>
        )}
        
        {status === 'error' && (
          <>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.title}>Authentication Failed</Text>
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.subMessage}>Redirecting back to sign in...</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  successIcon: {
    fontSize: 48,
  },
  errorIcon: {
    fontSize: 48,
  },
});