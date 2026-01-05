import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  MessageCircle,
  Share2,
  Heart,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import ServiceBookingModal from '@/components/ServiceBookingModal';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#2E7D32',
  orange: '#FF6B35',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  success: '#10B981',
  warning: '#F59E0B',
} as const;

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('basic');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const service = useMemo(() => ({
    id: params.id as string || '1',
    name: 'Professional Farm Plowing Service',
    category: 'Services',
    description: 'Expert plowing services for all farm sizes. We use modern equipment and experienced operators to prepare your land efficiently.',
    providerName: 'AgriPlus Services Ltd',
    providerImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    rating: 4.8,
    reviewCount: 156,
    location: 'Eldoret',
    verified: true,
    availability: 'Available',
    completedJobs: 320,
    responseTime: '2 hours',
    images: [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800',
    ],
    packages: [
      {
        id: 'basic',
        name: 'Basic Package',
        price: 8000,
        duration: '1 day',
        features: ['Up to 2 acres', 'Standard plowing', 'Basic equipment'],
      },
      {
        id: 'standard',
        name: 'Standard Package',
        price: 15000,
        duration: '2 days',
        features: ['Up to 5 acres', 'Deep plowing', 'Modern equipment', 'Soil testing'],
      },
      {
        id: 'premium',
        name: 'Premium Package',
        price: 25000,
        duration: '3 days',
        features: ['Up to 10 acres', 'Deep plowing', 'Premium equipment', 'Soil testing', 'Fertilizer application'],
      },
    ],
    reviews: [
      {
        id: '1',
        userName: 'John Kamau',
        rating: 5,
        comment: 'Excellent service! Very professional and completed the work on time.',
        date: '2 weeks ago',
      },
      {
        id: '2',
        userName: 'Mary Wanjiru',
        rating: 4.5,
        comment: 'Good work quality. Will definitely use their services again.',
        date: '1 month ago',
      },
    ],
  }), [params.id]);

  const handleRequestService = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowBookingModal(true);
  };

  const handleBookingComplete = () => {
    setShowBookingModal(false);
    router.push('/(tabs)/cart');
  };

  const handleToggleFavorite = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsFavorite(!isFavorite);
  };

  const handleContactProvider = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/chat');
  };

  const selectedPackageData = service.packages.find(p => p.id === selectedPackage);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {service.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.mainImage} />
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.imageActionButton}>
              <Share2 size={20} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageActionButton} onPress={handleToggleFavorite}>
              <Heart
                size={20}
                color={isFavorite ? COLORS.orange : COLORS.text}
                fill={isFavorite ? COLORS.orange : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Info */}
        <View style={styles.infoSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{service.category}</Text>
          </View>

          <Text style={styles.serviceName}>{service.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingSection}>
              <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
              <Text style={styles.ratingText}>{service.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCountText}>({service.reviewCount} reviews)</Text>
            </View>

            <View style={styles.locationSection}>
              <MapPin size={14} color={COLORS.textLight} />
              <Text style={styles.locationText}>{service.location}</Text>
            </View>
          </View>

          {/* Provider Info */}
          <View style={styles.providerCard}>
            <Image source={{ uri: service.providerImage }} style={styles.providerImage} />
            <View style={styles.providerInfo}>
              <View style={styles.providerNameRow}>
                <Text style={styles.providerName}>{service.providerName}</Text>
                {service.verified && (
                  <ShieldCheck size={16} color={COLORS.success} />
                )}
              </View>
              <View style={styles.providerStats}>
                <View style={styles.providerStat}>
                  <CheckCircle2 size={12} color={COLORS.success} />
                  <Text style={styles.providerStatText}>{service.completedJobs} jobs</Text>
                </View>
                <View style={styles.providerStat}>
                  <Clock size={12} color={COLORS.textLight} />
                  <Text style={styles.providerStatText}>Responds in {service.responseTime}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactProvider}>
              <MessageCircle size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Availability */}
          <View style={styles.availabilityCard}>
            <Calendar size={20} color={COLORS.success} />
            <Text style={styles.availabilityText}>{service.availability}</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Service</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>

          {/* Service Packages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Packages</Text>
            {service.packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  selectedPackage === pkg.id && styles.packageCardSelected,
                ]}
                onPress={() => setSelectedPackage(pkg.id)}
              >
                <View style={styles.packageHeader}>
                  <View>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <Text style={styles.packageDuration}>{pkg.duration}</Text>
                  </View>
                  <View style={styles.packagePrice}>
                    <Text style={styles.priceLabel}>From</Text>
                    <Text style={styles.price}>KES {pkg.price.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.packageFeatures}>
                  {pkg.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <CheckCircle2 size={14} color={COLORS.success} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {service.reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewUserName}>{review.userName}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.reviewRating}>
                    <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
                    <Text style={styles.reviewRatingText}>{review.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.finalPrice}>
            KES {selectedPackageData?.price.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity style={styles.requestButton} onPress={handleRequestService}>
          <Calendar size={20} color={COLORS.surface} />
          <Text style={styles.requestButtonText}>Request Service</Text>
        </TouchableOpacity>
      </View>

      <ServiceBookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        service={{
          id: service.id,
          name: service.name,
          category: service.category,
          providerName: service.providerName,
          priceFrom: selectedPackageData?.price || 0,
          location: service.location,
          rating: service.rating,
          image: service.images[0],
          // Using package price as project rate for simplicity in this context
          projectRate: selectedPackageData?.price,
        }}
        onBookingComplete={handleBookingComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    position: 'relative',
    height: 300,
    backgroundColor: '#F3F4F6',
  },
  mainImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageActions: {
    position: 'absolute',
    top: 48,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  imageActionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoSection: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewCountText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  providerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  providerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  providerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerStatText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  contactButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  packageCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#ECFDF5',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  packageDuration: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  packagePrice: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.orange,
  },
  packageFeatures: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  reviewCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    gap: 12,
  },
  priceSection: {
    flex: 1,
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.orange,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
