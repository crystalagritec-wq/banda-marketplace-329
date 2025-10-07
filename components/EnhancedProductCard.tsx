import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  ShieldCheck,
  Truck,
  Clock,
  MessageCircle,
  BadgePercent,
  Zap,
  TrendingUp,
  Award,
  Eye,
} from 'lucide-react-native';
import { Product } from '@/constants/products';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  primary: '#2E7D32',
  secondary: '#F57C00',
  accent: '#E91E63',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

interface EnhancedProductCardProps {
  product: Product;
  onPress: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  cardStyle?: 'default' | 'compact' | 'featured' | 'trending';
  showQuickActions?: boolean;
  showAnalytics?: boolean;
}

export default function EnhancedProductCard({
  product,
  onPress,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  cardStyle = 'default',
  showQuickActions = true,
  showAnalytics = false,
}: EnhancedProductCardProps) {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [viewCount] = useState<number>(Math.floor(Math.random() * 500) + 50);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  // Haptic feedback helper
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (Platform.OS !== 'web') {
      const feedbackType = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      }[type];
      Haptics.impactAsync(feedbackType);
    }
  }, []);

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    triggerHaptic('light');
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, triggerHaptic]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    triggerHaptic('medium');
    onPress(product.id);
  }, [onPress, product.id, triggerHaptic]);

  const handleAddToCart = useCallback((e: any) => {
    e?.stopPropagation?.();
    triggerHaptic('heavy');
    onAddToCart(product);
  }, [onAddToCart, product, triggerHaptic]);

  const handleToggleFavorite = useCallback((e: any) => {
    e?.stopPropagation?.();
    triggerHaptic('medium');
    
    // Heart animation
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    onToggleFavorite(product.id);
  }, [onToggleFavorite, product.id, triggerHaptic, heartAnim]);

  const formatPrice = useCallback((amount: number) => {
    return `KES ${amount.toLocaleString('en-KE')}`;
  }, []);

  const getCardWidth = useMemo(() => {
    switch (cardStyle) {
      case 'compact':
        return (screenWidth - 48) / 2;
      case 'featured':
        return screenWidth - 32;
      case 'trending':
        return 180;
      default:
        return (screenWidth - 48) / 2;
    }
  }, [cardStyle]);

  const getImageHeight = useMemo(() => {
    switch (cardStyle) {
      case 'compact':
        return 120;
      case 'featured':
        return 200;
      case 'trending':
        return 140;
      default:
        return 160;
    }
  }, [cardStyle]);

  const cardStyles = useMemo(() => [
    styles.card,
    cardStyle === 'featured' && styles.featuredCard,
    cardStyle === 'trending' && styles.trendingCard,
    cardStyle === 'compact' && styles.compactCard,
    { width: getCardWidth },
    isPressed && styles.cardPressed,
  ], [cardStyle, getCardWidth, isPressed]);

  return (
    <Animated.View
      style={[
        { 
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
          opacity: fadeAnim,
        }
      ]}
    >
      <Pressable
        style={cardStyles}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={`product-card-${product.id}`}
      >
        {/* Image Container */}
        <View style={[styles.imageContainer, { height: getImageHeight }]}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            onLoad={() => setImageLoaded(true)}
            resizeMode="cover"
          />
          
          {/* Image Overlay Gradient */}
          <View style={styles.imageOverlay} />

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {product.discount && (
              <View style={styles.discountBadge}>
                <BadgePercent size={12} color={COLORS.surface} />
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </View>
            )}
            
            {cardStyle === 'trending' && (
              <View style={styles.trendingBadge}>
                <TrendingUp size={10} color={COLORS.surface} />
                <Text style={styles.trendingText}>HOT</Text>
              </View>
            )}

            {cardStyle === 'featured' && (
              <View style={styles.featuredBadge}>
                <Award size={12} color={COLORS.surface} />
                <Text style={styles.featuredText}>FEATURED</Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          {showQuickActions && (
            <View style={styles.quickActions}>
              <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                <TouchableOpacity
                  style={[styles.quickActionButton, isFavorite && styles.favoriteActive]}
                  onPress={handleToggleFavorite}
                >
                  <Heart
                    size={16}
                    color={isFavorite ? COLORS.surface : COLORS.textSecondary}
                    fill={isFavorite ? COLORS.surface : 'transparent'}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {/* Status Indicators */}
          <View style={styles.statusIndicators}>
            {!product.inStock && (
              <View style={styles.outOfStockIndicator}>
                <Clock size={10} color={COLORS.surface} />
                <Text style={styles.statusText}>Out of Stock</Text>
              </View>
            )}
            
            {product.fastDelivery && product.inStock && (
              <View style={styles.fastDeliveryIndicator}>
                <Truck size={10} color={COLORS.surface} />
                <Text style={styles.statusText}>Fast</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Product Name */}
          <Text numberOfLines={2} style={styles.productName}>
            {product.name}
          </Text>

          {/* Vendor Info */}
          <View style={styles.vendorSection}>
            <View style={styles.vendorRow}>
              <Text numberOfLines={1} style={styles.vendorName}>
                {product.vendor}
              </Text>
              {product.vendorVerified && (
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={12} color={COLORS.success} />
                </View>
              )}
            </View>
            
            <View style={styles.locationRow}>
              <MapPin size={10} color={COLORS.textLight} />
              <Text numberOfLines={1} style={styles.locationText}>
                {product.location}
              </Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              {product.discount ? (
                <View style={styles.discountPriceRow}>
                  <Text style={styles.originalPrice}>
                    KES {Math.round(product.price * 1.3).toLocaleString()}
                  </Text>
                  <Text style={styles.discountPrice}>
                    {formatPrice(product.price)}
                  </Text>
                </View>
              ) : (
                <Text style={styles.price}>
                  {formatPrice(product.price)}
                </Text>
              )}
              <Text style={styles.unit}>/{product.unit}</Text>
            </View>

            {/* Meta Info */}
            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                <Star size={12} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
              </View>

              {showAnalytics && (
                <View style={styles.analyticsContainer}>
                  <Eye size={10} color={COLORS.textLight} />
                  <Text style={styles.viewCount}>{viewCount}</Text>
                </View>
              )}

              {product.negotiable && (
                <View style={styles.negotiableBadge}>
                  <MessageCircle size={10} color={COLORS.warning} />
                  <Text style={styles.negotiableText}>Negotiable</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              !product.inStock && styles.addToCartButtonDisabled,
              cardStyle === 'featured' && styles.addToCartButtonFeatured,
            ]}
            onPress={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? (
              <>
                <ShoppingCart size={14} color={COLORS.surface} />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </>
            ) : (
              <>
                <Clock size={14} color={COLORS.surface} />
                <Text style={styles.addToCartText}>Notify Me</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Flash Sale Timer (if applicable) */}
          {product.discount && cardStyle === 'featured' && (
            <View style={styles.flashSaleTimer}>
              <Zap size={12} color={COLORS.warning} />
              <Text style={styles.timerText}>Flash sale ends in 2h 45m</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuredCard: {
    elevation: 8,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  trendingCard: {
    borderColor: COLORS.error,
  },
  compactCard: {
    marginBottom: 12,
  },
  cardPressed: {
    elevation: 2,
    shadowOpacity: 0.05,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'column',
    gap: 6,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trendingText: {
    color: COLORS.surface,
    fontSize: 9,
    fontWeight: '700',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
  },
  quickActions: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  favoriteActive: {
    backgroundColor: COLORS.error,
  },
  statusIndicators: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  outOfStockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  fastDeliveryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    color: COLORS.surface,
    fontSize: 9,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  vendorSection: {
    marginBottom: 8,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: `${COLORS.success}15`,
    borderRadius: 10,
    padding: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textLight,
    flex: 1,
  },
  priceSection: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  discountPriceRow: {
    flexDirection: 'column',
    flex: 1,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.error,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    flex: 1,
  },
  unit: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  analyticsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewCount: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  negotiableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${COLORS.warning}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  negotiableText: {
    fontSize: 10,
    color: COLORS.warning,
    fontWeight: '600',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addToCartButtonFeatured: {
    paddingVertical: 12,
    borderRadius: 16,
  },
  addToCartButtonDisabled: {
    backgroundColor: COLORS.textLight,
    elevation: 0,
    shadowOpacity: 0,
  },
  addToCartText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  flashSaleTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
  },
});