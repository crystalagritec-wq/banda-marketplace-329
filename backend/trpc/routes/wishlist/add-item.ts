import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const addToWishlistProcedure = protectedProcedure
  .input(z.object({
    itemId: z.string(),
    itemType: z.enum(['product', 'service'])
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('❤️ Adding to wishlist for:', userId);

    try {
      const { error } = await ctx.supabase.rpc('add_to_wishlist', {
        p_user_id: userId,
        p_item_id: input.itemId,
        p_item_type: input.itemType
      });

      if (error) {
        console.error('❌ Add to wishlist error:', error);
        throw new Error('Failed to add to wishlist');
      }

      console.log('✅ Added to wishlist successfully');
      
      return {
        success: true,
        message: 'Added to wishlist successfully'
      };

    } catch (error) {
      console.error('❌ Add to wishlist error:', error);
      throw new Error('Failed to add to wishlist');
    }
  });