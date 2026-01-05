import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  Tractor,
  Wrench,
  Stethoscope,
  Truck,
  Zap,
  Droplets,
  Leaf,
  Building2,
  Briefcase,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ServiceBookingModal from '@/components/ServiceBookingModal';

const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  orange: '#FF6B35',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
} as const;

const SERVICE_CATEGORIES = [
  { id: 'all', name: 'All Services', icon: Users, color: '#2E7D32' },
  { id: 'farm', name: 'Farm Services', icon: Tractor, color: '#1976D2' },
  { id: 'livestock', name: 'Livestock & Vet', icon: Stethoscope, color: '#D32F2F' },
  { id: 'construction', name: 'Construction', icon: Building2, color: '#7B1FA2' },
  { id: 'mechanical', name: 'Mechanical', icon: Wrench, color: '#F57C00' },
  { id: 'transport', name: 'Transport', icon: Truck, color: '#00796B' },
  { id: 'electrical', name: 'Electrical', icon: Zap, color: '#FFC107' },
  { id: 'water', name: 'Water & Irrigation', icon: Droplets, color: '#0288D1' },
  { id: 'environmental', name: 'Environmental', icon: Leaf, color: '#388E3C' },
  { id: 'professional', name: 'Professional', icon: Briefcase, color: '#5C6BC0' },
];

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  specialization: string;
  location: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  dailyRate: number;
  verified: boolean;
  available: boolean;
  image: string;
  completedJobs: number;
  experience: string;
}

const MOCK_PROVIDERS: ServiceProvider[] = [
  {
    id: '1',
    name: 'James Ochieng',
    category: 'Farm Services',
    specialization: 'Tractor Operator',
    location: 'Nakuru',
    rating: 4.9,
    reviews: 127,
    hourlyRate: 500,
    dailyRate: 3500,
    verified: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    completedJobs: 234,
    experience: '8 years',
  },
  {
    id: '2',
    name: 'Mary Wanjiku',
    category: 'Livestock & Vet',
    specialization: 'Veterinarian',
    location: 'Kiambu',
    rating: 4.8,
    reviews: 89,
    hourlyRate: 1500,
    dailyRate: 10000,
    verified: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
    completedJobs: 156,
    experience: '12 years',
  },
  {
    id: '3',
    name: 'Peter Kamau',
    category: 'Farm Services',
    specialization: 'Farm Labor',
    location: 'Eldoret',
    rating: 4.7,
    reviews: 56,
    hourlyRate: 200,
    dailyRate: 1500,
    verified: false,
    available: true,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    completedJobs: 89,
    experience: '5 years',
  },
  {
    id: '4',
    name: 'John Mwangi',
    category: 'Mechanical',
    specialization: 'Tractor Mechanic',
    location: 'Nairobi',
    rating: 4.9,
    reviews: 203,
    hourlyRate: 800,
    dailyRate: 5500,
    verified: true,
    available: false,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    completedJobs: 312,
    experience: '15 years',
  },
  {
    id: '5',
    name: 'Grace Akinyi',
    category: 'Water & Irrigation',
    specialization: 'Irrigation Specialist',
    location: 'Kisumu',
    rating: 4.6,
    reviews: 45,
    hourlyRate: 600,
    dailyRate: 4000,
    verified: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
    completedJobs: 78,
    experience: '6 years',
  },
  {
    id: '6',
    name: 'David Otieno',
    category: 'Construction',
    specialization: 'Mason',
    location: 'Mombasa',
    rating: 4.8,
    reviews: 112,
    hourlyRate: 400,
    dailyRate: 2800,
    verified: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    completedJobs: 189,
    experience: '10 years',
  },
];

