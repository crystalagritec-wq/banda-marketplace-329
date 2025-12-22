import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { X, CheckCircle2, Circle, SlidersHorizontal, TrendingUp, DollarSign, MapPin } from 'lucide-react-native';
import type { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';

const GREEN = '#2D5016' as const;
const WHITE = '#FFFFFF' as const;
const ORANGE = '#F59E0B' as const;

export type SortBy = 'popularity' | 'price' | 'location';

interface FilterBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  locationOptions: string[];
}

const FilterBottomSheet = forwardRef<BottomSheet, FilterBottomSheetProps>(({
  bottomSheetRef,
  sortBy,
  onSortChange,
  selectedLocation,
  onLocationChange,
  locationOptions,
}, ref) => {
  const snapPoints = useMemo(() => ['65%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, [bottomSheetRef]);

  const sortOptions: { key: SortBy; label: string; icon: typeof TrendingUp; description: string }[] = [
    { key: 'popularity', label: 'Popularity', icon: TrendingUp, description: 'Most viewed & rated' },
    { key: 'price', label: 'Price', icon: DollarSign, description: 'Low to high' },
    { key: 'location', label: 'Location', icon: MapPin, description: 'Nearest first' },
  ];

  return (
    <BottomSheet
      ref={ref || bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <SlidersHorizontal size={24} color={GREEN} />
            <Text style={styles.headerTitle}>Filter & Sort</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = sortBy === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => onSortChange(option.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                      <Icon size={20} color={isSelected ? WHITE : GREEN} />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {option.label}
                      </Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                  </View>
                  {isSelected ? (
                    <CheckCircle2 size={24} color={GREEN} />
                  ) : (
                    <Circle size={24} color="#D1D5DB" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Location Filter</Text>
              {selectedLocation && (
                <TouchableOpacity onPress={() => onLocationChange('')}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.locationChip, selectedLocation === '' && styles.locationChipSelected]}
              onPress={() => onLocationChange('')}
            >
              <Text style={[styles.locationChipText, selectedLocation === '' && styles.locationChipTextSelected]}>
                All Locations
              </Text>
            </TouchableOpacity>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.locationList}>
              {locationOptions.map((location) => {
                const isSelected = selectedLocation === location;
                return (
                  <TouchableOpacity
                    key={location}
                    style={[styles.locationChip, isSelected && styles.locationChipSelected]}
                    onPress={() => onLocationChange(location)}
                  >
                    <Text style={[styles.locationChipText, isSelected && styles.locationChipTextSelected]}>
                      {location}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={handleClose}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
});

FilterBottomSheet.displayName = 'FilterBottomSheet';

export default FilterBottomSheet;

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: ORANGE,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: GREEN,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: GREEN,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: GREEN,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  locationList: {
    gap: 8,
  },
  locationChip: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  locationChipSelected: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  locationChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  locationChipTextSelected: {
    color: WHITE,
  },
  applyButton: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  applyButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});
