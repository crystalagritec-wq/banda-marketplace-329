import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const createShopProductProcedure = protectedProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    negotiable: z.boolean().default(false),
    stock: z.number().int().nonnegative('Stock must be non-negative'),
    unit: z.string().default('unit'),
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
    }),
    isDraft: z.boolean().default(false),
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('[Shop Product] Creating product for user:', userId);

    try {
      const { data: userData, error: userError } = await ctx.supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('[Shop Product] User fetch error:', userError);
        throw new Error('Failed to fetch user data');
      }

      const productData = {
        user_id: userId,
        vendor_name: userData.full_name || 'Unknown Vendor',
        title: input.title,
        category: input.category,
        description: input.description || '',
        price: input.price,
        negotiable: input.negotiable,
        stock: input.stock,
        unit: input.unit,
        images: input.images || [],
        location_lat: input.location.coordinates.lat,
        location_lng: input.location.coordinates.lng,
        location_label: input.location.label,
        location_address: input.location.address,
        location_city: input.location.city,
        location_county: input.location.county,
        location_county_id: input.location.countyId,
        location_sub_county: input.location.subCounty,
        location_sub_county_id: input.location.subCountyId,
        location_ward: input.location.ward,
        location_ward_id: input.location.wardId,
        is_draft: input.isDraft,
        status: input.isDraft ? 'draft' : 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await ctx.supabase
        .from('marketplace_products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('[Shop Product] Insert error:', error);
        throw new Error('Failed to create product');
      }

      console.log('[Shop Product] Product created successfully:', data.id);

      return {
        success: true,
        message: input.isDraft ? 'Draft saved successfully' : 'Product posted successfully',
        productId: data.id,
        product: data,
      };
    } catch (error) {
      console.error('[Shop Product] Error:', error);
      throw new Error('Failed to create product');
    }
  });
