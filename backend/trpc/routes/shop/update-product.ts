import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const updateShopProductProcedure = protectedProcedure
  .input(z.object({
    productId: z.string(),
    title: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    negotiable: z.boolean().optional(),
    stock: z.number().int().nonnegative().optional(),
    unit: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    location: z.object({
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      label: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      county: z.string().optional(),
      countyId: z.string().optional(),
      subCounty: z.string().optional(),
      subCountyId: z.string().optional(),
      ward: z.string().optional(),
      wardId: z.string().optional(),
    }).optional(),
    rewardPoints: z.number().int().nonnegative().optional(),
    status: z.enum(['active', 'inactive', 'draft']).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    const { productId, ...updateData } = input;
    
    console.log('[Shop Product] Updating product:', productId);

    try {
      const { data: product, error: fetchError } = await ctx.supabase
        .from('marketplace_products')
        .select('user_id')
        .eq('id', productId)
        .single();

      if (fetchError || !product) {
        throw new Error('Product not found');
      }

      if (product.user_id !== userId) {
        throw new Error('Unauthorized to update this product');
      }

      const updatePayload: any = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      if (input.location) {
        updatePayload.location_lat = input.location.coordinates.lat;
        updatePayload.location_lng = input.location.coordinates.lng;
        updatePayload.location_label = input.location.label;
        updatePayload.location_address = input.location.address;
        updatePayload.location_city = input.location.city;
        updatePayload.location_county = input.location.county;
        updatePayload.location_county_id = input.location.countyId;
        updatePayload.location_sub_county = input.location.subCounty;
        updatePayload.location_sub_county_id = input.location.subCountyId;
        updatePayload.location_ward = input.location.ward;
        updatePayload.location_ward_id = input.location.wardId;
        console.log('[Shop Product] Updating product location');
      }

      if (input.rewardPoints !== undefined) {
        updatePayload.reward_points = input.rewardPoints;
        console.log('[Shop Product] Updating reward points:', input.rewardPoints);
      }

      delete updatePayload.location;

      const { data, error } = await ctx.supabase
        .from('marketplace_products')
        .update(updatePayload)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('[Shop Product] Update error:', error);
        throw new Error('Failed to update product');
      }

      console.log('[Shop Product] Product updated successfully');

      return {
        success: true,
        message: 'Product updated successfully',
        product: data,
      };
    } catch (error) {
      console.error('[Shop Product] Error:', error);
      throw new Error('Failed to update product');
    }
  });
