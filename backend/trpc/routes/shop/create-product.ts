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
    }).optional(),
    useVendorLocation: z.boolean().default(true),
    rewardPoints: z.number().int().nonnegative().optional(),
    isDraft: z.boolean().default(false),
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('[Shop Product] Creating product for user:', userId);

    try {
      const { data: userData, error: userError } = await ctx.supabase
        .from('profiles')
        .select('full_name, phone, location_lat, location_lng, location_city, location_county, location_county_id, location_sub_county, location_sub_county_id, location_ward, location_ward_id, location_label, location_address')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('[Shop Product] User fetch error:', userError);
        throw new Error('Failed to fetch user data');
      }

      let productLocation = input.location;
      
      if (input.useVendorLocation || !input.location) {
        if (userData.location_lat && userData.location_lng) {
          productLocation = {
            coordinates: {
              lat: userData.location_lat,
              lng: userData.location_lng,
            },
            label: userData.location_label || undefined,
            address: userData.location_address || undefined,
            city: userData.location_city || undefined,
            county: userData.location_county || undefined,
            countyId: userData.location_county_id || undefined,
            subCounty: userData.location_sub_county || undefined,
            subCountyId: userData.location_sub_county_id || undefined,
            ward: userData.location_ward || undefined,
            wardId: userData.location_ward_id || undefined,
          };
          console.log('[Shop Product] Using vendor shop location as default');
        } else {
          throw new Error('Vendor location not set. Please set your shop location first.');
        }
      }

      if (!productLocation) {
        throw new Error('Product location is required');
      }

      const rewardPoints = input.rewardPoints || Math.floor(input.price * 0.01);

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
        location_lat: productLocation.coordinates.lat,
        location_lng: productLocation.coordinates.lng,
        location_label: productLocation.label,
        location_address: productLocation.address,
        location_city: productLocation.city,
        location_county: productLocation.county,
        location_county_id: productLocation.countyId,
        location_sub_county: productLocation.subCounty,
        location_sub_county_id: productLocation.subCountyId,
        location_ward: productLocation.ward,
        location_ward_id: productLocation.wardId,
        reward_points: rewardPoints,
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
      console.log('[Shop Product] Product location:', {
        lat: productLocation.coordinates.lat,
        lng: productLocation.coordinates.lng,
        county: productLocation.county,
        usedVendorLocation: input.useVendorLocation || !input.location,
      });
      console.log('[Shop Product] Reward points:', rewardPoints);

      return {
        success: true,
        message: input.isDraft ? 'Draft saved successfully' : 'Product posted successfully',
        productId: data.id,
        product: data,
        rewardPoints,
        locationSource: input.useVendorLocation || !input.location ? 'vendor' : 'custom',
      };
    } catch (error) {
      console.error('[Shop Product] Error:', error);
      throw new Error('Failed to create product');
    }
  });
