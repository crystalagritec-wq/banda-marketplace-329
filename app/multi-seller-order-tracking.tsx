import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  Navigation,
  AlertCircle,
  Copy,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';

function formatPrice(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Clock size={20} color="#F59E0B" />;
    case 'confirmed':
      return <CheckCircle2 size={20} color="#10B981" />;
    case 'packed':
      return <Package size={20} color="#3B82F6" />;
    case 'shipped':
      return <Truck size={20} color="#8B5CF6" />;
    case 'delivered':
      return <CheckCircle2 size={20} color="#10B981" />;
    default:
      return <AlertCircle size={20} color="#6B7280" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'confirmed':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'packed':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'shipped':
        return { bg: '#EDE9FE', text: '#5B21B6' };
      case 'delivered':
        return { bg: '#D1FAE5', text: '#065F46' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const colors = getStatusColor();

  return (
    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.statusBadgeText, { color: colors.text }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

export default function MultiSellerOrderTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const userId = params.userId as string || 'user-123';

  const [expandedSubOrders, setExpandedSubOrders] = useState<Set<string>>(new Set());

  const { data: order, isLoading, error } = trpc.orders.getMultiSellerOrder.useQuery({
    orderId,
    userId,
  });

  const toggleSubOrder = (subOrderId: string) => {
    setExpandedSubOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subOrderId)) {
        newSet.delete(subOrderId);
      } else {
        newSet.add(subOrderId);
      }
      return newSet;
    });
  };

  const handleCopyTracking = (trackingId: string) => {
    Alert.alert('Copied', `Tracking ID ${trackingId} copied to clipboard`);
  };

  const handleCallDriver = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleCallSeller = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Package size={48} color="#2D5016" />
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#EF4444" />
            <Text style={styles.errorText}>Failed to load order</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Share2 size={20} color="#2D5016" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.masterOrderCard}>
            <View style={styles.masterOrderHeader}>
              <View>
                <Text style={styles.masterOrderId}>Order #{order.id.slice(-8)}</Text>
                <Text style={styles.masterOrderDate}>{formatDate(order.createdAt)}</Text>
              </View>
              <StatusBadge status={order.status} />
            </View>

            <View style={styles.trackingIdContainer}>
              <View style={styles.trackingIdLeft}>
                <Navigation size={16} color="#6B7280" />
                <Text style={styles.trackingIdText}>{order.masterTrackingId}</Text>
              </View>
              <TouchableOpacity onPress={() => handleCopyTracking(order.masterTrackingId)}>
                <Copy size={16} color="#2D5016" />
              </TouchableOpacity>
            </View>

            {order.isSplitOrder && (
              <View style={styles.splitOrderBanner}>
                <Truck size={16} color="#F57C00" />
                <Text style={styles.splitOrderText}>
                  Split delivery from {order.sellerCount} sellers
                </Text>
              </View>
            )}

            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Total Amount</Text>
              <Text style={styles.orderSummaryValue}>{formatPrice(order.orderSummary.total)}</Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderSummaryLabel}>Payment Status</Text>
              <View style={styles.paymentStatusBadge}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={styles.paymentStatusText}>Paid</Text>
              </View>
            </View>
          </View>

          <View style={styles.deliveryAddressCard}>
            <View style={styles.deliveryAddressHeader}>
              <MapPin size={20} color="#2D5016" />
              <Text style={styles.deliveryAddressTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.deliveryAddressName}>{order.deliveryAddress.name}</Text>
            <Text style={styles.deliveryAddressText}>{order.deliveryAddress.address}</Text>
            <Text style={styles.deliveryAddressCity}>{order.deliveryAddress.city}</Text>
          </View>

          <View style={styles.subOrdersSection}>
            <Text style={styles.subOrdersSectionTitle}>Delivery Details</Text>
            
            {order.subOrders.map((subOrder: any, index: number) => {
              const isExpanded = expandedSubOrders.has(subOrder.subOrderId);
              
              return (
                <View key={subOrder.subOrderId} style={styles.subOrderCard}>
                  <TouchableOpacity 
                    style={styles.subOrderHeader}
                    onPress={() => toggleSubOrder(subOrder.subOrderId)}
                  >
                    <View style={styles.subOrderHeaderLeft}>
                      <View style={styles.subOrderNumber}>
                        <Text style={styles.subOrderNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.subOrderInfo}>
                        <Text style={styles.subOrderSeller}>{subOrder.sellerName}</Text>
                        <View style={styles.subOrderLocationRow}>
                          <MapPin size={12} color="#6B7280" />
                          <Text style={styles.subOrderLocation}>{subOrder.sellerLocation}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.subOrderHeaderRight}>
                      <StatusBadge status={subOrder.status} />
                      {isExpanded ? (
                        <ChevronUp size={20} color="#6B7280" />
                      ) : (
                        <ChevronDown size={20} color="#6B7280" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.subOrderDetails}>
                      <View style={styles.subOrderTrackingRow}>
                        <Text style={styles.subOrderTrackingLabel}>Tracking ID:</Text>
                        <View style={styles.subOrderTrackingValue}>
                          <Text style={styles.subOrderTrackingText}>{subOrder.subTrackingId}</Text>
                          <TouchableOpacity onPress={() => handleCopyTracking(subOrder.subTrackingId)}>
                            <Copy size={14} color="#2D5016" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.subOrderItems}>
                        <Text style={styles.subOrderItemsTitle}>Items ({subOrder.items.length})</Text>
                        {subOrder.items.map((item: any) => (
                          <View key={item.productId} style={styles.subOrderItem}>
                            <Image source={{ uri: item.image }} style={styles.subOrderItemImage} />
                            <View style={styles.subOrderItemDetails}>
                              <Text style={styles.subOrderItemName}>{item.productName}</Text>
                              <Text style={styles.subOrderItemQuantity}>
                                {item.quantity} {item.unit} × {formatPrice(item.price)}
                              </Text>
                            </View>
                            <Text style={styles.subOrderItemTotal}>
                              {formatPrice(item.quantity * item.price)}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.subOrderDelivery}>
                        <View style={styles.subOrderDeliveryHeader}>
                          <Truck size={18} color="#2D5016" />
                          <Text style={styles.subOrderDeliveryTitle}>Delivery Provider</Text>
                        </View>
                        <View style={styles.subOrderDeliveryInfo}>
                          <View style={styles.subOrderDeliveryRow}>
                            <Text style={styles.subOrderDeliveryLabel}>Provider:</Text>
                            <Text style={styles.subOrderDeliveryValue}>{subOrder.deliveryProvider.providerName}</Text>
                          </View>
                          <View style={styles.subOrderDeliveryRow}>
                            <Text style={styles.subOrderDeliveryLabel}>Driver:</Text>
                            <Text style={styles.subOrderDeliveryValue}>{subOrder.deliveryProvider.driverName}</Text>
                          </View>
                          <View style={styles.subOrderDeliveryRow}>
                            <Text style={styles.subOrderDeliveryLabel}>Estimated:</Text>
                            <Text style={styles.subOrderDeliveryValue}>{subOrder.deliveryProvider.estimatedTime}</Text>
                          </View>
                        </View>
                        <View style={styles.subOrderDeliveryActions}>
                          <TouchableOpacity 
                            style={styles.subOrderDeliveryAction}
                            onPress={() => handleCallDriver(subOrder.deliveryProvider.driverPhone)}
                          >
                            <Phone size={16} color="#10B981" />
                            <Text style={styles.subOrderDeliveryActionText}>Call Driver</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.subOrderDeliveryAction}
                            onPress={() => handleCallSeller(subOrder.sellerPhone)}
                          >
                            <Phone size={16} color="#3B82F6" />
                            <Text style={styles.subOrderDeliveryActionText}>Call Seller</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.subOrderTimeline}>
                        <Text style={styles.subOrderTimelineTitle}>Timeline</Text>
                        {subOrder.timeline.map((event: any, eventIndex: number) => (
                          <View key={eventIndex} style={styles.timelineEvent}>
                            <View style={styles.timelineIconContainer}>
                              <StatusIcon status={event.status} />
                              {eventIndex < subOrder.timeline.length - 1 && (
                                <View style={styles.timelineLine} />
                              )}
                            </View>
                            <View style={styles.timelineContent}>
                              <Text style={styles.timelineDescription}>{event.description}</Text>
                              <Text style={styles.timelineTimestamp}>
                                {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>

                      <View style={styles.subOrderSummary}>
                        <View style={styles.subOrderSummaryRow}>
                          <Text style={styles.subOrderSummaryLabel}>Subtotal</Text>
                          <Text style={styles.subOrderSummaryValue}>{formatPrice(subOrder.subtotal)}</Text>
                        </View>
                        <View style={styles.subOrderSummaryRow}>
                          <Text style={styles.subOrderSummaryLabel}>Delivery Fee</Text>
                          <Text style={styles.subOrderSummaryValue}>{formatPrice(subOrder.deliveryFee)}</Text>
                        </View>
                        <View style={styles.subOrderSummaryDivider} />
                        <View style={styles.subOrderSummaryRow}>
                          <Text style={styles.subOrderSummaryTotalLabel}>Total</Text>
                          <Text style={styles.subOrderSummaryTotalValue}>
                            {formatPrice(subOrder.subtotal + subOrder.deliveryFee)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {order.deliveryOptimization.poolingOpportunities > 0 && (
            <View style={styles.optimizationCard}>
              <View style={styles.optimizationHeader}>
                <Navigation size={20} color="#8B5CF6" />
                <Text style={styles.optimizationTitle}>Route Optimization</Text>
              </View>
              <Text style={styles.optimizationText}>
                {order.deliveryOptimization.poolingOpportunities} delivery pooling opportunities identified
              </Text>
              <Text style={styles.optimizationSavings}>
                Potential savings: {formatPrice(order.deliveryOptimization.savingsFromOptimization)}
              </Text>
            </View>
          )}
        </ScrollView>
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
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: { padding: 8 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: '#2D5016',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  masterOrderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  masterOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  masterOrderId: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  masterOrderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trackingIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  trackingIdLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  trackingIdText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  splitOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  splitOrderText: {
    fontSize: 14,
    color: '#9A3412',
    fontWeight: '600',
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderSummaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  orderSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5016',
  },
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  deliveryAddressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  deliveryAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  deliveryAddressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  deliveryAddressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  deliveryAddressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  deliveryAddressCity: {
    fontSize: 14,
    color: '#6B7280',
  },
  subOrdersSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  subOrdersSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  subOrderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  subOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  subOrderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  subOrderNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D5016',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subOrderNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  subOrderInfo: {
    flex: 1,
  },
  subOrderSeller: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subOrderLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subOrderLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  subOrderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subOrderDetails: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  subOrderTrackingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subOrderTrackingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  subOrderTrackingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subOrderTrackingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  subOrderItems: {
    marginBottom: 16,
  },
  subOrderItemsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  subOrderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subOrderItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  subOrderItemDetails: {
    flex: 1,
  },
  subOrderItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  subOrderItemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  subOrderItemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D5016',
  },
  subOrderDelivery: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  subOrderDeliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  subOrderDeliveryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  subOrderDeliveryInfo: {
    marginBottom: 12,
  },
  subOrderDeliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subOrderDeliveryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  subOrderDeliveryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  subOrderDeliveryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  subOrderDeliveryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subOrderDeliveryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  subOrderTimeline: {
    marginBottom: 16,
  },
  subOrderTimelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  subOrderSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  subOrderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subOrderSummaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  subOrderSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  subOrderSummaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  subOrderSummaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  subOrderSummaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5016',
  },
  optimizationCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  optimizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  optimizationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5B21B6',
  },
  optimizationText: {
    fontSize: 14,
    color: '#6B21A8',
    marginBottom: 8,
  },
  optimizationSavings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
});
