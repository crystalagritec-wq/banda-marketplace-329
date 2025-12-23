import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  Heart,
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const COLORS = {
  primary: '#2E7D32',
  orange: '#FF6B35',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  success: '#10B981',
  warning: '#F59E0B',
} as const;

interface EquipmentCardProps {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  location: string;
  rating: number;
  image: string;
  verified?: boolean;
  available?: boolean;
  condition?: string;
  onPress: (id: string) => void;
  onRentEquipment: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}

export default function EquipmentCard({
  id,
  name,
  category,
  pricePerDay,
  location,
  rating,
  image,
  verified = false,
  available = true,
  condition = 'Excellent',
  onPress,
  onRentEquipment,
  onToggleFavorite,
  isFavorite,
}: EquipmentCardProps) {
  const [pressed, setPressed] = useState(false);

  const handlePress = useCallback(() => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(id);
  }, [id, onPress]);

  const handleRentEquipment = useCallback((e: any) => {
    e.stopPropagation();
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onRentEquipment(id);
  }, [id, onRentEquipment]);

  const handleToggleFavorite = useCallback((e: any) => {
    e.stopPropagation();
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleFavorite(id);
  }, [id, onToggleFavorite]);

  return (
    <Pressable
      style={[styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        
        {verified && (
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={14} color={COLORS.success} />
            <Text style={styles.verifiedText}>Verified Seller</Text>
          </View>
        )}

        {!available && (
          <View style={styles.unavailableBadge}>
            <AlertCircle size={10} color={COLORS.warning} />
            <Text style={styles.unavailableText}>Low Stock</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <Heart
            size={20}
            color={isFavorite ? COLORS.orange : COLORS.textLight}
            fill={isFavorite ? COLORS.orange : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>

        <Text style={styles.equipmentName} numberOfLines={2}>
          {name}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={12} color={COLORS.textLight} />
          <Text style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceSection}>
            <View>
              <Text style={styles.price}>KES {pricePerDay.toLocaleString()}</Text>
              <Text style={styles.priceLabel}>/day</Text>
            </View>
            <View style={styles.ratingRow}>
              <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.rentButton, !available && styles.rentButtonDisabled]}
            onPress={handleRentEquipment}
            disabled={!available}
          >
            <Calendar size={16} color={COLORS.surface} />
            <Text style={styles.rentButtonText}>
              {available ? 'Add to Cart' : 'Not Available'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    elevation: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.success,
  },
  unavailableBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#92400E',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    padding: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  equipmentName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textLight,
    flex: 1,
  },
  footer: {
    gap: 10,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.orange,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  rentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.orange,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  rentButtonDisabled: {
    backgroundColor: COLORS.textLight,
    elevation: 0,
  },
  rentButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
