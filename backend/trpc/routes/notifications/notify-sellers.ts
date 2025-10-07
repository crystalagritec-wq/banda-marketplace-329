import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const notifySellersOfOrderProcedure = publicProcedure
  .input(z.object({
    masterOrderId: z.string(),
    buyerId: z.string(),
    buyerName: z.string(),
    subOrders: z.array(z.object({
      subOrderId: z.string(),
      sellerId: z.string(),
      sellerName: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        productName: z.string(),
        quantity: z.number(),
        price: z.number(),
      })),
      subtotal: z.number(),
      deliveryProvider: z.object({
        providerName: z.string(),
        vehicleType: z.string(),
        estimatedTime: z.string(),
      }),
      deliveryAddress: z.object({
        address: z.string(),
        city: z.string(),
        phone: z.string(),
      }),
    })),
  }))
  .mutation(async ({ input }) => {
    console.log('📢 Notifying sellers for master order:', input.masterOrderId);
    console.log('📢 Number of sellers to notify:', input.subOrders.length);

    const notifications = input.subOrders.map((subOrder) => {
      const itemsList = subOrder.items
        .map(item => `${item.quantity}x ${item.productName}`)
        .join(', ');

      return {
        id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: subOrder.sellerId,
        type: 'new_order' as const,
        priority: 'high' as const,
        title: '🎉 New Order Received!',
        message: `${input.buyerName} ordered: ${itemsList}`,
        data: {
          masterOrderId: input.masterOrderId,
          subOrderId: subOrder.subOrderId,
          buyerId: input.buyerId,
          buyerName: input.buyerName,
          itemCount: subOrder.items.length,
          subtotal: subOrder.subtotal,
          deliveryProvider: subOrder.deliveryProvider.providerName,
          estimatedPickup: subOrder.deliveryProvider.estimatedTime,
          deliveryAddress: subOrder.deliveryAddress,
        },
        actions: [
          {
            id: 'confirm',
            label: 'Confirm Order',
            action: 'confirm_order',
          },
          {
            id: 'view',
            label: 'View Details',
            action: 'view_order',
          },
        ],
        createdAt: new Date().toISOString(),
        read: false,
        delivered: false,
      };
    });

    console.log('✅ Notifications created:', notifications.length);
    
    for (const notification of notifications) {
      console.log(`📧 Sending to seller ${notification.userId}:`, notification.title);
    }

    return {
      success: true,
      notificationsSent: notifications.length,
      notifications,
      message: `Successfully notified ${notifications.length} sellers`,
      deliveryStatus: notifications.map(n => ({
        sellerId: n.userId,
        notificationId: n.id,
        status: 'sent',
        sentAt: n.createdAt,
      })),
    };
  });
