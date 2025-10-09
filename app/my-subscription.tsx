import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Crown,
  Check,
  Zap,
  Shield,
  TrendingUp,
  Star,
  Sparkles,
  Award,
  Users,
  BarChart3,
  Headphones,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/auth-provider';
import { trpc } from '@/lib/trpc';

type SubscriptionTier = 'free' | 'basic' | 'premium' | 'elite';

interface Plan {
  id: SubscriptionTier;
  name: string;
  price: number;
  period: string;
  features: string[];
  color: string;
  gradient: [string, string];
  icon: React.ReactNode;
  popular?: boolean;
  savings?: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      'List up to 5 products',
      'Basic marketplace access',
      'Standard support',
      'Community features',
    ],
    color: '#6B7280',
    gradient: ['#F3F4F6', '#E5E7EB'] as [string, string],
    icon: <Shield size={24} color="#6B7280" />,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 499,
    period: 'month',
    features: [
      'List up to 20 products',
      'Priority listing',
      'Email support',
      'Basic analytics',
      'Promotional tools',
      'Trust badge',
    ],
    color: '#10B981',
    gradient: ['#D1FAE5', '#A7F3D0'] as [string, string],
    icon: <TrendingUp size={24} color="#10B981" />,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999,
    period: 'month',
    features: [
      'Unlimited product listings',
      'Featured placement',
      'Priority support',
      'Advanced analytics',
      'Marketing tools',
      'Bulk operations',
      'Custom branding',
    ],
    color: '#F59E0B',
    gradient: ['#FEF3C7', '#FDE68A'] as [string, string],
    icon: <Star size={24} color="#F59E0B" />,
    popular: true,
    savings: 'Save 20%',
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 2499,
    period: 'month',
    features: [
      'Everything in Premium',
      'Dedicated account manager',
      '24/7 priority support',
      'Custom branding',
      'API access',
      'White-label options',
      'Advanced integrations',
      'Export capabilities',
    ],
    color: '#8B5CF6',
    gradient: ['#EDE9FE', '#DDD6FE'] as [string, string],
    icon: <Crown size={24} color="#8B5CF6" />,
  },
];

