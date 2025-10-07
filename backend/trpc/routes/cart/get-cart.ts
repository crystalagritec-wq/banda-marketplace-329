import { protectedProcedure } from '../../create-context';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const getCartProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.user.id;

    try {
      const { data: items, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching cart:', error);
        throw new Error('Failed to fetch cart');
      }

      const { data: summary } = await supabase
        .rpc('get_cart_summary', { p_user_id: userId });

      return {
        items: items?.map(item => ({
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
        summary: summary?.[0] || {
          item_count: 0,
          seller_count: 0,
          subtotal: 0,
          is_split_order: false,
        },
      };
    } catch (error) {
      console.error('Get cart error:', error);
      throw new Error('Failed to get cart');
    }
  });
