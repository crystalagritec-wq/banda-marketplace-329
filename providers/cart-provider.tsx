import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useStorage } from '@/providers/storage-provider';
import { Product } from '@/constants/products';
import { trpcClient } from '@/lib/trpc';

export type CartItemType = 'product' | 'service_booking' | 'equipment_rental';

export interface CartItem {
  product: Product;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
  sellerLocation?: string;
  itemType?: CartItemType;
  bookingDate?: string;
  bookingTime?: string;
  duration?: number;
  durationUnit?: 'hour' | 'day' | 'project';
  jobDetails?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  totalDays?: number;
  rentalPrice?: number;
  securityDeposit?: number;
  deliveryOption?: 'pickup' | 'delivery';
}

export interface ServiceCartItem {
  id: string;
  name: string;
  category: string;
  providerName: string;
  price: number;
  image?: string;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  durationUnit: 'hour' | 'day' | 'project';
  jobDetails: string;
  location: string;
}

export interface EquipmentRentalCartItem {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  image?: string;
  rentalStartDate: string;
  rentalEndDate: string;
  totalDays: number;
  rentalPrice: number;
  securityDeposit: number;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress?: string;
  location: string;
}



export interface PaymentMethod {
  id: string;
  type: 'agripay' | 'mpesa' | 'card' | 'cod';
  name: string;
  details?: string;
  isDefault: boolean;
}

export interface SellerGroup {
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  estimatedDelivery?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  address: any;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  estimatedDelivery?: Date;
  trackingId?: string;
  sellerGroups?: SellerGroup[];
  isSplitOrder?: boolean;
}

const CART_STORAGE_KEY = 'banda_cart';

const PAYMENT_METHODS_STORAGE_KEY = 'banda_payment_methods';
const ORDERS_STORAGE_KEY = 'banda_orders';

