import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store, Check, Wallet, CreditCard, Smartphone, Star } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAgriPay } from '@/providers/agripay-provider';

export default function BoostShopScreen() {
  const insets = useSafeAreaInsets();
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { wallet } = useAgriPay();
  
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'mpesa' | 'card'>('wallet');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const packagesQuery = trpc.boost.getPackages.useQuery({ type: 'shop' });
  const createBoostMutation = trpc.boost.createBoost.useMutation();

  const handleBoost = async () => {
    if (!selectedPackage || !shopId) {
      Alert.alert('Error', 'Please select a boost package');
      return;
    }

    const pkg = packagesQuery.data?.packages.find((p) => p.id === selectedPackage);
    if (!pkg) return;

    if (paymentMethod === 'wallet' && (!wallet || wallet.balance < pkg.price)) {
      Alert.alert('Insufficient Balance', 'Please fund your wallet or choose another payment method');
      return;
    }

    Alert.alert(
      'Confirm Shop Boost',
      `Boost your entire shop for ${pkg.duration} days at KSh ${pkg.price}?\n\nAll your products will be boosted!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const result = await createBoostMutation.mutateAsync({
                type: 'shop',
                targetId: shopId,
                duration: pkg.duration,
                amount: pkg.price,
                paymentMethod: {
                  type: paymentMethod,
                  details: {},
                },
              });

              if (result.success) {
                Alert.alert('Success! 🌟', result.message, [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to create boost');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (packagesQuery.isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Boost Shop' }} />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading packages...</Text>
        </View>
      </>
    );
  }

  const packages = packagesQuery.data?.packages || [];

  return (
    <>
      <Stack.Screen options={{ title: 'Boost Shop' }} />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Store size={48} color="#10B981" />
            <Text style={styles.title}>Boost Your Shop</Text>
            <Text style={styles.subtitle}>
              Become a featured seller and boost all your products
            </Text>
          </View>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Shop Boost Benefits</Text>
            <View style={styles.benefitRow}>
              <Star size={16} color="#F59E0B" />
              <Text style={styles.benefitText}>All products automatically boosted</Text>
            </View>
            <View style={styles.benefitRow}>
              <Star size={16} color="#F59E0B" />
              <Text style={styles.benefitText}>Featured seller badge</Text>
            </View>
            <View style={styles.benefitRow}>
              <Star size={16} color="#F59E0B" />
              <Text style={styles.benefitText}>Priority in search results</Text>
            </View>
            <View style={styles.benefitRow}>
              <Star size={16} color="#F59E0B" />
              <Text style={styles.benefitText}>Homepage shop carousel placement</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Package</Text>
            {packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  selectedPackage === pkg.id && styles.packageCardSelected,
                  pkg.popular && styles.packageCardPopular,
                ]}
                onPress={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>BEST VALUE</Text>
                  </View>
                )}
                <View style={styles.packageHeader}>
                  <View>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <Text style={styles.packageDuration}>{pkg.duration} days</Text>
                  </View>
                  <View style={styles.packagePriceContainer}>
                    <Text style={styles.packagePrice}>KSh {pkg.price}</Text>
                    <Text style={styles.packagePricePerDay}>
                      ~KSh {Math.round(pkg.price / pkg.duration)}/day
                    </Text>
                  </View>
                </View>
                <View style={styles.packageFeatures}>
                  {pkg.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Check size={16} color="#10B981" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                {selectedPackage === pkg.id && (
                  <View style={styles.selectedIndicator}>
                    <Check size={20} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentCard,
                paymentMethod === 'wallet' && styles.paymentCardSelected,
              ]}
              onPress={() => setPaymentMethod('wallet')}
            >
              <Wallet size={24} color={paymentMethod === 'wallet' ? '#10B981' : '#6B7280'} />
              <View style={styles.paymentContent}>
                <Text style={styles.paymentTitle}>AgriPay Wallet</Text>
                <Text style={styles.paymentSubtitle}>
                  Balance: KSh {wallet?.balance.toLocaleString() || '0'}
                </Text>
              </View>
              {paymentMethod === 'wallet' && (
                <Check size={20} color="#10B981" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentCard,
                paymentMethod === 'mpesa' && styles.paymentCardSelected,
              ]}
              onPress={() => setPaymentMethod('mpesa')}
            >
              <Smartphone size={24} color={paymentMethod === 'mpesa' ? '#10B981' : '#6B7280'} />
              <View style={styles.paymentContent}>
                <Text style={styles.paymentTitle}>M-PESA</Text>
                <Text style={styles.paymentSubtitle}>Pay via M-PESA</Text>
              </View>
              {paymentMethod === 'mpesa' && (
                <Check size={20} color="#10B981" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentCard,
                paymentMethod === 'card' && styles.paymentCardSelected,
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <CreditCard size={24} color={paymentMethod === 'card' ? '#10B981' : '#6B7280'} />
              <View style={styles.paymentContent}>
                <Text style={styles.paymentTitle}>Card Payment</Text>
                <Text style={styles.paymentSubtitle}>Visa, Mastercard</Text>
              </View>
              {paymentMethod === 'card' && (
                <Check size={20} color="#10B981" />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.boostButton,
              (!selectedPackage || isProcessing) && styles.boostButtonDisabled,
            ]}
            onPress={handleBoost}
            disabled={!selectedPackage || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Store size={20} color="white" />
                <Text style={styles.boostButtonText}>Boost Shop</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  benefitsCard: {
    margin: 24,
    padding: 20,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#92400E',
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#78350F',
    flex: 1,
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  packageCardPopular: {
    borderColor: '#F59E0B',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
  },
  packageDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  packagePriceContainer: {
    alignItems: 'flex-end',
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#10B981',
  },
  packagePricePerDay: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  packageFeatures: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  paymentCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  footer: {
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  boostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  boostButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  boostButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
  },
});
