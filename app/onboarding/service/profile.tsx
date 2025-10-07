import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Wrench } from 'lucide-react-native';

const SERVICE_CATEGORIES = [
  'Tractor Services',
  'Plowing',
  'Harvesting',
  'Spraying',
  'Transportation',
  'Veterinary',
  'Consultation',
  'Equipment Rental',
];

export default function ServiceProfileScreen() {
  const insets = useSafeAreaInsets();
  const { updateServiceData, setCurrentStep } = useOnboarding();
  
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');

  const progress = useMemo(() => {
    const baseProgress = 0;
    const stepWeight = 25;
    let filled = 0;
    const totalFields = 3;
    
    if (serviceName.trim()) filled++;
    if (category.trim()) filled++;
    if (contact.trim()) filled++;
    
    const stepProgress = (filled / totalFields) * stepWeight;
    return Math.round(baseProgress + stepProgress);
  }, [serviceName, category, contact]);

  const handleNext = () => {
    if (!serviceName.trim()) {
      Alert.alert('Required', 'Please enter your service name');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Required', 'Please select a category');
      return;
    }
    if (!contact.trim()) {
      Alert.alert('Required', 'Please enter contact information');
      return;
    }

    updateServiceData({
      name: serviceName,
      category,
    });
    
    setCurrentStep('service_offerings');
    router.push('/onboarding/service/offerings' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Wrench size={32} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Service Profile</Text>
          <Text style={styles.subtitle}>Set up your service business</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 4 • {progress}%</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Kamau Tractor Services"
              value={serviceName}
              onChangeText={setServiceName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <TextInput
              style={styles.input}
              placeholder="Select or type category"
              value={category}
              onChangeText={setCategory}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.categoryGrid}>
            {SERVICE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextSelected,
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Info *</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number or email"
              value={contact}
              onChangeText={setContact}
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 Service providers with complete profiles get 5x more bookings
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
    gap: 20,
  },
  inputGroup: {
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryChipTextSelected: {
    color: 'white',
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
