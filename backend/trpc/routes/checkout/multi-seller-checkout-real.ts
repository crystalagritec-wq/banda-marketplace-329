import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';

export const multiSellerCheckoutRealProcedure = protectedProcedure
  .input(
    z.object({
      sellerGroups: z.array(
        z.object({
          sellerId: z.string(),
          sellerName: z.string(),
          items: z.array(
            z.object({
              product: z.object({
                id: z.string(),
                name: z.string(),
                price: z.number(),
              }),
              quantity: z.number(),
            })
          ),
          subtotal: z.number(),
          deliveryProvider: z.object({
            providerId: z.string(),
            providerName: z.string(),
            deliveryFee: z.number(),
            vehicleType: z.string(),
            estimatedTime: z.string(),
          }),
        })
      ),
      deliveryAddress: z.object({
        street: z.string().optional(),
        city: z.string(),
        county: z.string().optional(),
        coordinates: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      }),
      paymentMethod: z.string(),
      totalAmount: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    console.log('[MultiSellerCheckout] Starting checkout for user:', ctx.user.id);
    console.log('[MultiSellerCheckout] Seller groups:', input.sellerGroups.length);
    console.log('[MultiSellerCheckout] Total amount:', input.totalAmount);

    try {
      const masterOrderId = `MORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const totalSubtotal = input.sellerGroups.reduce((sum, g) => sum + g.subtotal, 0);
      const totalDeliveryFee = input.sellerGroups.reduce(
        (sum, g) => sum + g.deliveryProvider.deliveryFee,
        0
      );

      const { data: masterOrder, error: masterError } = await ctx.supabase
        .from('orders')
        .insert({
          user_id: ctx.user.id,
          is_split_order: true,
          seller_count: input.sellerGroups.length,
          delivery_address: input.deliveryAddress,
          payment_method: input.paymentMethod,
          subtotal: totalSubtotal,
          delivery_fee: totalDeliveryFee,
          total: input.totalAmount,
          status: 'pending',
          tracking_id: masterOrderId,
          estimated_delivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (masterError) {
        console.error('[MultiSellerCheckout] Error creating master order:', masterError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create master order: ${masterError.message}`,
        });
      }

      console.log('[MultiSellerCheckout] Master order created:', masterOrder.id);

      const subOrders = [];

      for (const group of input.sellerGroups) {
        const subOrderId = `SORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const { data: subOrder, error: subError } = await ctx.supabase
          .from('sub_orders')
          .insert({
            master_order_id: masterOrder.id,
            seller_id: group.sellerId,
            tracking_id: subOrderId,
            subtotal: group.subtotal,
            delivery_fee: group.deliveryProvider.deliveryFee,
            status: 'pending',
            estimated_delivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (subError) {
          console.error('[MultiSellerCheckout] Error creating sub-order:', subError);
          await ctx.supabase.from('orders').delete().eq('id', masterOrder.id);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create sub-order for seller ${group.sellerName}: ${subError.message}`,
          });
        }

        console.log('[MultiSellerCheckout] Sub-order created:', subOrder.id);

        const orderItems = group.items.map((item) => ({
          order_id: subOrder.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          seller_id: group.sellerId,
        }));

        const { error: itemsError } = await ctx.supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('[MultiSellerCheckout] Error creating order items:', itemsError);
          await ctx.supabase.from('orders').delete().eq('id', masterOrder.id);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create order items: ${itemsError.message}`,
          });
        }

        const { error: assignmentError } = await ctx.supabase
          .from('delivery_assignments')
          .insert({
            order_id: subOrder.id,
            provider_id: group.deliveryProvider.providerId,
            status: 'pending',
            pickup_location: input.deliveryAddress,
            dropoff_location: input.deliveryAddress,
            estimated_time: group.deliveryProvider.estimatedTime,
          });

        if (assignmentError) {
          console.error('[MultiSellerCheckout] Error creating delivery assignment:', assignmentError);
        }

        const { error: notifError } = await ctx.supabase
          .from('notifications')
          .insert({
            user_id: group.sellerId,
            type: 'new_order',
            title: 'New Order Received',
            message: `Order #${subOrderId} is waiting for confirmation`,
            data: {
              order_id: subOrder.id,
              master_order_id: masterOrder.id,
              tracking_id: subOrderId,
            },
            read: false,
          });

        if (notifError) {
          console.error('[MultiSellerCheckout] Error creating notification:', notifError);
        }

        subOrders.push({
          id: subOrder.id,
          tracking_id: subOrderId,
          seller_id: group.sellerId,
          seller_name: group.sellerName,
          subtotal: group.subtotal,
          delivery_fee: group.deliveryProvider.deliveryFee,
          status: subOrder.status,
        });
      }

      console.log('[MultiSellerCheckout] Checkout complete');

      return {
        success: true,
        masterOrder: {
          id: masterOrder.id,
          tracking_id: masterOrderId,
          status: masterOrder.status,
          total: masterOrder.total,
          seller_count: input.sellerGroups.length,
          created_at: masterOrder.created_at,
          estimated_delivery: masterOrder.estimated_delivery,
        },
        subOrders,
      };
    } catch (error) {
      console.error('[MultiSellerCheckout] Unexpected error:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during checkout',
      });
    }
  });
