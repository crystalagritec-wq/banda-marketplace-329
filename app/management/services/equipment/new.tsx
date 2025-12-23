import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Upload,
  MapPin,
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

const EQUIPMENT_CATEGORIES = [
  'Tractors',
  'Water Pumps',
  'Harvesters',
  'Plows',
  'Sprayers',
  'Generators',
  'Tillers',
  'Seeders',
  'Others',
];

interface EquipmentFormData {
  category: string;
  type: string;
  brand: string;
  model: string;
  specifications: string;
  location: string;
  county: string;
  serviceRadius: string;
  pricePerHour: string;
  pricePerDay: string;
  images: string[];
  safetyNotes: string;
  condition: string;
}

export default function EquipmentListingWizardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState<EquipmentFormData>({
    category: '',
    type: '',
    brand: '',
    model: '',
    specifications: '',
    location: '',
    county: 'Nairobi',
    serviceRadius: '50',
    pricePerHour: '',
    pricePerDay: '',
    images: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'],
    safetyNotes: '',
    condition: 'Excellent',
  });

  const createEquipmentMutation = trpc.serviceProviders.createMarketplacePost.useMutation({
    onSuccess: () => {
      if (Haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Success', 'Your equipment has been listed successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to create equipment listing. Please try again.');
      console.error('[CreateEquipment] Error:', error);
    },
  });

  const handleNext = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    if (!formData.category || !formData.brand || !formData.pricePerDay) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    createEquipmentMutation.mutate({
      serviceTypeId: '2',
      serviceName: `${formData.brand} ${formData.model}`,
      category: formData.category,
      title: `${formData.brand} ${formData.model} - ${formData.category}`,
      description: `${formData.specifications}\n\nCondition: ${formData.condition}\n\nSafety Notes: ${formData.safetyNotes}`,
      pricingType: 'daily',
      startingPrice: parseFloat(formData.pricePerDay),
      serviceAreas: [formData.serviceRadius],
      locationCounty: formData.county,
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Equipment Category</Text>
            <Text style={styles.stepDescription}>
              Select the category that best describes your equipment
            </Text>
            <View style={styles.categoryGrid}>
              {EQUIPMENT_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryCard,
                    formData.category === category && styles.categoryCardSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, category })}
                >
                  <Text
                    style={[
                      styles.categoryCardText,
                      formData.category === category && styles.categoryCardTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                  {formData.category === category && (
                    <CheckCircle2 size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Equipment Identity</Text>
            <Text style={styles.stepDescription}>
              Provide details about your equipment
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Brand *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., John Deere, Massey Ferguson"
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Model</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5075E, MF 385"
                value={formData.model}
                onChangeText={(text) => setFormData({ ...formData, model: text })}
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Technical Specifications</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., 75HP, 4WD, with loader"
                value={formData.specifications}
                onChangeText={(text) => setFormData({ ...formData, specifications: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Condition</Text>
              <View style={styles.conditionRow}>
                {['Excellent', 'Good', 'Fair'].map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.conditionChip,
                      formData.condition === condition && styles.conditionChipSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, condition })}
                  >
                    <Text
                      style={[
                        styles.conditionChipText,
                        formData.condition === condition && styles.conditionChipTextSelected,
                      ]}
                    >
                      {condition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Location & Service Area</Text>
            <Text style={styles.stepDescription}>
              Where is your equipment located and how far can you service?
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Base Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Nairobi, Kiambu"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>County</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter county"
                value={formData.county}
                onChangeText={(text) => setFormData({ ...formData, county: text })}
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Radius (km)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 50"
                value={formData.serviceRadius}
                onChangeText={(text) => setFormData({ ...formData, serviceRadius: text.replace(/[^0-9]/g, '') })}
                keyboardType="numeric"
                placeholderTextColor={COLORS.textLight}
              />
              <Text style={styles.hint}>How far can you travel to provide service?</Text>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pricing</Text>
            <Text style={styles.stepDescription}>
              Set your rental rates
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price per Hour (KES)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1500"
                value={formData.pricePerHour}
                onChangeText={(text) => setFormData({ ...formData, pricePerHour: text.replace(/[^0-9]/g, '') })}
                keyboardType="numeric"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price per Day (KES) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 8000"
                value={formData.pricePerDay}
                onChangeText={(text) => setFormData({ ...formData, pricePerDay: text.replace(/[^0-9]/g, '') })}
                keyboardType="numeric"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.pricingTip}>
              <Text style={styles.pricingTipText}>
                💡 Tip: Daily rates typically offer better value than hourly rates
              </Text>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Media & Safety</Text>
            <Text style={styles.stepDescription}>
              Add photos and safety information
            </Text>

            <TouchableOpacity style={styles.uploadButton}>
              <Upload size={24} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>Upload Equipment Photos</Text>
              <Text style={styles.uploadHint}>Add up to 10 photos</Text>
            </TouchableOpacity>

            <View style={styles.imagePreview}>
              {formData.images.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.previewImage} />
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Safety Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Operator training required, PPE recommended"
                value={formData.safetyNotes}
                onChangeText={(text) => setFormData({ ...formData, safetyNotes: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Publish</Text>
            <Text style={styles.stepDescription}>
              Review your listing before publishing
            </Text>

            <View style={styles.previewCard}>
              <Image
                source={{ uri: formData.images[0] }}
                style={styles.previewCardImage}
              />
              <View style={styles.previewCardContent}>
                <Text style={styles.previewCardTitle}>
                  {formData.brand} {formData.model}
                </Text>
                <Text style={styles.previewCardCategory}>{formData.category}</Text>
                <Text style={styles.previewCardLocation}>
                  <MapPin size={14} color={COLORS.textLight} /> {formData.location}
                </Text>
                <Text style={styles.previewCardPrice}>
                  KES {parseFloat(formData.pricePerDay || '0').toLocaleString()}/day
                </Text>
              </View>
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Listing Details</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Category:</Text>
                <Text style={styles.summaryValue}>{formData.category}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Brand:</Text>
                <Text style={styles.summaryValue}>{formData.brand}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Model:</Text>
                <Text style={styles.summaryValue}>{formData.model}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Condition:</Text>
                <Text style={styles.summaryValue}>{formData.condition}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service Radius:</Text>
                <Text style={styles.summaryValue}>{formData.serviceRadius} km</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>List Equipment</Text>
          <Text style={styles.headerSubtitle}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.footer}>
        {currentStep < totalSteps ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <ArrowRight size={20} color={COLORS.surface} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.publishButton}
            onPress={handleSubmit}
            disabled={createEquipmentMutation.isPending}
          >
            <CheckCircle2 size={20} color={COLORS.surface} />
            <Text style={styles.publishButtonText}>
              {createEquipmentMutation.isPending ? 'Publishing...' : 'Publish Listing'}
            </Text>
          </TouchableOpacity>
        )}
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
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  categoryGrid: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  categoryCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#ECFDF5',
  },
  categoryCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryCardTextSelected: {
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
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
    minHeight: 100,
    paddingTop: 14,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 6,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  conditionChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  conditionChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  conditionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  conditionChipTextSelected: {
    color: COLORS.surface,
  },
  pricingTip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  pricingTipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#92400E',
  },
  uploadButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 8,
  },
  uploadHint: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  previewCardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  previewCardContent: {
    padding: 16,
  },
  previewCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  previewCardCategory: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  previewCardLocation: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  previewCardPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.orange,
  },
  summarySection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
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
  nextButton: {
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
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
  publishButton: {
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
  publishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