export const [CartProvider, useCart] = createContextHook(() => {
  const storage = useStorage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [agriPayBalance, setAgriPayBalance] = useState<number>(0);

  const loadCartData = useCallback(async () => {
    try {
      const [cartData, paymentData, orderData] = await Promise.all([
        storage.getItem(CART_STORAGE_KEY),
        storage.getItem(PAYMENT_METHODS_STORAGE_KEY),
        storage.getItem(ORDERS_STORAGE_KEY),
      ]);

      if (cartData) setCartItems(JSON.parse(cartData));
      if (paymentData) setPaymentMethods(JSON.parse(paymentData));
      if (orderData) {
        const parsedOrders = JSON.parse(orderData).map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
        }));
        setOrders(parsedOrders);
      }

      if (!paymentData) {
        const currentBalance = agriPayBalance;
        const defaultPaymentMethods: PaymentMethod[] = [
          {
            id: '1',
            type: 'agripay',
            name: 'AgriPay Wallet',
            details: `Balance: KSh ${currentBalance.toLocaleString()}`,
            isDefault: false,
          },
          {
            id: '2',
            type: 'mpesa',
            name: 'M-Pesa',
            details: 'Safaricom M-Pesa',
            isDefault: true,
          },
          {
            id: '3',
            type: 'mpesa',
            name: 'Airtel Money',
            details: 'Airtel Money',
            isDefault: false,
          },
          {
            id: '4',
            type: 'card',
            name: 'Credit/Debit Card',
            details: 'Visa, Mastercard',
            isDefault: false,
          },
          {
            id: '5',
            type: 'card',
            name: 'PayPal',
            details: 'PayPal payment',
            isDefault: false,
          },
          {
            id: '6',
            type: 'card',
            name: 'Crypto',
            details: 'Bitcoin, USDT',
            isDefault: false,
          },
          {
            id: '7',
            type: 'cod',
            name: 'Pay on Delivery',
            details: 'Cash payment with Reserve hold',
            isDefault: false,
          },
        ];
        setPaymentMethods(defaultPaymentMethods);
        await storage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(defaultPaymentMethods));
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storage, agriPayBalance]);

  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

  const saveCartItems = useCallback(async (items: CartItem[]) => {
    if (!Array.isArray(items)) return;
    try {
      await storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart items:', error);
    }
  }, [storage]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    console.log('[Cart] Adding to cart:', product.name, 'qty:', quantity);
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const sellerId = `seller-${product.vendor.toLowerCase().replace(/\s+/g, '-')}`;
        newItems = [...prev, { 
          product, 
          quantity,
          sellerId,
          sellerName: product.vendor,
          sellerLocation: product.location
        }];
      }
      
      saveCartItems(newItems);
      return newItems;
    });
  }, [saveCartItems]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => {
      const newItems = prev.filter(item => item.product.id !== productId);
      saveCartItems(newItems);
      return newItems;
    });
  }, [saveCartItems]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev => {
      const newItems = prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      saveCartItems(newItems);
      return newItems;
    });
  }, [removeFromCart, saveCartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    saveCartItems([]);
  }, [saveCartItems]);

  const addServiceToCart = useCallback((service: ServiceCartItem) => {
    console.log('[Cart] Adding service to cart:', service.name);
    const serviceProduct: Product = {
      id: `service-${service.id}-${Date.now()}`,
      name: service.name,
      price: service.price,
      category: service.category,
      vendor: service.providerName,
      location: service.location,
      coordinates: { lat: 0, lng: 0 },
      rating: 0,
      image: service.image || 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400',
      inStock: true,
      unit: service.durationUnit,
    };
    
    setCartItems(prev => {
      const newItem: CartItem = {
        product: serviceProduct,
        quantity: 1,
        sellerId: `provider-${service.providerName.toLowerCase().replace(/\s+/g, '-')}`,
        sellerName: service.providerName,
        sellerLocation: service.location,
        itemType: 'service_booking',
        bookingDate: service.bookingDate,
        bookingTime: service.bookingTime,
        duration: service.duration,
        durationUnit: service.durationUnit,
        jobDetails: service.jobDetails,
      };
      const newItems = [...prev, newItem];
      saveCartItems(newItems);
      return newItems;
    });
  }, [saveCartItems]);

  const addEquipmentRentalToCart = useCallback((equipment: EquipmentRentalCartItem) => {
    console.log('[Cart] Adding equipment rental to cart:', equipment.name);
    const totalPrice = equipment.rentalPrice + equipment.securityDeposit + (equipment.deliveryOption === 'delivery' ? 1500 : 0);
    
    const equipmentProduct: Product = {
      id: `rental-${equipment.id}-${Date.now()}`,
      name: `${equipment.name} (Rental)`,
      price: totalPrice,
      category: equipment.category,
      vendor: 'Equipment Owner',
      location: equipment.location,
      coordinates: { lat: 0, lng: 0 },
      rating: 0,
      image: equipment.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      inStock: true,
      unit: 'rental',
    };
    
    setCartItems(prev => {
      const newItem: CartItem = {
        product: equipmentProduct,
        quantity: 1,
        sellerId: `equipment-owner-${equipment.id}`,
        sellerName: 'Equipment Owner',
        sellerLocation: equipment.location,
        itemType: 'equipment_rental',
        rentalStartDate: equipment.rentalStartDate,
        rentalEndDate: equipment.rentalEndDate,
        totalDays: equipment.totalDays,
        rentalPrice: equipment.rentalPrice,
        securityDeposit: equipment.securityDeposit,
        deliveryOption: equipment.deliveryOption,
      };
      const newItems = [...prev, newItem];
      saveCartItems(newItems);
      return newItems;
    });
  }, [saveCartItems]);

  const groupedBySeller = useMemo(() => {
    const groups = new Map<string, SellerGroup>();
    
    cartItems.forEach(item => {
      const sellerId = item.sellerId || `seller-${item.product.vendor.toLowerCase().replace(/\s+/g, '-')}`;
      const sellerName = item.sellerName || item.product.vendor;
      const sellerLocation = item.sellerLocation || item.product.location;
      
      if (!groups.has(sellerId)) {
        groups.set(sellerId, {
          sellerId,
          sellerName,
          sellerLocation,
          items: [],
          subtotal: 0,
          deliveryFee: 0,
        });
      }
      
      const group = groups.get(sellerId)!;
      group.items.push(item);
      group.subtotal += item.product.price * item.quantity;
    });
    
    return Array.from(groups.values());
  }, [cartItems]);

  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const deliveryFee = groupedBySeller.reduce((sum, group) => sum + group.deliveryFee, 0);
    const discount = 0;
    const total = subtotal + deliveryFee - discount;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const sellerCount = groupedBySeller.length;
    const isSplitOrder = sellerCount > 1;

    return {
      subtotal,
      deliveryFee,
      discount,
      total,
      itemCount,
      sellerCount,
      isSplitOrder,
    };
  }, [cartItems, groupedBySeller]);

  const createOrder = useCallback(async (
    address: any,
    paymentMethod: PaymentMethod,
    promoCode?: string
  ): Promise<Order> => {
    console.log('[CartProvider] Creating order with backend');
    const summary = cartSummary;
    
    try {
      const result = await trpcClient.orders.createOrder.mutate({
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          seller_id: item.sellerId || `seller-${item.product.vendor.toLowerCase().replace(/\\s+/g, '-')}`,
        })),
        delivery_address: {
          street: address.street || address.label || '',
          city: address.city || address.county || '',
          county: address.county,
          coordinates: {
            lat: address.coordinates?.lat || address.lat || 0,
            lng: address.coordinates?.lng || address.lng || 0,
          },
        },
        payment_method: paymentMethod.type,
        subtotal: summary.subtotal,
        delivery_fee: summary.deliveryFee,
        discount: summary.discount,
        total: summary.total,
        promo_code: promoCode,
      });

      if (!result.success) {
        throw new Error('Failed to create order');
      }

      console.log('[CartProvider] Order created successfully:', result.order.tracking_id);

      const order: Order = {
        id: result.order.id,
        items: [...cartItems],
        subtotal: summary.subtotal,
        deliveryFee: summary.deliveryFee,
        discount: summary.discount,
        total: summary.total,
        address,
        paymentMethod,
        status: result.order.status as Order['status'],
        createdAt: new Date(result.order.created_at),
        estimatedDelivery: result.order.estimated_delivery ? new Date(result.order.estimated_delivery) : undefined,
        trackingId: result.order.tracking_id,
      };

      const newOrders = [order, ...orders];
      setOrders(newOrders);
      
      try {
        await storage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(newOrders));
      } catch (error) {
        console.error('[CartProvider] Error saving order to storage:', error);
      }

      clearCart();
      return order;
    } catch (error) {
      console.error('[CartProvider] Error creating order:', error);
      throw error;
    }
  }, [cartItems, cartSummary, orders, clearCart, storage]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => {
      const newOrders = prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      );
      storage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(newOrders));
      return newOrders;
    });
  }, [storage]);



  const updateAgriPayBalance = useCallback((newBalance: number) => {
    if (typeof newBalance !== 'number' || newBalance < 0) return;
    setAgriPayBalance(newBalance);
    setPaymentMethods(prev => 
      prev.map(method => 
        method.type === 'agripay' 
          ? { ...method, details: `Balance: KSh ${newBalance.toLocaleString()}` }
          : method
      )
    );
  }, []);

  const depositAgriPay = useCallback((amount: number) => {
    if (typeof amount !== 'number' || amount <= 0) return;
    setAgriPayBalance(prev => {
      const updated = prev + amount;
      setPaymentMethods(pPrev => 
        pPrev.map(method => method.type === 'agripay' 
          ? { ...method, details: `Balance: KSh ${updated.toLocaleString()}` } 
          : method)
      );
      return updated;
    });
  }, []);

  const withdrawAgriPay = useCallback((amount: number) => {
    if (typeof amount !== 'number' || amount <= 0) return;
    setAgriPayBalance(prev => {
      const updated = Math.max(0, prev - amount);
      setPaymentMethods(pPrev => 
        pPrev.map(method => method.type === 'agripay' 
          ? { ...method, details: `Balance: KSh ${updated.toLocaleString()}` } 
          : method)
      );
      return updated;
    });
  }, []);

  return useMemo(() => ({
    cartItems,
    paymentMethods,
    orders,
    isLoading,
    agriPayBalance,
    cartSummary,
    groupedBySeller,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    createOrder,
    updateOrderStatus,
    updateAgriPayBalance,
    depositAgriPay,
    withdrawAgriPay,
    addServiceToCart,
    addEquipmentRentalToCart,
  }), [
    cartItems,
    paymentMethods,
    orders,
    isLoading,
    agriPayBalance,
    cartSummary,
    groupedBySeller,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    createOrder,
    updateOrderStatus,
    updateAgriPayBalance,
    depositAgriPay,
    withdrawAgriPay,
    addServiceToCart,
    addEquipmentRentalToCart,
  ]);
});