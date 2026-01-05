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
  ShieldCheck,
  MessageCircle,
  Share2,
  Heart,
  CheckCircle2,
  Wrench,
  AlertCircle,
  Info,
  ShoppingCart,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import EquipmentRentalModal from '@/components/EquipmentRentalModal';

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

export default function EquipmentDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [showRentalModal, setShowRentalModal] = useState(false);

  const equipment = useMemo(() => ({
    id: params.id as string || '1',
    name: '2-inch Water Pump',
    category: 'Equipment',
    description: 'High-quality 2-inch water pump perfect for irrigation. Reliable, fuel-efficient, and easy to operate. Suitable for small to medium-sized farms.',
    pricePerDay: 1500,
    sellerName: 'Eldoret Equipment Rentals',
    sellerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    rating: 4.7,
    reviewCount: 89,
    location: 'Eldoret',
    verified: true,
    available: true,
    condition: 'Excellent',
    specifications: {
      brand: 'Honda',
      model: 'WB20XT',
      power: '5.5 HP',
      maxFlow: '600 L/min',
      maxHead: '28 meters',
    },
    rentedCount: 145,
    images: [
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    ],
    rentalTerms: [
      'Minimum rental period: 1 day',
      'Fuel not included',
      'Security deposit required: KES 5,000',
      'Free delivery within 10km',
      'Technical support included',
    ],
    reviews: [
      {
        id: '1',
        userName: 'David Kiprop',
        rating: 5,
        comment: 'Excellent pump! Very powerful and reliable. Would rent again.',
        date: '1 week ago',
      },
      {
        id: '2',
        userName: 'Sarah Njeri',
        rating: 4.5,
        comment: 'Good equipment. Worked perfectly for my irrigation needs.',
        date: '3 weeks ago',
      },
    ],
  }), [params.id]);

  const handleAddToCart = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowRentalModal(true);
  };

  const handleRentalComplete = () => {
    setShowRentalModal(false);
    router.push('/(tabs)/cart');
  };

  const handleToggleFavorite = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsFavorite(!isFavorite);
  };

  const handleContactSeller = () => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/chat');
  };

  const totalPrice = equipment.pricePerDay * selectedDuration;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {equipment.images.map((image, index) => (
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

          {!equipment.available && (
            <View style={styles.unavailableBanner}>
              <AlertCircle size={16} color={COLORS.warning} />
              <Text style={styles.unavailableText}>Currently Unavailable</Text>
            </View>
          )}
        </View>

        {/* Equipment Info */}
        <View style={styles.infoSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{equipment.category}</Text>
          </View>

          <Text style={styles.equipmentName}>{equipment.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingSection}>
              <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
              <Text style={styles.ratingText}>{equipment.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCountText}>({equipment.reviewCount} reviews)</Text>
            </View>

            <View style={styles.locationSection}>
              <MapPin size={14} color={COLORS.textLight} />
              <Text style={styles.locationText}>{equipment.location}</Text>
            </View>
          </View>

          {/* Seller Info */}
          <View style={styles.sellerCard}>
            <Image source={{ uri: equipment.sellerImage }} style={styles.sellerImage} />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{equipment.sellerName}</Text>
                {equipment.verified && (
                  <ShieldCheck size={16} color={COLORS.success} />
                )}
              </View>
              <View style={styles.sellerStats}>
                <View style={styles.sellerStat}>
                  <CheckCircle2 size={12} color={COLORS.success} />
                  <Text style={styles.sellerStatText}>{equipment.rentedCount} times rented</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
              <MessageCircle size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Condition Badge */}
          <View style={styles.conditionCard}>
            <Wrench size={20} color={COLORS.success} />
            <Text style={styles.conditionText}>Condition: {equipment.condition}</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{equipment.description}</Text>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specificationsCard}>
              {Object.entries(equipment.specifications).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Rental Duration Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Rental Duration</Text>
            <View style={styles.durationSelector}>
              {[1, 3, 7, 14, 30].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.durationOption,
                    selectedDuration === days && styles.durationOptionSelected,
                  ]}
                  onPress={() => setSelectedDuration(days)}
                >
                  <Text
                    style={[
                      styles.durationText,
                      selectedDuration === days && styles.durationTextSelected,
                    ]}
                  >
                    {days} {days === 1 ? 'day' : 'days'}
                  </Text>
                  <Text
                    style={[
                      styles.durationPrice,
                      selectedDuration === days && styles.durationPriceSelected,
                    ]}
                  >
                    KES {(equipment.pricePerDay * days).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rental Terms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rental Terms</Text>
            <View style={styles.termsCard}>
              {equipment.rentalTerms.map((term, index) => (
                <View key={index} style={styles.termRow}>
                  <Info size={14} color={COLORS.primary} />
                  <Text style={styles.termText}>{term}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {equipment.reviews.map((review) => (
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
          <Text style={styles.priceLabel}>Total ({selectedDuration} {selectedDuration === 1 ? 'day' : 'days'})</Text>
          <Text style={styles.finalPrice}>
            KES {totalPrice.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, !equipment.available && styles.addButtonDisabled]}
          onPress={handleAddToCart}
          disabled={!equipment.available}
        >
          <ShoppingCart size={20} color={COLORS.surface} />
          <Text style={styles.addButtonText}>
            {equipment.available ? 'Add to Cart' : 'Not Available'}
          </Text>
        </TouchableOpacity>
      </View>

      <EquipmentRentalModal
        visible={showRentalModal}
        onClose={() => setShowRentalModal(false)}
        equipment={{
          id: equipment.id,
          name: equipment.name,
          category: equipment.category,
          pricePerDay: equipment.pricePerDay,
          location: equipment.location,
          rating: equipment.rating,
          image: equipment.images[0],
          condition: equipment.condition,
          securityDeposit: 5000, // From mock data rental terms
        }}
        onRentalComplete={handleRentalComplete}
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
  unavailableBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  unavailableText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.surface,
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
  equipmentName: {
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
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sellerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sellerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  sellerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerStatText: {
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
  conditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  conditionText: {
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
  specificationsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  specLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  durationSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#ECFDF5',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  durationTextSelected: {
    color: COLORS.primary,
  },
  durationPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  durationPriceSelected: {
    color: COLORS.orange,
  },
  termsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  termRow: {
    flexDirection: 'row',
    gap: 12,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.orange,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.textLight,
    elevation: 0,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
