import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const cartItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productPrice: z.number(),
  productImage: z.string().optional(),
  productUnit: z.string().default('kg'),
  quantity: z.number().positive(),
  selectedVariety: z.string().optional(),
  sellerId: z.string(),
  sellerName: z.string(),
  sellerLocation: z.string(),
  source: z.enum(['manual', 'recommendation', 'bundle', 'wishlist']).default('manual'),
});

export const syncCartProcedure = protectedProcedure
  .input(z.object({
    items: z.array(cartItemSchema),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    try {
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString());

      if (fetchError) {
        console.error('Error fetching cart items:', fetchError);
        throw new Error('Failed to fetch cart items');
      }

      const existingMap = new Map(
        existingItems?.map(item => [
          `${item.product_id}-${item.selected_variety || ''}`,
          item
        ]) || []
      );

      const inputMap = new Map(
        input.items.map(item => [
          `${item.productId}-${item.selectedVariety || ''}`,
          item
        ])
      );

      const toInsert = [];
      const toUpdate = [];
      const toDelete = [];

      for (const [key, inputItem] of inputMap) {
        const existing = existingMap.get(key);
        if (existing) {
          if (existing.quantity !== inputItem.quantity) {
            toUpdate.push({
              id: existing.id,
              quantity: inputItem.quantity,
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          toInsert.push({
            user_id: userId,
            product_id: inputItem.productId,
            product_name: inputItem.productName,
            product_price: inputItem.productPrice,
            product_image: inputItem.productImage,
            product_unit: inputItem.productUnit,
            quantity: inputItem.quantity,
            selected_variety: inputItem.selectedVariety,
            seller_id: inputItem.sellerId,
            seller_name: inputItem.sellerName,
            seller_location: inputItem.sellerLocation,
            source: inputItem.source,
            original_price: inputItem.productPrice,
          });
        }
      }

      for (const [key, existing] of existingMap) {
        if (!inputMap.has(key)) {
          toDelete.push(existing.id);
        }
      }

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert(toInsert);

        if (insertError) {
          console.error('Error inserting cart items:', insertError);
          throw new Error('Failed to insert cart items');
        }
      }

      for (const update of toUpdate) {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: update.quantity, updated_at: update.updated_at })
          .eq('id', update.id);

        if (updateError) {
          console.error('Error updating cart item:', updateError);
        }
      }

      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .in('id', toDelete);

        if (deleteError) {
          console.error('Error deleting cart items:', deleteError);
        }
      }

      await supabase.rpc('extend_cart_expiry', { p_user_id: userId });

      const { data: syncedItems, error: syncError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString());

      if (syncError) {
        console.error('Error fetching synced cart:', syncError);
        throw new Error('Failed to fetch synced cart');
      }

      return {
        success: true,
        items: syncedItems?.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          productPrice: item.product_price,
          productImage: item.product_image,
          productUnit: item.product_unit,
          quantity: item.quantity,
          selectedVariety: item.selected_variety,
          sellerId: item.seller_id,
          sellerName: item.seller_name,
          sellerLocation: item.seller_location,
          addedAt: item.added_at,
          expiresAt: item.expires_at,
        })) || [],
      };
    } catch (error) {
      console.error('Cart sync error:', error);
      throw new Error('Failed to sync cart');
    }
  });
