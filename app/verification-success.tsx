import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { UserRole, VerificationMethod } from '@/lib/supabase';
import { CheckCircle, ArrowRight, Clock, Users, Shield } from 'lucide-react-native';

export default function VerificationSuccessScreen() {
  const params = useLocalSearchParams();
  const roleType = params.roleType as UserRole;
  const verificationMethod = params.verificationMethod as VerificationMethod;
  const message = params.message as string;

  const getVerificationInfo = () => {
    switch (verificationMethod) {
      case 'ai_id':
        return {
          title: 'AI Verification Submitted',
          description: 'Your documents are being processed by our AI system. This usually takes 2-5 minutes.',
          icon: Shield,
          color: '#10B981',
          estimatedTime: '2-5 minutes'
        };
      case 'human_qr':
        return {
          title: 'Human Review Submitted',
          description: 'Your documents will be reviewed by our verification team and field agents.',
          icon: Users,
          color: '#F59E0B',
          estimatedTime: '1-2 business days'
        };
      case 'admin_approval':
        return {
          title: 'Admin Review Submitted',
          description: 'Your application will be reviewed by our admin team for elite tier access.',
          icon: Clock,
          color: '#8B5CF6',
          estimatedTime: '3-5 business days'
        };
      default:
        return {
          title: 'Verification Submitted',
          description: 'Your verification request has been submitted successfully.',
          icon: CheckCircle,
          color: '#10B981',
          estimatedTime: 'Soon'
        };
    }
  };

  const getRoleTitle = () => {
    switch (roleType) {
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

  const verificationInfo = getVerificationInfo();
  const Icon = verificationInfo.icon;

  const handleContinue = () => {
    router.replace('/(tabs)/marketplace');
  };

  const handleViewStatus = () => {
    router.push('/verification-status' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: verificationInfo.color + '20' }]}>
            <Icon size={64} color={verificationInfo.color} />
          </View>
        </View>

        <Text style={styles.title}>{verificationInfo.title}</Text>
        <Text style={styles.subtitle}>
          {getRoleTitle()} Role Upgrade
        </Text>

        <Text style={styles.description}>
          {message || verificationInfo.description}
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Clock size={20} color="#6B7280" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Estimated Processing Time</Text>
              <Text style={styles.infoValue}>{verificationInfo.estimatedTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.nextStepsContainer}>
          <Text style={styles.nextStepsTitle}>What happens next?</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                {verificationMethod === 'ai_id' 
                  ? 'AI system processes your documents'
                  : 'Our team reviews your submission'
                }
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                You&apos;ll receive a notification with the result
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Once approved, your new role features will be activated
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleViewStatus}
          testID="view-status-button"
        >
          <Text style={styles.secondaryButtonText}>View Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: verificationInfo.color }]}
          onPress={handleContinue}
          testID="continue-button"
        >
          <Text style={styles.primaryButtonText}>Continue to Marketplace</Text>
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
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
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
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
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
    gap: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
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