import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useStorage } from '@/providers/storage-provider';
import { Product, GeoCoordinates } from '@/constants/products';

export interface CartItem {
  product: Product;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
  sellerLocation?: string;
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
  }, [storage]);

  useEffect(() => {
    loadCartData();
  }, []);

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
    const summary = cartSummary;
    const order: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cartItems],
      subtotal: summary.subtotal,
      deliveryFee: summary.deliveryFee,
      discount: summary.discount,
      total: summary.total,
      address,
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000),
      trackingId: `TRK-${Date.now()}`,
    };

    const newOrders = [order, ...orders];
    setOrders(newOrders);
    
    try {
      await storage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(newOrders));
    } catch (error) {
      console.error('Error saving order:', error);
    }

    clearCart();
    return order;
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
  ]);
});