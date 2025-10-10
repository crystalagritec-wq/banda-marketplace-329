import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const searchProcedure = publicProcedure
  .input(z.object({
    query: z.string().min(1, 'Search query is required'),
    type: z.enum(['products', 'services', 'users', 'all']).default('all'),
    location: z.string().optional(),
    category: z.string().optional(),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0)
  }))
  .query(async ({ input, ctx }) => {
    console.log('🔍 Searching for:', input.query, 'Type:', input.type);

    try {
      const results: any[] = [];

      if (input.type === 'all' || input.type === 'products') {
        let productsQuery = ctx.supabase
          .from('marketplace_products')
          .select(`
            *,
            vendor:user_id (
              id,
              full_name,
              vendor_display_name,
              business_name,
              location_city,
              location_county,
              verified
            )
          `)
          .eq('status', 'active')
          .or(`title.ilike.%${input.query}%,description.ilike.%${input.query}%`);

        if (input.category) {
          productsQuery = productsQuery.eq('category', input.category);
        }

        if (input.location) {
          productsQuery = productsQuery.or(`location_city.ilike.%${input.location}%,location_county.ilike.%${input.location}%`);
        }

        productsQuery = productsQuery.limit(input.limit);

        const { data: products } = await productsQuery;

        if (products) {
          results.push(...products.map((p: any) => ({
            ...p,
            type: 'product',
            vendor_name: p.vendor?.vendor_display_name || p.vendor?.business_name || p.vendor?.full_name || 'Unknown',
            vendor_id: p.user_id,
            vendor_verified: p.vendor?.verified || false,
          })));
        }
      }

      if (input.type === 'all' || input.type === 'services') {
        let servicesQuery = ctx.supabase
          .from('service_marketplace_posts')
          .select(`
            *,
            provider:user_id (
              id,
              full_name,
              vendor_display_name,
              business_name,
              location_city,
              location_county,
              verified
            )
          `)
          .eq('status', 'active')
          .or(`title.ilike.%${input.query}%,description.ilike.%${input.query}%`);

        if (input.location) {
          servicesQuery = servicesQuery.or(`location_city.ilike.%${input.location}%,location_county.ilike.%${input.location}%`);
        }

        servicesQuery = servicesQuery.limit(input.limit);

        const { data: services } = await servicesQuery;

        if (services) {
          results.push(...services.map((s: any) => ({
            ...s,
            type: 'service',
            provider_name: s.provider?.vendor_display_name || s.provider?.business_name || s.provider?.full_name || 'Unknown',
            provider_id: s.user_id,
            provider_verified: s.provider?.verified || false,
          })));
        }
      }

      console.log(`✅ Search completed: ${results.length} results found`);
      
      return {
        success: true,
        data: results,
        query: input.query,
        total: results.length
      };

    } catch (error) {
      console.error('❌ Search error:', error);
      throw new Error('Failed to perform search');
    }
  });