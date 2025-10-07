
import { useRouter } from 'expo-router';
import { useAgriPay } from '@/providers/agripay-provider';

export function useWalletCheck() {
  const router = useRouter();
  const { wallet, isLoading, hasWallet } = useAgriPay();

  const checkWalletAndNavigate = () => {
    console.log('[useWalletCheck] Checking wallet:', { isLoading, hasWallet, walletId: wallet?.id });
    
    if (isLoading) {
      console.log('[useWalletCheck] Still loading, skipping navigation');
      return;
    }

    if (!hasWallet) {
      console.log('[useWalletCheck] No wallet found, navigating to welcome screen');
      router.push('/wallet-welcome' as any);
    } else {
      console.log('[useWalletCheck] Wallet found, navigating to wallet screen');
      router.push('/(tabs)/wallet' as any);
    }
  };

  return {
    wallet,
    isLoading,
    hasWallet,
    checkWalletAndNavigate,
  };
}
