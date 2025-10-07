import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  Download,
  Star,
  Copy,
  QrCode,
  Share,
  FileText,
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/providers/cart-provider';
import { supabase } from '@/lib/supabase';
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

const OrderStatusStep = ({ 
  icon, 
  title, 
  time, 
  isActive, 
  isCompleted 
}: { 
  icon: React.ReactNode; 
  title: string; 
  time?: string; 
  isActive: boolean; 
  isCompleted: boolean; 
}) => (
  <View style={styles.statusStep}>
    <View style={[
      styles.statusIcon,
      isCompleted && styles.statusIconCompleted,
      isActive && styles.statusIconActive,
    ]}>
      <View>
        {icon}
      </View>
    </View>
    <View style={styles.statusContent}>
      <Text style={[
        styles.statusTitle,
        isCompleted && styles.statusTitleCompleted,
        isActive && styles.statusTitleActive,
      ]}>
        {title}
      </Text>
      {time ? (
        <Text style={styles.statusTime}>{time}</Text>
      ) : null}
    </View>
  </View>
);

export default function OrderSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ orderId?: string }>();
  
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  const orderId = params?.orderId || '';
  
  const releaseMutation = trpc.orders.releaseReserve.useMutation();
  const orderQuery = trpc.orders.getDetailedOrder.useQuery(
    { order_id: orderId },
    { enabled: !!orderId, refetchOnMount: true }
  );
  const order = orderQuery.data?.order;
  const handleConfirmDelivery = useCallback(async () => {
    try {
      if (!order?.id || !user?.id) {
        Alert.alert('Missing data', 'Unable to confirm delivery.');
        return;
      }
      const res = await releaseMutation.mutateAsync({ orderId: order.id, userId: user.id, releaseReason: 'Buyer confirmed delivery' });
      if (res?.success) {
        Alert.alert('Success', 'Funds released to seller. Thank you!', [
          { text: 'OK', onPress: () => router.push('/(tabs)/orders') }
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to confirm delivery');
    }
  }, [order?.id, releaseMutation, router, user?.id]);

  const reserveHeld = useMemo(() => {
    try {
      const paymentReserved = (order as any)?.payment?.status === 'reserved';
      const tradeguardHeld = (order as any)?.reserve?.status === 'held';
      const orderFlag = (order as any)?.flags?.includes?.('reserve_held');
      return Boolean(paymentReserved || tradeguardHeld || orderFlag);
    } catch {
      return false;
    }
  }, [order]);

  useEffect(() => {
    if (order?.estimated_delivery) {
      const deliveryTime = new Date(order.estimated_delivery);
      const now = new Date();
      const diffMinutes = Math.ceil((deliveryTime.getTime() - now.getTime()) / (1000 * 60));
      
      if (diffMinutes > 60) {
        const hours = Math.ceil(diffMinutes / 60);
        setEstimatedDelivery(`${hours} hour${hours > 1 ? 's' : ''}`);
      } else {
        setEstimatedDelivery(`${diffMinutes} minutes`);
      }
    }
  }, [order]);
  
  useEffect(() => {
    if (order?.qr_code?.download_url) {
      setQrCodeUrl(order.qr_code.download_url);
    }
  }, [order]);

  const handleAcceptOrder = useCallback(() => {
    console.log('Accept order (renamed from Track Order):', orderId);
    router.push('/(tabs)/orders');
  }, [orderId, router]);

  const handleTrackOrder = useCallback(() => {
    router.push({
      pathname: '/order-tracking' as any,
      params: { orderId },
    });
  }, [orderId, router]);

  const handleContactVendor = useCallback(() => {
    console.log('Contact vendor for order:', orderId);
  }, [orderId]);

  const handleCopyOrderId = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(orderId);
      } else {
        Clipboard.setString(orderId);
      }
      Alert.alert('Copied!', 'Order ID copied to clipboard');
      console.log('Order ID copied:', orderId);
    } catch (error) {
      console.error('Error copying order ID:', error);
      Alert.alert('Error', 'Failed to copy order ID');
    }
  }, [orderId]);

  const downloadReceipt = useCallback(async (format: 'jpg' | 'pdf') => {
    try {
      console.log(`Downloading receipt as ${format.toUpperCase()} for order:`, orderId);
      
      const { data, error } = await supabase
        .rpc('generate_digital_receipt', {
          order_id: orderId,
          format: format,
          include_qr: true
        });

      if (error) {
        throw error;
      }

      Alert.alert('Success', `Receipt downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      Alert.alert('Error', `Failed to download ${format.toUpperCase()} receipt`);
    }
  }, [orderId]);

  const handleDownloadReceipt = useCallback(async () => {
    try {
      console.log('Generating digital receipt for order:', orderId);
      
      // Log order details to My Orders (Supabase)
      const { error: logError } = await supabase
        .rpc('log_payment_success', {
          order_id: orderId,
          payment_details: {
            amount: order?.payment?.total,
            method: order?.payment?.method,
            timestamp: new Date().toISOString()
          }
        });

      if (logError) {
        console.error('Error logging payment:', logError);
      }

      // Generate QR code for order
      const { data: qrData, error: qrError } = await supabase
        .rpc('generate_order_qr', {
          order_id: orderId,
          order_details: {
            id: orderId,
            total: order?.payment?.total,
            items: order?.items?.length || 0,
            status: 'confirmed'
          }
        });

      if (qrError) {
        console.error('Error generating QR:', qrError);
      }

      // Notify seller and driver
      const { error: notifyError } = await supabase
        .rpc('notify_seller_driver', {
          order_id: orderId,
          seller_ids: order?.items?.map(item => item.seller?.id) || [],
          message: 'New order received - please prepare for delivery'
        });

      if (notifyError) {
        console.error('Error notifying seller/driver:', notifyError);
      }

      Alert.alert(
        'Receipt Generated',
        'Digital receipt with QR code has been generated. You can download it as JPG or PDF.',
        [
          { text: 'Download JPG', onPress: () => downloadReceipt('jpg') },
          { text: 'Download PDF', onPress: () => downloadReceipt('pdf') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error in handleDownloadReceipt:', error);
      Alert.alert('Error', 'Failed to generate receipt');
    }
  }, [orderId, order]);


  const handleGenerateQR = useCallback(async () => {
    try {
      console.log('Generating QR code for order:', orderId);
      
      const { data, error } = await supabase
        .rpc('generate_order_qr', {
          order_id: orderId,
          order_details: {
            id: orderId,
            total: order?.payment?.total,
            items: order?.items?.length || 0,
            status: 'confirmed',
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        throw error;
      }

      Alert.alert('QR Code Generated', 'Order QR code has been generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code');
    }
  }, [orderId, order]);

  if (orderQuery.isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Loading order details...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
  
  if (orderQuery.isError || !order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {orderQuery.error?.message || 'Order not found'}
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/(tabs)/marketplace')}
            >
              <Text style={styles.backButtonText}>Back to Marketplace</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} >
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Success Header */}
          <View style={styles.successHeader}>
            <View style={styles.successIcon}>
              <CheckCircle2 size={80} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Order Placed Successfully!</Text>
            <Text style={styles.successMessage}>
              Your order has been confirmed and is being prepared for delivery
            </Text>
          </View>

          {/* Order Details Card */}
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderTitle}>Order Details</Text>
              <View style={styles.orderHeaderActions}>
                <TouchableOpacity onPress={handleCopyOrderId} style={styles.headerAction} testID="copy-order-id">
                  <Copy size={18} color="#2D5016" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGenerateQR} style={styles.headerAction} testID="generate-qr">
                  <QrCode size={18} color="#2D5016" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDownloadReceipt} style={styles.headerAction} testID="download-receipt">
                  <Download size={18} color="#2D5016" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.orderInfo}>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Order ID</Text>
                <TouchableOpacity onPress={handleCopyOrderId} style={styles.orderIdContainer}>
                  <Text style={styles.orderValue}>{order.id}</Text>
                  <Copy size={14} color="#2D5016" />
                </TouchableOpacity>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Total Amount</Text>
                <Text style={styles.orderValue}>{formatPrice(order.payment?.total || 0)}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Payment Method</Text>
                <Text style={styles.orderValue}>{order.payment?.method || 'N/A'}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Estimated Delivery</Text>
                <Text style={styles.orderValue}>{estimatedDelivery}</Text>
              </View>
            </View>
          </View>

          {/* Order Status */}
          <View style={styles.statusCard}>
            <Text style={styles.statusCardTitle}>Order Status</Text>
            
            <View style={styles.statusSteps}>
              <OrderStatusStep
                icon={<CheckCircle2 size={24} color="#10B981" />}
                title="Order Confirmed"
                time="Just now"
                isActive={false}
                isCompleted={true}
              />
              
              <View style={styles.statusLine} />
              
              <OrderStatusStep
                icon={<Package size={24} color="#F57C00" />}
                title="Being Prepared"
                time="In progress"
                isActive={true}
                isCompleted={false}
              />
              
              <View style={styles.statusLine} />
              
              <OrderStatusStep
                icon={<Truck size={24} color="#9CA3AF" />}
                title="Out for Delivery"
                isActive={false}
                isCompleted={false}
              />
              
              <View style={styles.statusLine} />
              
              <OrderStatusStep
                icon={<MapPin size={24} color="#9CA3AF" />}
                title="Delivered"
                isActive={false}
                isCompleted={false}
              />
            </View>
          </View>

          {/* Delivery Address */}
          <View style={styles.addressCard}>
            <Text style={styles.addressTitle}>Delivery Address</Text>
            <View style={styles.addressContent}>
              <MapPin size={20} color="#2D5016" />
              <View style={styles.addressDetails}>
                <Text style={styles.addressName}>Delivery Address</Text>
                <Text style={styles.addressText}>{order.delivery?.address?.street || 'N/A'}</Text>
                <Text style={styles.addressCity}>{order.delivery?.address?.city || 'N/A'}</Text>
                {order.delivery?.driver?.phone && (
                  <Text style={styles.addressPhone}>{order.delivery.driver.phone}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.itemsCard}>
            <Text style={styles.itemsTitle}>Order Items ({order.items?.length || 0})</Text>
            {order.items?.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemVendor}>{item.seller?.name || 'Unknown Seller'}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.total_price)}
                  </Text>
                  <TouchableOpacity style={styles.rateButton}>
                    <Star size={16} color="#FFD700" />
                    <Text style={styles.rateButtonText}>Rate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )) || []}
          </View>

          {/* Vendor Contact */}
          <View style={styles.vendorCard}>
            <Text style={styles.vendorTitle}>Need Help?</Text>
            <Text style={styles.vendorSubtitle}>
              Contact your vendors directly for any questions about your order
            </Text>
            
            <View style={styles.vendorActions}>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactVendor}>
                <Phone size={20} color="#2D5016" />
                <Text style={styles.contactButtonText}>Call Vendor</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.chatButton} onPress={handleContactVendor}>
                <MessageCircle size={20} color="#1976D2" />
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Order QR Code */}
          <View style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <QrCode size={24} color="#2D5016" />
              <Text style={styles.qrTitle}>Order QR Code</Text>
            </View>
            <Text style={styles.qrText}>
              Show this QR code to the delivery person for verification.
            </Text>
            {qrCodeUrl ? (
              <View style={styles.qrImageContainer}>
                <Image source={{ uri: qrCodeUrl }} style={styles.qrImage} />
                <Text style={styles.qrCode}>{order.qr_code?.verification_code}</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.qrButton} onPress={handleGenerateQR} testID="view-qr">
                <QrCode size={16} color="white" />
                <Text style={styles.qrButtonText}>Generate QR Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Digital Receipt */}
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <FileText size={24} color="#1976D2" />
              <Text style={styles.receiptTitle}>Digital Receipt</Text>
            </View>
            <Text style={styles.receiptText}>
              Download your receipt with QR code in JPG or PDF format.
            </Text>
            <View style={styles.receiptActions}>
              <TouchableOpacity style={styles.receiptButton} onPress={() => downloadReceipt('jpg')} testID="download-jpg">
                <Download size={16} color="#1976D2" />
                <Text style={styles.receiptButtonText}>JPG</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.receiptButton} onPress={() => downloadReceipt('pdf')} testID="download-pdf">
                <Download size={16} color="#1976D2" />
                <Text style={styles.receiptButtonText}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* TradeGuard Protection */}
          <View style={styles.protectionCard}>
            <View style={styles.protectionHeader}>
              <CheckCircle2 size={24} color="#10B981" />
              <Text style={styles.protectionTitle}>TradeGuard Protection Active</Text>
            </View>
            <Text style={styles.protectionText}>
              Your payment is safely held in Reserve. Funds will only be released to vendors 
              after you confirm delivery. You can dispute any issues within 7 days of delivery.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {reserveHeld ? (
            <TouchableOpacity style={styles.acceptButton} onPress={handleConfirmDelivery} testID="confirm-delivery">
              <Text style={styles.acceptButtonText}>Confirm Delivery & Release</Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptOrder} testID="accept-order">
              <Text style={styles.acceptButtonText}>View My Orders</Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={() => router.push('/(tabs)/marketplace')}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    backgroundColor: '#ECFDF5',
    borderRadius: 50,
    padding: 20,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderHeaderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerAction: {
    padding: 4,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  orderInfo: {
    gap: 12,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  statusCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  statusSteps: {
    gap: 0,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusIconCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusIconActive: {
    backgroundColor: '#FEF3C7',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  statusTitleCompleted: {
    color: '#10B981',
  },
  statusTitleActive: {
    color: '#F59E0B',
  },
  statusTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 23,
    marginVertical: 4,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
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
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemPrice: {
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
  vendorCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  vendorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  vendorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  vendorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  contactButtonText: {
    fontSize: 14,
    color: '#2D5016',
    fontWeight: '600',
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EBF8FF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  chatButtonText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  protectionCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  protectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  protectionText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  acceptButton: {
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
  acceptButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  qrCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5016',
  },
  qrText: {
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
  },
  receiptText: {
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
  continueButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  continueButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2D5016',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  qrImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 12,
  },
  qrCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D5016',
    letterSpacing: 2,
  },
});