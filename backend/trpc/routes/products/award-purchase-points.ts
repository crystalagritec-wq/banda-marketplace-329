import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const awardPurchasePointsProcedure = protectedProcedure
  .input(z.object({
    productId: z.string(),
    orderId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('[Award Points] Awarding points for product purchase:', input.productId);

    try {
      const { data: product, error: productError } = await ctx.supabase
        .from('marketplace_products')
        .select('reward_points, title, price')
        .eq('id', input.productId)
        .single();

      if (productError || !product) {
        console.error('[Award Points] Product not found:', productError);
        throw new Error('Product not found');
      }

      const pointsToAward = product.reward_points || Math.floor(product.price * 0.01);

      const { data: loyaltyData, error: loyaltyError } = await ctx.supabase
        .from('loyalty_points')
        .select('points')
        .eq('user_id', userId)
        .single();

      if (loyaltyError && loyaltyError.code !== 'PGRST116') {
        console.error('[Award Points] Error fetching loyalty points:', loyaltyError);
      }

      if (!loyaltyData) {
        const { error: insertError } = await ctx.supabase
          .from('loyalty_points')
          .insert({
            user_id: userId,
            points: pointsToAward,
          });

        if (insertError) {
          console.error('[Award Points] Error creating loyalty record:', insertError);
          throw new Error('Failed to create loyalty record');
        }
      } else {
        const { error: updateError } = await ctx.supabase
          .from('loyalty_points')
          .update({
            points: loyaltyData.points + pointsToAward,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('[Award Points] Error updating loyalty points:', updateError);
          throw new Error('Failed to update loyalty points');
        }
      }

      const { error: transactionError } = await ctx.supabase
        .from('loyalty_transactions')
        .insert({
          user_id: userId,
          event_type: 'purchase',
          points: pointsToAward,
          metadata: {
            product_id: input.productId,
            product_title: product.title,
            order_id: input.orderId,
            price: product.price,
          },
        });

      if (transactionError) {
        console.error('[Award Points] Error creating transaction:', transactionError);
      }

      console.log('[Award Points] Successfully awarded', pointsToAward, 'points to user:', userId);

      return {
        success: true,
        pointsAwarded: pointsToAward,
        message: `You earned ${pointsToAward} points!`,
      };
    } catch (error) {
      console.error('[Award Points] Error:', error);
      throw new Error('Failed to award points');
    }
  });
