import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const getMarketplaceServicesProcedure = publicProcedure
  .input(
    z.object({
      category: z.string().optional(),
      county: z.string().optional(),
      searchQuery: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    })
  )
  .query(async ({ input }) => {
    console.log('[getMarketplaceServices] Fetching services with filters:', input);

    let query = supabase
      .from('service_marketplace_listings')
      .select(`
        *,
        service_provider_profiles!inner(
          user_id,
          provider_type,
          business_name,
          full_name,
          verification_status,
          rating
        )
      `, { count: 'exact' });

    if (input.category) {
      query = query.eq('category', input.category);
    }

    if (input.county) {
      query = query.eq('location_county', input.county);
    }

    if (input.searchQuery) {
      query = query.or(
        `title.ilike.%${input.searchQuery}%,description.ilike.%${input.searchQuery}%,service_name.ilike.%${input.searchQuery}%`
      );
    }

    const { data: listings, error, count } = await query
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (error) {
      console.error('[getMarketplaceServices] Error fetching services:', error);
      throw new Error('Failed to fetch marketplace services');
    }

    console.log('[getMarketplaceServices] Found services:', listings?.length || 0);

    const services = (listings || []).map((listing: any) => ({
      id: listing.id,
      name: listing.title || listing.service_name || 'Service',
      category: listing.category || 'General',
      providerName: listing.service_provider_profiles?.business_name || 
                    listing.service_provider_profiles?.full_name || 
                    'Service Provider',
      priceFrom: listing.price_from || 0,
      location: listing.location_county || 'Kenya',
      rating: listing.service_provider_profiles?.rating || 4.5,
      image: listing.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
      verified: listing.service_provider_profiles?.verification_status === 'verified',
      availability: listing.availability || 'Available',
      coordinates: listing.location_coordinates ? {
        lat: listing.location_coordinates.coordinates[1],
        lng: listing.location_coordinates.coordinates[0],
      } : null,
    }));

    return {
      services,
      total: count || 0,
    };
  });
