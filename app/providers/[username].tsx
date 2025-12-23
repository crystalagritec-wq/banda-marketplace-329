import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  Briefcase,
  Wrench,
  MessageCircle,
  Phone,
  Award,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';
import ServiceCard from '@/components/ServiceCard';
import EquipmentCard from '@/components/EquipmentCard';

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
  warning: '#F59E0B',
} as const;

type TabType = 'services' | 'equipment' | 'reviews';

export default function ProviderPublicProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { username } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const servicesQuery = trpc.serviceProviders.getMarketplaceServices.useQuery({
    limit: 50,
  });
  const equipmentQuery = trpc.serviceProviders.getMarketplaceEquipment.useQuery({
    limit: 50,
  });

  const provider = {
    name: 'John Kamau',
    username: username || 'john_kamau',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.8,
    reviewCount: 127,
    jobsCompleted: 234,
    verified: true,
    trustScore: 95,
    location: 'Nairobi, Kenya',
    memberSince: 'January 2023',
    description: 'Experienced farm manager and equipment operator with over 10 years of experience in modern agriculture.',
    specializations: ['Farm Management', 'Tractor Operation', 'Irrigation Systems'],
  };

  const handleToggleFavorite = (id: string) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleServicePress = (id: string) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/service-details?id=${id}`);
  };

  const handleEquipmentPress = (id: string) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/equipment-details?id=${id}`);
  };

  const handleRequestService = (id: string) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(`/service-details?id=${id}`);
  };

  const handleRentEquipment = (id: string) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(`/equipment-details?id=${id}`);
  };

  const renderTabContent = () => {
    if (activeTab === 'services') {
      if (servicesQuery.isLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        );
      }

      const services = servicesQuery.data?.services || [];

      return (
        <View style={styles.tabContentContainer}>
          <Text style={styles.tabContentTitle}>Labor & Skills</Text>
          <Text style={styles.tabContentSubtitle}>
            {services.length} service{services.length !== 1 ? 's' : ''} available
          </Text>
          <FlashList
            data={services}
            renderItem={({ item }: any) => (
              <ServiceCard
                id={item.id}
                name={item.name}
                category={item.category}
                providerName={provider.name}
                priceFrom={item.priceFrom}
                location={item.location}
                rating={item.rating}
                image={item.image}
                verified={item.verified}
                availability={item.availability}
                onPress={handleServicePress}
                onRequestService={handleRequestService}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.has(item.id)}
              />
            )}
            keyExtractor={(item: any) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }

    if (activeTab === 'equipment') {
      if (equipmentQuery.isLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        );
      }

      const equipment = equipmentQuery.data?.equipment || [];

      return (
        <View style={styles.tabContentContainer}>
          <Text style={styles.tabContentTitle}>Equipment Rentals</Text>
          <Text style={styles.tabContentSubtitle}>
            {equipment.length} item{equipment.length !== 1 ? 's' : ''} available
          </Text>
          <FlashList
            data={equipment}
            renderItem={({ item }: any) => (
              <EquipmentCard
                id={item.id}
                name={item.name}
                category={item.category}
                pricePerDay={item.pricePerDay}
                location={item.location}
                rating={item.rating}
                image={item.image}
                verified={item.verified}
                available={item.available}
                condition={item.condition}
                onPress={handleEquipmentPress}
                onRentEquipment={handleRentEquipment}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.has(item.id)}
              />
            )}
            keyExtractor={(item: any) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }

    if (activeTab === 'reviews') {
      return (
        <View style={styles.tabContentContainer}>
          <Text style={styles.tabContentTitle}>Customer Reviews</Text>
          <Text style={styles.tabContentSubtitle}>
            {provider.reviewCount} reviews
          </Text>
          <View style={styles.emptyReviews}>
            <Star size={48} color={COLORS.textLight} />
            <Text style={styles.emptyReviewsText}>Reviews coming soon</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: provider.avatar }} style={styles.avatar} />
            {provider.verified && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={16} color={COLORS.surface} />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerUsername}>@{provider.username}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.statText}>
                  {provider.rating} ({provider.reviewCount})
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Award size={16} color={COLORS.success} />
                <Text style={styles.statText}>
                  {provider.jobsCompleted} jobs
                </Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <MapPin size={14} color={COLORS.textLight} />
              <Text style={styles.locationText}>{provider.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.trustScoreCard}>
          <View style={styles.trustScoreHeader}>
            <Text style={styles.trustScoreLabel}>Trust Score</Text>
            <Text style={styles.trustScoreValue}>{provider.trustScore}%</Text>
          </View>
          <View style={styles.trustScoreBar}>
            <View style={[styles.trustScoreFill, { width: `${provider.trustScore}%` }]} />
          </View>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{provider.description}</Text>
          <Text style={styles.memberSince}>Member since {provider.memberSince}</Text>
        </View>

        <View style={styles.specializationsSection}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.specializationsList}>
            {provider.specializations.map((spec, index) => (
              <View key={index} style={styles.specializationChip}>
                <Text style={styles.specializationText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButtonPrimary}>
            <MessageCircle size={20} color={COLORS.surface} />
            <Text style={styles.actionButtonPrimaryText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Phone size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonSecondaryText}>Call</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.tabActive]}
            onPress={() => setActiveTab('services')}
          >
            <Briefcase size={20} color={activeTab === 'services' ? COLORS.primary : COLORS.textLight} />
            <Text style={[styles.tabText, activeTab === 'services' && styles.tabTextActive]}>
              Services
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'equipment' && styles.tabActive]}
            onPress={() => setActiveTab('equipment')}
          >
            <Wrench size={20} color={activeTab === 'equipment' ? COLORS.primary : COLORS.textLight} />
            <Text style={[styles.tabText, activeTab === 'equipment' && styles.tabTextActive]}>
              Equipment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Star size={20} color={activeTab === 'reviews' ? COLORS.primary : COLORS.textLight} />
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  profileHeader: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.success,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  profileInfo: {
    alignItems: 'center',
  },
  providerName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  providerUsername: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  trustScoreCard: {
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  trustScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trustScoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  trustScoreValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.success,
  },
  trustScoreBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trustScoreFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  aboutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  specializationsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  specializationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specializationChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specializationText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.surface,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabContentContainer: {
    padding: 16,
    minHeight: 400,
  },
  tabContentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  tabContentSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyReviews: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyReviewsText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  bottomSpacing: {
    height: 40,
  },
});
