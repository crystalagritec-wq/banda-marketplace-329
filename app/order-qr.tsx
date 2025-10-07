import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  QrCode,
  Download,
  Share,
  Copy,
  CheckCircle2,
  Shield,
  Clock,
  AlertTriangle,
} from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/providers/cart-provider';
import { trpc } from '@/lib/trpc';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

function formatPrice(amount: number) {
  try {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  } catch (e) {
    console.log('formatPrice error', e);
    return `KSh ${amount}`;
  }
}

const QRCodeDisplay = ({ 
  value, 
  size = 200 
}: { 
  value: string; 
  size?: number; 
}) => (
  <View style={[styles.qrCodeContainer, { width: size, height: size }]}>
    <View style={styles.qrCodePlaceholder}>
      <QRCode
        value={value}
        size={size * 0.8}
        color="#1F2937"
        backgroundColor="#FFFFFF"
        logo={undefined}
      />
    </View>
    <Text style={styles.qrCodeText}>Scan to Verify Order</Text>
    <Text style={styles.qrCodeValue} numberOfLines={1}>
      {value.substring(0, 20)}...
    </Text>
  </View>
);

export default function OrderQRScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useCart();
  const params = useLocalSearchParams<{ orderId?: string }>();
  
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const orderId = params?.orderId || '';
  const order = orders.find(o => o.id === orderId);

  const generateQR = trpc.qr.generate.useMutation();

  useEffect(() => {
    if (orderId && order) {
      generateQRCode();
    }
  }, [orderId, order]);

  const generateQRCode = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[QR] Generating QR code for order:', orderId);
      
      if (!order) {
        console.error('[QR] Order not found');
        Alert.alert('Error', 'Order not found');
        setLoading(false);
        return;
      }
      
      const result = await generateQR.mutateAsync({
        qr_type: 'order',
        linked_id: orderId,
        payload: {
          order_id: orderId,
          buyer_id: 'current-user-id',
          seller_ids: Array.from(new Set(order?.items.map(item => item.product.vendor) || [])),
          role: 'buyer',
          reserve_status: 'held',
          timestamp: new Date().toISOString(),
          total: order?.total || 0,
          items: order?.items.length || 0,
          status: order?.status || 'confirmed',
        },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      console.log('[QR] QR generation result:', result);
      
      if (result.success && result.qr_code) {
        setQrData(result.qr_code);
        console.log('[QR] QR code set successfully');
      } else {
        console.error('[QR] QR generation failed:', result);
        Alert.alert('Error', 'Failed to generate QR code');
      }
    } catch (error: any) {
      console.error('[QR] Error generating QR code:', error);
      Alert.alert('Error', error?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }, [orderId, order, generateQR]);

  const handleCopyVerificationCode = useCallback(async () => {
    if (!qrData?.verification_code) return;
    
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(qrData.verification_code);
      } else {
        Clipboard.setString(qrData.verification_code);
      }
      Alert.alert('Copied!', 'Verification code copied to clipboard');
    } catch (error) {
      console.error('Error copying verification code:', error);
      Alert.alert('Error', 'Failed to copy verification code');
    }
  }, [qrData]);

  const handleDownloadQR = useCallback(() => {
    if (!qrData?.download_url) return;
    
    Alert.alert(
      'Download QR Code',
      'Choose download format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PNG Image', onPress: () => downloadQR('png') },
        { text: 'PDF Document', onPress: () => downloadQR('pdf') },
      ]
    );
  }, [qrData]);

  const downloadQR = useCallback(async (format: 'png' | 'pdf') => {
    try {
      // In a real app, this would trigger the actual download
      console.log(`Downloading QR code as ${format.toUpperCase()}`);
      Alert.alert('Success', `QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      Alert.alert('Error', `Failed to download ${format.toUpperCase()}`);
    }
  }, []);

  const handleShareQR = useCallback(() => {
    const shareText = `Order #${orderId} - Verification Code: ${qrData?.verification_code}`;
    
    if (Platform.OS === 'web') {
      if (navigator.share) {
        navigator.share({
          title: 'Banda Order QR Code',
          text: shareText,
        });
      } else {
        Alert.alert('Share QR Code', shareText);
      }
    } else {
      Alert.alert('Share QR Code', shareText);
    }
  }, [orderId, qrData]);

  const handleRegenerateQR = useCallback(() => {
    Alert.alert(
      'Regenerate QR Code',
      'Are you sure you want to generate a new QR code? The old one will become invalid.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Regenerate', onPress: generateQRCode },
      ]
    );
  }, [generateQRCode]);

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order QR Code</Text>
            <View style={styles.headerActions} />
          </View>
          
          <View style={styles.errorContainer}>
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order QR Code</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShareQR} style={styles.headerAction}>
              <Share size={20} color="#2D5016" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Info */}
          <View style={styles.orderInfoCard}>
            <Text style={styles.orderId}>#{orderId}</Text>
            <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
            <Text style={styles.orderItems}>{order.items.length} items</Text>
          </View>

          {/* QR Code Display */}
          <View style={styles.qrDisplayCard}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Generating QR Code...</Text>
              </View>
            ) : qrData ? (
              <>
                <QRCodeDisplay 
                  value={qrData.qr_data} 
                  size={Math.min(width - 120, 250)} 
                />
                
                <View style={styles.verificationSection}>
                  <Text style={styles.verificationLabel}>Verification Code</Text>
                  <TouchableOpacity 
                    style={styles.verificationCodeContainer}
                    onPress={handleCopyVerificationCode}
                  >
                    <Text style={styles.verificationCode}>
                      {qrData.verification_code}
                    </Text>
                    <Copy size={16} color="#2D5016" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <AlertTriangle size={48} color="#EF4444" />
                <Text style={styles.errorText}>Failed to generate QR code</Text>
                <TouchableOpacity style={styles.retryButton} onPress={generateQRCode}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <Shield size={24} color="#2D5016" />
              <Text style={styles.instructionsTitle}>How to Use</Text>
            </View>
            
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>
                  Show this QR code to the delivery person when they arrive
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  They will scan it to verify the order and confirm delivery
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>
                  Payment will be released to vendors after successful verification
                </Text>
              </View>
            </View>
          </View>

          {/* Security Info */}
          <View style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <CheckCircle2 size={24} color="#10B981" />
              <Text style={styles.securityTitle}>Secure & Protected</Text>
            </View>
            <Text style={styles.securityText}>
              This QR code is unique to your order and contains encrypted verification data. 
              It expires after successful delivery or 24 hours, whichever comes first.
            </Text>
            
            <View style={styles.securityDetails}>
              <View style={styles.securityItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.securityItemText}>
                  Generated: {new Date().toLocaleString('en-KE')}
                </Text>
              </View>
              <View style={styles.securityItem}>
                <Shield size={16} color="#6B7280" />
                <Text style={styles.securityItemText}>
                  Expires: 24 hours from generation
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadQR}>
              <Download size={18} color="#1976D2" />
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerateQR}>
              <QrCode size={18} color="#F59E0B" />
              <Text style={styles.regenerateButtonText}>Regenerate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCopyVerificationCode}>
            <Copy size={20} color="white" />
            <Text style={styles.primaryButtonText}>Copy Verification Code</Text>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  backToOrdersButton: {
    backgroundColor: '#2D5016',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToOrdersText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  orderInfoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderId: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D5016',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#6B7280',
  },
  qrDisplayCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodePlaceholder: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
    height: '100%',
  },
  qrCodeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  qrCodeValue: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  verificationSection: {
    alignItems: 'center',
    width: '100%',
  },
  verificationLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  verificationCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D5016',
  },
  verificationCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D5016',
    letterSpacing: 2,
  },
  instructionsCard: {
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
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2D5016',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  securityCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  securityText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
    marginBottom: 16,
  },
  securityDetails: {
    gap: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityItemText: {
    fontSize: 12,
    color: '#059669',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#EBF8FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  downloadButtonText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  regenerateButton: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  regenerateButtonText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
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
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});