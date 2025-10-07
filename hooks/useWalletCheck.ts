import { useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAgriPay } from '@/providers/agripay-provider';

export function useWalletCheck() {
  const router = useRouter();
  const { wallet, isLoading, hasWallet, refreshWallet } = useAgriPay();
  const navigatingRef = useRef<boolean>(false);
  const retriesRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const decideNavigation = () => {
    console.log('[useWalletCheck] decideNavigation()', {
      isLoading,
      hasWallet,
      walletId: wallet?.id ?? null,
      retries: retriesRef.current,
    });

    if (navigatingRef.current) {
      console.log('[useWalletCheck] Navigation already in progress, aborting duplicate call');
      return;
    }

    if (hasWallet && wallet?.id) {
      navigatingRef.current = true;
      console.log('[useWalletCheck] Wallet found → navigating to /(tabs)/wallet');
      setTimeout(() => {
        router.push('/(tabs)/wallet' as any);
      }, 100);
      return;
    }

    if (!isLoading && !hasWallet) {
      navigatingRef.current = true;
      console.log('[useWalletCheck] No wallet and not loading → navigating to /wallet-welcome');
      setTimeout(() => {
        router.push('/wallet-welcome' as any);
      }, 100);
      return;
    }

    if (retriesRef.current >= 8) {
      navigatingRef.current = true;
      console.warn('[useWalletCheck] Timeout waiting for wallet query → fallback to /wallet-welcome');
      setTimeout(() => {
        router.push('/wallet-welcome' as any);
      }, 100);
      return;
    }

    retriesRef.current += 1;
    console.log('[useWalletCheck] Still loading → refetching and retrying', { attempt: retriesRef.current });
    try {
      refreshWallet();
    } catch (e) {
      console.warn('[useWalletCheck] refreshWallet threw', e);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      decideNavigation();
    }, 500);
  };

  const checkWalletAndNavigate = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    retriesRef.current = 0;
    navigatingRef.current = false;
    console.log('[useWalletCheck] Starting wallet check flow');
    decideNavigation();
  };

  return {
    wallet,
    isLoading,
    hasWallet,
    checkWalletAndNavigate,
  };
}
