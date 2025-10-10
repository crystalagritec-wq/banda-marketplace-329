import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';

export const createOrderProcedure = protectedProcedure
  .input(
    z.object({
      items: z.array(
        z.object({
          product_id: z.string(),
          quantity: z.number().positive(),
          price: z.number().positive(),
          seller_id: z.string(),
        })
      ),
      delivery_address: z.object({
        street: z.string().optional(),
        city: z.string(),
        county: z.string().optional(),
        coordinates: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      }),
      payment_method: z.string(),
      subtotal: z.number(),
      delivery_fee: z.number(),
      discount: z.number().default(0),
      total: z.number(),
      promo_code: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    console.log('[CreateOrder] Creating order for user:', ctx.user.id);
    console.log('[CreateOrder] Items:', input.items.length);
    console.log('[CreateOrder] Total:', input.total);

    try {
      const { data: order, error: orderError } = await ctx.supabase
        .from('orders')
        .insert({
          user_id: ctx.user.id,
          delivery_address: input.delivery_address,
          payment_method: input.payment_method,
          subtotal: input.subtotal,
          delivery_fee: input.delivery_fee,
          discount: input.discount,
          total: input.total,
          status: 'pending',
          tracking_id: `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          estimated_delivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (orderError) {
        console.error('[CreateOrder] Error creating order:', orderError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create order: ${orderError.message}`,
        });
      }

      console.log('[CreateOrder] Order created:', order.id);

      const orderItems = input.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        seller_id: item.seller_id,
      }));

      const { error: itemsError } = await ctx.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('[CreateOrder] Error creating order items:', itemsError);
        await ctx.supabase.from('orders').delete().eq('id', order.id);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create order items: ${itemsError.message}`,
        });
      }

      console.log('[CreateOrder] Order items created:', orderItems.length);

      const sellerIds = [...new Set(input.items.map((i) => i.seller_id))];
      console.log('[CreateOrder] Notifying sellers:', sellerIds);

      for (const sellerId of sellerIds) {
        const { error: notifError } = await ctx.supabase
          .from('notifications')
          .insert({
            user_id: sellerId,
            type: 'new_order',
            title: 'New Order Received',
            message: `Order #${order.tracking_id} is waiting for confirmation`,
            data: { order_id: order.id, tracking_id: order.tracking_id },
            read: false,
          });

        if (notifError) {
          console.error('[CreateOrder] Error creating notification:', notifError);
        }
      }

      console.log('[CreateOrder] Order creation complete');

      return {
        success: true,
        order: {
          id: order.id,
          tracking_id: order.tracking_id,
          status: order.status,
          total: order.total,
          created_at: order.created_at,
          estimated_delivery: order.estimated_delivery,
        },
      };
    } catch (error) {
      console.error('[CreateOrder] Unexpected error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while creating the order',
      });
    }
  });
