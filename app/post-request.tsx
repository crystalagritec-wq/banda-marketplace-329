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
  MessageSquare,
  DollarSign,
  Hash,
  FileText,
  Save,
  Send,
  Clock,
  Zap,
  Calendar,
  CalendarDays,
} from 'lucide-react-native';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
const WHITE = '#FFFFFF' as const;

interface RequestFormData {
  title: string;
  category: string;
  description: string;
  budgetMin: string;
  budgetMax: string;
  negotiable: boolean;
  quantity: string;
  urgency: 'asap' | 'week' | 'month' | 'flexible';
  location: string;
  images: string[];
}

const categories = [
  'Seeds',
  'Poultry',
  'Inputs',
  'Machinery',
  'Services',
  'Labor',
  'Livestock',
  'Other',
];

const urgencyOptions = [
  { key: 'asap', label: 'ASAP', icon: Zap, color: '#EF4444' },
  { key: 'week', label: 'This Week', icon: Calendar, color: '#F59E0B' },
  { key: 'month', label: 'This Month', icon: CalendarDays, color: '#10B981' },
  { key: 'flexible', label: 'Flexible', icon: Clock, color: '#6B7280' },
];

export default function PostRequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<RequestFormData>({
    title: '',
    category: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    negotiable: false,
    quantity: '',
    urgency: 'flexible',
    location: '',
    images: [],
  });

  const updateFormData = (field: keyof RequestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    const mockImageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300&fit=crop`;
    if (formData.images.length < 3) {
      updateFormData('images', [...formData.images, mockImageUrl]);
    } else {
      Alert.alert('Limit Reached', 'You can only add up to 3 images for requests');
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
      Alert.alert('Draft Saved', 'Your request draft has been saved locally');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePostNow = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Information', 'Please enter a request title');
      return;
    }
    if (!formData.category) {
      Alert.alert('Missing Information', 'Please select a category');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Missing Information', 'Please provide a request description');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        'Request Posted!',
        'Your request has been posted successfully',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/requests'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to post request');
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
        <Text style={styles.headerTitle}>Post Request</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Request Title *</Text>
          <View style={styles.inputContainer}>
            <MessageSquare size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="e.g., Looking for Quality Maize Seeds"
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
              placeholder="Describe what you need, specifications, quality requirements, etc."
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              testID="description-input"
            />
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.label}>Budget Range</Text>
          <View style={styles.budgetRow}>
            <View style={[styles.inputContainer, styles.budgetInput]}>
              <DollarSign size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Min"
                value={formData.budgetMin}
                onChangeText={(text) => updateFormData('budgetMin', text)}
                keyboardType="numeric"
                testID="budget-min-input"
              />
              <Text style={styles.currency}>KES</Text>
            </View>
            
            <Text style={styles.budgetSeparator}>to</Text>
            
            <View style={[styles.inputContainer, styles.budgetInput]}>
              <DollarSign size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Max"
                value={formData.budgetMax}
                onChangeText={(text) => updateFormData('budgetMax', text)}
                keyboardType="numeric"
                testID="budget-max-input"
              />
              <Text style={styles.currency}>KES</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.negotiableButton,
              formData.negotiable && styles.negotiableButtonActive,
            ]}
            onPress={() => updateFormData('negotiable', !formData.negotiable)}
            testID="negotiable-toggle"
          >
            <Text
              style={[
                styles.negotiableButtonText,
                formData.negotiable && styles.negotiableButtonTextActive,
              ]}
            >
              Budget is negotiable
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.label}>Quantity (Optional)</Text>
          <View style={styles.inputContainer}>
            <Hash size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="e.g., 50 bags, 100 kg, 5 units"
              value={formData.quantity}
              onChangeText={(text) => updateFormData('quantity', text)}
              testID="quantity-input"
            />
          </View>
        </View>

        {/* Urgency */}
        <View style={styles.section}>
          <Text style={styles.label}>Urgency</Text>
          <View style={styles.urgencyGrid}>
            {urgencyOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.urgencyChip,
                    formData.urgency === option.key && styles.urgencyChipActive,
                  ]}
                  onPress={() => updateFormData('urgency', option.key)}
                  testID={`urgency-${option.key}`}
                >
                  <IconComponent
                    size={20}
                    color={
                      formData.urgency === option.key ? WHITE : option.color
                    }
                  />
                  <Text
                    style={[
                      styles.urgencyChipText,
                      formData.urgency === option.key && styles.urgencyChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputContainer}>
            <MapPin size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="e.g., Nairobi, Kenya"
              value={formData.location}
              onChangeText={(text) => updateFormData('location', text)}
              testID="location-input"
            />
          </View>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.label}>Reference Images (Optional)</Text>
          <Text style={styles.sublabel}>
            Add images to help others understand what you're looking for
          </Text>
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
                  <Image source={{ uri: imageUri }} style={styles.requestImage} />
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
  sublabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
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
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  budgetInput: {
    flex: 1,
  },
  budgetSeparator: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  negotiableButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: WHITE,
    alignItems: 'center',
  },
  negotiableButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  negotiableButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  negotiableButtonTextActive: {
    color: WHITE,
  },
  urgencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  urgencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: WHITE,
    gap: 8,
    minWidth: '45%',
  },
  urgencyChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  urgencyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  urgencyChipTextActive: {
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
  requestImage: {
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