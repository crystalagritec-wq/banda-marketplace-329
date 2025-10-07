import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getMultiSellerOrderProcedure = publicProcedure
  .input(z.object({
    orderId: z.string(),
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    console.log('📦 Fetching multi-seller order:', input.orderId);

    const mockOrder = {
      id: input.orderId,
      userId: input.userId,
      masterTrackingId: `MTRK-${Date.now()}-ABC123`,
      status: 'processing' as const,
      isSplitOrder: true,
      sellerCount: 2,
      createdAt: new Date().toISOString(),
      paymentStatus: 'completed' as const,
      paymentMethod: {
        type: 'mpesa' as const,
        details: '+254712345678',
      },
      deliveryAddress: {
        name: 'Home',
        address: '123 Farm Road, Kiambu',
        city: 'Kiambu',
        phone: '+254712345678',
      },
      orderSummary: {
        subtotal: 4500,
        totalDeliveryFee: 300,
        discount: 0,
        total: 4800,
      },
      subOrders: [
        {
          subOrderId: `${input.orderId}-S1`,
          subTrackingId: `MTRK-${Date.now()}-S1`,
          sellerId: 'seller-john-farmer',
          sellerName: 'John Farmer',
          sellerLocation: 'Kiambu',
          sellerPhone: '+254700111222',
          items: [
            {
              productId: 'prod-1',
              productName: 'Fresh Tomatoes',
              quantity: 5,
              price: 150,
              unit: 'kg',
              image: 'https://images.unsplash.com/photo-1546470427-227e2e1e8c8e',
            },
            {
              productId: 'prod-2',
              productName: 'Green Peppers',
              quantity: 3,
              price: 200,
              unit: 'kg',
              image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83',
            },
          ],
          subtotal: 1350,
          deliveryFee: 150,
          deliveryProvider: {
            providerId: 'boda-1',
            providerName: 'Banda Boda',
            vehicleType: 'boda',
            driverName: 'Peter Kamau',
            driverPhone: '+254700333444',
            estimatedTime: '1-2 hours',
          },
          status: 'packed' as const,
          estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          pickupLocation: 'Kiambu Farm, Plot 45',
          dropoffLocation: '123 Farm Road, Kiambu',
          timeline: [
            {
              status: 'pending',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              description: 'Order placed',
            },
            {
              status: 'confirmed',
              timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
              description: 'Seller confirmed order',
            },
            {
              status: 'packed',
              timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              description: 'Items packed and ready for pickup',
            },
          ],
        },
        {
          subOrderId: `${input.orderId}-S2`,
          subTrackingId: `MTRK-${Date.now()}-S2`,
          sellerId: 'seller-dairy-coop',
          sellerName: 'Dairy Co-op',
          sellerLocation: 'Meru',
          sellerPhone: '+254700555666',
          items: [
            {
              productId: 'prod-3',
              productName: 'Fresh Milk',
              quantity: 10,
              price: 120,
              unit: 'liter',
              image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150',
            },
            {
              productId: 'prod-4',
              productName: 'Yogurt',
              quantity: 5,
              price: 180,
              unit: 'pack',
              image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777',
            },
          ],
          subtotal: 3150,
          deliveryFee: 150,
          deliveryProvider: {
            providerId: 'van-1',
            providerName: 'Banda Van',
            vehicleType: 'van',
            driverName: 'Mary Wanjiku',
            driverPhone: '+254700777888',
            estimatedTime: '2-4 hours',
          },
          status: 'confirmed' as const,
          estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          pickupLocation: 'Meru Dairy, Main Street',
          dropoffLocation: '123 Farm Road, Kiambu',
          timeline: [
            {
              status: 'pending',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              description: 'Order placed',
            },
            {
              status: 'confirmed',
              timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
              description: 'Seller confirmed order',
            },
          ],
        },
      ],
      deliveryOptimization: {
        totalDistance: 85,
        totalDeliveryFee: 300,
        estimatedTotalTime: 4,
        poolingOpportunities: 0,
        savingsFromOptimization: 0,
      },
    };

    return mockOrder;
  });
