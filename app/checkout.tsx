import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Smartphone,
  Wallet,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  ChevronRight,
  AlertCircle,
  Shield,
  Zap,
  Plus,
  X,
  Navigation,
} from 'lucide-react-native';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { initiateMpesaStk, createCardCheckoutSession, validateAndFormatMpesaPhone } from '@/services/payments';
import { useRouter } from 'expo-router';
import { useStorage } from '@/providers/storage-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart, type PaymentMethod } from '@/providers/cart-provider';
import { useAddresses, type UnifiedAddress } from '@/providers/address-provider';
import { useAuth } from '@/providers/auth-provider';
import { useDelivery, type DeliveryQuote } from '@/providers/delivery-provider';
import { useLoyalty } from '@/providers/loyalty-provider';
import { useTrust } from '@/providers/trust-provider';
import { trpc } from '@/lib/trpc';
import { calculateDistance } from '@/utils/geo-distance';
import { useLocation } from '@/providers/location-provider';

function formatPrice(amount: number) {
  try {
    return `KSh ${amount.toLocaleString('en-KE')}`;
  } catch (e) {
    return `KSh ${amount}`;
  }
}

const PaymentMethodIcon = ({ type }: { type: PaymentMethod['type'] }) => {
  switch (type) {
    case 'agripay':
      return <Wallet size={20} color="#10B981" />;
    case 'mpesa':
      return <Smartphone size={20} color="#10B981" />;
    case 'card':
      return <CreditCard size={20} color="#10B981" />;
    case 'cod':
      return <Truck size={20} color="#F59E0B" />;
    default:
      return <CreditCard size={20} color="#6B7280" />;
  }
};

