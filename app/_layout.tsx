import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/providers/auth-provider";
import { StorageProvider } from "@/providers/storage-provider";
import { CartProvider } from "@/providers/cart-provider";
import { WishlistProvider } from "@/providers/wishlist-provider";
import { BandaDeliveryProvider } from "@/providers/delivery-provider";
import { DisputeProvider } from "@/providers/dispute-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { LoyaltyProvider } from "@/providers/loyalty-provider";
import { TrustProvider } from "@/providers/trust-provider";
import { LocationProvider } from "@/providers/location-provider";
import { AddressProvider } from "@/providers/address-provider";
import { OnboardingProvider } from "@/providers/onboarding-provider";
import { ServiceInboardingProvider } from "@/providers/service-inboarding-provider";
import { AgriPayProvider } from "@/providers/agripay-provider";
import { OrderProvider } from "@/providers/order-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { AppLockProvider } from "@/providers/app-lock-provider";
import { FarmProvider } from "@/providers/farm-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { trpc, trpcClient } from "@/lib/trpc";
import { useDeepLinking } from "@/hooks/useDeepLinking";


if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(console.warn);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount) => {
        if (Platform.OS === 'web' && failureCount >= 1) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
    },
  },
});

function RootLayoutNav() {
  // Initialize deep linking for OAuth callbacks
  useDeepLinking();
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/callback" />
      <Stack.Screen name="checkout" options={{ presentation: "modal" }} />
      <Stack.Screen name="payment-processing" options={{ presentation: "modal" }} />
      <Stack.Screen name="order-success" options={{ presentation: "modal" }} />
      <Stack.Screen name="wallet-welcome" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="my-products" />
      <Stack.Screen name="insights" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="address" />
      <Stack.Screen name="disputes" />
      <Stack.Screen name="dispute/[disputeId]" />
      <Stack.Screen name="order-details" />
      <Stack.Screen name="order-tracking" />
      <Stack.Screen name="order-qr" />
      <Stack.Screen name="qr-scanner" />
      <Stack.Screen name="onboarding/welcome" />
      <Stack.Screen name="onboarding/intro-tour" />
      <Stack.Screen name="onboarding/role-selection" />
      <Stack.Screen name="onboarding/shop/profile" />
      <Stack.Screen name="onboarding/shop/products" />
      <Stack.Screen name="onboarding/shop/wallet" />
      <Stack.Screen name="onboarding/shop/tutorial" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="inboarding/service-role" />
      <Stack.Screen name="inboarding/service-details" />
      <Stack.Screen name="inboarding/service-types" />
      <Stack.Screen name="inboarding/service-verification" />
      <Stack.Screen name="inboarding/service-equipment" />
      <Stack.Screen name="inboarding/service-availability" />
      <Stack.Screen name="inboarding/service-payment" />
      <Stack.Screen name="inboarding/service-summary" />
      <Stack.Screen name="service-provider-dashboard" />
      <Stack.Screen name="settings/security" />
      <Stack.Screen name="settings/privacy" />
      <Stack.Screen name="settings/appearance" />
      <Stack.Screen name="settings/language" />
      <Stack.Screen name="settings/notifications" />
      <Stack.Screen name="settings/help" />
      <Stack.Screen name="settings/feedback" />
      <Stack.Screen name="settings/legal" />
      <Stack.Screen name="settings/delete-account" />
      <Stack.Screen name="app-lock-setup" />
      <Stack.Screen name="wallet-create-pin" />
      <Stack.Screen name="wallet-onboarding" />
      <Stack.Screen name="farm-dashboard" />
      <Stack.Screen name="onboarding/farm/profile" />
      <Stack.Screen name="onboarding/farm/crops" />
      <Stack.Screen name="onboarding/farm/workers" />
      <Stack.Screen name="onboarding/farm/analytics" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const fallbackTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Error hiding splash screen (fallback):', error);
      });
    }, 6000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={styles.container}>
            <StorageProvider>
              <I18nProvider>
                <ThemeProvider>
                <AuthProvider>
                  <AppLockProvider>
                  <AgriPayProvider>
                    <OnboardingProvider>
                      <ServiceInboardingProvider>
                        <LocationProvider>
                        <AddressProvider>
                        <CartProvider>
                          <WishlistProvider>
                            <BandaDeliveryProvider>
                              <DisputeProvider>
                                <LoyaltyProvider>
                                  <TrustProvider>
                                    <OrderProvider>
                                      <FarmProvider>
                                        <RootLayoutNav />
                                      </FarmProvider>
                                    </OrderProvider>
                                  </TrustProvider>
                                </LoyaltyProvider>
                              </DisputeProvider>
                            </BandaDeliveryProvider>
                          </WishlistProvider>
                        </CartProvider>
                        </AddressProvider>
                        </LocationProvider>
                      </ServiceInboardingProvider>
                    </OnboardingProvider>
                  </AgriPayProvider>
                  </AppLockProvider>
                </AuthProvider>
                </ThemeProvider>
              </I18nProvider>
            </StorageProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});