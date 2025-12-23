import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const getMarketplaceEquipmentProcedure = publicProcedure
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
    console.log('[getMarketplaceEquipment] Fetching equipment with filters:', input);

    let query = supabase
      .from('service_provider_equipment')
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
        `name.ilike.%${input.searchQuery}%,description.ilike.%${input.searchQuery}%,type.ilike.%${input.searchQuery}%`
      );
    }

    const { data: equipment, error, count } = await query
      .in('availability', ['available', 'in_use'])
      .order('created_at', { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (error) {
      console.error('[getMarketplaceEquipment] Error fetching equipment:', error);
      throw new Error('Failed to fetch marketplace equipment');
    }

    console.log('[getMarketplaceEquipment] Found equipment:', equipment?.length || 0);

    const items = (equipment || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category || 'Equipment',
      sellerName: item.service_provider_profiles?.business_name || 
                  item.service_provider_profiles?.full_name || 
                  'Equipment Provider',
      pricePerDay: item.rental_rate_per_day || 0,
      location: item.location_county || 'Kenya',
      rating: item.service_provider_profiles?.rating || 4.5,
      image: item.images?.[0] || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
      verified: item.service_provider_profiles?.verification_status === 'verified',
      available: item.availability === 'available',
      condition: item.condition || 'Good',
      coordinates: item.location_coordinates ? {
        lat: item.location_coordinates.coordinates[1],
        lng: item.location_coordinates.coordinates[0],
      } : null,
    }));

    return {
      equipment: items,
      total: count || 0,
    };
  });
