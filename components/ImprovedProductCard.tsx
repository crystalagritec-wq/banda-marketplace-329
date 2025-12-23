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
  ShoppingCart,
  Star,
  MapPin,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const COLORS = {
  primary: '#2E7D32',
  orange: '#FF6B35',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
} as const;

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  location: string;
  rating: number;
  image: string;
  verified?: boolean;
  featured?: boolean;
  lowStock?: boolean;
  onPress: (id: string) => void;
  onAddToCart: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}

export default function ImprovedProductCard({
  id,
  name,
  category,
  price,
  location,
  rating,
  image,
  verified = false,
  featured = false,
  lowStock = false,
  onPress,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
}: ProductCardProps) {
  const [pressed, setPressed] = useState(false);

  const handlePress = useCallback(() => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(id);
  }, [id, onPress]);

  const handleAddToCart = useCallback((e: any) => {
    e.stopPropagation();
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onAddToCart(id);
  }, [id, onAddToCart]);

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

        {featured && (
          <View style={styles.featuredRibbon}>
            <Text style={styles.featuredText}>FEATURED</Text>
          </View>
        )}

        {lowStock && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>⚠️ Low Stock</Text>
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

        <Text style={styles.productName} numberOfLines={2}>
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
            <Text style={styles.price}>KES {price.toLocaleString()}</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color={COLORS.warning} fill={COLORS.warning} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
          >
            <ShoppingCart size={16} color={COLORS.surface} />
            <Text style={styles.addButtonText}>Add to Cart</Text>
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
  featuredRibbon: {
    position: 'absolute',
    top: 12,
    right: -28,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 32,
    paddingVertical: 4,
    transform: [{ rotate: '45deg' }],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  featuredText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.surface,
    letterSpacing: 0.5,
  },
  lowStockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lowStockText: {
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
  productName: {
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
  addButton: {
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
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
