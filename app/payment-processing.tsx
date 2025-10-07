import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle2,
  Loader2,
  Smartphone,
  CreditCard,
  Wallet,
  Truck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react-native';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/providers/cart-provider';
import { pollMpesaStatus, pollCardStatus } from '@/services/payments';

function formatPrice(amount: number, currency: string = 'KSh') {
  try {
    if (currency === 'USD') {
      return `${amount.toLocaleString('en-US')}`;
    }
    return `${currency} ${amount.toLocaleString('en-KE')}`;
  } catch (e) {
    console.log('formatPrice error', e);
    return `${currency} ${amount}`;
  }
}

const PaymentIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'agripay':
      return <Wallet size={48} color="#2D5016" />;
    case 'mpesa':
      return <Smartphone size={48} color="#10B981" />;
    case 'card':
      return <CreditCard size={48} color="#1976D2" />;
    case 'cod':
      return <Truck size={48} color="#F57C00" />;
    default:
      return <CreditCard size={48} color="#6B7280" />;
  }
};

export default function PaymentProcessingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateOrderStatus, depositAgriPay, withdrawAgriPay } = useCart();
  const params = useLocalSearchParams<{
    orderId?: string;
    paymentMethod?: 'agripay' | 'mpesa' | 'card' | 'cod';
    amount?: string;
    transportProvider?: string;
    estimatedDelivery?: string;
    mpesaNumber?: string;
    stkId?: string;
    cardRef?: string;
    lite?: string;
    // Subscription params
    type?: 'order' | 'subscription';
    planId?: string;
    currency?: string;
    description?: string;
    userId?: string;
    role?: string;
    tier?: string;
  }>();

  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [countdown, setCountdown] = useState<number>(60);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [retryAvailable, setRetryAvailable] = useState<boolean>(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const handledRef = useRef<boolean>(false);
  const maxRetries = 3;

  const orderId = params?.orderId ?? '';
  const paymentMethod = (params?.paymentMethod as 'agripay' | 'mpesa' | 'card' | 'cod') ?? 'agripay';
  const amount = parseFloat(params?.amount ?? '0');
  const transportProvider = params?.transportProvider ?? '';
  const estimatedDelivery = params?.estimatedDelivery ?? '';
  const stkId = (params?.stkId as string | undefined) ?? undefined;
  const cardRef = (params?.cardRef as string | undefined) ?? undefined;
  const isLite = (params?.lite ?? 'false') === 'true';
  
  // Subscription params
  const paymentType = params?.type ?? 'order';
  const planId = params?.planId ?? '';
  const currency = params?.currency ?? 'KSh';
  const description = params?.description ?? '';
  const userId = params?.userId ?? '';
  const role = params?.role ?? '';
  const tier = params?.tier ?? '';

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    if (paymentStatus === 'processing') spinAnimation.start();
    else spinAnimation.stop();
    return () => spinAnimation.stop();
  }, [paymentStatus, spinValue]);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateStyle = useMemo(() => ({ transform: [{ rotate: spin }] as const }), [spin]);

  useEffect(() => {
    if (paymentStatus !== 'processing') return;

    let poller: ReturnType<typeof setInterval> | undefined;
    let fallbackTimer: ReturnType<typeof setInterval> | undefined;

    const onSuccess = () => {
      if (handledRef.current) return;
      handledRef.current = true;
      setPaymentStatus('success');
      try {
        if (paymentType === 'order' && orderId) {
          if (paymentMethod === 'agripay') {
            withdrawAgriPay(amount);
          } else if (paymentMethod === 'mpesa' || paymentMethod === 'card') {
            depositAgriPay(amount);
          }
          updateOrderStatus(orderId, 'confirmed');
        } else if (paymentType === 'subscription') {
          // Handle subscription success
          console.log('✅ Subscription payment successful:', { planId, userId, role, tier });
        }
      } catch (e) {
        console.log('post-success update error', e);
      }
    };

    const onFailed = () => {
      if (handledRef.current) return;
      handledRef.current = true;
      setPaymentStatus('failed');
      setRetryAvailable(retryCount < maxRetries);
      console.log(`❌ Payment failed. Retry available: ${retryCount < maxRetries}`);
    };

    const startFallbackCountdown = () => {
      fallbackTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (paymentMethod === 'mpesa' || paymentMethod === 'card') {
              onFailed();
            } else {
              const simulated = Math.random() > 0.1;
              if (simulated) onSuccess(); else onFailed();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const startPolling = () => {
      if (paymentMethod === 'mpesa' && stkId) {
        startFallbackCountdown();
        poller = setInterval(async () => {
          try {
            const res = await pollMpesaStatus(stkId);
            console.log('mpesa poll', res);
            if (res.status === 'success') onSuccess();
            else if (res.status === 'failed') onFailed();
          } catch (e) {
            console.log('mpesa poll error', e);
          }
        }, 3000);
      } else if (paymentMethod === 'card' && cardRef) {
        startFallbackCountdown();
        poller = setInterval(async () => {
          try {
            const res = await pollCardStatus(cardRef);
            console.log('card poll', res);
            if (res.status === 'success') onSuccess();
            else if (res.status === 'failed') onFailed();
          } catch (e) {
            console.log('card poll error', e);
          }
        }, 3000);
      } else if (paymentMethod === 'agripay') {
        setTimeout(() => onSuccess(), 1500);
      } else if (paymentMethod === 'cod') {
        setTimeout(() => onSuccess(), 1000);
      } else {
        startFallbackCountdown();
      }
    };

    startPolling();

    return () => {
      if (poller) clearInterval(poller);
      if (fallbackTimer) clearInterval(fallbackTimer);
    };
  }, [paymentStatus, orderId, paymentMethod, amount, updateOrderStatus, depositAgriPay, withdrawAgriPay, stkId, cardRef]);

  const handleContinue = useCallback(() => {
    if (paymentStatus === 'success') {
      if (paymentType === 'subscription') {
        router.push({ 
          pathname: '/subscription-success' as any, 
          params: { planId, role, tier, amount: amount.toString() } 
        });
      } else {
        router.push({ pathname: '/order-success' as any, params: { orderId } });
      }
    } else {
      if (paymentType === 'subscription') {
        router.push('/role-selection');
      } else {
        router.push('/(tabs)/cart');
      }
    }
  }, [paymentStatus, paymentType, orderId, planId, role, tier, amount, router]);

  const handleRetry = useCallback(() => {
    if (retryCount >= maxRetries) {
      Alert.alert(
        'Maximum Retries Reached',
        'You have reached the maximum number of retry attempts. Please contact support or try a different payment method.',
        [
          { text: 'Contact Support', onPress: () => router.push('/customer-care') },
          { text: 'Change Payment', onPress: () => router.push('/checkout') },
        ]
      );
      return;
    }

    console.log(`🔄 Retrying payment (attempt ${retryCount + 1}/${maxRetries})`);
    handledRef.current = false;
    setPaymentStatus('processing');
    setCountdown(30);
    setRetryCount(prev => prev + 1);
    setRetryAvailable(false);
  }, [retryCount, maxRetries, router]);

  const getPaymentMethodName = (type: string) => {
    switch (type) {
      case 'agripay':
        return 'AgriPay Wallet';
      case 'mpesa':
        return 'M-Pesa';
      case 'card':
        return 'Credit/Debit Card';
      case 'cod':
        return 'Pay on Delivery';
      default:
        return 'Payment Method';
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        if (paymentType === 'subscription') {
          return 'Processing your subscription payment...';
        }
        if (paymentMethod === 'mpesa') {
          return 'Check your phone for M-Pesa STK push notification';
        } else if (paymentMethod === 'card') {
          return 'Processing your card payment securely';
        } else if (paymentMethod === 'agripay') {
          return 'Deducting amount from your AgriPay wallet';
        }
        return 'Processing your payment';
      case 'success':
        if (paymentType === 'subscription') {
          return 'Subscription activated successfully!';
        }
        return 'Payment completed successfully!';
      case 'failed':
        if (paymentType === 'subscription') {
          return 'Subscription payment failed. Please try again.';
        }
        return 'Payment failed. Please try again.';
      default:
        return '';
    }
  };

  if (isLite) {
    return (
      <View style={[stylesLite.container, { paddingTop: insets.top }]} testID="payment-status-lite">
        <View style={stylesLite.row}>
          {paymentStatus === 'processing' && (
            <Animated.View style={[stylesLite.spinner, rotateStyle]}>
              <Loader2 size={28} color="#F57C00" />
            </Animated.View>
          )}
          {paymentStatus === 'success' && <CheckCircle2 size={28} color="#10B981" />}
          {paymentStatus === 'failed' && <AlertCircle size={28} color="#DC2626" />}
          <Text style={stylesLite.text} numberOfLines={2}>
            {getStatusMessage()} {paymentStatus === 'processing' ? `(${countdown}s)` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={handleContinue} style={stylesLite.link} testID="payment-lite-continue">
          <Text style={stylesLite.linkText}>{paymentStatus === 'success' ? 'Continue' : 'Back'}</Text>
          <ArrowRight size={16} color="#1976D2" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="payment-processing-screen">
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {paymentStatus === 'processing' && (
              <Animated.View style={[styles.spinner, rotateStyle]} testID="payment-spinner">
                <Loader2 size={80} color="#F57C00" />
              </Animated.View>
            )}
            {paymentStatus === 'success' && (
              <View style={styles.successIcon}>
                <CheckCircle2 size={80} color="#10B981" />
              </View>
            )}
            {paymentStatus === 'failed' && (
              <View style={styles.failedIcon}>
                <AlertCircle size={80} color="#DC2626" />
              </View>
            )}
          </View>

          <Text style={styles.statusTitle}>
            {paymentStatus === 'processing' && (paymentType === 'subscription' ? 'Processing Subscription' : 'Processing Payment')}
            {paymentStatus === 'success' && (paymentType === 'subscription' ? 'Subscription Active' : 'Payment Successful')}
            {paymentStatus === 'failed' && (paymentType === 'subscription' ? 'Subscription Failed' : 'Payment Failed')}
          </Text>

          <Text style={styles.statusMessage}>{getStatusMessage()}</Text>

          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <PaymentIcon type={paymentMethod} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentMethodName}>{getPaymentMethodName(paymentMethod)}</Text>
                <Text style={styles.paymentAmount}>{formatPrice(amount, currency)}</Text>
              </View>
            </View>

            <View style={styles.orderInfo}>
              {paymentType === 'subscription' ? (
                <>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Plan ID</Text>
                    <Text style={styles.orderValue}>{planId}</Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Role</Text>
                    <Text style={styles.orderValue}>{role}</Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Tier</Text>
                    <Text style={styles.orderValue}>{tier}</Text>
                  </View>
                  {description && (
                    <View style={styles.orderRow}>
                      <Text style={styles.orderLabel}>Description</Text>
                      <Text style={styles.orderValue}>{description}</Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Order ID</Text>
                    <Text style={styles.orderValue}>{orderId}</Text>
                  </View>
                  {transportProvider ? (
                    <View style={styles.orderRow}>
                      <Text style={styles.orderLabel}>Transport</Text>
                      <Text style={styles.orderValue}>{transportProvider}</Text>
                    </View>
                  ) : null}
                  {estimatedDelivery ? (
                    <View style={styles.orderRow}>
                      <Text style={styles.orderLabel}>Delivery Time</Text>
                      <Text style={styles.orderValue}>{estimatedDelivery}</Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>
          </View>

          {paymentStatus === 'processing' && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>Please wait... {countdown}s</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(0, Math.min(100, ((60 - countdown) / 60) * 100))}%` },
                  ]}
                />
              </View>
              {countdown < 10 && (
                <Text style={styles.timeoutWarning}>Payment verification taking longer than expected...</Text>
              )}
            </View>
          )}

          {paymentStatus === 'processing' && paymentMethod === 'mpesa' && (
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>M-Pesa STK Push Sent</Text>
              <Text style={styles.instructionsText}>
                Number: {params?.mpesaNumber ?? 'your registered number'}{"\n"}
                1. Check your phone for M-Pesa prompt{"\n"}
                2. Enter M-Pesa PIN{"\n"}
                3. Wait for confirmation here
              </Text>
            </View>
          )}

          {paymentStatus === 'success' && (
            <View style={styles.reserveCard}>
              <View style={styles.reserveHeader}>
                <CheckCircle2 size={20} color="#10B981" />
                <Text style={styles.reserveTitle}>
                  {paymentType === 'subscription' ? 'Subscription Active' : 'TradeGuard Protection Active'}
                </Text>
              </View>
              <Text style={styles.reserveText}>
                {paymentType === 'subscription' 
                  ? `Your ${role} ${tier} subscription is now active. You can access all premium features immediately.`
                  : `Your payment is held safely in Reserve until delivery is confirmed. ${transportProvider ? `${transportProvider} will handle delivery. ` : ''}Funds will be released to the vendor only after you confirm receipt.`
                }
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          {paymentStatus === 'success' && (
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue} testID="payment-continue">
              <Text style={styles.continueButtonText}>
                {paymentType === 'subscription' ? 'Access Features' : 'Track Order'}
              </Text>
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          )}

          {paymentStatus === 'failed' && (
            <>
              {retryAvailable && (
                <View style={styles.retryInfo}>
                  <Text style={styles.retryInfoText}>
                    Retry attempts: {retryCount}/{maxRetries}
                  </Text>
                </View>
              )}
              {retryAvailable ? (
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry} testID="payment-retry">
                  <Text style={styles.retryButtonText}>Try Again ({maxRetries - retryCount} left)</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.contactSupportButton} onPress={() => router.push('/customer-care')} testID="contact-support">
                  <Text style={styles.contactSupportButtonText}>Contact Support</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.backButton} onPress={handleContinue} testID="payment-back">
                <Text style={styles.backButtonText}>
                  {paymentType === 'subscription' ? 'Back to Roles' : 'Back to Cart'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {paymentStatus === 'processing' && paymentMethod === 'mpesa' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                if (Platform.OS === 'web') {
                  const confirmCancel = window.confirm('Cancel M-Pesa payment?');
                  if (confirmCancel) router.push(paymentType === 'subscription' ? '/role-selection' : '/(tabs)/cart');
                  return;
                }
                Alert.alert('Cancel Payment', 'Are you sure you want to cancel this payment?', [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes', onPress: () => router.push(paymentType === 'subscription' ? '/role-selection' : '/(tabs)/cart') },
                ]);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel Payment</Text>
            </TouchableOpacity>
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  successIcon: {
    backgroundColor: '#ECFDF5',
    borderRadius: 50,
    padding: 20,
  },
  failedIcon: {
    backgroundColor: '#FEF2F2',
    borderRadius: 50,
    padding: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: 24,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D5016',
  },
  orderInfo: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
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
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F57C00',
    borderRadius: 2,
  },
  timeoutWarning: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 8,
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  reserveCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  reserveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reserveTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  reserveText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  continueButton: {
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
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: '#F57C00',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    alignSelf: 'center',
  },
  retryInfo: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  retryInfoText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  contactSupportButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  contactSupportButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

const stylesLite = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingHorizontal: 16, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  text: { fontSize: 16, color: '#374151', flex: 1, fontWeight: '600' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  linkText: { color: '#1976D2', fontSize: 14, fontWeight: '700' },
  spinner: { alignSelf: 'center' },
});