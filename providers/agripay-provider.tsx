import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "./auth-provider";
import { supabase } from "@/lib/supabase";

export interface AgriPayWallet {
  id: string;
  user_id: string;
  balance: number;
  reserve_balance: number;
  status: "active" | "suspended" | "frozen" | "closed";
  verification_level: "basic" | "verified" | "premium";
  daily_limit: number;
  transaction_limit: number;
  linked_methods: any[];
  pin_hash: string | null;
  biometric_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_transaction_at: string | null;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type:
    | "deposit"
    | "withdrawal"
    | "payment"
    | "refund"
    | "reserve_hold"
    | "reserve_release"
    | "reserve_refund"
    | "transfer_in"
    | "transfer_out"
    | "fee"
    | "commission";
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  reserve_before: number;
  reserve_after: number;
  status: "pending" | "completed" | "failed" | "reversed";
  reference_type: "order" | "service" | "delivery" | "subscription" | "dispute" | null;
  reference_id: string | null;
  payment_method: any;
  external_transaction_id: string | null;
  external_provider: string | null;
  description: string | null;
  metadata: any;
  created_at: string;
  completed_at: string | null;
}

export interface TrustScore {
  id: string;
  user_id: string;
  trust_score: number;
  total_transactions: number;
  successful_transactions: number;
  disputed_transactions: number;
  resolved_disputes: number;
  average_rating: number;
  total_ratings: number;
  late_deliveries: number;
  cancelled_orders: number;
  refund_requests: number;
  identity_verified: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  badges: any[];
  updated_at: string;
}

export const [AgriPayProvider, useAgriPay] = createContextHook(() => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<AgriPayWallet | null>(null);
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const walletQuery = trpc.agripay.getWallet.useQuery(
    { userId: user?.id || "" },
    { enabled: !!user?.id, refetchInterval: 30000 }
  );

  const createWalletMutation = trpc.agripay.createWallet.useMutation();
  const fundWalletMutation = trpc.agripay.fundWallet.useMutation();
  const withdrawFundsMutation = trpc.agripay.withdrawFunds.useMutation();
  const setPinMutation = trpc.agripay.setPin.useMutation();
  const verifyPinMutation = trpc.agripay.verifyPin.useMutation();

  useEffect(() => {
    console.log('[AgriPayProvider] Wallet query state:', {
      hasData: !!walletQuery.data,
      hasWallet: !!walletQuery.data?.wallet,
      hasError: !!walletQuery.error,
      isQueryLoading: walletQuery.isLoading,
      userId: user?.id
    });
    
    if (walletQuery.data) {
      if (walletQuery.data.wallet) {
        console.log('[AgriPayProvider] Wallet found:', walletQuery.data.wallet.id);
        setWallet(walletQuery.data.wallet);
      } else {
        console.log('[AgriPayProvider] No wallet in response');
        setWallet(null);
      }
      if (walletQuery.data.trustScore) {
        setTrustScore(walletQuery.data.trustScore);
      }
      setIsLoading(false);
      setError(null);
    } else if (walletQuery.error) {
      console.error('[AgriPayProvider] Wallet query error:', walletQuery.error.message);
      setError(walletQuery.error.message);
      setIsLoading(false);
      setWallet(null);
    } else if (!walletQuery.isLoading && user?.id) {
      console.log('[AgriPayProvider] Query finished, no data');
      setIsLoading(false);
    }
  }, [walletQuery.data, walletQuery.error, walletQuery.isLoading, user?.id]);

  useEffect(() => {
    if (!wallet?.id) return;

    const channel = supabase
      .channel(`wallet:${wallet.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agripay_wallets",
          filter: `id=eq.${wallet.id}`,
        },
        (payload) => {
          console.log("Wallet updated:", payload);
          if (payload.new) {
            setWallet(payload.new as AgriPayWallet);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [wallet?.id]);

  const createWallet = useCallback(async () => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      setIsLoading(true);
      const result = await createWalletMutation.mutateAsync({
        userId: user.id,
      });

      if (result.success && result.wallet) {
        setWallet(result.wallet);
        walletQuery.refetch();
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, createWalletMutation]);

  const fundWallet = useCallback(
    async (
      amount: number,
      paymentMethod: {
        type: "mpesa" | "bank" | "card" | "airtel" | "paypal" | "crypto";
        details: Record<string, any>;
      },
      externalTransactionId?: string,
      externalProvider?: string
    ) => {
      if (!wallet?.id) {
        throw new Error("Wallet not found");
      }

      try {
        const result = await fundWalletMutation.mutateAsync({
          walletId: wallet.id,
          amount,
          paymentMethod,
          externalTransactionId,
          externalProvider,
        });

        if (result.success) {
          walletQuery.refetch();
        }

        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [wallet?.id, fundWalletMutation]
  );

  const withdrawFunds = useCallback(
    async (
      amount: number,
      payoutMethod: "mpesa" | "bank" | "card",
      payoutDetails: {
        phoneNumber?: string;
        accountNumber?: string;
        bankCode?: string;
        accountName?: string;
      }
    ) => {
      if (!wallet?.id) {
        throw new Error("Wallet not found");
      }

      try {
        const result = await withdrawFundsMutation.mutateAsync({
          walletId: wallet.id,
          amount,
          payoutMethod,
          payoutDetails,
        });

        if (result.success) {
          walletQuery.refetch();
        }

        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [wallet?.id, withdrawFundsMutation]
  );

  const setPin = useCallback(
    async (pin: string) => {
      if (!wallet?.id) {
        throw new Error("Wallet not found");
      }

      try {
        const result = await setPinMutation.mutateAsync({
          walletId: wallet.id,
          pin,
        });

        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [wallet?.id, setPinMutation]
  );

  const verifyPin = useCallback(
    async (pin: string) => {
      if (!wallet?.id) {
        throw new Error("Wallet not found");
      }

      try {
        const result = await verifyPinMutation.mutateAsync({
          walletId: wallet.id,
          pin,
        });

        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [wallet?.id, verifyPinMutation]
  );

  const refreshWallet = useCallback(() => {
    walletQuery.refetch();
  }, [walletQuery]);

  return useMemo(
    () => ({
      wallet,
      trustScore,
      isLoading,
      error,
      hasWallet: !!wallet,
      createWallet,
      fundWallet,
      withdrawFunds,
      setPin,
      verifyPin,
      refreshWallet,
    }),
    [
      wallet,
      trustScore,
      isLoading,
      error,
      createWallet,
      fundWallet,
      withdrawFunds,
      setPin,
      verifyPin,
      refreshWallet,
    ]
  );
});
