import { Redirect } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useAuth } from '@/providers/auth-provider';
import { useOnboarding } from '@/providers/onboarding-provider';
import LoadingAnimation from '@/components/LoadingAnimation';
import { trpc } from '@/lib/trpc';

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const { state, isLoading: onboardingLoading, markOnboardingComplete } = useOnboarding();

  const walletQuery = trpc.agripay.getWallet.useQuery(
    { userId: user?.id ?? '' },
    { enabled: !!user?.id }
  );
  const shopQuery = trpc.shop.getMyShop.useQuery(undefined, { enabled: !!user?.id });
  const serviceQuery = trpc.serviceProviders.getMyProfile.useQuery(undefined, { enabled: !!user?.id });
  const farmsQuery = trpc.farm.getFarms.useQuery(undefined, { enabled: !!user?.id });

  const anyUnitExists = useMemo(() => {
    const hasWallet = !!walletQuery.data?.wallet;
    const hasShop = !!shopQuery.data?.exists;
    const hasService = !!serviceQuery.data?.exists;
    const hasFarm = Array.isArray(farmsQuery.data) ? farmsQuery.data.length > 0 : false;
    return hasWallet || hasShop || hasService || hasFarm;
  }, [walletQuery.data, shopQuery.data, serviceQuery.data, farmsQuery.data]);

  useEffect(() => {
    if (user && !state.hasSeenOnboarding && anyUnitExists) {
      console.log('[Index] Existing units detected. Skipping onboarding.');
      markOnboardingComplete();
    }
  }, [user, state.hasSeenOnboarding, anyUnitExists, markOnboardingComplete]);
  
  const isBootLoading = authLoading || onboardingLoading || (user ? (walletQuery.isLoading || shopQuery.isLoading || serviceQuery.isLoading || farmsQuery.isLoading) : false);

  if (isBootLoading) {
    return (
      <View style={styles.container} testID="splashLoading">
        <LoadingAnimation 
          visible={true} 
          message={Platform.OS === 'web' ? 'Initializing Banda (Web)...' : 'Initializing Banda...'} 
          type="marketplace"
          overlay={false}
        />
        {Platform.OS === 'web' && !process.env.EXPO_PUBLIC_RORK_API_BASE_URL && (
          <Text style={styles.envWarning} testID="envWarning">Missing EXPO_PUBLIC_RORK_API_BASE_URL</Text>
        )}
      </View>
    );
  }
  
  if (user) {
    if (!state.hasSeenOnboarding) {
      return <Redirect href="/onboarding/welcome" />;
    }
    return <Redirect href="/dashboard" />;
  }
  
  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5DC',
  },
  envWarning: {
    marginTop: 12,
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },
});