import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Wallet, Shield, CheckCircle } from 'lucide-react-native';

export default function ShopWalletScreen() {
  const insets = useSafeAreaInsets();
  const { setCurrentStep } = useOnboarding();
  const [understood, setUnderstood] = useState(false);

  const progress = useMemo(() => {
    const baseProgress = 50;
    const stepWeight = 25;
    const stepProgress = understood ? stepWeight : 0;
    return Math.round(baseProgress + stepProgress);
  }, [understood]);

  const handleNext = () => {
    setUnderstood(true);
    setCurrentStep('shop_tutorial');
    router.push('/onboarding/shop/tutorial' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Wallet size={32} color="#10B981" />
          </View>
          <Text style={styles.title}>Wallet Setup</Text>
          <Text style={styles.subtitle}>Secure payments with AgriPay</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 4 • {progress}%</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Shield size={24} color="#10B981" />
            <Text style={styles.infoTitle}>Secure Escrow System</Text>
            <Text style={styles.infoText}>
              Buyer payments are held securely until delivery is confirmed. This protects both you and your customers.
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.featureText}>Instant payment notifications</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.featureText}>Auto-withdraw to M-Pesa</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.featureText}>Transaction history & analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.featureText}>Low transaction fees (2%)</Text>
            </View>
          </View>

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 Your wallet will be automatically created when you receive your first payment
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next →</Text>
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  content: {
    gap: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  hint: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hintText: {
    fontSize: 14,
    color: '#92400E',
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
