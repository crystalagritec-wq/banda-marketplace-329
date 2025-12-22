import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useAuth } from '@/providers/auth-provider';
import { useOnboarding } from '@/providers/onboarding-provider';
import LoadingAnimation from '@/components/LoadingAnimation';
import { trpc } from '@/lib/trpc';

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const { state, isLoading: onboardingLoading, markOnboardingComplete } = useOnboarding();

  const isAuthed = !!user?.id;
  const shouldCheckExistingUnits = isAuthed && !state.hasSeenOnboarding;

  const walletQuery = trpc.agripay.getWallet.useQuery(
    { userId: user?.id ?? '' },
    {
      enabled: shouldCheckExistingUnits,
      retry: 1,
    }
  );

  const shopQuery = trpc.shop.getMyShop.useQuery(undefined, {
    enabled: shouldCheckExistingUnits,
    retry: 1,
  });

  const serviceQuery = trpc.serviceProviders.getMyProfile.useQuery(undefined, {
    enabled: shouldCheckExistingUnits,
    retry: 1,
  });

  const farmsQuery = trpc.farm.getFarms.useQuery(undefined, {
    enabled: shouldCheckExistingUnits,
    retry: 1,
  });

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
  
  const isBootLoading =
    authLoading ||
    onboardingLoading ||
    (shouldCheckExistingUnits
      ? walletQuery.isLoading ||
        shopQuery.isLoading ||
        serviceQuery.isLoading ||
        farmsQuery.isLoading
      : false);

  const bootHasError =
    walletQuery.isError ||
    shopQuery.isError ||
    serviceQuery.isError ||
    farmsQuery.isError;

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (authLoading || onboardingLoading) return;

    const anyQueriesSettled =
      !shouldCheckExistingUnits ||
      (walletQuery.isFetched &&
        shopQuery.isFetched &&
        serviceQuery.isFetched &&
        farmsQuery.isFetched);

    if (anyQueriesSettled) {
      SplashScreen.hideAsync().catch((e) => {
        console.warn('[Index] Failed to hide splash screen:', e);
      });
    }
  }, [
    authLoading,
    onboardingLoading,
    shouldCheckExistingUnits,
    walletQuery.isFetched,
    shopQuery.isFetched,
    serviceQuery.isFetched,
    farmsQuery.isFetched,
  ]);

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
    return <Redirect href="/(tabs)/marketplace" />;
  }

  if (bootHasError && __DEV__) {
    console.warn('[Index] Boot queries had errors:', {
      wallet: walletQuery.error,
      shop: shopQuery.error,
      service: serviceQuery.error,
      farms: farmsQuery.error,
    });
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