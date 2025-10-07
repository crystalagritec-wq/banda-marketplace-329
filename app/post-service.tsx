import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Wrench,
  DollarSign,
  Clock,
  FileText,
  Save,
  Send,
  Phone,
  MessageCircle,
} from 'lucide-react-native';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
const WHITE = '#FFFFFF' as const;

interface ServiceFormData {
  title: string;
  category: string;
  description: string;
  pricingModel: 'fixed' | 'hourly' | 'negotiable';
  price: string;
  availability: string;
  location: string;
  contactPreference: 'phone' | 'chat' | 'both';
  images: string[];
}

const categories = [
  'Mechanization',
  'Veterinary',
  'Logistics',
  'Training',
  'Consulting',
  'Labor',
  'Other',
];

const availabilityOptions = [
  'Daily',
  'Weekends',
  'Seasonal',
  'On-demand',
];

export default function PostServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    category: '',
    description: '',
    pricingModel: 'fixed',
    price: '',
    availability: '',
    location: '',
    contactPreference: 'both',
    images: [],
  });

  const updateFormData = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    const mockImageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300&fit=crop`;
    if (formData.images.length < 3) {
      updateFormData('images', [...formData.images, mockImageUrl]);
    } else {
      Alert.alert('Limit Reached', 'You can only add up to 3 images for services');
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Draft Saved', 'Your service draft has been saved locally');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePostNow = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Information', 'Please enter a service title');
      return;
    }
    if (!formData.category) {
      Alert.alert('Missing Information', 'Please select a category');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Missing Information', 'Please provide a service description');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        'Service Posted!',
        'Your service has been posted successfully',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/marketplace'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to post service');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.category && formData.description.trim();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ArrowLeft size={24} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Service</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Service Title *</Text>
          <View style={styles.inputContainer}>
            <Wrench size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="e.g., Tractor Plowing Service"
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              testID="title-input"
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    formData.category === category && styles.categoryChipActive,
                  ]}
                  onPress={() => updateFormData('category', category)}
                  testID={`category-${category.toLowerCase()}`}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      formData.category === category && styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <FileText size={20} color="#9CA3AF" style={styles.textAreaIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your service, experience, equipment, etc."
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              testID="description-input"
            />
          </View>
        </View>

        {/* Pricing Model */}
        <View style={styles.section}>
          <Text style={styles.label}>Pricing Model</Text>
          <View style={styles.pricingModelRow}>
            {[
              { key: 'fixed', label: 'Fixed Price' },
              { key: 'hourly', label: 'Per Hour' },
              { key: 'negotiable', label: 'Negotiable' },
            ].map((model) => (
              <TouchableOpacity
                key={model.key}
                style={[
                  styles.pricingModelChip,
                  formData.pricingModel === model.key && styles.pricingModelChipActive,
                ]}
                onPress={() => updateFormData('pricingModel', model.key)}
                testID={`pricing-${model.key}`}
              >
                <Text
                  style={[
                    styles.pricingModelChipText,
                    formData.pricingModel === model.key && styles.pricingModelChipTextActive,
                  ]}
                >
                  {model.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price */}
        {formData.pricingModel !== 'negotiable' && (
          <View style={styles.section}>
            <Text style={styles.label}>
              Price {formData.pricingModel === 'hourly' ? '(per hour)' : ''}
            </Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.price}
                onChangeText={(text) => updateFormData('price', text)}
                keyboardType="numeric"
                testID="price-input"
              />
              <Text style={styles.currency}>KES</Text>
            </View>
          </View>
        )}

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.label}>Availability</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {availabilityOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.categoryChip,
                    formData.availability === option && styles.categoryChipActive,
                  ]}
                  onPress={() => updateFormData('availability', option)}
                  testID={`availability-${option.toLowerCase()}`}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      formData.availability === option && styles.categoryChipTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Service Location</Text>
          <View style={styles.inputContainer}>
            <MapPin size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="e.g., Nairobi and surrounding areas"
              value={formData.location}
              onChangeText={(text) => updateFormData('location', text)}
              testID="location-input"
            />
          </View>
        </View>

        {/* Contact Preference */}
        <View style={styles.section}>
          <Text style={styles.label}>Contact Preference</Text>
          <View style={styles.contactRow}>
            {[
              { key: 'phone', label: 'Phone', icon: Phone },
              { key: 'chat', label: 'Chat', icon: MessageCircle },
              { key: 'both', label: 'Both', icon: null },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.contactChip,
                  formData.contactPreference === option.key && styles.contactChipActive,
                ]}
                onPress={() => updateFormData('contactPreference', option.key)}
                testID={`contact-${option.key}`}
              >
                {option.icon && <option.icon size={16} color={
                  formData.contactPreference === option.key ? WHITE : '#6B7280'
                } />}
                <Text
                  style={[
                    styles.contactChipText,
                    formData.contactPreference === option.key && styles.contactChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.label}>Images (up to 3)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imagesRow}>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleAddImage}
                testID="add-image-button"
              >
                <Camera size={24} color="#9CA3AF" />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
              
              {formData.images.map((imageUri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.serviceImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                    testID={`remove-image-${index}`}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.draftButton}
          onPress={handleSaveDraft}
          disabled={loading}
          testID="save-draft-button"
        >
          <Save size={20} color="#6B7280" />
          <Text style={styles.draftButtonText}>Save Draft</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.postButton,
            !isFormValid && styles.postButtonDisabled,
          ]}
          onPress={handlePostNow}
          disabled={!isFormValid || loading}
          testID="post-now-button"
        >
          <Send size={20} color={WHITE} />
          <Text style={styles.postButtonText}>
            {loading ? 'Posting...' : 'Post Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  textAreaIcon: {
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: WHITE,
  },
  categoryChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: WHITE,
  },
  pricingModelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pricingModelChip: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: WHITE,
    alignItems: 'center',
  },
  pricingModelChipActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  pricingModelChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  pricingModelChipTextActive: {
    color: WHITE,
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contactChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: WHITE,
    gap: 6,
  },
  contactChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  contactChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  contactChipTextActive: {
    color: WHITE,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
  },
  serviceImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: WHITE,
    gap: 8,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  postButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: GREEN,
    gap: 8,
  },
  postButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
  },
});