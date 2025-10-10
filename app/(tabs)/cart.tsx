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
  Heart,
  Star,
  Gift,
} from 'lucide-react-native';
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useCart } from '@/providers/cart-provider';
import { useTheme } from '@/providers/theme-provider';
import { trpc } from '@/lib/trpc';
import CartFeedback from '@/components/CartFeedback';
import * as Haptics from 'expo-haptics';

function formatPrice(amount: number) {
  try {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  } catch (e) {
    console.log('formatPrice error', e);
    return `KSh ${amount}`;
  }
}

export default function CartScreen() {
  const router = useRouter();
  const theme = useTheme();

  const { cartItems, cartSummary, groupedBySeller, updateQuantity, removeFromCart } = useCart();
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const animatedValuesRef = useRef<Map<string, Animated.Value>>(new Map());
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [feedbackVisible, setFeedbackVisible] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'add' | 'update' | 'remove' | 'success'>('update');
  
  const validatePromoMutation = trpc.cart.validatePromo.useMutation();

  const showFeedback = useCallback((type: 'add' | 'update' | 'remove' | 'success', message: string) => {
    setFeedbackType(type);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  }, []);

  const getAnimatedValue = useCallback((itemId: string) => {
    if (!animatedValuesRef.current.has(itemId)) {
      animatedValuesRef.current.set(itemId, new Animated.Value(1));
    }
    return animatedValuesRef.current.get(itemId)!;
  }, []);

  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    const item = cartItems.find(i => i.product.id === productId);
    if (item) {
      const diff = newQuantity - item.quantity;
      updateQuantity(productId, newQuantity);
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      
      if (diff > 0) {
        showFeedback('update', `Added ${diff} more ${item.product.name}`);
      } else if (diff < 0) {
        showFeedback('update', `Removed ${Math.abs(diff)} ${item.product.name}`);
      }
    }
  }, [updateQuantity, cartItems, showFeedback]);

  const handleRemoveItem = useCallback((productId: string, productName: string) => {
    const animValue = getAnimatedValue(productId);
    Animated.timing(animValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      removeFromCart(productId);
      animValue.setValue(1);
      showFeedback('remove', `${productName} removed from cart`);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    });
  }, [removeFromCart, getAnimatedValue, showFeedback]);
  
  const handleQuantityInputChange = useCallback((productId: string, value: string) => {
    setQuantityInput(value);
  }, []);
  
  const handleQuantityInputSubmit = useCallback((productId: string) => {
    const newQuantity = parseInt(quantityInput, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity (minimum 1).');
      setEditingQuantity(null);
      setQuantityInput('');
      return;
    }
    if (newQuantity > 999) {
      Alert.alert('Quantity Too Large', 'Maximum quantity is 999.');
      return;
    }
    updateQuantity(productId, newQuantity);
    setEditingQuantity(null);
    setQuantityInput('');
  }, [quantityInput, updateQuantity]);
  
  const startEditingQuantity = useCallback((productId: string, currentQuantity: number) => {
    setEditingQuantity(productId);
    setQuantityInput(currentQuantity.toString());
  }, []);

  const handleApplyPromo = useCallback(async () => {
    if (!promoCode.trim()) {
      Alert.alert('Empty Code', 'Please enter a promo code.');
      return;
    }
    
    try {
      const result = await validatePromoMutation.mutateAsync({
        code: promoCode.trim(),
        cartValue: cartSummary.subtotal,
      });
      
      if (result.success && result.discountAmount) {
        setPromoApplied(true);
        setPromoDiscount(result.discountAmount);
        Alert.alert('✅ Success', `Promo code applied! You saved ${formatPrice(result.discountAmount)}`);
      } else {
        Alert.alert('❌ Invalid Code', result.error || 'This promo code is not valid.');
      }
    } catch (error: any) {
      Alert.alert('❌ Error', error?.message || 'Failed to validate promo code.');
    }
  }, [promoCode, cartSummary.subtotal, validatePromoMutation]);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }
    router.push('/checkout' as any);
  }, [cartItems.length, router]);

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <View style={[styles.headerBadge, { borderColor: theme.colors.primary }]}>
              <ShoppingCart size={20} color={theme.colors.primary} />
            </View>
          </View>
          
          <View style={styles.emptyCart}>
            <View style={styles.emptyCartIcon}>
              <ShoppingCart size={64} color={theme.colors.primary} />
              <View style={styles.emptyCartIconOverlay}>
                <Heart size={24} color="#EF4444" />
              </View>
            </View>
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtitle}>
              Discover fresh produce and quality agricultural products
            </Text>
            <TouchableOpacity
              style={[styles.shopNowButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/(tabs)/marketplace')}
            >
              <Text style={styles.shopNowButtonText}>Explore Marketplace</Text>
              <ArrowRight size={18} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <View style={styles.headerSubtitle}>
              <Text style={styles.itemCount}>{cartSummary.itemCount} items</Text>
              <Text style={[styles.totalPreview, { color: theme.colors.primary }]}>{formatPrice(cartSummary.total)}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.wishlistButton}>
              <Heart size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {cartSummary.isSplitOrder && (
            <View style={styles.splitOrderNotice}>
              <View style={styles.splitOrderHeader}>
                <Truck size={20} color="#F57C00" />
                <Text style={styles.splitOrderTitle}>Multi-Seller Order</Text>
              </View>
              <Text style={styles.splitOrderText}>
                Your cart contains items from {cartSummary.sellerCount} different sellers. Each seller will have separate delivery.
              </Text>
            </View>
          )}

          <View style={styles.cartItems}>
            {groupedBySeller.map((sellerGroup, groupIndex) => (
              <View key={sellerGroup.sellerId} style={styles.sellerGroup}>
                <View style={styles.sellerHeader}>
                  <View style={styles.sellerInfo}>
                    <Text style={styles.sellerName}>{sellerGroup.sellerName}</Text>
                    <View style={styles.sellerLocationRow}>
                      <MapPin size={12} color="#6B7280" />
                      <Text style={styles.sellerLocationText}>{sellerGroup.sellerLocation}</Text>
                    </View>
                  </View>
                  <View style={styles.sellerStats}>
                    <Text style={styles.sellerItemCount}>{sellerGroup.items.length} items</Text>
                    <Text style={styles.sellerSubtotal}>{formatPrice(sellerGroup.subtotal)}</Text>
                  </View>
                </View>

                {sellerGroup.items.map((item, index) => (
                <Animated.View 
                  key={item.product.id} 
                  style={[
                    styles.cartItem,
                    {
                      transform: [{
                        scale: getAnimatedValue(item.product.id)
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
                        <Star size={12} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.ratingText}>4.8</Text>
                      </View>
                    </View>
                    
                    <View style={styles.itemFooter}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.itemPrice}>
                          {formatPrice(item.product.price)}
                        </Text>
                        <Text style={styles.itemUnit}>/{item.product.unit}</Text>
                      </View>
                      
                      {item.product.discount && (
                        <View style={styles.savingsContainer}>
                          <Text style={styles.savingsText}>Save {item.product.discount}%</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.product.id, item.product.name)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                    
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={[styles.quantityButton, styles.quantityButtonMinus]}
                        onPress={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} color={item.quantity <= 1 ? '#D1D5DB' : theme.colors.primary} />
                      </TouchableOpacity>
                      
                      {editingQuantity === item.product.id ? (
                        <TextInput
                          style={[styles.quantityInput, { borderColor: theme.colors.primary }]}
                          value={quantityInput}
                          onChangeText={(value) => handleQuantityInputChange(item.product.id, value)}
                          onBlur={() => handleQuantityInputSubmit(item.product.id)}
                          onSubmitEditing={() => handleQuantityInputSubmit(item.product.id)}
                          keyboardType="number-pad"
                          selectTextOnFocus
                          autoFocus
                          maxLength={3}
                        />
                      ) : (
                        <TouchableOpacity 
                          style={styles.quantityDisplay}
                          onPress={() => startEditingQuantity(item.product.id, item.quantity)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.quantity}>{item.quantity}</Text>
                        </TouchableOpacity>
                      )}
                      
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
            ))}
          </View>

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
                style={[styles.applyButton, promoApplied && styles.applyButtonApplied]}
                onPress={handleApplyPromo}
                disabled={promoApplied}
              >
                <Text style={[styles.applyButtonText, promoApplied && styles.applyButtonTextApplied]}>
                  {promoApplied ? 'Applied ✓' : 'Apply'}
                </Text>
              </TouchableOpacity>
            </View>
            {promoApplied && promoDiscount > 0 && (
              <View style={styles.promoSuccess}>
                <ShieldCheck size={16} color="#10B981" />
                <Text style={styles.promoSuccessText}>
                  {promoCode.toUpperCase()} applied - {formatPrice(promoDiscount)} off
                </Text>
              </View>
            )}
            {validatePromoMutation.isPending && (
              <View style={styles.promoLoading}>
                <Text style={styles.promoLoadingText}>Validating...</Text>
              </View>
            )}
          </View>


        </ScrollView>

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
          
          {promoApplied && promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount ({promoCode.toUpperCase()})</Text>
              <Text style={styles.discountValue}>-{formatPrice(promoDiscount)}</Text>
            </View>
          )}
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {formatPrice(Math.max(0, cartSummary.total - promoDiscount))}
            </Text>
          </View>
          
          <Text style={styles.deliveryNote}>Delivery fee calculated at checkout</Text>
          
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <View style={styles.checkoutButtonContent}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <ArrowRight size={20} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.trustBadges}>
            <View style={styles.trustBadge}>
              <ShieldCheck size={14} color="#10B981" />
              <Text style={styles.trustBadgeText}>TradeGuard Protection</Text>
            </View>
            <View style={styles.trustBadge}>
              <Truck size={14} color="#3B82F6" />
              <Text style={styles.trustBadgeText}>Fast Delivery</Text>
            </View>
          </View>
        </View>
        
        <CartFeedback
          visible={feedbackVisible}
          type={feedbackType}
          message={feedbackMessage}
          onHide={() => setFeedbackVisible(false)}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18.59,
    fontWeight: '800',
    color: '#1F2937',
  },
  itemCount: {
    fontSize: 12.39,
    color: '#6B7280',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  cartItems: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 9.29,
    padding: 9.29,
    marginBottom: 9.29,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  itemImage: {
    width: 54.21,
    height: 54.21,
    borderRadius: 7.74,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 10.84,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 3.10,
    flex: 1,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 14,
    color: '#2D5016',
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
    fontSize: 10.84,
    fontWeight: '700',
    color: '#2D5016',
  },
  itemUnit: {
    fontSize: 9.29,
    color: '#6B7280',
    marginLeft: 1.55,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
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
    padding: 6.19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 10.84,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 21.68,
    textAlign: 'center',
  },
  quantityInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 40,
    textAlign: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  itemTotal: {
    fontSize: 10.84,
    fontWeight: '700',
    color: '#1F2937',
  },
  promoSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  promoTitle: {
    fontSize: 12.39,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 9.29,
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
    backgroundColor: '#2D5016',
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
  deliveryInfo: {
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
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  deliveryEstimate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12.39,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 12.39,
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
    fontSize: 13.94,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 15.49,
    fontWeight: '800',
    color: '#2D5016',
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
  checkoutButtonText: {
    color: 'white',
    fontSize: 13.94,
    fontWeight: '700',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustBadgeText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
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
  headerBadge: {
    backgroundColor: '#F5F5DC',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
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
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  totalPreview: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wishlistButton: {
    padding: 8,
    backgroundColor: '#F5F5DC',
    borderRadius: 12,
  },
  itemImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  fastDeliveryBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
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
  itemTotalContainer: {
    alignItems: 'flex-end',
  },
  itemTotalLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
  checkoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  splitOrderNotice: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  splitOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  splitOrderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9A3412',
  },
  splitOrderText: {
    fontSize: 14,
    color: '#9A3412',
    lineHeight: 20,
  },
  
  sellerGroup: {
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
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 12.39,
    fontWeight: '700',
    color: '#2D5016',
    marginBottom: 3.10,
  },
  sellerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerLocationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sellerStats: {
    alignItems: 'flex-end',
  },
  sellerItemCount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  sellerSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D5016',
  },
  promoLoading: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  promoLoadingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  deliveryNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
