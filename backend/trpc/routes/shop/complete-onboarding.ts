import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const completeShopOnboardingProcedure = protectedProcedure
  .input(z.object({
    shopName: z.string().min(1),
    category: z.string().min(1),
    contact: z.string().min(1),
    productsCount: z.number().int().min(0),
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
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('[CompleteShopOnboarding] Starting for user:', userId);
    console.log('[CompleteShopOnboarding] Input:', input);

    try {
      const updateData: any = {
        business_name: input.shopName,
        vendor_display_name: input.shopName,
        business_type: 'Vendor',
        phone: input.contact,
        updated_at: new Date().toISOString(),
      };

      if (input.location) {
        updateData.location_lat = input.location.coordinates.lat;
        updateData.location_lng = input.location.coordinates.lng;
        updateData.location_label = input.location.label;
        updateData.location_address = input.location.address;
        updateData.location_city = input.location.city;
        updateData.location_county = input.location.county;
        updateData.location_county_id = input.location.countyId;
        updateData.location_sub_county = input.location.subCounty;
        updateData.location_sub_county_id = input.location.subCountyId;
        updateData.location_ward = input.location.ward;
        updateData.location_ward_id = input.location.wardId;
      }

      const { data: profile, error: profileError } = await ctx.supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (profileError) {
        console.error('[CompleteShopOnboarding] Profile update error:', profileError);
        throw new Error('Failed to update profile');
      }

      console.log('[CompleteShopOnboarding] Profile updated successfully');

      return {
        success: true,
        message: 'Shop onboarding completed successfully',
        shop: {
          id: profile.id,
          name: profile.vendor_display_name || profile.business_name,
          category: input.category,
          contact: profile.phone,
          productsCount: input.productsCount,
          location: input.location,
        },
      };
    } catch (error: any) {
      console.error('[CompleteShopOnboarding] Error:', error);
      throw new Error(error.message || 'Failed to complete shop onboarding');
    }
  });
