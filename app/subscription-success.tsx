import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, ArrowRight, Crown, Star, Award, Settings } from 'lucide-react-native';

export default function SubscriptionSuccessScreen() {
  const params = useLocalSearchParams();
  const planId = params.planId as string;
  const role = params.role as string;
  const tier = params.tier as string;
  const amount = params.amount as string;

  const getTierIcon = () => {
    switch (tier) {
      case 'premium':
        return Crown;
      case 'elite':
        return Award;
      default:
        return Star;
    }
  };

  const getTierColor = () => {
    switch (tier) {
      case 'premium':
        return '#8B5CF6';
      case 'elite':
        return '#DC2626';
      default:
        return '#F59E0B';
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'seller':
        return 'Seller';
      case 'service_provider':
        return 'Service Provider';
      case 'logistics_provider':
        return 'Logistics Provider';
      case 'farmer':
        return 'Farmer';
      default:
        return 'User';
    }
  };

  const getFeatures = () => {
    const baseFeatures = [
      'Unlimited listings',
      'Advanced analytics',
      'Priority support',
      'Enhanced visibility'
    ];

    if (tier === 'elite') {
      return [
        ...baseFeatures,
        'Dedicated account manager',
        'Custom branding',
        'API access',
        'Staff accounts'
      ];
    }

    return baseFeatures;
  };

  const TierIcon = getTierIcon();
  const tierColor = getTierColor();
  const features = getFeatures();

  const handleContinue = () => {
    router.replace('/(tabs)/marketplace');
  };

  const handleManageSubscription = () => {
    router.push('/settings' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.successBackground, { backgroundColor: tierColor + '20' }]}>
            <CheckCircle size={48} color="#10B981" />
            <View style={[styles.tierIconContainer, { backgroundColor: tierColor }]}>
              <TierIcon size={24} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Subscription Active!</Text>
        <Text style={styles.subtitle}>
          Welcome to {tier.charAt(0).toUpperCase() + tier.slice(1)} {getRoleTitle()}
        </Text>

        <Text style={styles.description}>
          Your subscription has been activated successfully. You now have access to all premium features.
        </Text>

        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <TierIcon size={32} color={tierColor} />
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} {getRoleTitle()}
              </Text>
              <Text style={styles.subscriptionPrice}>
                ${amount}/month
              </Text>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What's included:</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <CheckCircle size={16} color={tierColor} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.nextStepsContainer}>
          <Text style={styles.nextStepsTitle}>Next Steps</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Explore your new dashboard with advanced features
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Start using unlimited listings and analytics
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Contact support for personalized onboarding
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleManageSubscription}
          testID="manage-subscription-button"
        >
          <Settings size={20} color="#6B7280" />
          <Text style={styles.secondaryButtonText}>Manage Subscription</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: tierColor }]}
          onPress={handleContinue}
          testID="continue-button"
        >
          <Text style={styles.primaryButtonText}>Start Using Features</Text>
          <ArrowRight size={20} color="#FFFFFF" />
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  successBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierIconContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
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
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subscriptionPrice: {
    fontSize: 16,
    color: '#6B7280',
  },
  featuresContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  nextStepsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});