export default function MySubscriptionScreen() {
  const { user } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);

  const dashboardQuery = trpc.dashboard.getUserDashboard.useQuery({});
  const upgradeMutation = trpc.subscription.upgrade.useMutation();

  const currentTier = (dashboardQuery.data?.data?.subscription?.current_tier || 'free') as SubscriptionTier;
  const currentPlan = PLANS.find(p => p.id === currentTier) || PLANS[0];

  const handleUpgrade = async (planId: SubscriptionTier) => {
    if (planId === currentTier) {
      Alert.alert('Current Plan', 'You are already on this plan.');
      return;
    }

    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    setSelectedPlan(planId);

    Alert.alert(
      plan.price > currentPlan.price ? 'Upgrade Subscription' : 'Downgrade Subscription',
      `${plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade'} to ${plan.name} for KSh ${plan.price.toLocaleString()}/${plan.period}?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedPlan(null) },
        {
          text: plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade',
          onPress: async () => {
            try {
              setIsUpgrading(true);
              
              const tierNameMap: Record<SubscriptionTier, 'Basic' | 'Verified' | 'Premium' | 'Gold'> = {
                free: 'Basic',
                basic: 'Verified',
                premium: 'Premium',
                elite: 'Gold',
              };
              
              await upgradeMutation.mutateAsync({
                tierName: tierNameMap[planId],
                paymentMethod: 'mpesa',
              });

              await dashboardQuery.refetch();
              
              Alert.alert('Success', `Successfully ${plan.price > currentPlan.price ? 'upgraded' : 'downgraded'} to ${plan.name}!`);
            } catch (error) {
              console.error('Upgrade error:', error);
              Alert.alert('Error', 'Failed to update subscription. Please try again.');
            } finally {
              setIsUpgrading(false);
              setSelectedPlan(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={currentPlan.gradient}
          style={styles.currentPlanCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.currentPlanHeader}>
            <View style={[styles.currentPlanIcon, { backgroundColor: `${currentPlan.color}30` }]}>
              {currentPlan.icon}
            </View>
            <View style={styles.currentPlanInfo}>
              <Text style={styles.currentPlanLabel}>Current Plan</Text>
              <Text style={[styles.currentPlanName, { color: currentPlan.color }]}>
                {currentPlan.name}
              </Text>
            </View>
            <View style={[styles.activeBadge, { backgroundColor: currentPlan.color }]}>
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>
          <Text style={styles.currentPlanPrice}>
            {currentPlan.price === 0 ? 'Free Forever' : `KSh ${currentPlan.price.toLocaleString()}/${currentPlan.period}`}
          </Text>
          {currentPlan.price > 0 && (
            <Text style={styles.renewalText}>
              Renews automatically on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </Text>
          )}
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            <Text style={styles.sectionSubtitle}>Choose the plan that fits your needs</Text>
          </View>
          
          {PLANS.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Zap size={12} color="#FFFFFF" />
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <LinearGradient
                colors={plan.gradient}
                style={styles.planGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.planHeader}>
                  <View style={[styles.planIcon, { backgroundColor: `${plan.color}30` }]}>
                    {plan.icon}
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.planPrice}>
                        {plan.price === 0 ? 'Free' : `KSh ${plan.price.toLocaleString()}`}
                      </Text>
                      {plan.price > 0 && (
                        <Text style={styles.planPeriod}>/{plan.period}</Text>
                      )}
                    </View>
                    {plan.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{plan.savings}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.featuresList}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Check size={16} color={plan.color} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {plan.id !== currentTier ? (
                  <TouchableOpacity
                    style={[styles.upgradeButton, { backgroundColor: plan.color }]}
                    onPress={() => handleUpgrade(plan.id)}
                    disabled={isUpgrading && selectedPlan === plan.id}
                  >
                    {isUpgrading && selectedPlan === plan.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.upgradeButtonText}>
                          {plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade'}
                        </Text>
                        <Sparkles size={18} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.currentBadge}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.currentBadgeText}>Current Plan</Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Upgrade?</Text>
          <View style={styles.benefitsGrid}>
            <BenefitCard
              icon={<TrendingUp size={28} color="#10B981" />}
              title="Grow Faster"
              description="Reach more customers with unlimited listings"
            />
            <BenefitCard
              icon={<BarChart3 size={28} color="#3B82F6" />}
              title="Better Insights"
              description="Track performance with advanced analytics"
            />
            <BenefitCard
              icon={<Users size={28} color="#F59E0B" />}
              title="Build Trust"
              description="Stand out with verified badges"
            />
            <BenefitCard
              icon={<Headphones size={28} color="#8B5CF6" />}
              title="Priority Support"
              description="Get help when you need it most"
            />
          </View>
        </View>

        <View style={styles.faqCard}>
          <Award size={24} color="#2D5016" />
          <View style={styles.faqContent}>
            <Text style={styles.faqTitle}>Need Help Choosing?</Text>
            <Text style={styles.faqText}>
              Contact our team for personalized recommendations based on your business needs.
            </Text>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitIcon}>{icon as React.ReactElement}</View>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDescription}>{description}</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: '#1F2937' },
  headerRight: { width: 40 },
  content: { flex: 1, paddingHorizontal: 16 },
  currentPlanCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  currentPlanHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  currentPlanIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPlanInfo: { flex: 1 },
  currentPlanLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4, fontWeight: '600' as const },
  currentPlanName: { fontSize: 24, fontWeight: '700' as const },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeBadgeText: { fontSize: 12, fontWeight: '600' as const, color: '#FFFFFF' },
  currentPlanPrice: { fontSize: 18, fontWeight: '600' as const, color: '#1F2937', marginBottom: 4 },
  renewalText: { fontSize: 13, color: '#6B7280' },
  section: { marginTop: 28 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: '#1F2937', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#6B7280' },
  planCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: { fontSize: 10, fontWeight: '700' as const, color: '#FFFFFF' },
  planGradient: { padding: 20 },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 20 },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: { flex: 1 },
  planName: { fontSize: 20, fontWeight: '700' as const, color: '#1F2937', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  planPrice: { fontSize: 24, fontWeight: '700' as const, color: '#1F2937' },
  planPeriod: { fontSize: 16, fontWeight: '400' as const, color: '#6B7280', marginLeft: 2 },
  savingsBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  savingsText: { fontSize: 11, fontWeight: '700' as const, color: '#FFFFFF' },
  featuresList: { gap: 12, marginBottom: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 14, color: '#4B5563', flex: 1, lineHeight: 20 },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
  },
  upgradeButtonText: { fontSize: 16, fontWeight: '700' as const, color: '#FFFFFF' },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
  },
  currentBadgeText: { fontSize: 16, fontWeight: '600' as const, color: '#065F46' },
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  benefitCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  benefitIcon: { marginBottom: 12 },
  benefitTitle: { fontSize: 15, fontWeight: '700' as const, color: '#111827', marginBottom: 6, textAlign: 'center' as const },
  benefitDescription: { fontSize: 13, color: '#6B7280', textAlign: 'center' as const, lineHeight: 18 },
  faqCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: 16,
  },
  faqContent: { flex: 1 },
  faqTitle: { fontSize: 16, fontWeight: '700' as const, color: '#065F46', marginBottom: 6 },
  faqText: { fontSize: 14, color: '#047857', lineHeight: 20, marginBottom: 12 },
  contactButton: {
    backgroundColor: '#2D5016',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  contactButtonText: { fontSize: 14, fontWeight: '600' as const, color: '#FFFFFF' },
});
