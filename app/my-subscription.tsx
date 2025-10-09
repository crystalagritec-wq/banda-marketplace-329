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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Crown,
  Check,
  Zap,
  Shield,
  TrendingUp,
  Star,
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
  icon: React.ReactNode;
  popular?: boolean;
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
    ],
    color: '#10B981',
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
    ],
    color: '#F59E0B',
    icon: <Star size={24} color="#F59E0B" />,
    popular: true,
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
    ],
    color: '#8B5CF6',
    icon: <Crown size={24} color="#8B5CF6" />,
  },
];

export default function MySubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

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

    Alert.alert(
      'Upgrade Subscription',
      `Upgrade to ${plan.name} for KSh ${plan.price}/${plan.period}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            try {
              setIsUpgrading(true);
              
              await upgradeMutation.mutateAsync({
                userId: user?.id || '',
                tier: planId,
                paymentMethod: 'mpesa',
              });

              await dashboardQuery.refetch();
              
              Alert.alert('Success', `Successfully upgraded to ${plan.name}!`);
            } catch (error) {
              console.error('Upgrade error:', error);
              Alert.alert('Error', 'Failed to upgrade subscription. Please try again.');
            } finally {
              setIsUpgrading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <View style={[styles.currentPlanIcon, { backgroundColor: `${currentPlan.color}20` }]}>
                {currentPlan.icon}
              </View>
              <View style={styles.currentPlanInfo}>
                <Text style={styles.currentPlanLabel}>Current Plan</Text>
                <Text style={[styles.currentPlanName, { color: currentPlan.color }]}>
                  {currentPlan.name}
                </Text>
              </View>
            </View>
            <Text style={styles.currentPlanPrice}>
              {currentPlan.price === 0 ? 'Free' : `KSh ${currentPlan.price.toLocaleString()}/${currentPlan.period}`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            
            {PLANS.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Zap size={12} color="#FFFFFF" />
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <View style={styles.planHeader}>
                  <View style={[styles.planIcon, { backgroundColor: `${plan.color}20` }]}>
                    {plan.icon}
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>
                      {plan.price === 0 ? 'Free' : `KSh ${plan.price.toLocaleString()}`}
                      <Text style={styles.planPeriod}>/{plan.period}</Text>
                    </Text>
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

                {plan.id !== currentTier && (
                  <TouchableOpacity
                    style={[styles.upgradeButton, { backgroundColor: plan.color }]}
                    onPress={() => handleUpgrade(plan.id)}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.upgradeButtonText}>
                        {plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}

                {plan.id === currentTier && (
                  <View style={styles.currentBadge}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.currentBadgeText}>Current Plan</Text>
                  </View>
                )}
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
  currentPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currentPlanHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  currentPlanIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPlanInfo: { flex: 1 },
  currentPlanLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  currentPlanName: { fontSize: 20, fontWeight: '700' },
  currentPlanPrice: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  planPrice: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  planPeriod: { fontSize: 14, fontWeight: '400', color: '#6B7280' },
  featuresList: { gap: 12, marginBottom: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 14, color: '#4B5563', flex: 1 },
  upgradeButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  upgradeButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 14,
  },
  currentBadgeText: { fontSize: 15, fontWeight: '600', color: '#065F46' },
});