export default function LaborSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const filteredProviders = useMemo(() => {
    let filtered = [...MOCK_PROVIDERS];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.specialization.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      const category = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory);
      if (category) {
        filtered = filtered.filter((p) => p.category === category.name);
      }
    }

    if (params.category) {
      filtered = filtered.filter(
        (p) =>
          p.specialization.toLowerCase().includes(params.category!.toLowerCase()) ||
          p.category.toLowerCase().includes(params.category!.toLowerCase())
      );
    }

    if (showAvailableOnly) {
      filtered = filtered.filter((p) => p.available);
    }

    return filtered;
  }, [searchQuery, selectedCategory, showAvailableOnly, params.category]);

  const handleProviderPress = useCallback((provider: ServiceProvider) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProvider(provider);
    setShowBookingModal(true);
  }, []);

  const handleBookingComplete = useCallback(() => {
    setShowBookingModal(false);
    setSelectedProvider(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronRight size={24} color={COLORS.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Labor & Skills</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by skill, name, or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <SlidersHorizontal size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
        style={styles.categoriesScroll}
      >
        {SERVICE_CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <IconComponent
                size={16}
                color={isSelected ? COLORS.surface : category.color}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[
            styles.availabilityToggle,
            showAvailableOnly && styles.availabilityToggleActive,
          ]}
          onPress={() => {
            setShowAvailableOnly(!showAvailableOnly);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <View
            style={[
              styles.toggleDot,
              showAvailableOnly && styles.toggleDotActive,
            ]}
          />
          <Text
            style={[
              styles.availabilityText,
              showAvailableOnly && styles.availabilityTextActive,
            ]}
          >
            Available Now
          </Text>
        </TouchableOpacity>
        <Text style={styles.resultsCount}>
          {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <ScrollView
        style={styles.providersScroll}
        contentContainerStyle={styles.providersContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProviders.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={styles.providerCard}
            onPress={() => handleProviderPress(provider)}
            activeOpacity={0.7}
          >
            <View style={styles.providerHeader}>
              <Image
                source={{ uri: provider.image }}
                style={styles.providerImage}
              />
              <View style={styles.providerInfo}>
                <View style={styles.providerNameRow}>
                  <Text style={styles.providerName}>{provider.name}</Text>
                  {provider.verified && (
                    <CheckCircle2 size={16} color={COLORS.primary} />
                  )}
                </View>
                <Text style={styles.providerSpecialization}>
                  {provider.specialization}
                </Text>
                <View style={styles.providerMeta}>
                  <View style={styles.metaItem}>
                    <MapPin size={12} color={COLORS.textLight} />
                    <Text style={styles.metaText}>{provider.location}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Star size={12} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.metaText}>
                      {provider.rating} ({provider.reviews})
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.availabilityBadge,
                  provider.available
                    ? styles.availableBadge
                    : styles.unavailableBadge,
                ]}
              >
                <Text
                  style={[
                    styles.availabilityBadgeText,
                    provider.available
                      ? styles.availableBadgeText
                      : styles.unavailableBadgeText,
                  ]}
                >
                  {provider.available ? 'Available' : 'Busy'}
                </Text>
              </View>
            </View>

            <View style={styles.providerStats}>
              <View style={styles.statItem}>
                <Briefcase size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{provider.completedJobs} jobs</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{provider.experience}</Text>
              </View>
            </View>

            <View style={styles.providerPricing}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Hourly</Text>
                <Text style={styles.priceValue}>
                  KSh {provider.hourlyRate.toLocaleString()}
                </Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Daily</Text>
                <Text style={styles.priceValue}>
                  KSh {provider.dailyRate.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  !provider.available && styles.bookButtonDisabled,
                ]}
                onPress={() => handleProviderPress(provider)}
                disabled={!provider.available}
              >
                <Calendar size={16} color={COLORS.surface} />
                <Text style={styles.bookButtonText}>Book</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filteredProviders.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={48} color={COLORS.textLight} />
            <Text style={styles.emptyStateTitle}>No providers found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {selectedProvider && (
        <ServiceBookingModal
          visible={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedProvider(null);
          }}
          service={{
            id: selectedProvider.id,
            name: selectedProvider.specialization,
            category: selectedProvider.category,
            providerName: selectedProvider.name,
            priceFrom: selectedProvider.hourlyRate,
            location: selectedProvider.location,
            rating: selectedProvider.rating,
            image: selectedProvider.image,
            hourlyRate: selectedProvider.hourlyRate,
            dailyRate: selectedProvider.dailyRate,
          }}
          onBookingComplete={handleBookingComplete}
        />
      )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  filterButton: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
  },
  categoriesScroll: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.surface,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  availabilityToggleActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textLight,
  },
  toggleDotActive: {
    backgroundColor: COLORS.primary,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  availabilityTextActive: {
    color: COLORS.primary,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  providersScroll: {
    flex: 1,
  },
  providersContent: {
    padding: 16,
    gap: 16,
  },
  providerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  providerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  providerSpecialization: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  availableBadge: {
    backgroundColor: '#ECFDF5',
  },
  unavailableBadge: {
    backgroundColor: '#FEF3F2',
  },
  availabilityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  availableBadgeText: {
    color: '#059669',
  },
  unavailableBadgeText: {
    color: '#DC2626',
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  providerPricing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  priceDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.surface,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
});
