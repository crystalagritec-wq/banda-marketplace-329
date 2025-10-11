import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, Clock, AlertCircle, Award, Sparkles } from 'lucide-react-native';
import { useServiceInboarding } from '@/providers/service-inboarding-provider';
import { useEffect, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function ServiceSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, completeInboarding } = useServiceInboarding();
  const completeMutation = trpc.serviceProviders.completeOnboarding.useMutation();
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const handleComplete = async () => {
    if (!state.providerType) {
      Alert.alert('Incomplete', 'Select provider type first');
      return;
    }
    try {
      setSubmitting(true);
      const payload: any = {
        providerType: state.providerType,
        serviceTypes: state.serviceTypes,
        serviceAreas: state.availability.serviceAreas,
        discoverable: state.availability.discoverable,
        instantRequests: state.availability.instantRequests,
        paymentMethod: (state.payment.method ?? 'agripay') as 'agripay' | 'mpesa' | 'bank',
        accountDetails: state.payment.accountDetails || undefined,
      };
      if (state.providerType === 'individual') {
        payload.personalDetails = {
          fullName: state.personalDetails.fullName,
          idNumber: state.personalDetails.idNumber,
          phone: state.personalDetails.phone,
          email: state.personalDetails.email,
          address: state.personalDetails.address,
          profilePhoto: state.personalDetails.profilePhoto,
        };
      } else {
        payload.organizationDetails = {
          businessName: state.organizationDetails.businessName,
          registrationNumber: state.organizationDetails.registrationNumber,
          taxId: state.organizationDetails.taxId,
          contactPerson: state.organizationDetails.contactPerson,
          email: state.organizationDetails.email,
          logo: state.organizationDetails.logo,
        };
      }
      console.log('[ServiceSummary] Completing onboarding with', payload);
      const res = await completeMutation.mutateAsync(payload);
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to complete onboarding');
      }
      await completeInboarding();
      router.replace('/service-provider-dashboard' as any);
    } catch (e: any) {
      console.error('[ServiceSummary] Complete error', e);
      Alert.alert('Error', e?.message ?? 'Failed to complete onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  const verificationProgress = () => {
    let completed = 0;
    let total = 4;
    
    if (state.verification.idDocument) completed++;
    if (state.verification.license) completed++;
    if (state.verification.certificates.length > 0) completed++;
    if (state.equipment.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Summary', headerBackTitle: 'Back' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.celebrationContainer, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
          <View style={styles.celebrationIcon}>
            <Sparkles size={48} color="#FFD700" />
          </View>
          <Text style={styles.celebrationTitle}>Almost There!</Text>
          <Text style={styles.celebrationSubtitle}>
            Your service provider profile is {state.progress}% complete
          </Text>
        </Animated.View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { 
                  width: `${state.progress}%`,
                  opacity: fadeAnim,
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{state.progress}% Complete</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          
          <View style={styles.badgesGrid}>
            <View style={[styles.badgeCard, state.badges.verified && styles.badgeCardActive]}>
              <CheckCircle size={32} color={state.badges.verified ? '#34C759' : '#E5E7EB'} />
              <Text style={[styles.badgeLabel, state.badges.verified && styles.badgeLabelActive]}>
                Verified
              </Text>
            </View>

            <View style={[styles.badgeCard, state.badges.pending && styles.badgeCardPending]}>
              <Clock size={32} color={state.badges.pending ? '#FF9500' : '#E5E7EB'} />
              <Text style={[styles.badgeLabel, state.badges.pending && styles.badgeLabelPending]}>
                Pending
              </Text>
            </View>

            <View style={[styles.badgeCard, state.badges.equipmentVerified && styles.badgeCardActive]}>
              <Award size={32} color={state.badges.equipmentVerified ? '#007AFF' : '#E5E7EB'} />
              <Text style={[styles.badgeLabel, state.badges.equipmentVerified && styles.badgeLabelActive]}>
                Equipment
              </Text>
            </View>

            <View style={[styles.badgeCard, state.badges.goodConduct && styles.badgeCardActive]}>
              <CheckCircle size={32} color={state.badges.goodConduct ? '#34C759' : '#E5E7EB'} />
              <Text style={[styles.badgeLabel, state.badges.goodConduct && styles.badgeLabelActive]}>
                Good Conduct
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Provider Type</Text>
              <Text style={styles.summaryValue}>
                {state.providerType === 'individual' ? 'Individual' : 'Organization'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Types</Text>
              <Text style={styles.summaryValue}>{state.serviceTypes.length} selected</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Equipment</Text>
              <Text style={styles.summaryValue}>{state.equipment.length} items</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Areas</Text>
              <Text style={styles.summaryValue}>{state.availability.serviceAreas.length} regions</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Verification</Text>
              <Text style={styles.summaryValue}>{verificationProgress()}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.nextStepsBox}>
          <AlertCircle size={24} color="#007AFF" />
          <View style={styles.nextStepsContent}>
            <Text style={styles.nextStepsTitle}>Next Steps</Text>
            <Text style={styles.nextStepsText}>
              • Complete document verification{'\n'}
              • Add equipment photos{'\n'}
              • Start receiving service requests{'\n'}
              • Build your reputation
            </Text>
          </View>
        </View>

        <View style={styles.benefitsBox}>
          <Text style={styles.benefitsTitle}>🎉 What You Get</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>✓ Access to service requests</Text>
            <Text style={styles.benefitItem}>✓ Secure escrow payments</Text>
            <Text style={styles.benefitItem}>✓ Client ratings & reviews</Text>
            <Text style={styles.benefitItem}>✓ Performance analytics</Text>
            <Text style={styles.benefitItem}>✓ Growth opportunities</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, submitting && { opacity: 0.6 }]} onPress={handleComplete} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Finalizing...' : 'Go to Dashboard 🚀'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  celebrationContainer: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  celebrationIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFD70020',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden' as const,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center' as const,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  badgeCardActive: {
    borderColor: '#34C759',
    backgroundColor: '#34C75910',
  },
  badgeCardPending: {
    borderColor: '#FF9500',
    backgroundColor: '#FF950010',
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#8E8E93',
  },
  badgeLabelActive: {
    color: '#34C759',
  },
  badgeLabelPending: {
    color: '#FF9500',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
  },
  nextStepsBox: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row' as const,
    gap: 16,
    marginBottom: 16,
  },
  nextStepsContent: {
    flex: 1,
  },
  nextStepsTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1565C0',
    marginBottom: 8,
  },
  nextStepsText: {
    fontSize: 15,
    color: '#1565C0',
    lineHeight: 22,
  },
  benefitsBox: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#8B6914',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 15,
    color: '#8B6914',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
