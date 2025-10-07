import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStorage } from '@/providers/storage-provider';

export type LoyaltyEvent = 'purchase' | 'referral' | 'review' | 'streak' | 'challenge';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  endsAt?: string;
  rewardPoints: number;
  type: LoyaltyEvent;
}

export interface Referral {
  code: string;
  invited: number;
  rewardPerInvite: number;
}

export interface LoyaltyState {
  points: number;
  badges: Badge[];
  challenges: Challenge[];
  referral: Referral;
  awardPoints: (event: LoyaltyEvent, amount?: number) => void;
  completeChallenge: (id: string) => void;
  addBadge: (badge: Badge) => void;
  redeemReferral: (invites: number) => void;
  resetStreak: () => void;
}

const STORAGE_KEY = 'banda_loyalty_state';

function defaultChallenges(): Challenge[] {
  const now = new Date();
  const seasonEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  return [
    {
      id: 'seasonal-harvest',
      title: 'Seasonal Harvest Shopper',
      description: 'Place 5 orders this month',
      target: 5,
      progress: 0,
      endsAt: seasonEnd,
      rewardPoints: 200,
      type: 'purchase',
    },
    {
      id: 'refer-friends',
      title: 'Bring a Friend',
      description: 'Invite 3 friends to Banda',
      target: 3,
      progress: 0,
      rewardPoints: 300,
      type: 'referral',
    },
  ];
}

export const [LoyaltyProvider, useLoyalty] = createContextHook<LoyaltyState>(() => {
  const storage = useStorage();
  const [points, setPoints] = useState<number>(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>(defaultChallenges());
  const [referral, setReferral] = useState<Referral>({ code: 'BND-' + String(Date.now()).slice(-6), invited: 0, rewardPerInvite: 100 });

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await storage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setPoints(typeof parsed.points === 'number' ? parsed.points : 0);
          setBadges(Array.isArray(parsed.badges) ? parsed.badges : []);
          setChallenges(Array.isArray(parsed.challenges) ? parsed.challenges : defaultChallenges());
          setReferral(parsed.referral ?? referral);
        }
      } catch (e) {
        console.log('[Loyalty] load error', e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(async (next: { points?: number; badges?: Badge[]; challenges?: Challenge[]; referral?: Referral }) => {
    try {
      const state = {
        points: next.points ?? points,
        badges: next.badges ?? badges,
        challenges: next.challenges ?? challenges,
        referral: next.referral ?? referral,
      };
      await storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.log('[Loyalty] persist error', e);
    }
  }, [points, badges, challenges, referral, storage]);

  const addBadge = useCallback((badge: Badge) => {
    setBadges(prev => {
      const exists = prev.some(b => b.id === badge.id);
      const updated = exists ? prev : [...prev, badge];
      void persist({ badges: updated });
      return updated;
    });
  }, [persist]);

  const completeChallenge = useCallback((id: string) => {
    setChallenges(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, progress: c.target } : c);
      const done = updated.find(c => c.id === id);
      if (done && done.progress >= done.target) {
        setPoints(p => {
          const np = p + done.rewardPoints;
          void persist({ points: np });
          return np;
        });
        addBadge({ id: `badge-${id}`, name: done.title, description: done.description, icon: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=256&auto=format&fit=crop', earnedAt: new Date().toISOString() });
      }
      void persist({ challenges: updated });
      return updated;
    });
  }, [addBadge, persist]);

  const awardPoints = useCallback((event: LoyaltyEvent, amount: number = 0) => {
    let pts = 0;
    if (event === 'purchase') {
      pts = Math.max(1, Math.floor(amount / 100));
    } else if (event === 'referral') {
      pts = referral.rewardPerInvite;
    } else if (event === 'review') {
      pts = 10;
    } else if (event === 'streak') {
      pts = 5;
    } else if (event === 'challenge') {
      pts = amount;
    }
    setPoints(prev => {
      const np = prev + pts;
      void persist({ points: np });
      return np;
    });

    setChallenges(prev => {
      const updated = prev.map(c => {
        if ((c.type === event) && c.progress < c.target) {
          return { ...c, progress: Math.min(c.target, c.progress + 1) };
        }
        return c;
      });
      void persist({ challenges: updated });
      return updated;
    });
  }, [persist, referral.rewardPerInvite]);

  const redeemReferral = useCallback((invites: number) => {
    if (invites <= 0) return;
    setReferral(prev => {
      const next = { ...prev, invited: prev.invited + invites };
      void persist({ referral: next });
      return next;
    });
    for (let i = 0; i < invites; i++) awardPoints('referral');
  }, [awardPoints, persist]);

  const resetStreak = useCallback(() => {
    // No-op placeholder; in real app, track daily actions
  }, []);

  return useMemo(() => ({
    points,
    badges,
    challenges,
    referral,
    awardPoints,
    completeChallenge,
    addBadge,
    redeemReferral,
    resetStreak,
  }), [points, badges, challenges, referral, awardPoints, completeChallenge, addBadge, redeemReferral, resetStreak]);
});