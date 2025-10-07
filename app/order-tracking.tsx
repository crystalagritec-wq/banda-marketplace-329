import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  User,
  Star,
  RefreshCw,
  AlertTriangle,
  QrCode,
  Share2,
  Download,
  Info,
} from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';

function formatPrice(amount: number) {
  try {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  } catch (e) {
    return `KSh ${amount}`;
  }
}

const TrackingStep = ({
  icon,
  title,
  description,
  time,
  isCompleted,
  isActive,
  isLast,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time?: string;
  isCompleted: boolean;
  isActive: boolean;
  isLast?: boolean;
}) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive, pulseAnim]);

  return (
    <View style={styles.trackingStep}>
      <View style={styles.stepLeft}>
        <Animated.View
          style={[
            styles.stepIcon,
            isCompleted && styles.stepIconCompleted,
            isActive && styles.stepIconActive,
            isActive && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          {icon}
        </Animated.View>
        {!isLast && (
          <View
            style={[
              styles.stepLine,
              isCompleted && styles.stepLineCompleted,
              isActive && styles.stepLineActive,
            ]}
          />
        )}
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Text
            style={[
              styles.stepTitle,
              isCompleted && styles.stepTitleCompleted,
              isActive && styles.stepTitleActive,
            ]}
          >
            {title}
          </Text>
          {time && <Text style={styles.stepTime}>{time}</Text>}
        </View>
        <Text
          style={[
            styles.stepDescription,
            isActive && styles.stepDescriptionActive,
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
};

const DriverCard = ({
  name,
  phone,
  rating,
  vehicle,
  onCall,
  onChat,
}: {
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
  onCall: () => void;
  onChat: () => void;
}) => (
  <View style={styles.driverCard}>
    <View style={styles.driverHeader}>
      <View style={styles.driverAvatar}>
        <User size={24} color="#2D5016" />
      </View>
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{name}</Text>
        <View style={styles.driverRating}>
          <Star size={14} color="#FFD700" fill="#FFD700" />
          <Text style={styles.driverRatingText}>{rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.driverVehicle}>{vehicle}</Text>
      </View>
      <View style={styles.driverActions}>
        <TouchableOpacity style={styles.driverCallButton} onPress={onCall}>
          <Phone size={18} color="#2D5016" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.driverChatButton} onPress={onChat}>
          <MessageCircle size={18} color="#1976D2" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function OrderTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId?: string }>();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [trackingError, setTrackingError] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const live = useLiveLocation();

  const orderId = params?.orderId || '';

  const orderQuery = trpc.orders.getDetailedOrder.useQuery(
    { order_id: orderId },
    { enabled: !!orderId, refetchInterval: autoRefreshEnabled ? 30000 : false }
  );

  const order = orderQuery.data?.order;

  useEffect(() => {
    if (order?.estimated_delivery) {
      const deliveryTime = new Date(order.estimated_delivery);
      const now = new Date();
      const diffMinutes = Math.ceil(
        (deliveryTime.getTime() - now.getTime()) / (1000 * 60)
      );

      if (diffMinutes > 60) {
        const hours = Math.ceil(diffMinutes / 60);
        setEstimatedTime(`${hours} hour${hours > 1 ? 's' : ''}`);
      } else {
        setEstimatedTime(`${diffMinutes} minutes`);
      }
    }
  }, [order]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTrackingError('');
    try {
      console.log('🔄 Refreshing order tracking...');

      if (order?.status === 'out_for_delivery') {
        if (!live.isTracking) {
          await live.start();
        }
      }

      await orderQuery.refetch();
      setLastUpdate(new Date());
      console.log('✅ Tracking refreshed successfully');

      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error: any) {
      console.error('❌ Tracking refresh failed:', error);
      setTrackingError(error?.message || 'Failed to refresh tracking');
      setRefreshing(false);
    }
  }, [order, live, orderQuery]);

  const handleCallDriver = useCallback(async () => {
    const driverPhone = order?.delivery?.driver?.phone || '+254711000000';
    try {
      await Linking.openURL(`tel:${driverPhone}`);
    } catch (error) {
      console.error('Error opening phone:', error);
    }
  }, [order]);

  const handleChatDriver = useCallback(() => {
    router.push('/(tabs)/chat');
  }, [router]);

  const handleViewOnMap = useCallback(() => {
    const latitude = live.coords?.latitude || -1.2921;
    const longitude = live.coords?.longitude || 36.8219;

    const url = Platform.select({
      ios: `maps:${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}`,
      web: `https://maps.google.com/?q=${latitude},${longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch((error) => {
        console.error('Error opening maps:', error);
      });
    }
  }, [live.coords]);

  const handleShareTracking = useCallback(() => {
    Alert.alert(
      'Share Tracking',
      `Share order tracking link for order #${orderId}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: () => console.log('Sharing tracking link'),
        },
      ]
    );
  }, [orderId]);

  const handleDownloadInvoice = useCallback(() => {
    Alert.alert('Download Invoice', 'Invoice download will start shortly');
  }, []);

  const handleReportIssue = useCallback(() => {
    Alert.alert(
      'Report Issue',
      'What issue would you like to report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delayed Delivery', onPress: () => console.log('Report: Delayed') },
        { text: 'Wrong Items', onPress: () => console.log('Report: Wrong items') },
        { text: 'Damaged Items', onPress: () => console.log('Report: Damaged') },
        { text: 'Other', onPress: () => console.log('Report: Other') },
      ]
    );
  }, []);

  if (orderQuery.isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Package size={64} color="#2D5016" />
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Track Order</Text>
            <View style={styles.headerActions} />
          </View>

          <View style={styles.errorContainer}>
            <AlertTriangle size={64} color="#EF4444" />
            <Text style={styles.errorText}>Order not found</Text>
            <TouchableOpacity
              style={styles.backToOrdersButton}
              onPress={() => router.push('/(tabs)/orders')}
            >
              <Text style={styles.backToOrdersText}>Back to Orders</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const trackingSteps = [
    {
      icon: <CheckCircle2 size={20} color="#10B981" />,
      title: 'Order Placed',
      description: 'Your order has been confirmed and payment received',
      time: new Date(order.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isCompleted: true,
      isActive: false,
    },
    {
      icon: <Package size={20} color={order.status === 'packed' ? '#F59E0B' : '#10B981'} />,
      title: 'Being Prepared',
      description: 'Vendor is preparing your items for delivery',
      time: order.status === 'packed' ? 'In progress' : undefined,
      isCompleted: ['packed', 'out_for_delivery', 'delivered'].includes(order.status),
      isActive: order.status === 'packed',
    },
    {
      icon: (
        <Truck
          size={20}
          color={
            order.status === 'out_for_delivery'
              ? '#F59E0B'
              : order.status === 'delivered'
              ? '#10B981'
              : '#9CA3AF'
          }
        />
      ),
      title: 'Out for Delivery',
      description: 'Your order is on the way to your delivery address',
      time: order.status === 'out_for_delivery' ? 'In progress' : undefined,
      isCompleted: order.status === 'delivered',
      isActive: order.status === 'out_for_delivery',
    },
    {
      icon: <MapPin size={20} color={order.status === 'delivered' ? '#10B981' : '#9CA3AF'} />,
      title: 'Delivered',
      description: 'Order delivered successfully to your address',
      time: order.status === 'delivered' ? 'Completed' : undefined,
      isCompleted: order.status === 'delivered',
      isActive: false,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Order</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShareTracking} style={styles.headerAction}>
              <Share2 size={20} color="#2D5016" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRefresh} style={styles.headerAction}>
              <RefreshCw size={20} color="#2D5016" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.orderId}>#{order.order_number}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {order.status.replace('_', ' ').charAt(0).toUpperCase() +
                    order.status.replace('_', ' ').slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>{formatPrice(order.payment.total)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>{order.items.length} items</Text>
              </View>
              {estimatedTime && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Estimated Delivery</Text>
                  <Text style={styles.summaryValue}>{estimatedTime}</Text>
                </View>
              )}
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction} onPress={handleDownloadInvoice}>
                <Download size={16} color="#2D5016" />
                <Text style={styles.quickActionText}>Invoice</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => router.push({ pathname: '/order-qr', params: { orderId: order.id } })}
              >
                <QrCode size={16} color="#2D5016" />
                <Text style={styles.quickActionText}>QR Code</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={handleReportIssue}>
                <Info size={16} color="#2D5016" />
                <Text style={styles.quickActionText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>

          {order.status === 'out_for_delivery' && (
            <View style={styles.liveTrackingCard}>
              <View style={styles.liveTrackingHeader}>
                <Navigation size={24} color="#2D5016" />
                <Text style={styles.liveTrackingTitle}>Live Tracking</Text>
                <View style={styles.liveTrackingActions}>
                  {live.isTracking && (
                    <View style={styles.liveIndicator}>
                      <View style={styles.livePulse} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                    style={styles.autoRefreshToggle}
                  >
                    <Text
                      style={[
                        styles.autoRefreshText,
                        autoRefreshEnabled && styles.autoRefreshTextActive,
                      ]}
                    >
                      {autoRefreshEnabled ? 'Auto ✓' : 'Manual'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.lastUpdateText}>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </Text>
              <Text style={styles.liveTrackingText}>
                {live.coords
                  ? `Driver at ${live.coords.latitude.toFixed(4)}, ${live.coords.longitude.toFixed(
                      4
                    )} • ±${Math.round(live.coords.accuracy ?? 0)}m`
                  : 'Awaiting GPS...'}
              </Text>
              <Text style={styles.liveTrackingText}>
                Arrival in approximately {estimatedTime || '—'}
              </Text>
              {trackingError && (
                <View style={styles.trackingErrorCard}>
                  <AlertTriangle size={16} color="#EF4444" />
                  <Text style={styles.trackingErrorText}>{trackingError}</Text>
                </View>
              )}
              <View style={{ height: 8 }} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {!live.isTracking ? (
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={async () => {
                      try {
                        await live.start();
                        setTrackingError('');
                      } catch (e: any) {
                        setTrackingError(e?.message || 'Failed to start tracking');
                      }
                    }}
                  >
                    <MapPin size={18} color="white" />
                    <Text style={styles.mapButtonText}>Enable GPS</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.mapButton} onPress={live.stop}>
                    <MapPin size={18} color="white" />
                    <Text style={styles.mapButtonText}>Disable GPS</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.mapButton, { backgroundColor: '#059669', flex: 1 }]}
                  onPress={handleViewOnMap}
                >
                  <MapPin size={18} color="white" />
                  <Text style={styles.mapButtonText}>View on Map</Text>
                </TouchableOpacity>
              </View>
              {live.error && (
                <Text style={{ color: '#B91C1C', marginTop: 8, fontSize: 12 }}>{live.error}</Text>
              )}
            </View>
          )}

          {(order.status === 'out_for_delivery' || order.status === 'delivered') &&
            order.delivery?.driver && (
              <DriverCard
                name={order.delivery.driver.name}
                phone={order.delivery.driver.phone}
                rating={order.delivery.driver.rating}
                vehicle={order.delivery.driver.vehicle}
                onCall={handleCallDriver}
                onChat={handleChatDriver}
              />
            )}

          <View style={styles.trackingCard}>
            <Text style={styles.trackingTitle}>Order Progress</Text>
            <View style={styles.trackingSteps}>
              {trackingSteps.map((step, index) => (
                <TrackingStep
                  key={index}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  time={step.time}
                  isCompleted={step.isCompleted}
                  isActive={step.isActive}
                  isLast={index === trackingSteps.length - 1}
                />
              ))}
            </View>
          </View>

          <View style={styles.addressCard}>
            <Text style={styles.addressTitle}>Delivery Address</Text>
            <View style={styles.addressContent}>
              <MapPin size={20} color="#2D5016" />
              <View style={styles.addressDetails}>
                <Text style={styles.addressText}>{order.delivery.address.street}</Text>
                <Text style={styles.addressCity}>{order.delivery.address.city}</Text>
                <Text style={styles.addressCity}>{order.delivery.address.county}</Text>
              </View>
            </View>
          </View>

          <View style={styles.supportCard}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <View style={styles.supportActions}>
              <TouchableOpacity style={styles.supportButton} onPress={handleReportIssue}>
                <AlertTriangle size={18} color="#EF4444" />
                <Text style={styles.supportButtonText}>Report Issue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportButton}
                onPress={() => router.push('/(tabs)/chat')}
              >
                <MessageCircle size={18} color="#1976D2" />
                <Text style={styles.supportButtonText}>Live Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {order.status === 'out_for_delivery' && (
          <View style={[styles.actionButtons, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleViewOnMap}>
              <MapPin size={20} color="white" />
              <Text style={styles.primaryButtonText}>Track on Map</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleCallDriver}>
              <Phone size={20} color="#2D5016" />
              <Text style={styles.secondaryButtonText}>Call Driver</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: '#FFFFFF',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerAction: { padding: 4 },
  content: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: { fontSize: 18, color: '#6B7280', marginTop: 16, marginBottom: 20 },
  backToOrdersButton: {
    backgroundColor: '#2D5016',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToOrdersText: { color: 'white', fontSize: 16, fontWeight: '600' },
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderId: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  orderDate: { fontSize: 13, color: '#6B7280' },
  statusBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  statusText: { fontSize: 12, fontWeight: '600', color: '#2D5016' },
  summaryDetails: { gap: 12, marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  quickActionText: { fontSize: 12, fontWeight: '600', color: '#2D5016' },
  liveTrackingCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  liveTrackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  liveTrackingTitle: { fontSize: 18, fontWeight: '700', color: '#2D5016', flex: 1, marginLeft: 8 },
  liveTrackingActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  autoRefreshToggle: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  autoRefreshText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  autoRefreshTextActive: { color: '#10B981' },
  lastUpdateText: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  liveTrackingText: { fontSize: 14, color: '#166534', lineHeight: 20, marginBottom: 8 },
  mapButton: {
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  mapButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText: { fontSize: 10, fontWeight: '700', color: '#DC2626' },
  trackingErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    gap: 6,
  },
  trackingErrorText: { fontSize: 12, color: '#DC2626', flex: 1 },
  driverCard: {
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
  driverHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2D5016',
  },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  driverRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  driverRatingText: { fontSize: 14, fontWeight: '600', color: '#F59E0B' },
  driverVehicle: { fontSize: 12, color: '#6B7280' },
  driverActions: { flexDirection: 'row', gap: 8 },
  driverCallButton: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  driverChatButton: {
    backgroundColor: '#EBF8FF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  trackingCard: {
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
  trackingTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 20 },
  trackingSteps: { gap: 0 },
  trackingStep: { flexDirection: 'row', alignItems: 'flex-start' },
  stepLeft: { alignItems: 'center', marginRight: 16 },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconCompleted: { backgroundColor: '#ECFDF5' },
  stepIconActive: { backgroundColor: '#FEF3C7' },
  stepLine: { width: 2, height: 32, backgroundColor: '#E5E7EB', marginTop: 8 },
  stepLineCompleted: { backgroundColor: '#10B981' },
  stepLineActive: { backgroundColor: '#F59E0B' },
  stepContent: { flex: 1, paddingBottom: 24 },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#9CA3AF' },
  stepTitleCompleted: { color: '#10B981' },
  stepTitleActive: { color: '#F59E0B' },
  stepTime: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  stepDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  stepDescriptionActive: { color: '#4B5563' },
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
  addressTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  addressContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  addressDetails: { flex: 1 },
  addressText: { fontSize: 14, color: '#4B5563', marginBottom: 2 },
  addressCity: { fontSize: 14, color: '#4B5563', marginBottom: 2 },
  supportCard: {
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
  supportTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  supportActions: { flexDirection: 'row', gap: 12 },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  supportButtonText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  actionButtons: { paddingHorizontal: 20, paddingTop: 12, gap: 12, backgroundColor: '#FFFFFF' },
  primaryButton: {
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
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
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
  secondaryButtonText: { color: '#2D5016', fontSize: 16, fontWeight: '600' },
});
