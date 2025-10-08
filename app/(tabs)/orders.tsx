import { LinearGradient } from 'expo-linear-gradient';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Eye,
  MessageCircle,
  RefreshCw,
  Phone,
  LifeBuoy,
  AlertTriangle,
  ShieldCheck,
  Search as SearchIcon,
  Repeat,
  Filter as FilterIcon,
  QrCode,
  Download,
} from 'lucide-react-native';
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart, type Order } from '@/providers/cart-provider';
import { useOrders } from '@/providers/order-provider';
import { useDisputes } from '@/providers/dispute-provider';
import { useAddresses, type UnifiedAddress } from '@/providers/address-provider';
import { supabase } from '@/lib/supabase';

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
      return <Clock size={16} color={color} />;
    case 'confirmed':
      return <CheckCircle2 size={16} color={color} />;
    case 'packed':
      return <Package size={16} color={color} />;
    case 'shipped':
      return <Truck size={16} color={color} />;
    case 'delivered':
      return <CheckCircle2 size={16} color={color} />;
    case 'cancelled':
      return <RefreshCw size={16} color={color} />;
    default:
      return <Package size={16} color={color} />;
  }
};

const OrderCard = ({
  order,
  onViewDetails,
  onTrackOrder,
  onReorder,
  onCancel,
  onRaiseDispute,
  onViewQR,
}: {
  order: Order;
  onViewDetails: (orderId: string) => void;
  onTrackOrder: (orderId: string) => void;
  onReorder: (order: Order) => void;
  onCancel: (orderId: string) => void;
  onRaiseDispute: (orderId: string) => void;
  onViewQR: (orderId: string) => void;
}) => (
  <View style={styles.orderCard} testID={`order-card-${order.id}`}>
    <View style={styles.orderHeader}>
      <View style={styles.orderIdSection}>
        <Text style={styles.orderId}>#{order.id}</Text>
        <View style={styles.statusBadge}>
          {getStatusIcon(order.status)}
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={styles.orderDate}>
        {order.createdAt.toLocaleDateString('en-KE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </Text>
    </View>

    <View style={styles.orderItems}>
      {order.items.slice(0, 2).map((item) => (
        <View key={item.product.id} style={styles.orderItem}>
          <Image source={{ uri: item.product.image }} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.product.name}
            </Text>
            <Text style={styles.itemVendor}>{item.product.vendor}</Text>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          </View>
        </View>
      ))}
      {order.items.length > 2 && (
        <Text style={styles.moreItems}>+{order.items.length - 2} more items</Text>
      )}
    </View>

    <View style={styles.orderFooter}>
      <View style={styles.orderTotal}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onViewDetails(order.id)}
          testID={`order-view-${order.id}`}
        >
          <Eye size={16} color="#2D5016" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>

        {(order.status === 'confirmed' || order.status === 'packed' || order.status === 'shipped') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.trackButton]}
            onPress={() => onTrackOrder(order.id)}
            testID={`order-track-${order.id}`}
          >
            <MapPin size={16} color="white" />
            <Text style={[styles.actionButtonText, styles.trackButtonText]}>Track</Text>
          </TouchableOpacity>
        )}

        {order.status === 'delivered' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onReorder(order)}
            testID={`order-reorder-${order.id}`}
          >
            <Repeat size={16} color="#2D5016" />
            <Text style={styles.actionButtonText}>Reorder</Text>
          </TouchableOpacity>
        )}

        {(order.status === 'pending' || order.status === 'confirmed') && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onCancel(order.id)}
            testID={`order-cancel-${order.id}`}
          >
            <RefreshCw size={16} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} testID={`order-chat-${order.id}`}>
          <MessageCircle size={16} color="#1976D2" />
          <Text style={[styles.actionButtonText, { color: '#1976D2' }]}>Chat</Text>
        </TouchableOpacity>
        
        {/* QR Code for all orders */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onViewQR(order.id)}
          testID={`order-qr-${order.id}`}
        >
          <QrCode size={16} color="#2D5016" />
          <Text style={styles.actionButtonText}>QR</Text>
        </TouchableOpacity>
        
        {(order.status === 'delivered' || order.status === 'shipped') && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onRaiseDispute(order.id)}
            testID={`order-dispute-${order.id}`}
          >
            <AlertTriangle size={16} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Dispute</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
);

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, updateOrderStatus } = useCart();
  const { addresses } = useAddresses();
  const { disputeStats, createDispute } = useDisputes();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'requests' | 'inTransit' | 'delivered' | 'cancelled' | 'all'>('all');
  const [query, setQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'amount'>('recent');

  const defaultPhone = useMemo(() => {
    const addr = (addresses ?? []).find((a: UnifiedAddress) => a.isDefault) ?? (addresses ?? [])[0];
    return addr?.phone ?? '+254700000000';
  }, [addresses]);

  const { refetchActive, isRefetching } = useOrders();

  const onRefresh = useCallback(async () => {
    console.log('OrdersScreen:onRefresh');
    setRefreshing(true);
    try {
      await refetchActive();
    } finally {
      setRefreshing(false);
    }
  }, [refetchActive]);

  const handleViewDetails = useCallback((orderId: string) => {
    console.log('OrdersScreen:handleViewDetails', orderId);
    router.push({ pathname: '/order-details' as any, params: { orderId } });
  }, [router]);

  const handleTrackOrder = useCallback((orderId: string) => {
    console.log('OrdersScreen:handleTrackOrder', orderId);
    router.push({ pathname: '/order-tracking' as any, params: { orderId } });
  }, [router]);

  const handleReorder = useCallback((order: Order) => {
    console.log('OrdersScreen:handleReorder', order.id);
    router.push('/(tabs)/marketplace');
  }, [router]);

  const handleCancel = useCallback((orderId: string) => {
    console.log('OrdersScreen:handleCancel', orderId);
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const canCancel = ['pending', 'confirmed'].includes(order.status);
    if (!canCancel) {
      Alert.alert(
        'Cannot Cancel',
        'This order cannot be cancelled as it is already being prepared or shipped. Please contact support if you need assistance.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const refundAmount = order.total;
    const confirmText = `Cancel this order?\n\nOrder: #${orderId}\nTotal: ${formatPrice(refundAmount)}\n\nYou will receive a full refund to your wallet within 24 hours.`;
    
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' ? window.confirm(confirmText) : true;
      if (ok) {
        updateOrderStatus(orderId, 'cancelled');
        Alert.alert(
          'Order Cancelled',
          `Your order has been cancelled. Refund of ${formatPrice(refundAmount)} will be processed within 24 hours.`,
          [{ text: 'OK' }]
        );
      }
      return;
    }
    
    Alert.alert(
      'Cancel Order',
      confirmText,
      [
        { text: 'Keep Order', style: 'cancel' },
        { 
          text: 'Cancel Order', 
          style: 'destructive', 
          onPress: () => {
            updateOrderStatus(orderId, 'cancelled');
            Alert.alert(
              'Order Cancelled',
              `Your order has been cancelled. Refund of ${formatPrice(refundAmount)} will be processed within 24 hours.`,
              [{ text: 'OK' }]
            );
          }
        },
      ]
    );
  }, [updateOrderStatus, orders]);
  
  const handleRaiseDispute = useCallback(async (orderId: string) => {
    console.log('OrdersScreen:handleRaiseDispute', orderId);
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const reasons = [
      'Item not as described',
      'Item not delivered',
      'Wrong item received',
      'Damaged item',
      'Quality issues',
      'Other'
    ];
    
    if (Platform.OS === 'web') {
      const reason = typeof window !== 'undefined' ? window.prompt('Please describe the issue:', reasons[0]) : reasons[0];
      if (reason && reason.trim()) {
        try {
          const dispute = await createDispute(orderId, 'buyer', reason.trim(), 'medium');
          console.log('Dispute created:', dispute.disputeId);
          router.push(`/dispute/${dispute.disputeId}` as any);
        } catch (error) {
          console.error('Error creating dispute:', error);
        }
      }
      return;
    }
    
    Alert.alert(
      'Raise Dispute',
      'What is the issue with this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...reasons.map(reason => ({
          text: reason,
          onPress: async () => {
            try {
              const dispute = await createDispute(orderId, 'buyer', reason, 'medium');
              console.log('Dispute created:', dispute.disputeId);
              router.push(`/dispute/${dispute.disputeId}` as any);
            } catch (error) {
              console.error('Error creating dispute:', error);
            }
          }
        }))
      ],
      { cancelable: true }
    );
  }, [orders, createDispute, router]);

  const handleViewQR = useCallback(async (orderId: string) => {
    console.log('OrdersScreen:handleViewQR', orderId);
    try {
      const { data, error } = await supabase
        .rpc('fetch_order_details', {
          order_id: orderId
        });

      if (error) {
        throw error;
      }

      // Navigate to QR view or show QR modal
      Alert.alert(
        'Order QR Code',
        'QR code for order verification',
        [
          { text: 'View QR', onPress: () => router.push({ pathname: '/order-qr' as any, params: { orderId } }) },
          { text: 'Download', onPress: () => downloadOrderQR(orderId) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error fetching order QR:', error);
      Alert.alert('Error', 'Failed to load order QR code');
    }
  }, [router]);

  const downloadOrderQR = useCallback(async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('generate_order_qr', {
          order_id: orderId,
          format: 'png'
        });

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'QR code downloaded successfully');
    } catch (error) {
      console.error('Error downloading QR:', error);
      Alert.alert('Error', 'Failed to download QR code');
    }
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { requests: 0, inTransit: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => {
      if (['pending', 'confirmed', 'packed'].includes(o.status)) counts.requests += 1;
      if (o.status === 'shipped') counts.inTransit += 1;
      if (o.status === 'delivered') counts.delivered += 1;
      if (o.status === 'cancelled') counts.cancelled += 1;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders.filter(order => {
      switch (selectedTab) {
        case 'requests':
          return ['pending', 'confirmed', 'packed'].includes(order.status);
        case 'inTransit':
          return order.status === 'shipped';
        case 'delivered':
          return order.status === 'delivered';
        case 'cancelled':
          return order.status === 'cancelled';
        default:
          return true;
      }
    });

    if (query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      list = list.filter(o => {
        const inId = o.id.toLowerCase().includes(q);
        const inItems = o.items.some(i =>
          (i.product.name?.toLowerCase().includes(q)) || (i.product.vendor?.toLowerCase().includes(q))
        );
        return inId || inItems;
      });
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'amount') return b.total - a.total;
      if (sortBy === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return list;
  }, [orders, selectedTab, query, sortBy]);

  const openPhone = useCallback(async () => {
    const url = `tel:${defaultPhone}`;
    console.log('OrdersScreen:openPhone', url);
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.log('openPhone error', e);
    }
  }, [defaultPhone]);

  const openWhatsApp = useCallback(async () => {
    const phoneNum = defaultPhone.replace(/[^\d]/g, '');
    const url = `https://wa.me/${phoneNum}`;
    console.log('OrdersScreen:openWhatsApp', url);
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.log('openWhatsApp error', e);
    }
  }, [defaultPhone]);

  const goLiveChat = useCallback(() => {
    console.log('OrdersScreen:goLiveChat');
    router.push('/(tabs)/chat');
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="orders-screen">
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.orderCount}>{orders.length} orders</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <SearchIcon size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders, items or vendors"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              testID="orders-search"
            />
          </View>
          <TouchableOpacity
            style={styles.sortPill}
            onPress={() => setSortBy(prev => (prev === 'recent' ? 'amount' : prev === 'amount' ? 'oldest' : 'recent'))}
            testID="orders-sort"
          >
            <FilterIcon size={16} color="#2D5016" />
            <Text style={styles.sortPillText}>
              {sortBy === 'recent' ? 'Recent' : sortBy === 'amount' ? 'Amount' : 'Oldest'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
            onPress={() => setSelectedTab('all')}
            testID="tab-all"
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'requests' && styles.activeTab]}
            onPress={() => setSelectedTab('requests')}
            testID="tab-requests"
          >
            <Text style={[styles.tabText, selectedTab === 'requests' && styles.activeTabText]}>Request {statusCounts.requests}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'inTransit' && styles.activeTab]}
            onPress={() => setSelectedTab('inTransit')}
            testID="tab-inTransit"
          >
            <Text style={[styles.tabText, selectedTab === 'inTransit' && styles.activeTabText]}>In Transit {statusCounts.inTransit}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'delivered' && styles.activeTab]}
            onPress={() => setSelectedTab('delivered')}
            testID="tab-delivered"
          >
            <Text style={[styles.tabText, selectedTab === 'delivered' && styles.activeTabText]}>Delivered {statusCounts.delivered}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'cancelled' && styles.activeTab]}
            onPress={() => setSelectedTab('cancelled')}
            testID="tab-cancelled"
          >
            <Text style={[styles.tabText, selectedTab === 'cancelled' && styles.activeTabText]}>Cancelled {statusCounts.cancelled}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing || isRefetching} onRefresh={onRefresh} />}
        >
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
                onTrackOrder={handleTrackOrder}
                onReorder={handleReorder}
                onCancel={handleCancel}
                onRaiseDispute={handleRaiseDispute}
                onViewQR={handleViewQR}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Package size={80} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>
                No orders found
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Try adjusting filters or searching by order ID, product, or vendor
              </Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/(tabs)/marketplace')}
              >
                <Text style={styles.shopButtonText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>Need Help Placing Order?</Text>
            <View style={styles.helpActions}>
              <TouchableOpacity style={styles.helpRow} onPress={() => router.push('/delivery-scheduling' as any)} testID="help-schedule">
                <Clock size={18} color="#2D5016" />
                <Text style={styles.helpText}>Schedule Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpRow} onPress={openPhone} testID="help-call">
                <Phone size={18} color="#2D5016" />
                <Text style={styles.helpText}>Call for Support</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpRow} onPress={openWhatsApp} testID="help-whatsapp">
                <MessageCircle size={18} color="#2D5016" />
                <Text style={styles.helpText}>Chat on WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpRow} onPress={goLiveChat} testID="help-livechat">
                <LifeBuoy size={18} color="#2D5016" />
                <Text style={styles.helpText}>Support Live Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={18} color="#EF4444" />
              <Text style={styles.sectionTitle}>In Dispute</Text>
            </View>
            <Text style={styles.sectionSub}>{disputeStats.open + disputeStats.analyzing + disputeStats.underReview} orders currently under review.</Text>
            <TouchableOpacity style={styles.sectionButton} onPress={() => router.push('/disputes')} testID="view-disputes">
              <Text style={styles.sectionButtonText}>View Disputes</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <ShieldCheck size={18} color="#10B981" />
              <Text style={styles.sectionTitle}>Resolved Disputes</Text>
            </View>
            <Text style={styles.sectionSub}>{statusCounts.cancelled} orders resolved or cancelled.</Text>
          </View>
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
  orderCount: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D5016',
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderIdSection: { flex: 1 },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  orderItems: { marginBottom: 16 },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemVendor: {
    fontSize: 12,
    color: '#2D5016',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: { fontSize: 12, color: '#6B7280' },
  moreItems: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: { fontSize: 16, color: '#6B7280' },
  totalAmount: { fontSize: 18, fontWeight: '700', color: '#2D5016' },
  orderActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionButton: {
    flexGrow: 1,
    flexBasis: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trackButton: { backgroundColor: '#2D5016', borderColor: '#2D5016' },
  actionButtonText: { fontSize: 12, fontWeight: '600', color: '#2D5016' },
  trackButtonText: { color: 'white' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: '#2D5016',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
  },
  shopButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  helpCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 12 },
  helpActions: { gap: 8 },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  sectionSub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  sectionButton: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionButtonText: { fontSize: 14, fontWeight: '700', color: '#111827' },
});