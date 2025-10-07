import { useRouter } from 'expo-router';
import { useAgriPay } from '@/providers/agripay-provider';

export function useWalletCheck() {
  const router = useRouter();
  const { wallet, isLoading, hasWallet } = useAgriPay();

  const checkWalletAndNavigate = () => {
    console.log('[useWalletCheck] Checking wallet:', {
      isLoading,
      hasWallet,
      walletId: wallet?.id ?? null,
    });

    if (isLoading) {
      console.log('[useWalletCheck] Still loading, waiting...');
      return;
    }

    if (hasWallet && wallet?.id) {
      console.log('[useWalletCheck] Wallet found → navigating to /(tabs)/wallet');
      router.push('/(tabs)/wallet' as any);
    } else {
      console.log('[useWalletCheck] No wallet → navigating to /wallet-welcome');
      router.push('/wallet-welcome' as any);
    }
  };

  return {
    wallet,
    isLoading,
    hasWallet,
    checkWalletAndNavigate,
  };
}
