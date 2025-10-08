import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Award,
  Star,
  Trophy,
  Gift,
  Crown,
  ShieldCheck,
  Zap,
  TrendingUp,
  Target,
  Users,
  Sparkles,
  ChevronRight,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import { useLoyalty } from '@/providers/loyalty-provider';
import { useAuth } from '@/providers/auth-provider';

export default function RewardsHubScreen() {
  const { points, badges, challenges, referral } = useLoyalty();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'loyalty' | 'verification' | 'subscription'>('loyalty');

  const userTier = user?.membershipTier || 'basic';
  const isVerified = user?.kycStatus === 'verified';

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return '#8B5CF6';
      case 'elite': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'premium': return 'Premium';
      case 'elite': return 'Elite';
      default: return 'Basic';
    }
  };

  const pointsToNextReward = 1000 - (points % 1000);
  const progressPercentage = ((points % 1000) / 1000) * 100;

  const activeChallenges = challenges.filter(c => c.progress < c.target);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards Hub</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'loyalty' && styles.tabActive]}
          onPress={() => setSelectedTab('loyalty')}
        >
          <Award size={20} color={selectedTab === 'loyalty' ? '#2D5016' : '#9CA3AF'} />
          <Text style={[styles.tabText, selectedTab === 'loyalty' && styles.tabTextActive]}>
            Loyalty
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'verification' && styles.tabActive]}
          onPress={() => setSelectedTab('verification')}
        >
          <ShieldCheck size={20} color={selectedTab === 'verification' ? '#2D5016' : '#9CA3AF'} />
          <Text style={[styles.tabText, selectedTab === 'verification' && styles.tabTextActive]}>
            Verification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'subscription' && styles.tabActive]}
          onPress={() => setSelectedTab('subscription')}
        >
          <Crown size={20} color={selectedTab === 'subscription' ? '#2D5016' : '#9CA3AF'} />
          <Text style={[styles.tabText, selectedTab === 'subscription' && styles.tabTextActive]}>
            Membership
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedTab === 'loyalty' && (
          <View style={styles.content}>
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
                  <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Next Reward</Text>
                  <Text style={styles.progressValue}>{pointsToNextReward} pts</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                </View>
              </View>

              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction}>
                  <Gift size={20} color="#92400E" />
                  <Text style={styles.quickActionText}>Redeem</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <TrendingUp size={20} color="#92400E" />
                  <Text style={styles.quickActionText}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={() => router.push('/referrals' as any)}
                >
                  <Users size={20} color="#92400E" />
                  <Text style={styles.quickActionText}>Refer</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Challenges</Text>
                <Text style={styles.sectionCount}>{activeChallenges.length}</Text>
              </View>

              {activeChallenges.map((challenge) => {
                const progress = (challenge.progress / challenge.target) * 100;
                return (
                  <TouchableOpacity key={challenge.id} style={styles.challengeCard}>
                    <View style={styles.challengeIcon}>
                      <Target size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.challengeContent}>
                      <Text style={styles.challengeTitle}>{challenge.title}</Text>
                      <Text style={styles.challengeDescription}>{challenge.description}</Text>
                      
                      <View style={styles.challengeProgress}>
                        <View style={styles.challengeProgressBar}>
                          <View style={[styles.challengeProgressFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.challengeProgressText}>
                          {challenge.progress}/{challenge.target}
                        </Text>
                      </View>

                      <View style={styles.challengeFooter}>
                        <View style={styles.rewardBadge}>
                          <Zap size={14} color="#F59E0B" />
                          <Text style={styles.rewardText}>+{challenge.rewardPoints} pts</Text>
                        </View>
                        {challenge.endsAt && (
                          <View style={styles.timeBadge}>
                            <Clock size={14} color="#6B7280" />
                            <Text style={styles.timeText}>
                              {new Date(challenge.endsAt).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {badges.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your Badges</Text>
                  <Text style={styles.sectionCount}>{badges.length}</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
                  {badges.map((badge) => (
                    <View key={badge.id} style={styles.badgeCard}>
                      <LinearGradient
                        colors={['#DBEAFE', '#BFDBFE']}
                        style={styles.badgeGradient}
                      >
                        <Trophy size={32} color="#3B82F6" />
                        <Text style={styles.badgeName}>{badge.name}</Text>
                        <Text style={styles.badgeDate}>
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </Text>
                      </LinearGradient>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

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
                  <Text style={styles.referralTitle}>Invite Friends</Text>
                  <Text style={styles.referralDescription}>
                    Earn {referral.rewardPerInvite} points per referral
                  </Text>
                  <View style={styles.referralStats}>
                    <Text style={styles.referralCode}>Code: {referral.code}</Text>
                    <Text style={styles.referralCount}>{referral.invited} invited</Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#4F46E5" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {selectedTab === 'verification' && (
          <View style={styles.content}>
            <View style={styles.verificationStatusCard}>
              <LinearGradient
                colors={isVerified ? ['#D1FAE5', '#A7F3D0'] : ['#FEF3C7', '#FDE68A']}
                style={styles.statusGradient}
              >
                <View style={styles.statusIcon}>
                  {isVerified ? (
                    <CheckCircle size={48} color="#059669" />
                  ) : (
                    <ShieldCheck size={48} color="#F59E0B" />
                  )}
                </View>
                <Text style={styles.statusTitle}>
                  {isVerified ? 'Verified Account' : 'Verification Pending'}
                </Text>
                <Text style={styles.statusDescription}>
                  {isVerified
                    ? 'Your account is fully verified and trusted'
                    : 'Complete verification to unlock premium features'}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verification Levels</Text>

              <TouchableOpacity
                style={styles.verificationLevelCard}
                onPress={() => router.push({
                  pathname: '/verification' as any,
                  params: { roleType: user?.role, verificationMethod: 'ai_id' }
                })}
              >
                <View style={styles.levelIcon}>
                  <Zap size={24} color="#3B82F6" />
                </View>
                <View style={styles.levelContent}>
                  <Text style={styles.levelTitle}>AI ID Verification</Text>
                  <Text style={styles.levelDescription}>Quick automated verification</Text>
                  <View style={styles.levelFeatures}>
                    <Text style={styles.levelFeature}>• Instant verification</Text>
                    <Text style={styles.levelFeature}>• Basic trust badge</Text>
                    <Text style={styles.levelFeature}>• Standard features</Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.verificationLevelCard}
                onPress={() => router.push({
                  pathname: '/verification' as any,
                  params: { roleType: user?.role, verificationMethod: 'human_qr' }
                })}
              >
                <View style={[styles.levelIcon, { backgroundColor: '#DBEAFE' }]}>
                  <ShieldCheck size={24} color="#3B82F6" />
                </View>
                <View style={styles.levelContent}>
                  <Text style={styles.levelTitle}>Human + QR Verification</Text>
                  <Text style={styles.levelDescription}>Enhanced trust verification</Text>
                  <View style={styles.levelFeatures}>
                    <Text style={styles.levelFeature}>• Human review</Text>
                    <Text style={styles.levelFeature}>• QR code verification</Text>
                    <Text style={styles.levelFeature}>• Premium trust badge</Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.verificationLevelCard}
                onPress={() => router.push({
                  pathname: '/verification' as any,
                  params: { roleType: user?.role, verificationMethod: 'admin_approval' }
                })}
              >
                <View style={[styles.levelIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Crown size={24} color="#DC2626" />
                </View>
                <View style={styles.levelContent}>
                  <Text style={styles.levelTitle}>Elite Verification</Text>
                  <Text style={styles.levelDescription}>Maximum trust & credibility</Text>
                  <View style={styles.levelFeatures}>
                    <Text style={styles.levelFeature}>• Admin approval</Text>
                    <Text style={styles.levelFeature}>• Elite trust badge</Text>
                    <Text style={styles.levelFeature}>• All premium features</Text>
                  </View>
                </View>
                <ChevronRight size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>Verification Benefits</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <CheckCircle size={20} color="#10B981" />
                  <Text style={styles.benefitText}>Increased buyer trust</Text>
                </View>
                <View style={styles.benefitItem}>
                  <CheckCircle size={20} color="#10B981" />
                  <Text style={styles.benefitText}>Higher visibility in search</Text>
                </View>
                <View style={styles.benefitItem}>
                  <CheckCircle size={20} color="#10B981" />
                  <Text style={styles.benefitText}>Access to premium features</Text>
                </View>
                <View style={styles.benefitItem}>
                  <CheckCircle size={20} color="#10B981" />
                  <Text style={styles.benefitText}>Priority customer support</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'subscription' && (
          <View style={styles.content}>
            <View style={styles.currentTierCard}>
              <LinearGradient
                colors={[getTierColor(userTier) + '20', getTierColor(userTier) + '40']}
                style={styles.tierGradient}
              >
                <View style={styles.tierHeader}>
                  <View style={[styles.tierIcon, { backgroundColor: getTierColor(userTier) + '30' }]}>
                    <Crown size={32} color={getTierColor(userTier)} />
                  </View>
                  <View style={styles.tierInfo}>
                    <Text style={styles.tierLabel}>Current Tier</Text>
                    <Text style={[styles.tierName, { color: getTierColor(userTier) }]}>
                      {getTierName(userTier)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Plans</Text>

              <TouchableOpacity
                style={styles.planCard}
                onPress={() => router.push({
                  pathname: '/subscription' as any,
                  params: { role: user?.role, tier: 'premium' }
                })}
              >
                <LinearGradient
                  colors={['#F3E8FF', '#E9D5FF']}
                  style={styles.planGradient}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planIcon}>
                      <Crown size={28} color="#8B5CF6" />
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={styles.planName}>Premium</Text>
                      <Text style={styles.planPrice}>$29.99/month</Text>
                    </View>
                    {userTier === 'premium' && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.planFeatures}>
                    <View style={styles.planFeature}>
                      <CheckCircle size={16} color="#8B5CF6" />
                      <Text style={styles.planFeatureText}>Unlimited listings</Text>
                    </View>
                    <View style={styles.planFeature}>
                      <CheckCircle size={16} color="#8B5CF6" />
                      <Text style={styles.planFeatureText}>Regional/national reach</Text>
                    </View>
                    <View style={styles.planFeature}>
                      <CheckCircle size={16} color="#8B5CF6" />
                      <Text style={styles.planFeatureText}>Advanced analytics</Text>
                    </View>
                    <View style={styles.planFeature}>
                      <CheckCircle size={16} color="#8B5CF6" />
                      <Text style={styles.planFeatureText}>Priority support</Text>
                    </View>
                  </View>

                  {userTier !== 'premium' && (
                    <View style={styles.upgradeButton}>
                      <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                      <ChevronRight size={20} color="#8B5CF6" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.planCard}
                onPress={() => router.push({
                  pathname: '/subscription' as any,
                  params: { role: user?.role, tier: 'elite' }
                })}
              >
                <LinearGradient
                  colors={['#FEE2E2', '#FECACA']}
                  style={styles.planGradient}
                >
                  <View style={styles.popularBadge}>
                    <Star size={12} color="#FFFFFF" />
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>

                  <View style={styles.planHeader}>
                    <View style={styles.planIcon}>
                      <Trophy size={28} color="#DC2626" />
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={styles.planName}>Elite</Text>
                      <Text style={styles.planPrice}>$99.99/month</Text>
                    </View>
                    {userTier === 'elite' && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.planFeatures}>
                    <View style={styles.planFeature}>
                      <CheckCircle size={16} color="#DC2626" />
                      <Text style={styles.planFeatureText}>Everything in Premium</Text>
                    </View>
                    <View style={styles.planFeature}>
                      <CheckCircle size={16} color="#DC2626" />
                      <Text style={styles.planFeatureText}>Multi-market access</Text>
                    </View>
                    <View style={styles.planFeature}>
                      <CheckCircle size={16} color="#DC2626" />
                      <Text style={styles.planFeatureText}>Staff management</Text>
                    </View>
                    <View style={styles.planFeature}>
                      <CheckCircle size={16} color="#DC2626" />
                      <Text style={styles.planFeatureText}>Dedicated manager</Text>
                    </View>
                    <View style={styles.planFeature}>
                      <CheckCircle size={16} color="#DC2626" />
                      <Text style={styles.planFeatureText}>API access</Text>
                    </View>
                  </View>

                  {userTier !== 'elite' && (
                    <View style={[styles.upgradeButton, { backgroundColor: '#DC2626' }]}>
                      <Text style={[styles.upgradeButtonText, { color: '#FFFFFF' }]}>Upgrade to Elite</Text>
                      <ChevronRight size={20} color="#FFFFFF" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>Compare All Plans</Text>
              <TouchableOpacity 
                style={styles.comparisonButton}
                onPress={() => router.push('/subscription' as any)}
              >
                <Text style={styles.comparisonButtonText}>View Full Comparison</Text>
                <ChevronRight size={20} color="#2D5016" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#F0FDF4',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#2D5016',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  pointsCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(146, 64, 14, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
    fontWeight: '600',
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#78350F',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(146, 64, 14, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#92400E',
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  challengeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  challengeProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  challengeProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  challengeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  badgesScroll: {
    flexDirection: 'row',
  },
  badgeCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeGradient: {
    width: 120,
    padding: 16,
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 8,
  },
  badgeDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  referralCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  referralGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  referralIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  referralContent: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  referralDescription: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
  },
  referralStats: {
    flexDirection: 'row',
    gap: 12,
  },
  referralCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  referralCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verificationStatusCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusGradient: {
    padding: 32,
    alignItems: 'center',
  },
  statusIcon: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  verificationLevelCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  levelContent: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  levelFeatures: {
    gap: 2,
  },
  levelFeature: {
    fontSize: 12,
    color: '#4B5563',
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#4B5563',
  },
  currentTierCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tierGradient: {
    padding: 24,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tierInfo: {
    flex: 1,
  },
  tierLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    fontWeight: '600',
  },
  tierName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planGradient: {
    padding: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  currentBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planFeatures: {
    gap: 10,
    marginBottom: 16,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#4B5563',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  comparisonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  comparisonButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5016',
  },
});
