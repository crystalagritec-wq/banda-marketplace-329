import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Trash2,
  ShoppingBag,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWishlist } from '@/providers/wishlist-provider';
import { useCart } from '@/providers/cart-provider';
import { Product } from '@/constants/products';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();


  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    if (confirm(`Remove "${productName}" from your wishlist?`)) {
      removeFromWishlist(productId);
    }
  };

  const handleClearWishlist = () => {
    if (wishlistItems.length === 0) return;
    
    if (confirm('Are you sure you want to remove all items from your wishlist?')) {
      clearWishlist();
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!product?.name) return;
    addToCart(product, 1);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/(tabs)/product/${productId}` as any);
  };

  const renderWishlistItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard} testID={`wishlist-item-${item.id}`}>
      <TouchableOpacity
        style={styles.productContent}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFromWishlist(item.id, item.name)}
              testID={`remove-${item.id}`}
            >
              <Heart size={20} color="#EF4444" fill="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{item.vendor}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={12} color="#6B7280" />
              <Text style={styles.location}>{item.location}</Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>{item.rating}</Text>
            {item.vendorVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              {item.discount && (
                <Text style={styles.originalPrice}>
                  KSh {Math.round(item.price / (1 - item.discount / 100)).toLocaleString()}
                </Text>
              )}
              <Text style={styles.price}>
                KSh {item.price.toLocaleString()}
                <Text style={styles.unit}>/{item.unit}</Text>
              </Text>
              {item.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{item.discount}%</Text>
                </View>
              )}
            </View>

            <View style={styles.actionButtons}>
              {item.negotiable && (
                <View style={styles.negotiableBadge}>
                  <Text style={styles.negotiableText}>Negotiable</Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  !item.inStock && styles.addToCartButtonDisabled,
                ]}
                onPress={() => handleAddToCart(item)}
                disabled={!item.inStock}
                testID={`add-to-cart-${item.id}`}
              >
                <ShoppingCart size={16} color="white" />
                <Text style={styles.addToCartText}>
                  {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Heart size={64} color="#E5E7EB" />
      </View>
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Start adding products you love to your wishlist and they will appear here.
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)/marketplace')}
      >
        <ShoppingBag size={20} color="white" />
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2D5016', '#4A7C59']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <Text style={styles.headerSubtitle}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
        {wishlistItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearWishlist}
            testID="clear-wishlist"
          >
            <Trash2 size={20} color="white" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          wishlistItems.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}

        ListEmptyComponent={renderEmptyState}
        testID="wishlist-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productContent: {
    padding: 16,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  vendorInfo: {
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D5016',
  },
  unit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  actionButtons: {
    alignItems: 'flex-end',
  },
  negotiableBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  negotiableText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});