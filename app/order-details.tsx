import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  Copy,
  QrCode,
  Download,
  Star,
  AlertTriangle,
  Share,
  FileText,
  Eye,
  Navigation,
} from 'lucide-react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Clipboard,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart, type Order } from '@/providers/cart-provider';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/providers/auth-provider';

function formatPrice(amount: number) {
  try {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  } catch (e) {
    console.log('formatPrice error', e);
    return `KSh ${amount}`;
  }
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return '#F59E0B';
    case 'confirmed':
      return '#3B82F6';
    case 'packed':
      return '#8B5CF6';
    case 'shipped':
      return '#06B6D4';
    case 'delivered':
      return '#10B981';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusIcon = (status: Order['status']) => {
  const color = getStatusColor(status);
  switch (status) {
    case 'pending':
      return <Clock size={20} color={color} />;
    case 'confirmed':
      return <CheckCircle2 size={20} color={color} />;
    case 'packed':
      return <Package size={20} color={color} />;
    case 'shipped':
      return <Truck size={20} color={color} />;
    case 'delivered':
      return <CheckCircle2 size={20} color={color} />;
    case 'cancelled':
      return <AlertTriangle size={20} color={color} />;
    default:
      return <Package size={20} color={color} />;
  }
};

const OrderStatusTimeline = ({ status }: { status: Order['status'] }) => {
  const statuses = [
    { key: 'pending', label: 'Order Placed', time: 'Just now' },
    { key: 'confirmed', label: 'Confirmed', time: '5 mins ago' },
    { key: 'packed', label: 'Being Packed', time: '' },
    { key: 'shipped', label: 'Out for Delivery', time: '' },
    { key: 'delivered', label: 'Delivered', time: '' },
  ];

  const currentIndex = statuses.findIndex(s => s.key === status);

  return (
    <View style={styles.timeline}>
      {statuses.map((item, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;
        
        return (
          <View key={item.key} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[
                styles.timelineIcon,
                isCompleted && styles.timelineIconCompleted,
                isActive && styles.timelineIconActive,
              ]}>
                {isCompleted ? (
                  <CheckCircle2 size={16} color={isActive ? '#F59E0B' : '#10B981'} />
                ) : (
                  <View style={styles.timelineIconEmpty} />
                )}
              </View>
              {index < statuses.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  isCompleted && styles.timelineLineCompleted,
                ]} />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text style={[
                styles.timelineLabel,
                isCompleted && styles.timelineLabelCompleted,
                isActive && styles.timelineLabelActive,
              ]}>
                {item.label}
              </Text>
              {item.time && (
                <Text style={styles.timelineTime}>{item.time}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default function OrderDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useCart();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ orderId?: string }>();
  
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isReleasing, setIsReleasing] = useState<boolean>(false);
  
  const orderId = params?.orderId || '';
  const order = useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);

  const fetchOrderDetails = trpc.orders.fetchOrderDetails.useQuery(
    { 
      order_id: orderId,
      include_qr: true,
      include_tracking: true,
    },
    { enabled: !!orderId }
  );

  useEffect(() => {
    if (fetchOrderDetails.data?.success) {
      setOrderDetails(fetchOrderDetails.data.order);
      setLoading(false);
    }
  }, [fetchOrderDetails.data]);

  const handleCopyOrderId = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(orderId);
      } else {
        Clipboard.setString(orderId);
      }
      Alert.alert('Copied!', 'Order ID copied to clipboard');
    } catch (error) {
      console.error('Error copying order ID:', error);
      Alert.alert('Error', 'Failed to copy order ID');
    }
  }, [orderId]);

  const handleTrackOrder = useCallback(() => {
    router.push({
      pathname: '/order-tracking' as any,
      params: { orderId },
    });
  }, [orderId, router]);

  const handleViewQR = useCallback(() => {
    router.push({ pathname: '/order-qr' as any, params: { orderId } });
  }, [orderId, router]);

  const handleScanQR = useCallback(() => {
    router.push({ pathname: '/qr-scanner' as any, params: { type: 'order', orderId } });
  }, [orderId, router]);

  const handleContactVendor = useCallback(async (phone: string) => {
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      console.error('Error opening phone:', error);
    }
  }, []);

  const handleChatVendor = useCallback(() => {
    router.push('/(tabs)/chat');
  }, [router]);

  const handleShareOrder = useCallback(() => {
    const shareText = `Order #${orderId} - Total: ${formatPrice(order?.total || 0)}`;
    
    if (Platform.OS === 'web') {
      if ((navigator as any).share) {
        (navigator as any).share({
          title: 'Banda Order',
          text: shareText,
        });
      } else {
        Alert.alert('Share', shareText);
      }
    } else {
      Alert.alert('Share Order', shareText);
    }
  }, [orderId, order]);

  const handleRateOrder = useCallback(() => {
    Alert.alert('Rate Order', 'Rating feature coming soon!');
  }, []);

  const releaseMutation = trpc.orders.releaseReserve.useMutation();

  const handleConfirmDelivery = useCallback(async () => {
    if (!orderId) {
      Alert.alert('Error', 'Missing order ID');
      return;
    }
    if (!user?.id) {
      Alert.alert('Not signed in', 'Please sign in to confirm delivery');
      return;
    }
    try {
      setIsReleasing(true);
      console.log('🔓 Releasing reserve for order', orderId);
      const res = await releaseMutation.mutateAsync({
        orderId,
        userId: user.id,
        releaseReason: 'Buyer confirmed delivery',
      });
      if ((res as any)?.success) {
        Alert.alert('Success', 'Funds released to the seller');
        await fetchOrderDetails.refetch();
      } else {
        Alert.alert('Notice', 'Request sent');
      }
    } catch (e: any) {
      console.error('Release error', e);
      Alert.alert('Error', e?.message ?? 'Failed to release funds');
    } finally {
      setIsReleasing(false);
    }
  }, [orderId, user?.id, releaseMutation, fetchOrderDetails]);

  if (loading || !order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={styles.headerActions} />
          </View>
          
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShareOrder} style={styles.headerAction}>
              <Share size={20} color="#2D5016" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.orderIdSection}>
                <Text style={styles.orderId}>#{orderId}</Text>
                <TouchableOpacity onPress={handleCopyOrderId} style={styles.copyButton}>
                  <Copy size={16} color="#2D5016" />
                </TouchableOpacity>
              </View>
              <View style={styles.statusBadge}>
                {getStatusIcon(order.status)}
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Order Date</Text>
                <Text style={styles.summaryValue}>
                  {order.createdAt.toLocaleDateString('en-KE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>{formatPrice(order.total)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment Method</Text>
                <Text style={styles.summaryValue}>{order.paymentMethod.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>{order.items.length} items</Text>
              </View>
            </View>
          </View>

          {/* Order Status Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.cardTitle}>Order Status</Text>
            <OrderStatusTimeline status={order.status} />
          </View>

          {/* Delivery Address */}
          <View style={styles.addressCard}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <View style={styles.addressContent}>
              <MapPin size={20} color="#2D5016" />
              <View style={styles.addressDetails}>
                <Text style={styles.addressName}>{order.address.name}</Text>
                <Text style={styles.addressText}>{order.address.address}</Text>
                <Text style={styles.addressCity}>{order.address.city}</Text>
                <Text style={styles.addressPhone}>{order.address.phone}</Text>
              </View>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.itemsCard}>
            <Text style={styles.cardTitle}>Order Items</Text>
            {order.items.map((item, index) => (
              <View key={item.product.id} style={styles.orderItem}>
                <Image source={{ uri: item.product.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemVendor}>{item.product.vendor}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemUnitPrice}>
                    Unit: {formatPrice(item.product.price)}
                  </Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemTotal}>
                    {formatPrice(item.product.price * item.quantity)}
                  </Text>
                  <TouchableOpacity style={styles.rateButton} onPress={handleRateOrder}>
                    <Star size={14} color="#FFD700" />
                    <Text style={styles.rateButtonText}>Rate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Payment Breakdown */}
          <View style={styles.paymentCard}>
            <Text style={styles.cardTitle}>Payment Summary</Text>
            <View style={styles.paymentDetails}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Subtotal</Text>
                <Text style={styles.paymentValue}>
                  {formatPrice(order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Delivery Fee</Text>
                <Text style={styles.paymentValue}>{formatPrice(150)}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Service Fee</Text>
                <Text style={styles.paymentValue}>{formatPrice(25)}</Text>
              </View>
              <View style={[styles.paymentRow, styles.paymentTotal]}>
                <Text style={styles.paymentTotalLabel}>Total</Text>
                <Text style={styles.paymentTotalValue}>{formatPrice(order.total)}</Text>
              </View>
            </View>
          </View>

          {/* Vendor Contact */}
          <View style={styles.vendorCard}>
            <Text style={styles.cardTitle}>Contact Vendors</Text>
            {Array.from(new Set(order.items.map(item => item.product.vendor))).map((vendor, index) => (
              <View key={vendor} style={styles.vendorItem}>
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{vendor}</Text>
                  <Text style={styles.vendorProducts}>
                    {order.items.filter(item => item.product.vendor === vendor).length} items
                  </Text>
                </View>
                <View style={styles.vendorActions}>
                  <TouchableOpacity 
                    style={styles.vendorCallButton} 
                    onPress={() => handleContactVendor('+254700000000')}
                  >
                    <Phone size={16} color="#2D5016" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.vendorChatButton} onPress={handleChatVendor}>
                    <MessageCircle size={16} color="#1976D2" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* QR Code Section */}
          <View style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <QrCode size={24} color="#2D5016" />
              <Text style={styles.cardTitle}>Order Verification</Text>
            </View>
            <Text style={styles.qrDescription}>
              Show this QR code to the delivery person for order verification and payment release.
            </Text>
            <TouchableOpacity style={styles.qrButton} onPress={handleViewQR}>
              <QrCode size={18} color="white" />
              <Text style={styles.qrButtonText}>View QR Code</Text>
            </TouchableOpacity>
          </View>

          {/* Receipt Download */}
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <FileText size={24} color="#1976D2" />
              <Text style={styles.cardTitle}>Digital Receipt</Text>
            </View>
            <Text style={styles.receiptDescription}>
              Download your order receipt with QR code for your records.
            </Text>
            <View style={styles.receiptActions}>
              <TouchableOpacity style={styles.receiptButton}>
                <Download size={16} color="#1976D2" />
                <Text style={styles.receiptButtonText}>Download PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.receiptButton}>
                <Download size={16} color="#1976D2" />
                <Text style={styles.receiptButtonText}>Download JPG</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {(order.status === 'confirmed' || order.status === 'packed' || order.status === 'shipped') && (
            <TouchableOpacity
              testID="track-order-button"
              style={styles.trackButton}
              onPress={handleTrackOrder}
            >
              <Navigation size={20} color="white" />
              <Text style={styles.trackButtonText}>Track Order</Text>
            </TouchableOpacity>
          )}

          {(order.status === 'shipped' || order.status === 'packed' || order.status === 'confirmed') && (
            <TouchableOpacity
              testID="confirm-delivery-button"
              style={[styles.confirmButton, isReleasing && styles.confirmButtonDisabled]}
              onPress={handleConfirmDelivery}
              disabled={isReleasing}
            >
              <CheckCircle2 size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>{isReleasing ? 'Releasing…' : 'Confirm Delivery'}</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            testID="need-help-button"
            style={styles.helpButton}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <MessageCircle size={20} color="#2D5016" />
            <Text style={styles.helpButtonText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerAction: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderIdSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  copyButton: {
    padding: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryDetails: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: '#ECFDF5',
  },
  timelineIconActive: {
    backgroundColor: '#FEF3C7',
  },
  timelineIconEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#10B981',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  timelineLabelCompleted: {
    color: '#10B981',
  },
  timelineLabelActive: {
    color: '#F59E0B',
  },
  timelineTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  addressCity: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemVendor: {
    fontSize: 12,
    color: '#2D5016',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemUnitPrice: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D5016',
    marginBottom: 8,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rateButtonText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  paymentDetails: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  paymentTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  paymentTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5016',
  },
  vendorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  vendorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  vendorProducts: {
    fontSize: 12,
    color: '#6B7280',
  },
  vendorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  vendorCallButton: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  vendorChatButton: {
    backgroundColor: '#EBF8FF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  qrCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  qrDescription: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
    marginBottom: 16,
  },
  qrButton: {
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  qrButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  receiptCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  receiptDescription: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
    marginBottom: 16,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 12,
  },
  receiptButton: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  receiptButtonText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  trackButton: {
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  helpButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2D5016',
  },
  confirmButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  helpButtonText: {
    color: '#2D5016',
    fontSize: 16,
    fontWeight: '600',
  },
});