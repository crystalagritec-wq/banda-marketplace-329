import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useStorage } from '@/providers/storage-provider';
import { 
  DeliveryProvider, 
  BANDA_DELIVERY_PROVIDERS, 
  DELIVERY_ZONES,
  calculateDeliveryFee,
  getRecommendedProvider 
} from '@/constants/delivery-providers';
import { Product } from '@/constants/products';

export interface DeliveryOrder {
  id: string;
  orderId: string;
  providerId: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pickupAddress: string;
  deliveryAddress: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  trackingUpdates: TrackingUpdate[];
  deliveryFee: number;
  distance: number;
  specialInstructions?: string;
}

export interface TrackingUpdate {
  id: string;
  timestamp: Date;
  status: string;
  message: string;
  location?: string;
}

export interface DeliveryQuote {
  provider: DeliveryProvider;
  baseFee: number;
  distanceFee: number;
  totalFee: number;
  isFreeDelivery: boolean;
  bandaDiscount: number;
  estimatedTime: string;
}

const DELIVERY_ORDERS_STORAGE_KEY = 'banda_delivery_orders';

export const [BandaDeliveryProvider, useDelivery] = createContextHook(() => {
  const storage = useStorage();
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadDeliveryData = useCallback(async () => {
    try {
      const deliveryData = await storage.getItem(DELIVERY_ORDERS_STORAGE_KEY);
      if (deliveryData) {
        const parsedOrders = JSON.parse(deliveryData).map((order: any) => ({
          ...order,
          estimatedDelivery: new Date(order.estimatedDelivery),
          actualDelivery: order.actualDelivery ? new Date(order.actualDelivery) : undefined,
          trackingUpdates: order.trackingUpdates.map((update: any) => ({
            ...update,
            timestamp: new Date(update.timestamp),
          })),
        }));
        setDeliveryOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Error loading delivery data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    loadDeliveryData();
  }, [loadDeliveryData]);

  const saveDeliveryOrders = useCallback(async (orders: DeliveryOrder[]) => {
    try {
      await storage.setItem(DELIVERY_ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving delivery orders:', error);
    }
  }, [storage]);

  // Get available providers based on order requirements
  const getAvailableProviders = useCallback((
    orderWeight: number,
    distance: number,
    deliveryArea: string
  ): DeliveryProvider[] => {
    return BANDA_DELIVERY_PROVIDERS.filter(provider => {
      if (!provider.available) return false;
      if (orderWeight > provider.maxWeight) return false;
      if (distance > provider.maxDistance) return false;
      if (!provider.serviceAreas.some(area => 
        area.toLowerCase().includes(deliveryArea.toLowerCase()) ||
        deliveryArea.toLowerCase().includes(area.toLowerCase())
      )) return false;
      
      return true;
    }).sort((a, b) => {
      // Sort by Banda recommendation, then rating, then cost
      if (a.bandaRecommended && !b.bandaRecommended) return -1;
      if (!a.bandaRecommended && b.bandaRecommended) return 1;
      if (a.rating !== b.rating) return b.rating - a.rating;
      return a.baseCost - b.baseCost;
    });
  }, []);

  // Calculate delivery quotes for multiple providers
  const getDeliveryQuotes = useCallback((
    orderValue: number,
    orderWeight: number,
    distance: number,
    deliveryArea: string,
    deliveryZone: keyof typeof DELIVERY_ZONES = 'ZONE_1'
  ): DeliveryQuote[] => {
    const availableProviders = getAvailableProviders(orderWeight, distance, deliveryArea);
    
    return availableProviders.map(provider => {
      const feeCalculation = calculateDeliveryFee(provider, distance, orderValue, deliveryZone);
      
      return {
        provider,
        ...feeCalculation,
        estimatedTime: provider.estimatedTime,
      };
    });
  }, [getAvailableProviders]);

  // Get AI-recommended provider
  const getAIRecommendation = useCallback((
    orderWeight: number,
    distance: number,
    productCategories: string[],
    urgency: 'standard' | 'express' | 'scheduled' = 'standard'
  ): DeliveryProvider | null => {
    return getRecommendedProvider(orderWeight, distance, productCategories, urgency);
  }, []);

  // Calculate order weight from cart items
  const calculateOrderWeight = useCallback((cartItems: { product: Product; quantity: number }[]): number => {
    return cartItems.reduce((total, item) => {
      // Estimate weight based on product type and quantity
      const estimatedWeight = item.product.unit === 'kg' ? item.quantity : 
                             item.product.unit === 'liter' ? item.quantity * 1.03 : 
                             item.product.unit === 'piece' ? item.quantity * 0.5 :
                             item.product.unit === 'bunch' ? item.quantity * 2 :
                             item.product.unit === '50kg bag' ? item.quantity * 50 :
                             item.product.unit === 'cup' ? item.quantity * 0.2 :
                             item.quantity * 1;
      return total + estimatedWeight;
    }, 0);
  }, []);

  // Create delivery order
  const createDeliveryOrder = useCallback(async (
    orderId: string,
    provider: DeliveryProvider,
    pickupAddress: string,
    deliveryAddress: string,
    deliveryFee: number,
    distance: number,
    specialInstructions?: string
  ): Promise<DeliveryOrder> => {
    const deliveryOrder: DeliveryOrder = {
      id: `DEL-${Date.now()}`,
      orderId,
      providerId: provider.id,
      driverName: provider.driverDetails.name,
      driverPhone: provider.driverDetails.phone,
      vehiclePlate: provider.vehicleDetails.licensePlate,
      status: 'assigned',
      pickupAddress,
      deliveryAddress,
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      trackingUpdates: [
        {
          id: `TU-${Date.now()}`,
          timestamp: new Date(),
          status: 'assigned',
          message: `Delivery assigned to ${provider.driverDetails.name}`,
          location: pickupAddress,
        },
      ],
      deliveryFee,
      distance,
      specialInstructions,
    };

    const newOrders = [deliveryOrder, ...deliveryOrders];
    setDeliveryOrders(newOrders);
    await saveDeliveryOrders(newOrders);

    return deliveryOrder;
  }, [deliveryOrders, saveDeliveryOrders]);

  // Update delivery status
  const updateDeliveryStatus = useCallback(async (
    deliveryId: string,
    status: DeliveryOrder['status'],
    message: string,
    location?: string
  ) => {
    const updatedOrders = deliveryOrders.map(order => {
      if (order.id === deliveryId) {
        const newUpdate: TrackingUpdate = {
          id: `TU-${Date.now()}`,
          timestamp: new Date(),
          status,
          message,
          location,
        };

        return {
          ...order,
          status,
          trackingUpdates: [...order.trackingUpdates, newUpdate],
          actualDelivery: status === 'delivered' ? new Date() : order.actualDelivery,
        };
      }
      return order;
    });

    setDeliveryOrders(updatedOrders);
    await saveDeliveryOrders(updatedOrders);
  }, [deliveryOrders, saveDeliveryOrders]);

  // Get delivery by order ID
  const getDeliveryByOrderId = useCallback((orderId: string): DeliveryOrder | null => {
    return deliveryOrders.find(delivery => delivery.orderId === orderId) || null;
  }, [deliveryOrders]);

  // Get active deliveries
  const getActiveDeliveries = useCallback((): DeliveryOrder[] => {
    return deliveryOrders.filter(delivery => 
      ['assigned', 'picked_up', 'in_transit'].includes(delivery.status)
    );
  }, [deliveryOrders]);

  // Simulate delivery progress (for demo purposes)
  const simulateDeliveryProgress = useCallback(async (deliveryId: string) => {
    const delivery = deliveryOrders.find(d => d.id === deliveryId);
    if (!delivery || delivery.status === 'delivered') return;

    const progressSteps = [
      { status: 'picked_up' as const, message: 'Order picked up from vendor', delay: 30000 },
      { status: 'in_transit' as const, message: 'On the way to delivery location', delay: 60000 },
      { status: 'delivered' as const, message: 'Order delivered successfully', delay: 90000 },
    ];

    for (const step of progressSteps) {
      const currentDelivery = deliveryOrders.find(d => d.id === deliveryId);
      if (!currentDelivery || currentDelivery.status === 'delivered') break;
      
      setTimeout(async () => {
        await updateDeliveryStatus(
          deliveryId,
          step.status,
          step.message,
          step.status === 'delivered' ? delivery.deliveryAddress : undefined
        );
      }, step.delay);
    }
  }, [deliveryOrders, updateDeliveryStatus]);

  return useMemo(() => ({
    deliveryOrders,
    isLoading,
    getAvailableProviders,
    getDeliveryQuotes,
    getAIRecommendation,
    calculateOrderWeight,
    createDeliveryOrder,
    updateDeliveryStatus,
    getDeliveryByOrderId,
    getActiveDeliveries,
    simulateDeliveryProgress,
    providers: BANDA_DELIVERY_PROVIDERS,
    deliveryZones: DELIVERY_ZONES,
  }), [
    deliveryOrders,
    isLoading,
    getAvailableProviders,
    getDeliveryQuotes,
    getAIRecommendation,
    calculateOrderWeight,
    createDeliveryOrder,
    updateDeliveryStatus,
    getDeliveryByOrderId,
    getActiveDeliveries,
    simulateDeliveryProgress,
  ]);
});