const TransportIcon = ({ type }: { type: 'boda' | 'van' | 'truck' | 'tractor' | 'pickup' }) => {
  switch (type) {
    case 'boda':
      return <Zap size={16} color="#10B981" />;
    case 'van':
      return <Truck size={16} color="#10B981" />;
    case 'truck':
      return <Package size={16} color="#10B981" />;
    case 'tractor':
      return <Package size={16} color="#10B981" />;
    case 'pickup':
      return <Truck size={16} color="#10B981" />;
    default:
      return <Truck size={16} color="#6B7280" />;
  }
};

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { 
    cartItems, 
    cartSummary, 
    paymentMethods, 
    createOrder,
    agriPayBalance,
    depositAgriPay,
    updateAgriPayBalance,
    groupedBySeller,
  } = useCart();
  
  const agripayWalletQuery = trpc.agripay.getWallet.useQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user?.id, refetchOnMount: true, refetchOnWindowFocus: true }
  );
  const fundWalletMutation = trpc.agripay.fundWallet.useMutation();
  const processAgriPayPaymentMutation = trpc.checkout.processAgriPayPayment.useMutation();
  const { addresses } = useAddresses();
  const {
    getDeliveryQuotes,
    calculateOrderWeight,
    createDeliveryOrder
  } = useDelivery();
  const storage = useStorage();
  const loyalty = useLoyalty();
  const trust = useTrust();
  const awardPointsMutation = trpc.loyalty.awardPoints.useMutation();
  const multiSellerCheckoutMutation = trpc.checkout.multiSellerCheckoutReal.useMutation();
  const checkoutOrderMutation = trpc.checkout.checkoutOrder.useMutation();
  
  useEffect(() => {
    if (agripayWalletQuery.data?.wallet) {
      const balance = Number(agripayWalletQuery.data.wallet.balance ?? 0);
      updateAgriPayBalance(balance);
    }
  }, [agripayWalletQuery.data, updateAgriPayBalance]);
  
  const [selectedAddress, setSelectedAddress] = useState<UnifiedAddress | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [mpesaNumber, setMpesaNumber] = useState<string>(user?.phone ?? '+254700000000');
  const [selectedDeliveryQuote, setSelectedDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [sellerDeliveryQuotes, setSellerDeliveryQuotes] = useState<Map<string, DeliveryQuote>>(new Map());
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>('');
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string>('');
  const [selectedSlotData, setSelectedSlotData] = useState<{ id: string; label: string; start: string; end: string } | null>(null);
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [topUpMethod, setTopUpMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showProviderModal, setShowProviderModal] = useState<boolean>(false);
  const [selectedSellerForProvider, setSelectedSellerForProvider] = useState<string | null>(null);
  const [isTopUpProcessing, setIsTopUpProcessing] = useState<boolean>(false);
  const [showCartPreview, setShowCartPreview] = useState<boolean>(false);
  const [showDeliveryTimeModal, setShowDeliveryTimeModal] = useState<boolean>(false);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState<boolean>(false);
  const [realTimeDeliveryFees, setRealTimeDeliveryFees] = useState<Map<string, number>>(new Map());
  const [realTimeETAs, setRealTimeETAs] = useState<Map<string, string>>(new Map());
  const [showMpesaConfirmModal, setShowMpesaConfirmModal] = useState<boolean>(false);
  const [showAirtelConfirmModal, setShowAirtelConfirmModal] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [airtelNumber, setAirtelNumber] = useState<string>(user?.phone ?? '+254700000000');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');

  const { userLocation, subscribeToLocationChanges, getCurrentLocation } = useLocation();
  
  const buyerCoords = selectedAddress?.coordinates || userLocation?.coordinates;
  const hasValidCoordinates = Boolean(buyerCoords && buyerCoords.lat && buyerCoords.lng);
  
  const multiSellerRoutesQuery = trpc.delivery.getMultiSellerRoutes.useQuery(
    {
      buyerAddress: buyerCoords || { lat: -1.2921, lng: 36.8219 },
      sellers: groupedBySeller.map(group => ({
        sellerId: group.sellerId,
        sellerName: group.sellerName,
        coordinates: cartItems.find(item => item.sellerId === group.sellerId)?.product.coordinates || { lat: -1.2921, lng: 36.8219 },
        orderValue: group.subtotal,
      })),
      vehicleType: 'van',
    },
    {
      enabled: Boolean(hasValidCoordinates && cartSummary.isSplitOrder && groupedBySeller.length > 0),
      refetchOnWindowFocus: false,
    }
  );

  const totalWeight = useMemo(() => {
    return calculateOrderWeight(cartItems);
  }, [cartItems, calculateOrderWeight]);

  const availablePaymentMethods = useMemo(() => {
    return paymentMethods.filter(method => {
      if (method.type === 'cod') {
        const canUseCOD = trust.codAllowed && trust.activeCodOrders < trust.codLimit;
        return canUseCOD;
      }
      return true;
    });
  }, [paymentMethods, trust.codAllowed, trust.activeCodOrders, trust.codLimit]);

  const deliveryQuotes = useMemo(() => {
    if (!selectedAddress || cartItems.length === 0) return [];
    
    const originCoords = cartItems[0]?.product.coordinates;
    const destCoords = selectedAddress.coordinates || userLocation?.coordinates;
    
    if (!originCoords || !destCoords) {
      console.log('[Checkout] Missing coordinates for delivery calculation');
      return [];
    }
    
    const distance = calculateDistance(destCoords, originCoords);
    console.log('[Checkout] Calculated distance:', distance, 'km');
    
    const deliveryArea = selectedAddress.city;
    const baseQuotes = getDeliveryQuotes(
      cartSummary.subtotal,
      totalWeight,
      distance,
      deliveryArea,
      'ZONE_1'
    );
    
    const quotes = baseQuotes.map(q => {
      const currentHour = new Date().getHours();
      const isRushHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);
      const isNightTime = currentHour >= 22 || currentHour <= 5;
      const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
      
      const baseSpeedMap = { boda: 35, van: 40, truck: 35, tractor: 25, pickup: 40 } as const;
      let speedMultiplier = 1.0;
      
      if (isRushHour) {
        speedMultiplier = 0.6;
      } else if (isNightTime) {
        speedMultiplier = 1.3;
      } else if (isWeekend) {
        speedMultiplier = 1.1;
      }
      
      const speed = (baseSpeedMap[q.provider.type] ?? 40) * speedMultiplier;
      const travelTimeHours = distance / speed;
      const etaMinutes = Math.ceil(travelTimeHours * 60);
      
      let estimatedTime = '';
      if (etaMinutes < 60) {
        estimatedTime = `${etaMinutes} mins`;
      } else if (etaMinutes < 120) {
        const hours = Math.floor(etaMinutes / 60);
        const mins = etaMinutes % 60;
        estimatedTime = mins > 0 ? `${hours}h ${mins}m` : `${hours} hour`;
      } else {
        const hours = Math.ceil(etaMinutes / 60);
        estimatedTime = `${hours} hours`;
      }
      
      const baseFee = 100;
      const perKmRate = 15;
      let calculatedFee = baseFee;
      
      if (distance <= 5) {
        calculatedFee = baseFee;
      } else if (distance <= 20) {
        calculatedFee = baseFee + (distance - 5) * perKmRate;
      } else if (distance <= 50) {
        calculatedFee = baseFee + (15 * perKmRate) + (distance - 20) * 12;
      } else {
        calculatedFee = baseFee + (15 * perKmRate) + (30 * 12) + (distance - 50) * 10;
      }
      
      const vehicleMultipliers = { boda: 1.0, van: 1.3, truck: 1.8, pickup: 1.4, tractor: 2.0 };
      const vehicleMultiplier = vehicleMultipliers[q.provider.type] || 1.0;
      const totalFee = Math.round(calculatedFee * vehicleMultiplier);
      
      console.log(`[Checkout] ${q.provider.name} (${q.provider.type}): Distance=${distance}km, Fee=${totalFee}, ETA=${estimatedTime}`);
      
      return { ...q, totalFee, estimatedTime, distance };
    });
    
    return quotes.filter(q => q.provider.type !== 'tractor');
  }, [selectedAddress, cartItems, cartSummary.subtotal, totalWeight, getDeliveryQuotes, userLocation]);

  const totalDeliveryFee = useMemo(() => {
    if (cartSummary.isSplitOrder && sellerDeliveryQuotes.size > 0) {
      const total = Array.from(sellerDeliveryQuotes.values()).reduce((sum, quote) => sum + (quote.totalFee || 0), 0);
      console.log('[Checkout] Multi-seller delivery fee:', total, 'from', sellerDeliveryQuotes.size, 'sellers');
      return total;
    }
    const fee = selectedDeliveryQuote?.totalFee || 0;
    console.log('[Checkout] Single seller delivery fee:', fee);
    return fee;
  }, [cartSummary.isSplitOrder, sellerDeliveryQuotes, selectedDeliveryQuote]);

  useEffect(() => {
    const loadSlot = async () => {
      try {
        const slot = await storage.getItem('delivery:selectedSlot');
        const slotDataStr = await storage.getItem('delivery:selectedSlotData');
        if (slot) setSelectedSlotLabel(slot);
        if (slotDataStr) {
          const slotData = JSON.parse(slotDataStr);
          setSelectedSlotData(slotData);
        }
      } catch (e) {
        console.log('[Checkout] load slot error', e);
      }
    };
    loadSlot();
  }, [storage]);

  useEffect(() => {
    let isActive = true;
    const loadLastAddress = async () => {
      try {
        const lastAddressId = await storage.getItem('checkout:lastAddressId');
        if (!isActive) return;
        if (lastAddressId && addresses.length > 0) {
          const lastAddress = addresses.find(addr => addr.id === lastAddressId);
          if (lastAddress) {
            setSelectedAddress(lastAddress);
            showToast('✅ Delivery address loaded');
            return;
          }
        }
        if (addresses.length > 0) {
          const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
          setSelectedAddress(defaultAddress);
          showToast('📍 Default address selected');
        }
      } catch (e) {
        console.log('[Checkout] Failed to load last address', e);
        if (!isActive) return;
        if (addresses.length > 0) {
          const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
          setSelectedAddress(defaultAddress);
        }
      }
    };
    loadLastAddress();
    return () => {
      isActive = false;
    };
  }, [addresses, storage]);

  useEffect(() => {
    if (!selectedPaymentMethod && availablePaymentMethods.length > 0) {
      const defaultMethod = availablePaymentMethods.find(method => method.isDefault) || availablePaymentMethods[0];
      setSelectedPaymentMethod(defaultMethod);
    }
  }, [availablePaymentMethods, selectedPaymentMethod]);

  useEffect(() => {
    if (!selectedDeliveryQuote && deliveryQuotes.length > 0) {
      setSelectedDeliveryQuote(deliveryQuotes[0]);
    }
  }, [deliveryQuotes, selectedDeliveryQuote]);

  useEffect(() => {
    if (cartSummary.isSplitOrder && groupedBySeller.length > 0 && deliveryQuotes.length > 0 && selectedAddress) {
      const newQuotes = new Map<string, DeliveryQuote>();
      let hasChanges = false;
      
      console.log('[Checkout] 🔄 Recalculating multi-seller delivery fees for', groupedBySeller.length, 'sellers');
      
      groupedBySeller.forEach((group, index) => {
        const existingQuote = sellerDeliveryQuotes.get(group.sellerId);
        const shouldRecalculate = !existingQuote || existingQuote.totalFee === 0;
        
        if (existingQuote && existingQuote.totalFee > 0 && !shouldRecalculate) {
          newQuotes.set(group.sellerId, existingQuote);
          console.log(`[Checkout] ♻️ Reusing existing quote for ${group.sellerName}: ${existingQuote.totalFee} KES`);
        } else {
          const sellerProduct = cartItems.find(item => item.sellerId === group.sellerId);
          const sellerCoords = sellerProduct?.product.coordinates;
          const buyerCoords = selectedAddress.coordinates || userLocation?.coordinates;
          
          if (!sellerCoords?.lat || !sellerCoords?.lng || !buyerCoords?.lat || !buyerCoords?.lng) {
            console.warn(`[Checkout] ⚠️ Missing coordinates for ${group.sellerName}. Seller:`, sellerCoords, 'Buyer:', buyerCoords);
          }
          
          const defaultCoordinates = { lat: -1.2921, lng: 36.8219 };
          const finalSellerCoords = (sellerCoords?.lat && sellerCoords?.lng) ? sellerCoords : defaultCoordinates;
          const finalBuyerCoords = (buyerCoords?.lat && buyerCoords?.lng) ? buyerCoords : defaultCoordinates;
          
          console.log(`[Checkout] Calculating delivery for ${group.sellerName}:`, {
            sellerCoords: finalSellerCoords,
            buyerCoords: finalBuyerCoords,
            hasSellerCoords: !!sellerCoords,
            hasBuyerCoords: !!buyerCoords,
          });
          
          const distance = calculateDistance(finalBuyerCoords, finalSellerCoords);
          
          if (distance === 0 || isNaN(distance)) {
            console.warn(`[Checkout] Invalid distance (${distance}) for ${group.sellerName}, using fallback 5km`);
            const fallbackDistance = 5;
            const baseFee = 100;
            const defaultQuote = deliveryQuotes[index % deliveryQuotes.length] || deliveryQuotes[0];
            const vehicleMultipliers = { boda: 1.0, van: 1.3, truck: 1.8, pickup: 1.4, tractor: 2.0 };
            const vehicleMultiplier = vehicleMultipliers[defaultQuote.provider.type] || 1.0;
            const fallbackFee = Math.round(baseFee * vehicleMultiplier);
            
            newQuotes.set(group.sellerId, { 
              ...defaultQuote, 
              totalFee: fallbackFee,
              estimatedTime: '30-45 mins'
            });
            hasChanges = true;
            console.log(`[Checkout] Applied fallback fee: ${fallbackFee} KES`);
          } else {
            const baseFee = 100;
            const perKmRate = 15;
            let calculatedFee = baseFee;
            
            if (distance <= 5) {
              calculatedFee = baseFee;
            } else if (distance <= 20) {
              calculatedFee = baseFee + (distance - 5) * perKmRate;
            } else if (distance <= 50) {
              calculatedFee = baseFee + (15 * perKmRate) + (distance - 20) * 12;
            } else {
              calculatedFee = baseFee + (15 * perKmRate) + (30 * 12) + (distance - 50) * 10;
            }
            
            const defaultQuote = deliveryQuotes[index % deliveryQuotes.length] || deliveryQuotes[0];
            const vehicleMultipliers = { boda: 1.0, van: 1.3, truck: 1.8, pickup: 1.4, tractor: 2.0 };
            const vehicleMultiplier = vehicleMultipliers[defaultQuote.provider.type] || 1.0;
            const totalFee = Math.round(calculatedFee * vehicleMultiplier);
            
            const currentHour = new Date().getHours();
            const isRushHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);
            const isNightTime = currentHour >= 22 || currentHour <= 5;
            const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
            
            const baseSpeedMap = { boda: 35, van: 40, truck: 35, tractor: 25, pickup: 40 } as const;
            let speedMultiplier = 1.0;
            
            if (isRushHour) {
              speedMultiplier = 0.6;
            } else if (isNightTime) {
              speedMultiplier = 1.3;
            } else if (isWeekend) {
              speedMultiplier = 1.1;
            }
            
            const speed = (baseSpeedMap[defaultQuote.provider.type] ?? 40) * speedMultiplier;
            const travelTimeHours = distance / speed;
            const etaMinutes = Math.ceil(travelTimeHours * 60);
            
            let estimatedTime = '';
            if (etaMinutes < 60) {
              estimatedTime = `${etaMinutes} mins`;
            } else if (etaMinutes < 120) {
              const hours = Math.floor(etaMinutes / 60);
              const mins = etaMinutes % 60;
              estimatedTime = mins > 0 ? `${hours}h ${mins}m` : `${hours} hour`;
            } else {
              const hours = Math.ceil(etaMinutes / 60);
              estimatedTime = `${hours} hours`;
            }
            
            const quoteWithFee = {
              ...defaultQuote,
              totalFee,
              estimatedTime,
            };
            
            newQuotes.set(group.sellerId, quoteWithFee);
            hasChanges = true;
            console.log(`[Checkout] ✅ Calculated delivery for ${group.sellerName}: Distance=${distance}km, Fee=${totalFee}, ETA=${estimatedTime}`);
          }
        }
      });
      
      if (hasChanges || newQuotes.size !== sellerDeliveryQuotes.size) {
        const totalFee = Array.from(newQuotes.values()).reduce((sum, q) => sum + q.totalFee, 0);
        console.log('[Checkout] 📦 Updating seller delivery quotes. Total sellers:', newQuotes.size);
        console.log('[Checkout] 💰 Total delivery fee:', totalFee, 'KES');
        setSellerDeliveryQuotes(newQuotes);
        
        if (totalFee > 0) {
          showToast(`✅ Delivery fees calculated: ${totalFee} KES`);
        }
      } else {
        console.log('[Checkout] ✓ No changes needed for seller delivery quotes');
      }
    }
  }, [cartSummary.isSplitOrder, groupedBySeller, deliveryQuotes, selectedAddress, cartItems, userLocation, sellerDeliveryQuotes]);

  useEffect(() => {
    const unsubscribe = subscribeToLocationChanges((newLocation) => {
      console.log('[Checkout] Location changed, recalculating delivery fees');
      if (cartSummary.isSplitOrder) {
        setSellerDeliveryQuotes(new Map());
      }
      setSelectedDeliveryQuote(null);
    });
    
    return () => {
      unsubscribe();
    };
  }, [subscribeToLocationChanges, cartSummary.isSplitOrder]);

  const finalTotal = cartSummary.subtotal + totalDeliveryFee;

  const hasInsufficientFunds = useMemo(() => {
    return selectedPaymentMethod?.type === 'agripay' && agriPayBalance < finalTotal;
  }, [selectedPaymentMethod, agriPayBalance, finalTotal]);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message, [{ text: 'OK' }]);
    }
  };

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress) {
      Alert.alert('Missing Information', 'Please select a delivery address.');
      return;
    }
    
    const buyerCoords = selectedAddress.coordinates || userLocation?.coordinates;
    if (!buyerCoords || !buyerCoords.lat || !buyerCoords.lng) {
      Alert.alert(
        '📍 Location Required',
        'We need your delivery location to calculate accurate delivery fees. Please enable location services or select an address with coordinates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable Location', onPress: async () => {
            try {
              const location = await getCurrentLocation();
              if (location) {
                Alert.alert('Success', 'Location enabled. Please try placing your order again.');
              }
            } catch (error) {
              console.error('Failed to get location:', error);
              Alert.alert('Error', 'Failed to get location. Please try again.');
            }
          }}
        ]
      );
      return;
    }
    
    if (!selectedPaymentMethod) {
      Alert.alert('Missing Information', 'Please select a payment method.');
      return;
    }

    if (cartSummary.isSplitOrder) {
      if (sellerDeliveryQuotes.size !== groupedBySeller.length) {
        Alert.alert('Missing Transport', `Please select delivery provider for all ${groupedBySeller.length} sellers.`);
        return;
      }
    } else {
      if (!selectedDeliveryQuote) {
        Alert.alert('Missing Transport', 'Please select a delivery provider.');
        return;
      }
    }



    if (selectedPaymentMethod.type === 'agripay' && agriPayBalance < finalTotal) {
      const shortfall = finalTotal - agriPayBalance;
      Alert.alert(
        '💰 Insufficient Wallet Balance',
        `Your wallet balance is KSh ${agriPayBalance.toLocaleString()}. You need KSh ${shortfall.toLocaleString()} more to complete this order.`,
        [
          { text: 'Cancel', style: 'cancel' as const },
          { 
            text: 'Top Up Now', 
            onPress: () => {
              setTopUpAmount(shortfall.toFixed(0));
              setShowTopUpModal(true);
            },
            style: 'default' as const
          }
        ]
      );
      return;
    }

    if (selectedAddress) {
      await storage.setItem('checkout:lastAddressId', selectedAddress.id);
    }
    
    if (selectedPaymentMethod.type === 'mpesa') {
      const validation = validateAndFormatMpesaPhone(mpesaNumber);
      if (!validation.isValid) {
        Alert.alert('Invalid Phone Number', validation.message || 'Please enter a valid M-Pesa number');
        return;
      }
      setMpesaNumber(validation.formatted!);
      setShowMpesaConfirmModal(true);
      return;
    }

    if (selectedPaymentMethod.type === 'card') {
      setShowCardModal(true);
      return;
    }

    setShowPaymentModal(true);
  }, [selectedAddress, selectedPaymentMethod, selectedDeliveryQuote, agriPayBalance, finalTotal, cartSummary.isSplitOrder, groupedBySeller, sellerDeliveryQuotes, selectedSlotLabel, mpesaNumber, storage]);

  const confirmPayment = useCallback(async () => {
    setShowPaymentModal(false);
    setShowMpesaConfirmModal(false);
    setShowAirtelConfirmModal(false);
    setShowCardModal(false);
    setIsProcessing(true);
    showToast('🔄 Processing your order...');

    try {
      if (cartSummary.isSplitOrder) {
        const sellerGroups = groupedBySeller.map(group => {
          const quote = sellerDeliveryQuotes.get(group.sellerId);
          if (!quote) throw new Error(`Missing delivery quote for seller ${group.sellerName}`);
          
          return {
            sellerId: group.sellerId,
            sellerName: group.sellerName,
            sellerLocation: group.sellerLocation,
            items: group.items.map(item => ({
              productId: item.product.id,
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
              unit: item.product.unit,
            })),
            subtotal: group.subtotal,
            deliveryProvider: {
              providerId: quote.provider.id,
              providerName: quote.provider.name,
              vehicleType: quote.provider.type,
              estimatedTime: quote.estimatedTime,
              deliveryFee: quote.totalFee,
            },
          };
        });

        const multiSellerResult = await multiSellerCheckoutMutation.mutateAsync({
          sellerGroups: sellerGroups.map(group => ({
            sellerId: group.sellerId,
            sellerName: group.sellerName,
            items: group.items.map(item => ({
              product: {
                id: item.productId,
                name: item.productName,
                price: item.price,
              },
              quantity: item.quantity,
            })),
            subtotal: group.subtotal,
            deliveryProvider: {
              providerId: group.deliveryProvider.providerId,
              providerName: group.deliveryProvider.providerName,
              deliveryFee: group.deliveryProvider.deliveryFee,
              vehicleType: group.deliveryProvider.vehicleType,
              estimatedTime: group.deliveryProvider.estimatedTime,
            },
          })),
          deliveryAddress: {
            street: selectedAddress!.address,
            city: selectedAddress!.city,
            county: selectedAddress!.county || '',
            coordinates: {
              lat: selectedAddress!.coordinates?.lat || userLocation?.coordinates?.lat || 0,
              lng: selectedAddress!.coordinates?.lng || userLocation?.coordinates?.lng || 0,
            },
          },
          paymentMethod: selectedPaymentMethod!.type,
          totalAmount: finalTotal,
        });

        if (selectedPaymentMethod!.type === 'mpesa') {
          try {
            showToast('📱 Initiating M-Pesa payment...');
            const stk = await initiateMpesaStk({
              orderId: multiSellerResult.masterOrder.id,
              amount: finalTotal,
              phone: mpesaNumber,
              accountReference: `BANDA-${multiSellerResult.masterOrder.id}`,
              transactionDesc: `Banda Multi-Seller Order - ${groupedBySeller.length} sellers`,
            });
            
            if (stk.message) {
              showToast('✅ M-Pesa prompt sent to ' + mpesaNumber);
            }
          } catch (e: any) {
            showToast('❌ M-Pesa payment failed');
            Alert.alert('Payment Failed', e?.message || 'Failed to initiate M-Pesa payment. Please try again.');
            setIsProcessing(false);
            return;
          }
        }

        loyalty.awardPoints('purchase', finalTotal);
        
        await awardPointsMutation.mutateAsync({
          userId: user?.id || '',
          event: 'purchase',
          amount: finalTotal,
          metadata: {
            orderId: multiSellerResult.masterOrder.id,
          },
        }).catch((err) => {
          console.error('[Checkout] Failed to award loyalty points:', err);
        });

        showToast('🎉 Order placed successfully!');
        router.push({
          pathname: '/multi-seller-order-tracking',
          params: { 
            orderId: multiSellerResult.masterOrder.id,
            userId: user?.id || 'user-123',
          },
        });
        return;
      }

      if (!selectedDeliveryQuote) {
        Alert.alert('Missing Transport', 'Please select a delivery provider.');
        return;
      }

      const checkoutResult = await checkoutOrderMutation.mutateAsync({
        userId: user?.id || 'user-123',
        cartItems: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          productName: item.product.name,
        })),
        deliveryAddress: {
          name: selectedAddress!.name,
          address: selectedAddress!.address,
          city: selectedAddress!.city,
          phone: selectedAddress!.phone,
          coordinates: selectedAddress!.coordinates,
        },
        paymentMethod: {
          type: selectedPaymentMethod!.type,
          details: selectedPaymentMethod!.details || '',
        },
        deliveryProvider: {
          providerId: selectedDeliveryQuote!.provider.id,
          providerName: selectedDeliveryQuote!.provider.name,
          vehicleType: selectedDeliveryQuote!.provider.type,
          estimatedTime: selectedDeliveryQuote!.estimatedTime,
          deliveryFee: selectedDeliveryQuote!.totalFee,
        },
        orderSummary: {
          subtotal: cartSummary.subtotal,
          deliveryFee: selectedDeliveryQuote!.totalFee,
          discount: 0,
          total: finalTotal,
        },
        specialInstructions: deliveryInstructions,
      });
      
      const order = await createOrder(selectedAddress!, selectedPaymentMethod!);
      const quote = selectedDeliveryQuote as DeliveryQuote;
      const deliveryOrder = await createDeliveryOrder(
        checkoutResult.orderId,
        quote.provider,
        `Vendor Location - ${cartItems[0]?.product.location || 'Unknown'}`,
        selectedAddress!.address,
        quote.totalFee,
        10,
        deliveryInstructions
      );

      let stkCheckoutId: string | undefined;

      if (selectedPaymentMethod!.type === 'agripay') {
        try {
          const sellerId = groupedBySeller.length > 0 ? groupedBySeller[0].sellerId : (cartItems[0]?.sellerId || "");
          const sellerAmount = cartSummary.subtotal;
          const driverAmount = 0;
          const platformFee = 0;
          showToast('💰 Processing AgriPay payment...');
          const res = await processAgriPayPaymentMutation.mutateAsync({
            userId: user?.id || "",
            orderId: checkoutResult.orderId,
            amount: finalTotal,
            sellerId: sellerId,
            sellerAmount,
            driverAmount,
            platformFee,
          });
          if (res?.success) {
            updateAgriPayBalance(Math.max(0, (agriPayBalance ?? 0) - finalTotal));
            showToast('✅ AgriPay payment successful');
          }
        } catch (e: any) {
          showToast('❌ AgriPay payment failed');
          Alert.alert('Payment Failed', e?.message || 'Failed to process AgriPay payment');
          setIsProcessing(false);
          return;
        }
      }

      if (selectedPaymentMethod!.type === 'mpesa') {
        try {
          showToast('📱 Sending M-Pesa prompt...');
          const stk = await initiateMpesaStk({
            orderId: order.id,
            amount: finalTotal,
            phone: mpesaNumber,
            accountReference: `BANDA-${order.id}`,
            transactionDesc: `Banda Order Payment - ${cartItems.length} items`,
          });
          stkCheckoutId = stk.checkoutRequestID;
          
          if (stk.message) {
            showToast('✅ M-Pesa prompt sent to ' + mpesaNumber);
          }
        } catch (e: any) {
          showToast('❌ M-Pesa payment failed');
          Alert.alert('Payment Failed', e?.message || 'Failed to initiate M-Pesa payment. Please try again.');
          setIsProcessing(false);
          return;
        }
      }

      let cardReference: string | undefined;
      if (selectedPaymentMethod!.type === 'card') {
        showToast('💳 Opening card payment...');
        const session = await createCardCheckoutSession({ orderId: order.id, amount: finalTotal, currency: 'KES' });
        cardReference = session.reference;
        const result = await WebBrowser.openAuthSessionAsync(session.redirectUrl, undefined, { showInRecents: true });
        if (result.type === 'success') {
          depositAgriPay(finalTotal);
          showToast('✅ Card payment successful');
        } else {
          showToast('❌ Card payment cancelled');
          Alert.alert('Payment Cancelled', 'Card payment was cancelled.');
          setIsProcessing(false);
          return;
        }
      }

      loyalty.awardPoints('purchase', finalTotal);
      
      await awardPointsMutation.mutateAsync({
        userId: user?.id || '',
        event: 'purchase',
        amount: finalTotal,
        metadata: {
          orderId: order.id,
        },
      }).catch((err) => {
        console.error('[Checkout] Failed to award loyalty points:', err);
      });

      showToast('🎉 Order placed successfully!');
      router.push({
        pathname: '/payment-processing',
        params: { 
          orderId: order.id,
          paymentMethod: selectedPaymentMethod!.type,
          amount: finalTotal.toString(),
          transportProvider: selectedDeliveryQuote?.provider.name || 'Unknown',
          estimatedDelivery: selectedDeliveryQuote?.estimatedTime || 'Unknown',
          deliveryId: deliveryOrder.id,
          deliverySlot: selectedSlotLabel,
          mpesaNumber: mpesaNumber,
          stkId: stkCheckoutId,
          cardRef: cardReference,
        },
      });
    } catch (error: any) {
      console.error('❌ Order creation failed:', error);
      showToast('❌ Order failed');
      Alert.alert('Order Failed', error?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAddress, selectedPaymentMethod, selectedDeliveryQuote, agriPayBalance, finalTotal, createOrder, createDeliveryOrder, cartItems, deliveryInstructions, selectedSlotLabel, router, cartSummary.isSplitOrder, groupedBySeller, sellerDeliveryQuotes, mpesaNumber, user, multiSellerCheckoutMutation, loyalty, awardPointsMutation, depositAgriPay]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Checkout</Text>
            <Text style={styles.headerSubtitle}>{cartSummary.itemCount} items</Text>
          </View>
          <TouchableOpacity
            style={styles.cartPreviewButton}
            onPress={() => setShowCartPreview(true)}
          >
            <Package size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Address Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => setShowAddressModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.cardIcon}>
                <MapPin size={20} color="#10B981" />
              </View>
              <View style={styles.cardContent}>
                {selectedAddress ? (
                  <>
                    <Text style={styles.cardTitle}>{selectedAddress.name}</Text>
                    <Text style={styles.cardSubtext}>
                      {selectedAddress.address}
                      {selectedAddress.ward && `, ${selectedAddress.ward}`}
                      {selectedAddress.subCounty && `, ${selectedAddress.subCounty}`}
                      {selectedAddress.county && `, ${selectedAddress.county}`}
                    </Text>
                    <Text style={styles.cardPhone}>{selectedAddress.phone}</Text>
                  </>
                ) : (
                  <Text style={styles.cardPlaceholder}>Select delivery address</Text>
                )}
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>



          {/* Delivery Provider Section */}
          {!cartSummary.isSplitOrder && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Provider</Text>
              {deliveryQuotes.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.providerScroll}>
                  {deliveryQuotes.map((quote) => (
                    <TouchableOpacity
                      key={quote.provider.id}
                      style={[
                        styles.providerCard,
                        selectedDeliveryQuote?.provider.id === quote.provider.id && styles.providerCardSelected
                      ]}
                      onPress={() => setSelectedDeliveryQuote(quote)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.providerHeader}>
                        <TransportIcon type={quote.provider.type} />
                        <Text style={styles.providerName}>{quote.provider.name}</Text>
                      </View>
                      <Text style={styles.providerTime}>{quote.estimatedTime}</Text>
                      <Text style={styles.providerFee}>{formatPrice(quote.totalFee)}</Text>
                      {selectedDeliveryQuote?.provider.id === quote.provider.id && (
                        <View style={styles.providerCheck}>
                          <CheckCircle2 size={16} color="#10B981" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No delivery providers available</Text>
                </View>
              )}
            </View>
          )}

          {/* Multi-Seller Delivery */}
          {cartSummary.isSplitOrder && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Delivery Providers</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{groupedBySeller.length} sellers</Text>
                </View>
              </View>
              
              {groupedBySeller.map((sellerGroup) => {
                const hasQuote = sellerDeliveryQuotes.has(sellerGroup.sellerId);
                const quote = sellerDeliveryQuotes.get(sellerGroup.sellerId);
                
                return (
                  <View key={sellerGroup.sellerId} style={styles.sellerCard}>
                    <View style={styles.sellerHeader}>
                      <View style={styles.sellerInfo}>
                        <Text style={styles.sellerName}>{sellerGroup.sellerName}</Text>
                        <View style={styles.sellerMeta}>
                          <MapPin size={12} color="#6B7280" />
                          <Text style={styles.sellerLocation}>{sellerGroup.sellerLocation}</Text>
                        </View>
                      </View>
                      <View style={styles.sellerStats}>
                        <Text style={styles.sellerItems}>{sellerGroup.items.length} items</Text>
                        <Text style={styles.sellerTotal}>{formatPrice(sellerGroup.subtotal)}</Text>
                      </View>
                    </View>
                    
                    {hasQuote && quote ? (
                      <TouchableOpacity 
                        style={styles.providerSelected}
                        onPress={() => {
                          setSelectedSellerForProvider(sellerGroup.sellerId);
                          setShowProviderModal(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.providerLeft}>
                          <TransportIcon type={quote.provider.type} />
                          <View style={styles.providerInfo}>
                            <Text style={styles.providerNameSmall}>{quote.provider.name}</Text>
                            <Text style={styles.providerTimeSmall}>{quote.estimatedTime}</Text>
                          </View>
                        </View>
                        <View style={styles.providerRight}>
                          <Text style={styles.providerFeeSmall}>{formatPrice(quote.totalFee)}</Text>
                          <Text style={styles.providerChange}>Change</Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={styles.providerEmpty}
                        onPress={() => {
                          setSelectedSellerForProvider(sellerGroup.sellerId);
                          setShowProviderModal(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <Truck size={16} color="#10B981" />
                        <Text style={styles.providerEmptyText}>Select Delivery Provider</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({cartSummary.itemCount} items)</Text>
              <Text style={styles.summaryValue}>{formatPrice(cartSummary.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={[styles.summaryValue, totalDeliveryFee === 0 && styles.summaryValueZero]}>
                {totalDeliveryFee > 0 ? formatPrice(totalDeliveryFee) : 'Calculating...'}
              </Text>
            </View>
            {cartSummary.isSplitOrder && sellerDeliveryQuotes.size > 0 && (
              <Text style={styles.deliveryBreakdown}>
                {sellerDeliveryQuotes.size} seller{sellerDeliveryQuotes.size > 1 ? 's' : ''} • {Array.from(sellerDeliveryQuotes.values()).map(q => formatPrice(q.totalFee)).join(' + ')}
              </Text>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{formatPrice(finalTotal)}</Text>
            </View>
            
            <View style={styles.securityBadge}>
              <Shield size={14} color="#10B981" />
              <Text style={styles.securityText}>Secure checkout with escrow protection</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Bar */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.bottomBarContent}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
              onPress={handlePlaceOrder}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.placeOrderButtonText}>Place Order</Text>
                  <ChevronRight size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Cart Preview Modal */}
        <Modal
          visible={showCartPreview}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCartPreview(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cart Items ({cartSummary.itemCount})</Text>
                <TouchableOpacity onPress={() => setShowCartPreview(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {cartItems.map((item) => (
                  <View key={item.product.id} style={styles.cartPreviewItem}>
                    <Image source={{ uri: item.product.image }} style={styles.cartPreviewImage} />
                    <View style={styles.cartPreviewInfo}>
                      <Text style={styles.cartPreviewName} numberOfLines={2}>{item.product.name}</Text>
                      <Text style={styles.cartPreviewPrice}>{formatPrice(item.product.price)} × {item.quantity}</Text>
                    </View>
                    <Text style={styles.cartPreviewTotal}>{formatPrice(item.product.price * item.quantity)}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Payment Modal */}
        <Modal
          visible={showPaymentModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPaymentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm Payment</Text>
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <View style={styles.paymentSummary}>
                  <Text style={styles.paymentSummaryTitle}>Payment Summary</Text>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentSummaryLabel}>Amount to Pay:</Text>
                    <Text style={styles.paymentSummaryAmount}>{formatPrice(finalTotal)}</Text>
                  </View>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentSummaryLabel}>Payment Method:</Text>
                    <View style={styles.paymentMethodRow}>
                      <PaymentMethodIcon type={selectedPaymentMethod?.type || 'card'} />
                      <Text style={styles.paymentMethodName}>{selectedPaymentMethod?.name}</Text>
                    </View>
                  </View>
                </View>

                {selectedPaymentMethod?.type === 'mpesa' && (
                  <View style={styles.mpesaInfo}>
                    <Smartphone size={20} color="#10B981" />
                    <Text style={styles.mpesaInfoText}>
                      You will receive an M-Pesa prompt on {mpesaNumber}
                    </Text>
                  </View>
                )}

                {selectedPaymentMethod?.type === 'agripay' && (
                  <View style={styles.walletInfo}>
                    <Wallet size={20} color="#10B981" />
                    <View style={styles.walletInfoContent}>
                      <Text style={styles.walletInfoText}>Current Balance: {formatPrice(agriPayBalance)}</Text>
                      <Text style={styles.walletInfoText}>After Payment: {formatPrice(agriPayBalance - finalTotal)}</Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.confirmPaymentButton}
                  onPress={confirmPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmPaymentButtonText}>Confirm & Pay {formatPrice(finalTotal)}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Address Modal */}
        <Modal
          visible={showAddressModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddressModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Delivery Address</Text>
                <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.currentLocationButton}
                  onPress={async () => {
                    try {
                      const location = await getCurrentLocation();
                      if (location && location.coordinates) {
                        const currentLocationAddress: UnifiedAddress = {
                          id: 'current-location',
                          name: 'My Current Location',
                          address: location.address || 'Current GPS Location',
                          city: location.label || 'Current Location',
                          phone: user?.phone || '',
                          isDefault: false,
                          coordinates: location.coordinates,
                          country: 'Kenya',
                          createdAt: Date.now(),
                          updatedAt: Date.now(),
                        };
                        setSelectedAddress(currentLocationAddress);
                        await storage.setItem('checkout:lastAddressId', currentLocationAddress.id);
                        setShowAddressModal(false);
                        showToast('📍 Using current GPS location');
                        setSellerDeliveryQuotes(new Map());
                        setSelectedDeliveryQuote(null);
                      }
                    } catch (error) {
                      console.error('[Checkout] Failed to get current location:', error);
                      Alert.alert('Location Error', 'Failed to get your current location. Please try again.');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.currentLocationIcon}>
                    <Navigation size={20} color="#10B981" />
                  </View>
                  <View style={styles.currentLocationContent}>
                    <Text style={styles.currentLocationTitle}>Use My Current Location</Text>
                    <Text style={styles.currentLocationSubtitle}>Get GPS location from device</Text>
                  </View>
                  <ChevronRight size={20} color="#10B981" />
                </TouchableOpacity>

                <View style={styles.addressDivider}>
                  <View style={styles.addressDividerLine} />
                  <Text style={styles.addressDividerText}>SAVED ADDRESSES</Text>
                  <View style={styles.addressDividerLine} />
                </View>

                {addresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={[
                      styles.addressCard,
                      selectedAddress?.id === address.id && styles.addressCardSelected
                    ]}
                    onPress={async () => {
                      setSelectedAddress(address);
                      await storage.setItem('checkout:lastAddressId', address.id);
                      setShowAddressModal(false);
                      showToast('📍 Delivery address updated');
                      setSellerDeliveryQuotes(new Map());
                      setSelectedDeliveryQuote(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.addressCardLeft}>
                      <MapPin size={20} color={selectedAddress?.id === address.id ? '#10B981' : '#6B7280'} />
                      <View style={styles.addressCardInfo}>
                        <View style={styles.addressCardTitleRow}>
                          <Text style={styles.addressCardName}>{address.name}</Text>
                          {address.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Default</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressCardText}>{address.address}</Text>
                        <Text style={styles.addressCardText}>
                          {address.ward && `${address.ward}, `}
                          {address.subCounty && `${address.subCounty}, `}
                          {address.county || address.city}
                        </Text>
                      </View>
                    </View>
                    {selectedAddress?.id === address.id && (
                      <CheckCircle2 size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addNewButton}
                  onPress={() => {
                    setShowAddressModal(false);
                    router.push('/address');
                  }}
                >
                  <Plus size={20} color="#10B981" />
                  <Text style={styles.addNewText}>Add New Address</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Provider Modal */}
        <Modal
          visible={showProviderModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowProviderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Delivery Provider</Text>
                <TouchableOpacity onPress={() => setShowProviderModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {deliveryQuotes.map((quote) => (
                  <TouchableOpacity
                    key={quote.provider.id}
                    style={styles.providerModalCard}
                    onPress={() => {
                      if (selectedSellerForProvider) {
                        const newQuotes = new Map(sellerDeliveryQuotes);
                        newQuotes.set(selectedSellerForProvider, quote);
                        setSellerDeliveryQuotes(newQuotes);
                        setShowProviderModal(false);
                        setSelectedSellerForProvider(null);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.providerModalLeft}>
                      <TransportIcon type={quote.provider.type} />
                      <View style={styles.providerModalInfo}>
                        <Text style={styles.providerModalName}>{quote.provider.name}</Text>
                        <Text style={styles.providerModalTime}>{quote.estimatedTime}</Text>
                        <Text style={styles.providerModalDesc}>{quote.provider.description}</Text>
                      </View>
                    </View>
                    <Text style={styles.providerModalFee}>{formatPrice(quote.totalFee)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* M-Pesa Confirmation Modal */}
        <Modal
          visible={showMpesaConfirmModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowMpesaConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📱 Confirm M-Pesa Number</Text>
                <TouchableOpacity onPress={() => setShowMpesaConfirmModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <View style={styles.confirmSection}>
                  <Text style={styles.confirmLabel}>M-Pesa Number</Text>
                  <TextInput
                    style={styles.confirmInput}
                    value={mpesaNumber}
                    onChangeText={setMpesaNumber}
                    keyboardType="phone-pad"
                    placeholder="+254700000000"
                  />
                  <Text style={styles.confirmHint}>
                    You will receive an M-Pesa prompt on this number
                  </Text>
                </View>

                <View style={styles.confirmSummary}>
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmRowLabel}>Amount to Pay:</Text>
                    <Text style={styles.confirmRowValue}>{formatPrice(finalTotal)}</Text>
                  </View>
                </View>

                <View style={styles.confirmButtons}>
                  <TouchableOpacity
                    style={styles.confirmCancelButton}
                    onPress={() => setShowMpesaConfirmModal(false)}
                  >
                    <Text style={styles.confirmCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmProceedButton}
                    onPress={() => {
                      setShowMpesaConfirmModal(false);
                      setShowPaymentModal(true);
                    }}
                  >
                    <Text style={styles.confirmProceedText}>Confirm & Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Card Payment Modal */}
        <Modal
          visible={showCardModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCardModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>💳 Card Payment</Text>
                <TouchableOpacity onPress={() => setShowCardModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.cardFormSection}>
                  <Text style={styles.cardFormLabel}>Card Number</Text>
                  <TextInput
                    style={styles.cardFormInput}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="numeric"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </View>

                <View style={styles.cardFormRow}>
                  <View style={styles.cardFormHalf}>
                    <Text style={styles.cardFormLabel}>Expiry Date</Text>
                    <TextInput
                      style={styles.cardFormInput}
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      placeholder="MM/YY"
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.cardFormHalf}>
                    <Text style={styles.cardFormLabel}>CVV</Text>
                    <TextInput
                      style={styles.cardFormInput}
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      placeholder="123"
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.cardFormSection}>
                  <Text style={styles.cardFormLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.cardFormInput}
                    value={cardName}
                    onChangeText={setCardName}
                    placeholder="JOHN DOE"
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.confirmSummary}>
                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmRowLabel}>Amount to Pay:</Text>
                    <Text style={styles.confirmRowValue}>{formatPrice(finalTotal)}</Text>
                  </View>
                </View>

                <View style={styles.cardSecurityNote}>
                  <Shield size={16} color="#10B981" />
                  <Text style={styles.cardSecurityText}>
                    Your card details are encrypted and secure
                  </Text>
                </View>

                <View style={styles.confirmButtons}>
                  <TouchableOpacity
                    style={styles.confirmCancelButton}
                    onPress={() => setShowCardModal(false)}
                  >
                    <Text style={styles.confirmCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmProceedButton}
                    onPress={() => {
                      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
                        showToast('❌ Please fill all card details');
                        return;
                      }
                      setShowCardModal(false);
                      setShowPaymentModal(true);
                    }}
                  >
                    <Text style={styles.confirmProceedText}>Pay {formatPrice(finalTotal)}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Top Up Modal */}
        <Modal
          visible={showTopUpModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTopUpModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>💰 Top Up Wallet</Text>
                <TouchableOpacity onPress={() => setShowTopUpModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <View style={styles.topUpInfo}>
                  <View style={styles.topUpRow}>
                    <Text style={styles.topUpLabel}>Current Balance:</Text>
                    <Text style={styles.topUpValue}>{formatPrice(agriPayBalance)}</Text>
                  </View>
                  <View style={styles.topUpRow}>
                    <Text style={styles.topUpLabel}>Order Total:</Text>
                    <Text style={styles.topUpValue}>{formatPrice(finalTotal)}</Text>
                  </View>
                  <View style={[styles.topUpRow, styles.topUpRowHighlight]}>
                    <Text style={styles.topUpLabelHighlight}>Amount Needed:</Text>
                    <Text style={styles.topUpValueHighlight}>{formatPrice(Math.max(0, finalTotal - agriPayBalance))}</Text>
                  </View>
                </View>

                <View style={styles.topUpAmountSection}>
                  <Text style={styles.topUpAmountLabel}>Top-up Amount</Text>
                  <TextInput
                    style={styles.topUpInput}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={topUpAmount}
                    onChangeText={setTopUpAmount}
                  />
                </View>

                <View style={styles.topUpMethodSection}>
                  <Text style={styles.topUpMethodLabel}>Payment Method</Text>
                  <View style={styles.topUpMethodButtons}>
                    <TouchableOpacity
                      style={[styles.topUpMethodButton, topUpMethod === 'mpesa' && styles.topUpMethodButtonActive]}
                      onPress={() => setTopUpMethod('mpesa')}
                    >
                      <Smartphone size={20} color={topUpMethod === 'mpesa' ? '#10B981' : '#6B7280'} />
                      <Text style={[styles.topUpMethodText, topUpMethod === 'mpesa' && styles.topUpMethodTextActive]}>M-Pesa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.topUpMethodButton, topUpMethod === 'card' && styles.topUpMethodButtonActive]}
                      onPress={() => setTopUpMethod('card')}
                    >
                      <CreditCard size={20} color={topUpMethod === 'card' ? '#10B981' : '#6B7280'} />
                      <Text style={[styles.topUpMethodText, topUpMethod === 'card' && styles.topUpMethodTextActive]}>Card</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.topUpButton, (isTopUpProcessing || !topUpAmount || parseFloat(topUpAmount) <= 0) && styles.topUpButtonDisabled]}
                  disabled={isTopUpProcessing || !topUpAmount || parseFloat(topUpAmount) <= 0}
                  onPress={async () => {
                    const amount = parseFloat(topUpAmount);
                    if (isNaN(amount) || amount <= 0) {
                      Alert.alert('❌ Invalid Amount', 'Please enter a valid amount');
                      return;
                    }

                    setIsTopUpProcessing(true);
                    try {
                      if (topUpMethod === 'mpesa') {
                        await initiateMpesaStk({
                          orderId: `TOPUP-${Date.now()}`,
                          amount: amount,
                          phone: mpesaNumber,
                          accountReference: `WALLET-TOPUP`,
                          transactionDesc: `AgriPay Wallet Top-up`,
                        });
                        Alert.alert('✅ Payment Initiated', 'Please complete the M-Pesa payment on your phone');
                        setTimeout(async () => {
                          try {
                            const walletId = agripayWalletQuery.data?.wallet?.id;
                            if (!walletId) throw new Error('Wallet not found');
                            const result = await fundWalletMutation.mutateAsync({
                              walletId,
                              amount,
                              paymentMethod: { type: 'mpesa', details: { phone: mpesaNumber } },
                              externalProvider: 'mpesa',
                            });
                            updateAgriPayBalance(result?.newBalance ?? (agriPayBalance + amount));
                            setShowTopUpModal(false);
                            setTopUpAmount('');
                            Alert.alert('🎉 Success', `Your wallet has been topped up with ${formatPrice(amount)}`);
                            agripayWalletQuery.refetch();
                          } catch (err: any) {
                            Alert.alert('Top-up Error', err?.message || 'Failed to record top-up');
                          }
                        }, 1500);
                      } else if (topUpMethod === 'card') {
                        const session = await createCardCheckoutSession({ 
                          orderId: `TOPUP-${Date.now()}`, 
                          amount: amount, 
                          currency: 'KES' 
                        });
                        const result = await WebBrowser.openAuthSessionAsync(session.redirectUrl, undefined, { showInRecents: true });
                        if (result.type === 'success') {
                          try {
                            const walletId = agripayWalletQuery.data?.wallet?.id;
                            if (!walletId) throw new Error('Wallet not found');
                            const fund = await fundWalletMutation.mutateAsync({
                              walletId,
                              amount,
                              paymentMethod: { type: 'card', details: { ref: session.reference } },
                              externalProvider: 'card',
                              externalTransactionId: session.reference,
                            });
                            updateAgriPayBalance(fund?.newBalance ?? (agriPayBalance + amount));
                            setShowTopUpModal(false);
                            setTopUpAmount('');
                            Alert.alert('🎉 Success', `Your wallet has been topped up with ${formatPrice(amount)}`);
                            agripayWalletQuery.refetch();
                          } catch (err: any) {
                            Alert.alert('Top-up Error', err?.message || 'Failed to record top-up');
                          }
                        } else {
                          Alert.alert('❌ Cancelled', 'Card payment was cancelled');
                        }
                      }
                    } catch (error: any) {
                      Alert.alert('❌ Top-up Failed', error?.message || 'Failed to process payment');
                    } finally {
                      setIsTopUpProcessing(false);
                    }
                  }}
                >
                  <Text style={styles.topUpButtonText}>
                    {isTopUpProcessing ? 'Processing...' : `Top Up ${topUpAmount ? formatPrice(parseFloat(topUpAmount)) : ''}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delivery Time Modal */}
        <Modal
          visible={showDeliveryTimeModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDeliveryTimeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Delivery Time</Text>
                <TouchableOpacity onPress={() => setShowDeliveryTimeModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <TouchableOpacity
                  style={styles.deliveryTimeButton}
                  onPress={() => {
                    setShowDeliveryTimeModal(false);
                    router.push('/delivery-scheduling' as any);
                  }}
                >
                  <Clock size={20} color="#10B981" />
                  <Text style={styles.deliveryTimeButtonText}>Choose Delivery Time Slot</Text>
                  <ChevronRight size={20} color="#10B981" />
                </TouchableOpacity>
                <Text style={styles.deliveryTimeNote}>
                  Select a convenient 2-hour delivery window
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cartPreviewButton: {
    padding: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700' as const,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardError: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardPhone: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  cardPlaceholder: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500' as const,
  },
  providerScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  providerCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  providerCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  providerName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  providerTime: {
    fontSize: 11,
    color: '#10B981',
    marginBottom: 4,
  },
  providerFee: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#2D5016',
  },
  providerCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  sellerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#2D5016',
    marginBottom: 4,
  },
  sellerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerLocation: {
    fontSize: 11,
    color: '#6B7280',
  },
  sellerStats: {
    alignItems: 'flex-end',
  },
  sellerItems: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  sellerTotal: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#2D5016',
  },
  providerSelected: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerInfo: {
    marginLeft: 8,
  },
  providerNameSmall: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  providerTimeSmall: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500' as const,
  },
  providerRight: {
    alignItems: 'flex-end',
  },
  providerFeeSmall: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#2D5016',
    marginBottom: 4,
  },
  providerChange: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600' as const,
  },
  providerEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    borderStyle: 'dashed' as const,
  },
  providerEmptyText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600' as const,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  securityText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500' as const,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  placeOrderButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  modalBody: {
    padding: 16,
  },
  cartPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cartPreviewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  cartPreviewInfo: {
    flex: 1,
  },
  cartPreviewName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  cartPreviewPrice: {
    fontSize: 12,
    color: '#6B7280',
  },
  cartPreviewTotal: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#2D5016',
  },
  paymentSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentSummaryTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentSummaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  paymentSummaryAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentMethodName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  mpesaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  mpesaInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#059669',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  walletInfoContent: {
    flex: 1,
  },
  walletInfoText: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 4,
  },
  confirmPaymentButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmPaymentButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  addressCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  addressCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  addressCardInfo: {
    flex: 1,
  },
  addressCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressCardName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  addressCardText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    borderStyle: 'dashed' as const,
  },
  addNewText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  providerModalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  providerModalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerModalInfo: {
    marginLeft: 12,
    flex: 1,
  },
  providerModalName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  providerModalTime: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  providerModalDesc: {
    fontSize: 11,
    color: '#6B7280',
  },
  providerModalFee: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#2D5016',
  },
  topUpInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  topUpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topUpRowHighlight: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: -16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  topUpLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  topUpValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  topUpLabelHighlight: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#92400E',
  },
  topUpValueHighlight: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
  topUpAmountSection: {
    marginBottom: 16,
  },
  topUpAmountLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  topUpInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  topUpMethodSection: {
    marginBottom: 16,
  },
  topUpMethodLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  topUpMethodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  topUpMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  topUpMethodButtonActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  topUpMethodText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  topUpMethodTextActive: {
    color: '#10B981',
  },
  topUpButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  topUpButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  topUpButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  deliveryTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  deliveryTimeButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
    marginLeft: 12,
  },
  deliveryTimeNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  deliveryTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryValueZero: {
    color: '#F59E0B',
    fontStyle: 'italic' as const,
  },
  deliveryBreakdown: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginLeft: 16,
  },
  deliveryTimeCardError: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  deliveryTimeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  deliveryTimeContent: {
    flex: 1,
  },
  deliveryTimeLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  deliveryTimeDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  deliveryTimePlaceholder: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500' as const,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  currentLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentLocationContent: {
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  currentLocationSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  addressDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  addressDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  addressDividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  confirmSection: {
    marginBottom: 20,
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  confirmInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  confirmHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  confirmSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmRowLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  confirmRowValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  confirmProceedButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmProceedText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  cardFormSection: {
    marginBottom: 16,
  },
  cardFormLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  cardFormInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  cardFormRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cardFormHalf: {
    flex: 1,
  },
  cardSecurityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  cardSecurityText: {
    flex: 1,
    fontSize: 12,
    color: '#059669',
  },
});
