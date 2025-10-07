import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const createMarketplacePostProcedure = protectedProcedure
  .input(
    z.object({
      serviceTypeId: z.string(),
      serviceName: z.string(),
      category: z.string(),
      title: z.string(),
      description: z.string(),
      images: z.array(z.string()).optional(),
      startingPrice: z.number().optional(),
      pricingType: z.enum(['hourly', 'daily', 'fixed', 'negotiable']),
      serviceAreas: z.array(z.string()),
      locationCounty: z.string(),
      locationLat: z.number().optional(),
      locationLng: z.number().optional(),
      availableDays: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('[createMarketplacePost] Creating post for user:', userId);

    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('id, verification_status')
      .eq('user_id', userId)
      .single();

    if (providerError || !provider) {
      console.error('[createMarketplacePost] Provider not found:', providerError);
      throw new Error('Service provider profile not found');
    }

    if (provider.verification_status === 'rejected') {
      throw new Error('Cannot create posts with rejected verification status');
    }

    const { data: post, error: postError } = await supabase
      .from('service_marketplace_posts')
      .insert([
        {
          provider_id: provider.id,
          service_type_id: input.serviceTypeId,
          service_name: input.serviceName,
          category: input.category,
          title: input.title,
          description: input.description,
          images: input.images || [],
          starting_price: input.startingPrice,
          pricing_type: input.pricingType,
          service_areas: input.serviceAreas,
          location_county: input.locationCounty,
          location_lat: input.locationLat,
          location_lng: input.locationLng,
          available_days: input.availableDays || [],
          tags: input.tags || [],
          is_active: true,
        },
      ])
      .select()
      .single();

    if (postError) {
      console.error('[createMarketplacePost] Error creating post:', postError);
      throw new Error('Failed to create marketplace post');
    }

    console.log('[createMarketplacePost] Post created successfully:', post.id);

    return {
      success: true,
      post,
    };
  });
