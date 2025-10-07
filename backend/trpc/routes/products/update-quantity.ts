import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const updateQuantityProcedure = protectedProcedure
  .input(
    z.object({
      cartItemId: z.string().min(1, 'Cart item ID is required'),
      quantity: z.number().min(0, 'Quantity cannot be negative'),
    })
  )
  .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
    const { cartItemId, quantity } = input;
    const userId = ctx.user.id;

    console.log('📝 Updating cart item quantity:', {
      userId,
      cartItemId,
      quantity,
    });

    try {
      if (quantity === 0) {
        // Remove item from cart
        // In production: await supabase.from('cart_items').delete().eq('id', cartItemId).eq('user_id', userId);
        
        return {
          success: true,
          message: 'Item removed from cart',
          action: 'removed',
          cartItemId,
        };
      }

      // Update quantity
      // In production: 
      // const { data, error } = await supabase
      //   .from('cart_items')
      //   .update({ quantity, updated_at: new Date().toISOString() })
      //   .eq('id', cartItemId)
      //   .eq('user_id', userId)
      //   .select();

      const updatedItem = {
        id: cartItemId,
        userId,
        quantity,
        updatedAt: new Date().toISOString(),
      };

      console.log('✅ Cart item quantity updated successfully');

      return {
        success: true,
        message: 'Cart updated successfully',
        action: 'updated',
        cartItem: updatedItem,
      };

    } catch (error) {
      console.error('❌ Update quantity error:', error);
      throw new Error('Failed to update cart item. Please try again.');
    }
  });