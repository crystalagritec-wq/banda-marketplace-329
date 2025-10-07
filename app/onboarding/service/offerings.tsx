import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Wrench, Plus, X } from 'lucide-react-native';

export default function ServiceOfferingsScreen() {
  const insets = useSafeAreaInsets();
  const { updateServiceData, setCurrentStep } = useOnboarding();
  
  const [offerings, setOfferings] = useState<string[]>(['']);

  const progress = useMemo(() => {
    const baseProgress = 25;
    const stepWeight = 25;
    const validOfferings = offerings.filter(o => o.trim());
    
    if (validOfferings.length === 0) return baseProgress;
    
    const stepProgress = Math.min(validOfferings.length / 3, 1) * stepWeight;
    return Math.round(baseProgress + stepProgress);
  }, [offerings]);

  const addOffering = () => {
    setOfferings([...offerings, '']);
  };

  const removeOffering = (index: number) => {
    if (offerings.length > 1) {
      setOfferings(offerings.filter((_, i) => i !== index));
    }
  };

  const updateOffering = (index: number, value: string) => {
    const updated = [...offerings];
    updated[index] = value;
    setOfferings(updated);
  };

  const handleNext = () => {
    const validOfferings = offerings.filter(o => o.trim());
    
    if (validOfferings.length === 0) {
      Alert.alert('Required', 'Please add at least one service offering');
      return;
    }

    updateServiceData({
      offerings: validOfferings,
    });
    
    setCurrentStep('service_pricing');
    router.push('/onboarding/service/pricing' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Wrench size={32} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Service Offerings</Text>
          <Text style={styles.subtitle}>What services do you provide?</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 4 • {progress}%</Text>
        </View>

        <View style={styles.form}>
          {offerings.map((offering, index) => (
            <View key={index} style={styles.offeringRow}>
              <View style={styles.offeringInput}>
                <Text style={styles.label}>Service {index + 1} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Land Plowing - 1 Acre"
                  value={offering}
                  onChangeText={(value) => updateOffering(index, value)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {offerings.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeOffering(index)}
                >
                  <X size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addOffering}>
            <Plus size={20} color="#F59E0B" />
            <Text style={styles.addButtonText}>Add Another Service</Text>
          </TouchableOpacity>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>💡 Examples:</Text>
            <Text style={styles.exampleText}>
              • Land Plowing - Per Acre{'\n'}
              • Tractor Hire - Per Hour{'\n'}
              • Crop Spraying - Per Acre{'\n'}
              • Harvesting Services - Per Day{'\n'}
              • Veterinary Consultation - Per Visit
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
    paddingBottom: 24,
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
    gap: 20,
  },
  offeringRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  offeringInput: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  removeButton: {
    width: 40,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  exampleBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 22,
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
