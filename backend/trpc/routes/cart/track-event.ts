import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const trackCartEventProcedure = protectedProcedure
  .input(z.object({
    eventType: z.enum([
      'cart_viewed',
      'item_added',
      'item_removed',
      'quantity_updated',
      'checkout_started',
      'checkout_completed',
      'cart_abandoned',
      'promo_applied',
      'promo_failed',
    ]),
    productId: z.string().optional(),
    productName: z.string().optional(),
    quantity: z.number().optional(),
    price: z.number().optional(),
    cartValue: z.number().optional(),
    itemCount: z.number().optional(),
    sellerCount: z.number().optional(),
    source: z.string().optional(),
    sessionId: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    try {
      const { error } = await supabase
        .from('cart_analytics')
        .insert({
          user_id: userId,
          event_type: input.eventType,
          product_id: input.productId,
          product_name: input.productName,
          quantity: input.quantity,
          price: input.price,
          cart_value: input.cartValue,
          item_count: input.itemCount,
          seller_count: input.sellerCount,
          source: input.source || 'app',
          session_id: input.sessionId,
        });

      if (error) {
        console.error('Error tracking cart event:', error);
      }

      return { success: true };
    } catch (error) {
      console.error('Cart event tracking error:', error);
      return { success: false };
    }
  });
