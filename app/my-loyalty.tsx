import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Star,
  Gift,
  Trophy,
  Zap,
  Target,
  Award,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLoyalty } from '@/providers/loyalty-provider';

export default function MyLoyaltyScreen() {
  const insets = useSafeAreaInsets();
  const loyalty = useLoyalty();

  const challenges = [
    { id: '1', title: 'First Purchase', description: 'Make your first order', points: 100, completed: true },
    { id: '2', title: 'Refer a Friend', description: 'Invite someone to join', points: 200, completed: false },
    { id: '3', title: 'Weekly Shopper', description: 'Shop 3 times this week', points: 150, completed: false },
  ];

  const rewards = [
    { id: '1', title: '10% Off Coupon', points: 500, icon: <Gift size={24} color="#F59E0B" /> },
    { id: '2', title: 'Free Delivery', points: 300, icon: <Zap size={24} color="#10B981" /> },
    { id: '3', title: 'Premium Badge', points: 1000, icon: <Award size={24} color="#8B5CF6" /> },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loyalty & Rewards</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.pointsCard}
          >
            <View style={styles.pointsHeader}>
              <Star size={32} color="#FFFFFF" />
              <View style={styles.pointsInfo}>
                <Text style={styles.pointsLabel}>Your Points</Text>
                <Text style={styles.pointsValue}>{loyalty.points.toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.pointsSubtext}>
              Earn points with every purchase and unlock exclusive rewards
            </Text>
          </LinearGradient>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color="#1F2937" />
              <Text style={styles.sectionTitle}>Active Challenges</Text>
            </View>
            
            {challenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  </View>
                  <View style={styles.challengePoints}>
                    <Star size={16} color="#F59E0B" />
                    <Text style={styles.challengePointsText}>+{challenge.points}</Text>
                  </View>
                </View>
                {challenge.completed ? (
                  <View style={styles.completedBadge}>
                    <Trophy size={14} color="#10B981" />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                ) : (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '60%' }]} />
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Gift size={20} color="#1F2937" />
              <Text style={styles.sectionTitle}>Available Rewards</Text>
            </View>
            
            {rewards.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardIcon}>
                  {reward.icon}
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <View style={styles.rewardPoints}>
                    <Star size={14} color="#F59E0B" />
                    <Text style={styles.rewardPointsText}>{reward.points} points</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    loyalty.points < reward.points && styles.redeemButtonDisabled
                  ]}
                  disabled={loyalty.points < reward.points}
                >
                  <Text style={styles.redeemButtonText}>Redeem</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  headerRight: { width: 40 },
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
  pointsHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  pointsInfo: { flex: 1 },
  pointsLabel: { fontSize: 14, color: '#FFFFFF', opacity: 0.9, marginBottom: 4 },
  pointsValue: { fontSize: 36, fontWeight: '700', color: '#FFFFFF' },
  pointsSubtext: { fontSize: 13, color: '#FFFFFF', opacity: 0.9 },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  challengeDescription: { fontSize: 13, color: '#6B7280' },
  challengePoints: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  challengePointsText: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedText: { fontSize: 12, fontWeight: '600', color: '#065F46' },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 3 },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rewardInfo: { flex: 1 },
  rewardTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  rewardPoints: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardPointsText: { fontSize: 13, color: '#6B7280' },
  redeemButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  redeemButtonDisabled: { backgroundColor: '#E5E7EB' },
  redeemButtonText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});
