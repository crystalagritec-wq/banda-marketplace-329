import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getProductProcedure = publicProcedure
  .input(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
    })
  )
  .query(async ({ input, ctx }) => {
    const { productId } = input;

    try {
      const { data, error } = await ctx.supabase
        .from('marketplace_products')
        .select(`
          *,
          vendor:user_id (
            id,
            full_name,
            vendor_display_name,
            business_name,
            phone,
            location_city,
            location_county,
            location_lat,
            location_lng,
            verified,
            avatar_url
          )
        `)
        .eq('id', productId)
        .single();

      if (error) {
        console.error('[Products] Failed to fetch product:', error.message);
        return null;
      }

      const formattedData = {
        ...data,
        vendor_name: data.vendor?.vendor_display_name || data.vendor?.business_name || data.vendor?.full_name || 'Unknown Vendor',
        vendor_id: data.user_id,
        vendor_verified: data.vendor?.verified || false,
        vendor_phone: data.vendor?.phone,
        vendor_location: data.vendor?.location_city && data.vendor?.location_county
          ? `${data.vendor.location_city}, ${data.vendor.location_county}`
          : data.location_county || 'Kenya',
        vendor_avatar: data.vendor?.avatar_url,
      };

      return formattedData;
    } catch (e: any) {
      console.error('[Products] getProduct error:', e);
      return null;
    }
  });
