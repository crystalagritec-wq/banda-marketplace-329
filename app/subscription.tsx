import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { roleService } from '@/services/role-service';
import { UserRole, UserTier } from '@/lib/supabase';
import { ArrowLeft, Check, Crown, Star, Award, CreditCard, Shield } from 'lucide-react-native';

interface SubscriptionPlan {
  tier: UserTier;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  icon: React.ComponentType<any>;
  color: string;
  popular?: boolean;
}

const SUBSCRIPTION_PLANS: Record<UserRole, SubscriptionPlan[]> = {
  buyer: [
    {
      tier: 'premium',
      name: 'Premium Buyer',
      price: 9.99,
      currency: 'USD',
      period: 'month',
      features: [
        'Priority customer support',
        'Exclusive deals and discounts',
        'Advanced search filters',
        'Purchase protection',
        'Early access to new features'
      ],
      icon: Crown,
      color: '#8B5CF6'
    }
  ],
  seller: [
    {
      tier: 'premium',
      name: 'Premium Seller',
      price: 29.99,
      currency: 'USD',
      period: 'month',
      features: [
        'Unlimited product listings',
        'Regional/national reach',
        'Advanced analytics dashboard',
        'Discounted logistics rates',
        'Priority listing placement',
        'Bulk upload tools'
      ],
      icon: Crown,
      color: '#8B5CF6',
      popular: true
    },
    {
      tier: 'elite',
      name: 'Elite Seller',
      price: 99.99,
      currency: 'USD',
      period: 'month',
      features: [
        'Multi-market/export access',
        'Staff/agent account management',
        'Exclusive business opportunities',
        'Dedicated account manager',
        'Custom branding options',
        'API access for integrations'
      ],
      icon: Award,
      color: '#DC2626'
    }
  ],
  service_provider: [
    {
      tier: 'premium',
      name: 'Premium Service',
      price: 24.99,
      currency: 'USD',
      period: 'month',
      features: [
        'Unlimited service listings',
        'Regional/national reach',
        'Advanced booking system',
        'Customer management tools',
        'Performance analytics'
      ],
      icon: Crown,
      color: '#8B5CF6',
      popular: true
    },
    {
      tier: 'elite',
      name: 'Elite Service',
      price: 79.99,
      currency: 'USD',
      period: 'month',
      features: [
        'Institutional access (NGOs, gov)',
        'Staff account management',
        'Contract management system',
        'Dedicated support',
        'Custom service packages'
      ],
      icon: Award,
      color: '#DC2626'
    }
  ],
  logistics_provider: [
    {
      tier: 'premium',
      name: 'Premium Logistics',
      price: 39.99,
      currency: 'USD',
      period: 'month',
      features: [
        'Regional/national deliveries',
        'Advanced route optimization',
        'Pooling request system',
        'Fleet management tools',
        'Real-time tracking'
      ],
      icon: Crown,
      color: '#8B5CF6',
      popular: true
    },
    {
      tier: 'elite',
      name: 'Elite Logistics',
      price: 149.99,
      currency: 'USD',
      period: 'month',
      features: [
        'Export + bulk contracts',
        'Staff account management',
        'Enterprise integrations',
        'Dedicated logistics manager',
        'Custom pricing models'
      ],
      icon: Award,
      color: '#DC2626'
    }
  ],
  farmer: [
    {
      tier: 'premium',
      name: 'Premium Farm',
      price: 19.99,
      currency: 'USD',
      period: 'month',
      features: [
        'Advanced farm analytics',
        'Advisory services access',
        'Marketplace integration',
        'Weather forecasting',
        'Crop planning tools'
      ],
      icon: Crown,
      color: '#8B5CF6',
      popular: true
    },
    {
      tier: 'elite',
      name: 'Elite Farm',
      price: 59.99,
      currency: 'USD',
      period: 'month',
      features: [
        'Export market access',
        'Dedicated farm advisor',
        'Supply chain management',
        'Quality certification support',
        'Bulk buyer connections'
      ],
      icon: Award,
      color: '#DC2626'
    }
  ]
};

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const role = params.role as UserRole;
  const tier = params.tier as UserTier;
  const userId = params.userId as string;
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    if (role && SUBSCRIPTION_PLANS[role]) {
      const availablePlans = SUBSCRIPTION_PLANS[role];
      setPlans(availablePlans);
      
      // Auto-select the requested tier or the first plan
      const requestedPlan = availablePlans.find(plan => plan.tier === tier);
      setSelectedPlan(requestedPlan || availablePlans[0]);
    }
  }, [role, tier]);

  const handleSubscribe = async () => {
    if (!selectedPlan || !user) return;

    try {
      setIsProcessing(true);
      
      // Navigate to payment processing
      router.push({
        pathname: '/payment-processing' as any,
        params: {
          type: 'subscription',
          planId: `${role}_${selectedPlan.tier}`,
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          description: `${selectedPlan.name} - ${selectedPlan.period}ly subscription`,
          userId: user.id,
          role,
          tier: selectedPlan.tier
        }
      });
    } catch (error) {
      console.error('❌ Subscription error:', error);
      Alert.alert(
        'Error',
        'Failed to process subscription. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleTitle = (role: UserRole): string => {
    switch (role) {
      case 'seller': return 'Seller';
      case 'service_provider': return 'Service Provider';
      case 'logistics_provider': return 'Logistics Provider';
      case 'farmer': return 'Farmer';
      default: return 'Buyer';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Upgrade to {getRoleTitle(role)}</Text>
          <Text style={styles.description}>
            Choose a subscription plan to unlock premium features and grow your business on Banda.
          </Text>

          <View style={styles.plansContainer}>
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan?.tier === plan.tier;
              
              return (
                <TouchableOpacity
                  key={plan.tier}
                  style={[
                    styles.planCard,
                    isSelected && { borderColor: plan.color, borderWidth: 2 },
                    plan.popular && styles.popularPlan
                  ]}
                  onPress={() => setSelectedPlan(plan)}
                  testID={`plan-${plan.tier}`}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Star size={12} color="#FFFFFF" />
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}
                  
                  <View style={styles.planHeader}>
                    <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
                      <Icon size={24} color={plan.color} />
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>${plan.price}</Text>
                        <Text style={styles.period}>/{plan.period}</Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: plan.color }]}>
                        <Check size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Check size={16} color={plan.color} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.securityInfo}>
            <View style={styles.securityHeader}>
              <Shield size={20} color="#10B981" />
              <Text style={styles.securityTitle}>Secure Payment</Text>
            </View>
            <Text style={styles.securityText}>
              Your payment information is encrypted and secure. Cancel anytime from your account settings.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          {selectedPlan && (
            <>
              <Text style={styles.summaryText}>
                {selectedPlan.name} - ${selectedPlan.price}/{selectedPlan.period}
              </Text>
              <Text style={styles.summarySubtext}>
                Billed {selectedPlan.period}ly • Cancel anytime
              </Text>
            </>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            { backgroundColor: selectedPlan?.color || '#3B82F6' },
            !selectedPlan && styles.subscribeButtonDisabled
          ]}
          onPress={handleSubscribe}
          disabled={!selectedPlan || isProcessing}
          testID="subscribe-button"
        >
          <CreditCard size={20} color="#FFFFFF" />
          <Text style={styles.subscribeButtonText}>
            {isProcessing ? 'Processing...' : 'Subscribe Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 32,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  popularPlan: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  period: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 2,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },
  securityInfo: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  securityText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});