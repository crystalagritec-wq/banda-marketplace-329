import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/providers/onboarding-provider';
import { Store } from 'lucide-react-native';

export default function ShopProfileScreen() {
  const insets = useSafeAreaInsets();
  const { updateShopData, setCurrentStep } = useOnboarding();
  
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');

  const progress = useMemo(() => {
    const baseProgress = 0;
    const stepWeight = 25;
    let filled = 0;
    const totalFields = 3;
    
    if (shopName.trim()) filled++;
    if (category.trim()) filled++;
    if (contact.trim()) filled++;
    
    const stepProgress = (filled / totalFields) * stepWeight;
    return Math.round(baseProgress + stepProgress);
  }, [shopName, category, contact]);

  const handleNext = () => {
    if (!shopName.trim()) {
      Alert.alert('Required', 'Please enter your shop name');
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

    updateShopData({
      name: shopName,
      category,
      contact,
    });
    
    setCurrentStep('shop_products');
    router.push('/onboarding/shop/products' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Store size={32} color="#10B981" />
          </View>
          <Text style={styles.title}>Shop Profile</Text>
          <Text style={styles.subtitle}>Let's set up your shop</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 4 • {progress}%</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Shop Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Fresh Farm Produce"
              value={shopName}
              onChangeText={setShopName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Vegetables, Fruits, Dairy"
              value={category}
              onChangeText={setCategory}
              placeholderTextColor="#9CA3AF"
            />
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
              💡 Shops with complete profiles get 3x more visibility
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
