import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const validatePromoProcedure = protectedProcedure
  .input(z.object({
    code: z.string(),
    cartValue: z.number(),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    try {
      const { data, error } = await supabase
        .rpc('validate_promo_code', {
          p_code: input.code,
          p_user_id: userId,
          p_cart_value: input.cartValue,
        });

      if (error) {
        console.error('Error validating promo:', error);
        throw new Error('Failed to validate promo code');
      }

      const result = data?.[0];

      if (!result?.is_valid) {
        return {
          success: false,
          error: result?.error_message || 'Invalid promo code',
        };
      }

      await supabase
        .from('cart_analytics')
        .insert({
          user_id: userId,
          event_type: 'promo_applied',
          cart_value: input.cartValue,
        });

      return {
        success: true,
        discountAmount: result.discount_amount,
        code: input.code,
      };
    } catch (error) {
      console.error('Promo validation error:', error);
      
      await supabase
        .from('cart_analytics')
        .insert({
          user_id: userId,
          event_type: 'promo_failed',
          cart_value: input.cartValue,
        });

      return {
        success: false,
        error: 'Failed to validate promo code',
      };
    }
  });
