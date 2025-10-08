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
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="payment-processing" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="order-success" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="wallet-welcome" options={{ headerShown: false }} />
      <Stack.Screen name="favorites" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="my-products" options={{ headerShown: false }} />
      <Stack.Screen name="insights" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="address" options={{ headerShown: false }} />
      <Stack.Screen name="disputes" options={{ headerShown: false }} />
      <Stack.Screen name="dispute/[disputeId]" options={{ headerShown: false }} />
      <Stack.Screen name="order-details" options={{ headerShown: false }} />
      <Stack.Screen name="order-tracking" options={{ headerShown: false }} />
      <Stack.Screen name="order-qr" options={{ headerShown: false }} />
      <Stack.Screen name="qr-scanner" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/intro-tour" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/role-selection" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/shop/profile" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/shop/products" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/shop/wallet" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/shop/tutorial" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="inboarding/service-role" options={{ headerShown: false }} />
      <Stack.Screen name="inboarding/service-details" options={{ headerShown: false }} />
      <Stack.Screen name="inboarding/service-types" options={{ headerShown: false }} />
      <Stack.Screen name="inboarding/service-verification" options={{ headerShown: false }} />
      <Stack.Screen name="inboarding/service-equipment" options={{ headerShown: false }} />
      <Stack.Screen name="inboarding/service-availability" options={{ headerShown: false }} />
      <Stack.Screen name="inboarding/service-payment" options={{ headerShown: false }} />
      <Stack.Screen name="inboarding/service-summary" options={{ headerShown: false }} />
      <Stack.Screen name="service-provider-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="settings/security" options={{ headerShown: false }} />
      <Stack.Screen name="settings/privacy" options={{ headerShown: false }} />
      <Stack.Screen name="settings/appearance" options={{ headerShown: false }} />
      <Stack.Screen name="settings/language" options={{ headerShown: false }} />
      <Stack.Screen name="settings/notifications" options={{ headerShown: false }} />
      <Stack.Screen name="settings/help" options={{ headerShown: false }} />
      <Stack.Screen name="settings/feedback" options={{ headerShown: false }} />
      <Stack.Screen name="settings/legal" options={{ headerShown: false }} />
      <Stack.Screen name="settings/delete-account" options={{ headerShown: false }} />
      <Stack.Screen name="app-lock-setup" options={{ headerShown: false }} />
      <Stack.Screen name="wallet-create-pin" options={{ headerShown: false }} />
      <Stack.Screen name="wallet-onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const hideSplash = async () => {
      try {
        if (Platform.OS !== 'web') {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.warn('Error hiding splash screen:', error);
      }
    };

    const timer = setTimeout(hideSplash, Platform.OS === 'web' ? 50 : 100);
    return () => clearTimeout(timer);
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
                                      <RootLayoutNav />
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