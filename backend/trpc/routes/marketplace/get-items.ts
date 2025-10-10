import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getMarketplaceProcedure = publicProcedure
  .input(z.object({
    category: z.string().optional(),
    location: z.string().optional(),
    search: z.string().optional(),
    priceMin: z.number().optional(),
    priceMax: z.number().optional(),
    sortBy: z.enum(['newest', 'price_low', 'price_high', 'popular']).default('newest'),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0)
  }))
  .query(async ({ input, ctx }) => {
    console.log('🏪 Fetching marketplace items from shop vendors');

    try {
      let query = ctx.supabase
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
            verified
          )
        `)
        .eq('status', 'active');

      if (input.category) {
        query = query.eq('category', input.category);
      }

      if (input.location) {
        query = query.or(`location_city.ilike.%${input.location}%,location_county.ilike.%${input.location}%`);
      }

      if (input.search) {
        query = query.or(`title.ilike.%${input.search}%,description.ilike.%${input.search}%`);
      }

      if (input.priceMin !== undefined) {
        query = query.gte('price', input.priceMin);
      }

      if (input.priceMax !== undefined) {
        query = query.lte('price', input.priceMax);
      }

      switch (input.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          query = query.order('views', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      query = query.range(input.offset, input.offset + input.limit - 1);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Get marketplace error:', error);
        throw new Error('Failed to fetch marketplace items');
      }

      const formattedData = (data || []).map((item: any) => ({
        ...item,
        vendor_name: item.vendor?.vendor_display_name || item.vendor?.business_name || item.vendor?.full_name || 'Unknown Vendor',
        vendor_id: item.user_id,
        vendor_verified: item.vendor?.verified || false,
        vendor_location: item.vendor?.location_city && item.vendor?.location_county 
          ? `${item.vendor.location_city}, ${item.vendor.location_county}`
          : item.location_county || 'Kenya',
      }));

      console.log(`✅ Fetched ${formattedData.length} marketplace items from shop vendors`);
      
      return {
        success: true,
        data: formattedData
      };

    } catch (error) {
      console.error('❌ Get marketplace error:', error);
      throw new Error('Failed to fetch marketplace items');
    }
  });