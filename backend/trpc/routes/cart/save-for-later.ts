import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const saveForLaterProcedure = protectedProcedure
  .input(z.object({
    productId: z.string(),
    productName: z.string(),
    productPrice: z.number(),
    productImage: z.string().optional(),
    sellerId: z.string(),
    sellerName: z.string(),
    sellerLocation: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    try {
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', input.productId);

      if (deleteError) {
        console.error('Error removing from cart:', deleteError);
      }

      const { error: insertError } = await supabase
        .from('saved_for_later')
        .insert({
          user_id: userId,
          product_id: input.productId,
          product_name: input.productName,
          product_price: input.productPrice,
          product_image: input.productImage,
          seller_id: input.sellerId,
          seller_name: input.sellerName,
          seller_location: input.sellerLocation,
        });

      if (insertError) {
        console.error('Error saving for later:', insertError);
        throw new Error('Failed to save item for later');
      }

      return { success: true };
    } catch (error) {
      console.error('Save for later error:', error);
      throw new Error('Failed to save item for later');
    }
  });

export const getSavedItemsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.user.id;

    try {
      const { data, error } = await supabase
        .from('saved_for_later')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved items:', error);
        throw new Error('Failed to fetch saved items');
      }

      return {
        items: data?.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          productPrice: item.product_price,
          productImage: item.product_image,
          sellerId: item.seller_id,
          sellerName: item.seller_name,
          sellerLocation: item.seller_location,
          savedAt: item.saved_at,
        })) || [],
      };
    } catch (error) {
      console.error('Get saved items error:', error);
      throw new Error('Failed to get saved items');
    }
  });

export const moveToCartProcedure = protectedProcedure
  .input(z.object({
    productId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id;

    try {
      const { data: savedItem, error: fetchError } = await supabase
        .from('saved_for_later')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', input.productId)
        .single();

      if (fetchError || !savedItem) {
        throw new Error('Saved item not found');
      }

      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: savedItem.product_id,
          product_name: savedItem.product_name,
          product_price: savedItem.product_price,
          product_image: savedItem.product_image,
          product_unit: 'kg',
          quantity: 1,
          seller_id: savedItem.seller_id,
          seller_name: savedItem.seller_name,
          seller_location: savedItem.seller_location,
          source: 'wishlist',
        });

      if (insertError) {
        console.error('Error moving to cart:', insertError);
        throw new Error('Failed to move item to cart');
      }

      const { error: deleteError } = await supabase
        .from('saved_for_later')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', input.productId);

      if (deleteError) {
        console.error('Error deleting saved item:', deleteError);
      }

      return { success: true };
    } catch (error) {
      console.error('Move to cart error:', error);
      throw new Error('Failed to move item to cart');
    }
  });
