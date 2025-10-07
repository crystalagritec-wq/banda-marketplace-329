import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getVendorProductsProcedure = publicProcedure
  .input(z.object({
    vendorId: z.string(),
    userLocation: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    category: z.string().optional(),
    search: z.string().optional(),
  }))
  .query(async ({ input, ctx }) => {
    console.log('[Vendor Products] Fetching products for vendor:', input.vendorId);

    try {
      let query = ctx.supabase
        .from('marketplace_products')
        .select('*')
        .eq('user_id', input.vendorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (input.category) {
        query = query.eq('category', input.category);
      }

      if (input.search) {
        query = query.or(`title.ilike.%${input.search}%,description.ilike.%${input.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Vendor Products] Fetch error:', error);
        throw new Error('Failed to fetch vendor products');
      }

      const productsWithDistance = data.map(product => {
        let distanceKm = null;
        let deliveryFee = null;

        if (input.userLocation && product.location_lat && product.location_lng) {
          const R = 6371;
          const dLat = (product.location_lat - input.userLocation.lat) * Math.PI / 180;
          const dLng = (product.location_lng - input.userLocation.lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(input.userLocation.lat * Math.PI / 180) * 
            Math.cos(product.location_lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distanceKm = R * c;

          if (distanceKm <= 5) deliveryFee = 100;
          else if (distanceKm <= 10) deliveryFee = 150;
          else if (distanceKm <= 20) deliveryFee = 250;
          else if (distanceKm <= 50) deliveryFee = 400;
          else deliveryFee = 600;
        }

        return {
          ...product,
          distanceKm,
          deliveryFee,
        };
      });

      return {
        products: productsWithDistance,
        total: productsWithDistance.length,
      };
    } catch (error) {
      console.error('[Vendor Products] Error:', error);
      throw new Error('Failed to fetch vendor products');
    }
  });
