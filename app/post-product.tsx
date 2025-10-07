import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Package,
  DollarSign,
  Hash,
  FileText,
  Save,
  Send,
} from 'lucide-react-native';
import { useLocation } from '@/providers/location-provider';
import { trpc } from '@/lib/trpc';
import { LocationPickerModal } from '@/components/LocationPickerModal';

const GREEN = '#2E7D32' as const;
const ORANGE = '#F57C00' as const;
const WHITE = '#FFFFFF' as const;

interface ProductFormData {
  title: string;
  category: string;
  description: string;
  price: string;
  negotiable: boolean;
  stock: string;
  unit: string;
  images: string[];
}

const categories = [
  'Seeds',
  'Poultry',
  'Inputs',
  'Machinery',
  'Livestock',
  'Produce',
  'Other',
];

export default function PostProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userLocation, getCurrentLocation, isLoadingLocation } = useLocation();
  const [loading, setLoading] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    category: '',
    description: '',
    price: '',
    negotiable: false,
    stock: '1',
    unit: 'unit',
    images: [],
  });

  const createProductMutation = trpc.shop.createProduct.useMutation();

  useEffect(() => {
    if (!userLocation) {
      getCurrentLocation();
    }
  }, [userLocation, getCurrentLocation]);

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddImage = () => {
    // Mock image addition - in real app would use expo-image-picker
    const mockImageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300&fit=crop`;
    if (formData.images.length < 5) {
      updateFormData('images', [...formData.images, mockImageUrl]);
    } else {
      Alert.alert('Limit Reached', 'You can only add up to 5 images');
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Information', 'Please enter a product title');
      return;
    }
    if (!userLocation) {
      Alert.alert('Location Required', 'Please set your location before saving');
      return;
    }

    setLoading(true);
    try {
      await createProductMutation.mutateAsync({
        title: formData.title,
        category: formData.category || 'Other',
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        negotiable: formData.negotiable,
        stock: parseInt(formData.stock) || 0,
        unit: formData.unit,
        images: formData.images,
        location: userLocation,
        isDraft: true,
      });
      Alert.alert('Draft Saved', 'Your product draft has been saved');
      router.back();
    } catch (error) {
      console.error('Save draft error:', error);
      Alert.alert('Error', 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePostNow = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Missing Information', 'Please enter a product title');
      return;
    }
    if (!formData.category) {
      Alert.alert('Missing Information', 'Please select a category');
      return;
    }
    if (!formData.price.trim()) {
      Alert.alert('Missing Information', 'Please enter a price');
      return;
    }
    if (!userLocation) {
      Alert.alert('Location Required', 'Please set your location before posting');
      return;
    }

    setLoading(true);
    try {
      await createProductMutation.mutateAsync({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        negotiable: formData.negotiable,
        stock: parseInt(formData.stock) || 1,
        unit: formData.unit,
        images: formData.images,
        location: userLocation,
        isDraft: false,
      });
      Alert.alert(
        'Product Posted!',
        'Your product has been posted successfully',
        [
          {
            text: 'View Shop',
            onPress: () => router.push('/shop-products' as any),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Post product error:', error);
      Alert.alert('Error', 'Failed to post product');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.category && formData.price.trim();

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
        <Text style={styles.headerTitle}>Post Product</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Product Title *</Text>
          <View style={styles.inputContainer}>
            <Package size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              placeholder="e.g., Organic Maize Seeds - 10kg"
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
          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <FileText size={20} color="#9CA3AF" style={styles.textAreaIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product, quality, origin, etc."
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              testID="description-input"
            />
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Price *</Text>
          <View style={styles.priceRow}>
            <View style={[styles.inputContainer, styles.priceInput]}>
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
                Negotiable
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stock */}
        <View style={styles.section}>
          <Text style={styles.label}>Stock/Quantity</Text>
          <View style={styles.priceRow}>
            <View style={[styles.inputContainer, styles.priceInput]}>
              <Hash size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.stock}
                onChangeText={(text) => updateFormData('stock', text)}
                keyboardType="numeric"
                testID="stock-input"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                placeholder="unit"
                value={formData.unit}
                onChangeText={(text) => updateFormData('unit', text)}
                testID="unit-input"
              />
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => setShowLocationPicker(true)}
            testID="location-button"
          >
            <MapPin size={20} color="#9CA3AF" />
            <Text style={styles.locationButtonText}>
              {userLocation?.label || userLocation?.city || 'Set Location'}
            </Text>
            {isLoadingLocation && <ActivityIndicator size="small" color={GREEN} />}
          </TouchableOpacity>
          {userLocation && (
            <Text style={styles.locationHint}>
              {userLocation.county && `${userLocation.county}, `}
              {userLocation.address || 'Location set'}
            </Text>
          )}
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.label}>Images (up to 5)</Text>
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
                  <Image source={{ uri: imageUri }} style={styles.productImage} />
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

      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
      />

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
  priceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
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
    justifyContent: 'center',
  },
  negotiableButtonActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  negotiableButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  negotiableButtonTextActive: {
    color: WHITE,
  },
  locationButton: {
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
  locationButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  locationHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
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
  productImage: {
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