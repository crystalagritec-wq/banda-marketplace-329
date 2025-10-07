import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStorage } from '@/providers/storage-provider';
import { useAuth } from '@/providers/auth-provider';
import { trpc } from '@/lib/trpc';
import { skipToken } from '@tanstack/react-query';

export type EscrowPreference = 'auto-release' | 'otp_required' | 'qr_required';

export interface TrustProfile {
  userId: string | null;
  trustScore: number;
  codLimit: number;
  activeCodOrders: number;
  codAllowed: boolean;
  escrowPreference: EscrowPreference;
  sellerTierBadges: Record<string, 'Verified' | 'Gold' | 'Elite' | 'None'>;
}

export interface TrustContextValue extends TrustProfile {
  setActiveCodOrders: (count: number) => void;
  updateTrustScore: (score: number) => void;
  setEscrowPreference: (pref: EscrowPreference) => void;
  setSellerBadge: (sellerId: string, badge: 'Verified' | 'Gold' | 'Elite' | 'None') => void;
  refresh: () => Promise<void>;
}

const STORAGE_KEY = 'trust:profile:v1';

export const [TrustProvider, useTrust] = createContextHook<TrustContextValue>(() => {
  const storage = useStorage();
  const { user } = useAuth();
  const [profile, setProfile] = useState<TrustProfile>({
    userId: null,
    trustScore: 3.5,
    codLimit: 1,
    activeCodOrders: 0,
    codAllowed: true,
    escrowPreference: 'otp_required',
    sellerTierBadges: {},
  });

  const pointsQuery = trpc.loyalty.getPoints.useQuery(
    user?.id ? { userId: user.id } : skipToken,
    { 
      staleTime: 60_000,
      enabled: !!user?.id
    }
  );

  useEffect(() => {
    const load = async () => {
      const raw = await storage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as TrustProfile;
          setProfile((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.log('[Trust] parse error', e);
        }
      }
    };
    load();
  }, [storage]);

  useEffect(() => {
    const persist = async () => {
      try {
        await storage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {
        console.log('[Trust] persist error', e);
      }
    };
    void persist();
  }, [profile, storage]);

  useEffect(() => {
    if (pointsQuery.data?.points != null) {
      const pts = pointsQuery.data.points;
      const newTrust = Math.max(1, Math.min(5, 3 + pts / 1000));
      const newCodLimit = newTrust >= 4.5 ? 3 : newTrust >= 4 ? 2 : 1;
      setProfile((p) => ({
        ...p,
        trustScore: newTrust,
        codLimit: newCodLimit,
        codAllowed: newTrust >= 3,
        escrowPreference: newTrust >= 4.5 ? 'auto-release' : p.escrowPreference,
      }));
    }
  }, [pointsQuery.data?.points]);

  const setActiveCodOrders = useCallback((count: number) => {
    setProfile((p) => ({ ...p, activeCodOrders: Math.max(0, count) }));
  }, []);

  const updateTrustScore = useCallback((score: number) => {
    const clamped = Math.max(1, Math.min(5, score));
    setProfile((p) => ({
      ...p,
      trustScore: clamped,
      codLimit: clamped >= 4.5 ? 3 : clamped >= 4 ? 2 : 1,
      codAllowed: clamped >= 3,
    }));
  }, []);

  const setEscrowPreference = useCallback((pref: EscrowPreference) => {
    setProfile((p) => ({ ...p, escrowPreference: pref }));
  }, []);

  const setSellerBadge = useCallback((sellerId: string, badge: 'Verified' | 'Gold' | 'Elite' | 'None') => {
    setProfile((p) => ({ ...p, sellerTierBadges: { ...p.sellerTierBadges, [sellerId]: badge } }));
  }, []);

  const refresh = useCallback(async () => {
    try {
      await pointsQuery.refetch();
    } catch (e) {
      console.log('[Trust] refresh error', e);
    }
  }, [pointsQuery]);

  return useMemo<TrustContextValue>(() => ({
    ...profile,
    setActiveCodOrders,
    updateTrustScore,
    setEscrowPreference,
    setSellerBadge,
    refresh,
  }), [profile, refresh, setActiveCodOrders, setEscrowPreference, setSellerBadge, updateTrustScore]);
});