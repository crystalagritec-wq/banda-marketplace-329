import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { X, Sliders } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

const COLORS = {
  primary: '#2E7D32',
  orange: '#FF6B35',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
} as const;

interface FilterBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  filters: {
    minRating: number;
    priceRange: [number, number];
    verified: boolean;
    available: boolean;
  };
  onApplyFilters: (filters: any) => void;
  maxPrice?: number;
}

export default function FilterBottomSheet({
  bottomSheetRef,
  filters,
  onApplyFilters,
  maxPrice = 100000,
}: FilterBottomSheetProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    bottomSheetRef.current?.close();
  };

  const handleReset = () => {
    const resetFilters = {
      minRating: 0,
      priceRange: [0, maxPrice] as [number, number],
      verified: false,
      available: false,
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['75%', '90%']}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sliders size={24} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Filters</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => bottomSheetRef.current?.close()}
          >
            <X size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minimum Rating</Text>
            <View style={styles.ratingOptions}>
              {[0, 3, 3.5, 4, 4.5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingChip,
                    localFilters.minRating === rating && styles.ratingChipSelected,
                  ]}
                  onPress={() =>
                    setLocalFilters({ ...localFilters, minRating: rating })
                  }
                >
                  <Text
                    style={[
                      styles.ratingChipText,
                      localFilters.minRating === rating && styles.ratingChipTextSelected,
                    ]}
                  >
                    {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <Text style={styles.priceLabel}>
                KES {localFilters.priceRange[0].toLocaleString()} - KES{' '}
                {localFilters.priceRange[1].toLocaleString()}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={maxPrice}
              step={500}
              value={localFilters.priceRange[1]}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  priceRange: [localFilters.priceRange[0], value],
                })
              }
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.border}
              thumbTintColor={COLORS.primary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() =>
                setLocalFilters({ ...localFilters, verified: !localFilters.verified })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  localFilters.verified && styles.checkboxChecked,
                ]}
              >
                {localFilters.verified && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.checkboxContent}>
                <Text style={styles.checkboxLabel}>Verified Providers Only</Text>
                <Text style={styles.checkboxDescription}>
                  Show only verified and trusted providers
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() =>
                setLocalFilters({ ...localFilters, available: !localFilters.available })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  localFilters.available && styles.checkboxChecked,
                ]}
              >
                {localFilters.available && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.checkboxContent}>
                <Text style={styles.checkboxLabel}>Available Now</Text>
                <Text style={styles.checkboxDescription}>
                  Show only currently available options
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: COLORS.border,
    width: 40,
    height: 4,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  ratingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ratingChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  ratingChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  ratingChipTextSelected: {
    color: COLORS.surface,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  checkboxDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
