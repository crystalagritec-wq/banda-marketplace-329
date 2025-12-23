import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Briefcase,
  Wrench,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';

const COLORS = {
  primary: '#2E7D32',
  orange: '#FF6B35',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  success: '#10B981',
} as const;

export default function ServiceProviderOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<'labor' | 'equipment' | null>(null);

  const createProfileMutation = trpc.serviceProviders.completeOnboarding.useMutation({
    onSuccess: (data: any) => {
      console.log('[Onboarding] Profile created:', data);
      if (Haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.push('/service-provider-dashboard');
    },
    onError: (error: any) => {
      console.error('[Onboarding] Error creating profile:', error);
    },
  });

  const handleSelectType = (type: 'labor' | 'equipment') => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (!selectedType) return;

    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    createProfileMutation.mutate({
      providerType: 'individual',
      personalDetails: {
        fullName: 'Service Provider',
        phone: '',
        email: '',
      },
      serviceTypes: selectedType === 'labor' ? ['agriculture'] : ['equipment_rental'],
      serviceAreas: ['Kenya'],
      discoverable: true,
      instantRequests: true,
      paymentMethod: 'agripay',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Service Provider</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800' }}
          style={styles.heroImage}
        />

        <View style={styles.section}>
          <Text style={styles.title}>What would you like to offer?</Text>
          <Text style={styles.subtitle}>
            Choose the type of service you want to provide on the marketplace
          </Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedType === 'labor' && styles.optionCardSelected,
              ]}
              onPress={() => handleSelectType('labor')}
            >
              <View style={styles.optionIcon}>
                <Briefcase size={32} color={selectedType === 'labor' ? COLORS.primary : COLORS.textLight} />
              </View>
              <Text style={styles.optionTitle}>Labor & Skills</Text>
              <Text style={styles.optionDescription}>
                Offer your expertise and skills to farmers and businesses
              </Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <CheckCircle2 size={16} color={COLORS.success} />
                  <Text style={styles.featureText}>Farm Management</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 size={16} color={COLORS.success} />
                  <Text style={styles.featureText}>Equipment Operation</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 size={16} color={COLORS.success} />
                  <Text style={styles.featureText}>Consultation Services</Text>
                </View>
              </View>
              {selectedType === 'labor' && (
                <View style={styles.selectedBadge}>
                  <CheckCircle2 size={20} color={COLORS.surface} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedType === 'equipment' && styles.optionCardSelected,
              ]}
              onPress={() => handleSelectType('equipment')}
            >
              <View style={styles.optionIcon}>
                <Wrench size={32} color={selectedType === 'equipment' ? COLORS.primary : COLORS.textLight} />
              </View>
              <Text style={styles.optionTitle}>Equipment Rental</Text>
              <Text style={styles.optionDescription}>
                List your equipment for rent and earn passive income
              </Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <CheckCircle2 size={16} color={COLORS.success} />
                  <Text style={styles.featureText}>Tractors & Machinery</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 size={16} color={COLORS.success} />
                  <Text style={styles.featureText}>Water Pumps</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle2 size={16} color={COLORS.success} />
                  <Text style={styles.featureText}>Harvesting Equipment</Text>
                </View>
              </View>
              {selectedType === 'equipment' && (
                <View style={styles.selectedBadge}>
                  <CheckCircle2 size={20} color={COLORS.surface} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Benefits of joining</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={20} color={COLORS.primary} />
                <Text style={styles.benefitText}>Reach thousands of potential customers</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={20} color={COLORS.primary} />
                <Text style={styles.benefitText}>Secure payments with AgriPay</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={20} color={COLORS.primary} />
                <Text style={styles.benefitText}>Build your reputation with reviews</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={20} color={COLORS.primary} />
                <Text style={styles.benefitText}>Manage bookings easily</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedType && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedType || createProfileMutation.isPending}
        >
          <Text style={styles.continueButtonText}>
            {createProfileMutation.isPending ? 'Creating Profile...' : 'Continue'}
          </Text>
          <ArrowRight size={20} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#ECFDF5',
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 14,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.textLight,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
