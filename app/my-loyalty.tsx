import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Star,
  Gift,
  Trophy,
  Zap,
  Target,
  Award,
  TrendingUp,
  Users,
  ShoppingBag,
  Heart,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLoyalty } from '@/providers/loyalty-provider';
import { trpc } from '@/lib/trpc';

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  completed: boolean;
  icon: React.ReactNode;
  color: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  color: string;
  available: boolean;
}

export default function MyLoyaltyScreen() {
  const loyalty = useLoyalty();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const redeemMutation = trpc.rewards.redeemPoints.useMutation();

  const challenges: Challenge[] = [
    { 
      id: '1', 
      title: 'First Purchase', 
      description: 'Make your first order on Banda', 
      points: 100, 
      progress: 1,
      target: 1,
      completed: true,
      icon: <ShoppingBag size={24} color="#10B981" />,
      color: '#10B981'
    },
    { 
      id: '2', 
      title: 'Refer a Friend', 
      description: 'Invite someone to join Banda', 
      points: 200, 
      progress: 0,
      target: 1,
      completed: false,
      icon: <Users size={24} color="#3B82F6" />,
      color: '#3B82F6'
    },
    { 
      id: '3', 
      title: 'Weekly Shopper', 
      description: 'Shop 3 times this week', 
      points: 150, 
      progress: 1,
      target: 3,
      completed: false,
      icon: <TrendingUp size={24} color="#F59E0B" />,
      color: '#F59E0B'
    },
    { 
      id: '4', 
      title: 'Product Reviewer', 
      description: 'Leave 5 product reviews', 
      points: 120, 
      progress: 2,
      target: 5,
      completed: false,
      icon: <Star size={24} color="#8B5CF6" />,
      color: '#8B5CF6'
    },
  ];

  const rewards: Reward[] = [
    { 
      id: '1', 
      title: '10% Off Coupon', 
      description: 'Get 10% off your next purchase',
      points: 500, 
      icon: <Gift size={24} color="#F59E0B" />,
      color: '#F59E0B',
      available: loyalty.points >= 500
    },
    { 
      id: '2', 
      title: 'Free Delivery', 
      description: 'Free delivery on your next order',
      points: 300, 
      icon: <Zap size={24} color="#10B981" />,
      color: '#10B981',
      available: loyalty.points >= 300
    },
    { 
      id: '3', 
      title: 'Premium Badge', 
      description: 'Display premium badge on your profile',
      points: 1000, 
      icon: <Award size={24} color="#8B5CF6" />,
      color: '#8B5CF6',
      available: loyalty.points >= 1000
    },
    { 
      id: '4', 
      title: 'Priority Support', 
      description: '30 days of priority customer support',
      points: 800, 
      icon: <Heart size={24} color="#EF4444" />,
      color: '#EF4444',
      available: loyalty.points >= 800
    },
  ];

  const handleRedeemReward = async (reward: Reward) => {
    if (!reward.available) {
      Alert.alert('Insufficient Points', `You need ${reward.points - loyalty.points} more points to redeem this reward.`);
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Redeem ${reward.title} for ${reward.points} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              setRedeeming(reward.id);
              await redeemMutation.mutateAsync({
                userId: '',
                rewardId: reward.id,
                pointsCost: reward.points,
              });
              Alert.alert('Success', `${reward.title} has been added to your account!`);
            } catch (error) {
              console.error('Redeem error:', error);
              Alert.alert('Error', 'Failed to redeem reward. Please try again.');
            } finally {
              setRedeeming(null);
            }
          },
        },
      ]
    );
  };

  const level = Math.floor(loyalty.points / 1000) + 1;
  const pointsToNextLevel = (level * 1000) - loyalty.points;
  const levelProgress = ((loyalty.points % 1000) / 1000) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty & Rewards</Text>
        <TouchableOpacity style={styles.shareButton} onPress={() => router.push('/referrals' as any)}>
          <Share2 size={22} color="#2D5016" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FEF3C7', '#FDE68A', '#FCD34D']}
          style={styles.pointsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.pointsHeader}>
            <View style={styles.pointsIconContainer}>
              <Sparkles size={32} color="#92400E" />
            </View>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsLabel}>Your Points</Text>
              <Text style={styles.pointsValue}>{loyalty.points.toLocaleString()}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Trophy size={20} color="#92400E" />
              <Text style={styles.levelText}>Level {level}</Text>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Next Level</Text>
              <Text style={styles.progressValue}>{pointsToNextLevel} pts</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${levelProgress}%` }]} />
            </View>
          </View>

          <Text style={styles.pointsSubtext}>
            Earn points with every purchase and unlock exclusive rewards
          </Text>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Target size={20} color="#1F2937" />
              <Text style={styles.sectionTitle}>Active Challenges</Text>
            </View>
            <Text style={styles.sectionCount}>{challenges.filter(c => !c.completed).length}</Text>
          </View>
          
          {challenges.map((challenge) => {
            const progress = (challenge.progress / challenge.target) * 100;
            return (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={[styles.challengeIcon, { backgroundColor: `${challenge.color}20` }]}>
                  {challenge.icon}
                </View>
                <View style={styles.challengeContent}>
                  <View style={styles.challengeHeader}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    {challenge.completed && (
                      <CheckCircle2 size={20} color="#10B981" />
                    )}
                  </View>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  
                  {!challenge.completed && (
                    <View style={styles.challengeProgress}>
                      <View style={styles.challengeProgressBar}>
                        <View style={[styles.challengeProgressFill, { width: `${progress}%`, backgroundColor: challenge.color }]} />
                      </View>
                      <Text style={styles.challengeProgressText}>
                        {challenge.progress}/{challenge.target}
                      </Text>
                    </View>
                  )}

                  <View style={styles.challengeFooter}>
                    <View style={[styles.rewardBadge, { backgroundColor: `${challenge.color}20` }]}>
                      <Star size={14} color={challenge.color} />
                      <Text style={[styles.rewardText, { color: challenge.color }]}>+{challenge.points} pts</Text>
                    </View>
                    {challenge.completed && (
                      <View style={styles.completedBadge}>
                        <CheckCircle2 size={14} color="#10B981" />
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Gift size={20} color="#1F2937" />
              <Text style={styles.sectionTitle}>Available Rewards</Text>
            </View>
          </View>
          
          <View style={styles.rewardsGrid}>
            {rewards.map((reward) => (
              <TouchableOpacity
                key={reward.id}
                style={[
                  styles.rewardCard,
                  !reward.available && styles.rewardCardDisabled
                ]}
                onPress={() => handleRedeemReward(reward)}
                disabled={!reward.available || redeeming === reward.id}
              >
                <LinearGradient
                  colors={reward.available ? [`${reward.color}20`, `${reward.color}10`] : ['#F3F4F6', '#E5E7EB']}
                  style={styles.rewardGradient}
                >
                  <View style={[styles.rewardIcon, { backgroundColor: reward.available ? `${reward.color}30` : '#D1D5DB' }]}>
                    {reward.icon}
                  </View>
                  <Text style={[styles.rewardTitle, !reward.available && styles.rewardTitleDisabled]}>
                    {reward.title}
                  </Text>
                  <Text style={[styles.rewardDescription, !reward.available && styles.rewardDescriptionDisabled]}>
                    {reward.description}
                  </Text>
                  <View style={styles.rewardPoints}>
                    <Star size={14} color={reward.available ? reward.color : '#9CA3AF'} />
                    <Text style={[styles.rewardPointsText, { color: reward.available ? reward.color : '#9CA3AF' }]}>
                      {reward.points} points
                    </Text>
                  </View>
                  {reward.available && (
                    <View style={[styles.redeemButton, { backgroundColor: reward.color }]}>
                      <Text style={styles.redeemButtonText}>Redeem</Text>
                    </View>
                  )}
                  {!reward.available && (
                    <View style={styles.lockedBadge}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.lockedText}>
                        {reward.points - loyalty.points} pts needed
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.referralCard}
          onPress={() => router.push('/referrals' as any)}
        >
          <LinearGradient
            colors={['#E0E7FF', '#C7D2FE']}
            style={styles.referralGradient}
          >
            <View style={styles.referralIcon}>
              <Users size={28} color="#4F46E5" />
            </View>
            <View style={styles.referralContent}>
              <Text style={styles.referralTitle}>Invite Friends & Earn</Text>
              <Text style={styles.referralDescription}>
                Get 200 points for each friend who joins Banda
              </Text>
            </View>
            <Share2 size={24} color="#4F46E5" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: '#1F2937', flex: 1, textAlign: 'center' as const },
  shareButton: { padding: 8 },
  content: { flex: 1, paddingHorizontal: 16 },
  pointsCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pointsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  pointsIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(146, 64, 14, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pointsInfo: { flex: 1 },
  pointsLabel: { fontSize: 14, color: '#92400E', marginBottom: 4, fontWeight: '600' as const },
  pointsValue: { fontSize: 36, fontWeight: '700' as const, color: '#78350F' },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(146, 64, 14, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  levelText: { fontSize: 14, fontWeight: '700' as const, color: '#92400E' },
  progressSection: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#92400E', fontWeight: '600' as const },
  progressValue: { fontSize: 13, color: '#92400E', fontWeight: '700' as const },
  progressBar: { height: 8, backgroundColor: 'rgba(146, 64, 14, 0.2)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#92400E', borderRadius: 4 },
  pointsSubtext: { fontSize: 13, color: '#92400E', lineHeight: 18 },
  section: { marginTop: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: '#1F2937' },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  challengeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  challengeContent: { flex: 1 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  challengeTitle: { fontSize: 16, fontWeight: '600' as const, color: '#1F2937' },
  challengeDescription: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  challengeProgress: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  challengeProgressBar: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  challengeProgressFill: { height: '100%', borderRadius: 3 },
  challengeProgressText: { fontSize: 12, fontWeight: '600' as const, color: '#4B5563' },
  challengeFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  rewardText: { fontSize: 12, fontWeight: '600' as const },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  completedText: { fontSize: 12, fontWeight: '600' as const, color: '#065F46' },
  rewardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  rewardCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardCardDisabled: { opacity: 0.7 },
  rewardGradient: { padding: 16, alignItems: 'center' },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  rewardTitle: { fontSize: 15, fontWeight: '700' as const, color: '#1F2937', textAlign: 'center' as const, marginBottom: 6 },
  rewardTitleDisabled: { color: '#9CA3AF' },
  rewardDescription: { fontSize: 12, color: '#6B7280', textAlign: 'center' as const, marginBottom: 12, lineHeight: 16 },
  rewardDescriptionDisabled: { color: '#9CA3AF' },
  rewardPoints: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  rewardPointsText: { fontSize: 13, fontWeight: '600' as const },
  redeemButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  redeemButtonText: { fontSize: 13, fontWeight: '700' as const, color: '#FFFFFF' },
  lockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  lockedText: { fontSize: 11, fontWeight: '600' as const, color: '#6B7280' },
  referralCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referralGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  referralIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  referralContent: { flex: 1 },
  referralTitle: { fontSize: 18, fontWeight: '700' as const, color: '#1F2937', marginBottom: 4 },
  referralDescription: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
});
