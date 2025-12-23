import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
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
  border: '#E5E7EB',
} as const;

const SERVICE_CATEGORIES = [
  'Farm Management',
  'Plowing & Tilling',
  'Planting',
  'Harvesting',
  'Pest Control',
  'Irrigation',
  'Livestock Care',
  'Equipment Operation',
  'Consultation',
];

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Expert', 'Master'];

const PRICING_MODELS = [
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_day', label: 'Per Day' },
  { value: 'per_job', label: 'Per Job' },
];

export default function CreateServiceListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    skills: '',
    experienceLevel: '',
    pricingModel: 'per_day',
    priceFrom: '',
    availability: 'Available',
  });

  const createServiceMutation = trpc.serviceProviders.createMarketplacePost.useMutation({
    onSuccess: () => {
      if (Haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Success', 'Your service has been listed successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to create service listing. Please try again.');
      console.error('[CreateService] Error:', error);
    },
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.category || !formData.description || !formData.priceFrom) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    createServiceMutation.mutate({
      serviceTypeId: '1',
      serviceName: formData.title,
      category: formData.category,
      title: formData.title,
      description: formData.description,
      pricingType: formData.pricingModel as 'hourly' | 'daily' | 'fixed' | 'negotiable',
      startingPrice: parseFloat(formData.priceFrom),
      serviceAreas: [],
      locationCounty: 'Kenya',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Service Listing</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Service Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Professional Farm Plowing Service"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {SERVICE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  formData.category === category && styles.categoryChipSelected,
                ]}
                onPress={() => setFormData({ ...formData, category })}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    formData.category === category && styles.categoryChipTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your service in detail..."
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Skills</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Tractor operation, Soil analysis"
            value={formData.skills}
            onChangeText={(text) => setFormData({ ...formData, skills: text })}
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Experience Level</Text>
          <View style={styles.experienceRow}>
            {EXPERIENCE_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.experienceChip,
                  formData.experienceLevel === level && styles.experienceChipSelected,
                ]}
                onPress={() => setFormData({ ...formData, experienceLevel: level })}
              >
                <Text
                  style={[
                    styles.experienceChipText,
                    formData.experienceLevel === level && styles.experienceChipTextSelected,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Pricing Model</Text>
          <View style={styles.pricingRow}>
            {PRICING_MODELS.map((model) => (
              <TouchableOpacity
                key={model.value}
                style={[
                  styles.pricingChip,
                  formData.pricingModel === model.value && styles.pricingChipSelected,
                ]}
                onPress={() => setFormData({ ...formData, pricingModel: model.value })}
              >
                <Text
                  style={[
                    styles.pricingChipText,
                    formData.pricingModel === model.value && styles.pricingChipTextSelected,
                  ]}
                >
                  {model.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Price (KES) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter starting price"
            value={formData.priceFrom}
            onChangeText={(text) => setFormData({ ...formData, priceFrom: text.replace(/[^0-9]/g, '') })}
            keyboardType="numeric"
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.uploadButton}>
            <Upload size={24} color={COLORS.primary} />
            <Text style={styles.uploadButtonText}>Upload Service Images</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={createServiceMutation.isPending}
        >
          <CheckCircle2 size={20} color={COLORS.surface} />
          <Text style={styles.submitButtonText}>
            {createServiceMutation.isPending ? 'Creating...' : 'Publish Service'}
          </Text>
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
    borderBottomColor: COLORS.border,
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
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  categoryScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextSelected: {
    color: COLORS.surface,
  },
  experienceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  experienceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  experienceChipSelected: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  experienceChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  experienceChipTextSelected: {
    color: COLORS.surface,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pricingChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  pricingChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pricingChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pricingChipTextSelected: {
    color: COLORS.surface,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bottomSpacing: {
    height: 100,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
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
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
