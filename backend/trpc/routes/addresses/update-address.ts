import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const updateAddressProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    addressId: z.string(),
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
    county: z.string().optional(),
    countyId: z.string().optional(),
    subCounty: z.string().optional(),
    subCountyId: z.string().optional(),
    ward: z.string().optional(),
    wardId: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    isDefault: z.boolean().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[updateAddress] Updating address:', input.addressId);

      if (input.isDefault) {
        const { error: clearError } = await ctx.supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', input.userId);

        if (clearError) {
          console.error('[updateAddress] Error clearing default:', clearError);
        }
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.address !== undefined) updateData.address = input.address;
      if (input.city !== undefined) updateData.city = input.city;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.country !== undefined) updateData.country = input.country;
      if (input.county !== undefined) updateData.county = input.county;
      if (input.countyId !== undefined) updateData.county_id = input.countyId;
      if (input.subCounty !== undefined) updateData.sub_county = input.subCounty;
      if (input.subCountyId !== undefined) updateData.sub_county_id = input.subCountyId;
      if (input.ward !== undefined) updateData.ward = input.ward;
      if (input.wardId !== undefined) updateData.ward_id = input.wardId;
      if (input.coordinates !== undefined) updateData.coordinates = input.coordinates;
      if (input.isDefault !== undefined) updateData.is_default = input.isDefault;

      const { data: updatedAddress, error } = await ctx.supabase
        .from('user_addresses')
        .update(updateData)
        .eq('id', input.addressId)
        .eq('user_id', input.userId)
        .select()
        .single();

      if (error) {
        console.error('[updateAddress] Supabase error:', error);
        throw new Error(`Failed to update address: ${error.message}`);
      }

      console.log('[updateAddress] Address updated successfully');

      return {
        success: true,
        address: updatedAddress,
      };
    } catch (error: any) {
      console.error('[updateAddress] Error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to update address',
      };
    }
  });
