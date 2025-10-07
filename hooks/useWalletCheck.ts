
import { useRouter } from 'expo-router';
import { useAgriPay } from '@/providers/agripay-provider';

export function useWalletCheck() {
  const router = useRouter();
  const { wallet, isLoading, hasWallet } = useAgriPay();

  const checkWalletAndNavigate = () => {
    if (isLoading) {
      return;
    }

    if (!hasWallet) {
      router.push('/wallet-welcome' as any);
    } else {
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
