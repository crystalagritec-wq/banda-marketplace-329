import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Wallet, Shield, Bell, CheckCircle } from 'lucide-react-native';

export default function LogisticsPaymentScreen() {
  const insets = useSafeAreaInsets();
  const { completeRole, state } = useOnboarding();

  const handleComplete = () => {
    completeRole('logistics');
    router.replace('/dashboard' as any);
  };

  const isOwner = state.logisticsData.role === 'owner';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Payments & Notifications</Text>
          <Text style={styles.subtitle}>How you get paid and stay informed</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 4 • 100%</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Wallet size={24} color="#10B981" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Payment Split</Text>
              <Text style={styles.featureText}>
                {isOwner 
                  ? 'Transparent payment split between you and your drivers. You set the percentage split for each delivery.'
                  : 'Receive your agreed percentage of each delivery fee directly to your wallet.'}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Shield size={24} color="#3B82F6" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Escrow Protection</Text>
              <Text style={styles.featureText}>
                Payment is held in escrow and released to your AgriPay wallet after delivery is confirmed by the customer
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Bell size={24} color="#F59E0B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Real-time Notifications</Text>
              <Text style={styles.featureText}>
                {isOwner 
                  ? 'Both you and your drivers receive instant notifications for new delivery requests'
                  : 'Get notified immediately when you\'re assigned to a delivery'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.successBox}>
          <CheckCircle size={48} color="#10B981" />
          <Text style={styles.successTitle}>Logistics Hub Active! 🚚💨</Text>
          <Text style={styles.successText}>
            Your logistics profile is ready. You'll start receiving delivery requests once your verification is complete.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  features: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065F46',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
