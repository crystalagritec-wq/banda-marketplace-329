import { LinearGradient } from 'expo-linear-gradient';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  MapPin,
  X,
  Heart,
  Star,
  Gift,
} from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/providers/cart-provider';
import { useTheme } from '@/providers/theme-provider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function formatPrice(amount: number) {
  try {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  } catch (e) {
    console.log('formatPrice error', e);
    return `KSh ${amount}`;
  }
}

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CartModal({ visible, onClose }: CartModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { cartItems, cartSummary, updateQuantity, removeFromCart } = useCart();
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  }, [updateQuantity]);

  const handleRemoveItem = useCallback((productId: string, productName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove ${productName} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(productId) },
      ]
    );
  }, [removeFromCart]);

  const handleApplyPromo = useCallback(() => {
    if (promoCode.toLowerCase() === 'banda100') {
      setPromoApplied(true);
      Alert.alert('Success', 'Promo code applied! KSh 100 discount will be applied at checkout.');
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid promo code.');
    }
  }, [promoCode]);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }
    onClose();
    router.push('/checkout' as any);
  }, [cartItems.length, router, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (cartItems.length === 0) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }],
                paddingTop: insets.top + 20,
                paddingBottom: Math.max(insets.bottom, 20),
              }
            ]}
          >
            <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Cart</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.emptyCart}>
                <View style={styles.emptyCartIcon}>
                  <ShoppingCart size={64} color={theme.colors.primary} />
                  <View style={styles.emptyCartIconOverlay}>
                    <Heart size={24} color={'#EF4444'} />
                  </View>
                </View>
                <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
                <Text style={styles.emptyCartSubtitle}>
                  Discover fresh produce and quality agricultural products
                </Text>
                <TouchableOpacity
                  style={[styles.shopNowButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    handleClose();
                    router.push('/(tabs)/marketplace');
                  }}
                >
                  <Text style={styles.shopNowButtonText}>Explore Marketplace</Text>
                  <ArrowRight size={18} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
              paddingTop: insets.top + 20,
              paddingBottom: Math.max(insets.bottom, 20),
            }
          ]}
        >
          <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Your Cart</Text>
                <View style={styles.headerSubtitle}>
                  <Text style={styles.itemCount}>{cartSummary.itemCount} items</Text>
                  <Text style={[styles.totalPreview, { color: theme.colors.primary }]}>{formatPrice(cartSummary.total)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Cart Items */}
              <View style={styles.cartItems}>
                {cartItems.map((item, index) => (
                  <Animated.View 
                    key={item.product.id} 
                    style={[
                      styles.cartItem,
                      {
                        transform: [{
                          scale: new Animated.Value(1)
                        }]
                      }
                    ]}
                  >
                    <View style={styles.itemImageContainer}>
                      <Image source={{ uri: item.product.image }} style={styles.itemImage} />
                      {item.product.fastDelivery && (
                        <View style={styles.fastDeliveryBadge}>
                          <Truck size={10} color="white" />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.itemDetails}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.product.name}
                        </Text>
                        <View style={styles.itemRating}>
                          <Star size={12} color={'#FFD700'} fill={'#FFD700'} />
                          <Text style={styles.ratingText}>4.8</Text>
                        </View>
                      </View>
                      
                      <View style={styles.vendorRow}>
                        <Text style={[styles.vendorName, { color: theme.colors.primary }]}>{item.product.vendor}</Text>
                        {item.product.vendorVerified && (
                          <ShieldCheck size={12} color={'#10B981'} />
                        )}
                      </View>
                      
                      <View style={styles.locationRow}>
                        <MapPin size={10} color={theme.colors.primary} />
                        <Text style={styles.locationText}>{item.product.location}</Text>
                      </View>
                      
                      <View style={styles.itemFooter}>
                        <View style={styles.priceContainer}>
                          <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>
                            {formatPrice(item.product.price)}
                          </Text>
                          <Text style={styles.itemUnit}>/{item.product.unit}</Text>
                        </View>
                        
                        <View style={styles.savingsContainer}>
                          <Text style={styles.savingsText}>Save 15%</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(item.product.id, item.product.name)}
                      >
                        <Trash2 size={16} color={'#EF4444'} />
                      </TouchableOpacity>
                      
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={[styles.quantityButton, styles.quantityButtonMinus]}
                          onPress={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        >
                          <Minus size={14} color={theme.colors.primary} />
                        </TouchableOpacity>
                        
                        <View style={styles.quantityDisplay}>
                          <Text style={styles.quantity}>{item.quantity}</Text>
                        </View>
                        
                        <TouchableOpacity
                          style={[styles.quantityButton, styles.quantityButtonPlus, { backgroundColor: theme.colors.primary }]}
                          onPress={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        >
                          <Plus size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.itemTotalContainer}>
                        <Text style={styles.itemTotal}>
                          {formatPrice(item.product.price * item.quantity)}
                        </Text>
                        <Text style={styles.itemTotalLabel}>Total</Text>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>

              {/* Promo Code */}
              <View style={styles.promoSection}>
                <View style={styles.promoHeader}>
                  <Gift size={20} color={theme.colors.primary} />
                  <Text style={styles.promoTitle}>Have a promo code?</Text>
                </View>
                <View style={styles.promoInputContainer}>
                  <View style={styles.promoInputWrapper}>
                    <Tag size={16} color={theme.colors.primary} />
                    <TextInput
                      style={styles.promoInput}
                      placeholder="Enter promo code"
                      placeholderTextColor="#9CA3AF"
                      value={promoCode}
                      onChangeText={setPromoCode}
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.applyButton, { backgroundColor: theme.colors.primary }, promoApplied && styles.applyButtonApplied]}
                    onPress={handleApplyPromo}
                    disabled={promoApplied}
                  >
                    <Text style={[styles.applyButtonText, promoApplied && styles.applyButtonTextApplied]}>
                      {promoApplied ? 'Applied ✓' : 'Apply'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {promoApplied && (
                  <View style={styles.promoSuccess}>
                    <ShieldCheck size={16} color={'#10B981'} />
                    <Text style={styles.promoSuccessText}>BANDA100 applied - KSh 100 off</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryHeaderTitle}>Order Summary</Text>
                <View style={[styles.summaryHeaderBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.summaryHeaderBadgeText}>{cartSummary.itemCount}</Text>
                </View>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({cartSummary.itemCount} items)</Text>
                <Text style={styles.summaryValue}>{formatPrice(cartSummary.subtotal)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={[styles.summaryValue, styles.freeDelivery]}>FREE</Text>
              </View>
              
              {promoApplied && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount (BANDA100)</Text>
                  <Text style={styles.discountValue}>-KSh 100</Text>
                </View>
              )}
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                  {formatPrice(cartSummary.total - (promoApplied ? 100 : 0))}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                <View style={styles.checkoutButtonContent}>
                  <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  <ArrowRight size={20} color="white" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.trustBadges}>
                <View style={styles.trustBadge}>
                  <ShieldCheck size={14} color={'#10B981'} />
                  <Text style={styles.trustBadgeText}>TradeGuard Protection</Text>
                </View>
                <View style={styles.trustBadge}>
                  <Truck size={14} color={'#3B82F6'} />
                  <Text style={styles.trustBadgeText}>Fast Delivery</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  itemCount: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  totalPreview: {
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItems: {
    marginTop: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  itemImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  fastDeliveryBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 4,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  itemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 2,
  },
  savingsContainer: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginVertical: 8,
  },
  quantityButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonMinus: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  quantityDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  quantityButtonPlus: {
    borderRadius: 6,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 32,
    textAlign: 'center',
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemTotalLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  promoSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  promoInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonApplied: {
    backgroundColor: '#10B981',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  applyButtonTextApplied: {
    color: 'white',
  },
  promoSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
  },
  promoSuccessText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  orderSummary: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryHeaderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryHeaderBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  freeDelivery: {
    color: '#10B981',
    fontWeight: '700',
  },
  discountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  checkoutButton: {
    backgroundColor: '#F57C00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  checkoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyCartIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartIconOverlay: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  shopNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});