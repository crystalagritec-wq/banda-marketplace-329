import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { DollarSign } from 'lucide-react-native';

export default function ServicePricingScreen() {
  const insets = useSafeAreaInsets();
  const { updateServiceData, setCurrentStep, state } = useOnboarding();
  
  const offerings = state.serviceData.offerings;
  const [pricing, setPricing] = useState<Record<string, string>>(
    offerings.reduce((acc, offering) => ({ ...acc, [offering]: '' }), {})
  );

  const progress = useMemo(() => {
    const baseProgress = 50;
    const stepWeight = 25;
    const filledPrices = Object.values(pricing).filter(p => p.trim()).length;
    
    if (filledPrices === 0) return baseProgress;
    
    const stepProgress = (filledPrices / offerings.length) * stepWeight;
    return Math.round(baseProgress + stepProgress);
  }, [pricing, offerings.length]);

  const updatePrice = (offering: string, price: string) => {
    setPricing({ ...pricing, [offering]: price });
  };

  const handleNext = () => {
    const filledPrices = Object.entries(pricing).filter(([_, price]) => price.trim());
    
    if (filledPrices.length === 0) {
      Alert.alert('Required', 'Please set prices for your services');
      return;
    }

    const pricingData = Object.entries(pricing).reduce((acc, [offering, price]) => {
      if (price.trim()) {
        acc[offering] = parseFloat(price) || 0;
      }
      return acc;
    }, {} as Record<string, number>);

    updateServiceData({
      pricing: pricingData,
    });
    
    setCurrentStep('service_availability');
    router.push('/onboarding/service/availability' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <DollarSign size={32} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Set Your Pricing</Text>
          <Text style={styles.subtitle}>How much do you charge?</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 4 • {progress}%</Text>
        </View>

        <View style={styles.form}>
          {offerings.map((offering, index) => (
            <View key={index} style={styles.priceCard}>
              <Text style={styles.offeringName}>{offering}</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currency}>KSh</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={pricing[offering]}
                  onChangeText={(value) => updatePrice(offering, value)}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          ))}

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 Competitive pricing attracts more customers. You can adjust prices anytime from your dashboard.
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
    backgroundColor: '#F59E0B20',
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
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  priceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  offeringName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  hint: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 8,
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
    backgroundColor: '#F59E0B',
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
