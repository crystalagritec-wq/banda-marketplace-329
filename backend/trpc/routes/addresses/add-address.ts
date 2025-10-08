import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const addAddressProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    name: z.string(),
    address: z.string(),
    city: z.string(),
    phone: z.string(),
    country: z.string(),
    county: z.string().optional(),
    countyId: z.string().optional(),
    subCounty: z.string().optional(),
    subCountyId: z.string().optional(),
    ward: z.string().optional(),
    wardId: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    isDefault: z.boolean().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[addAddress] Adding address for user:', input.userId);

      if (input.isDefault) {
        const { error: updateError } = await ctx.supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', input.userId);

        if (updateError) {
          console.error('[addAddress] Error clearing default:', updateError);
        }
      }

      const { data: existingAddresses } = await ctx.supabase
        .from('user_addresses')
        .select('id')
        .eq('user_id', input.userId);

      const isFirstAddress = !existingAddresses || existingAddresses.length === 0;

      const { data: newAddress, error } = await ctx.supabase
        .from('user_addresses')
        .insert({
          user_id: input.userId,
          name: input.name,
          address: input.address,
          city: input.city,
          phone: input.phone,
          country: input.country,
          county: input.county,
          county_id: input.countyId,
          sub_county: input.subCounty,
          sub_county_id: input.subCountyId,
          ward: input.ward,
          ward_id: input.wardId,
          coordinates: input.coordinates,
          is_default: input.isDefault || isFirstAddress,
        })
        .select()
        .single();

      if (error) {
        console.error('[addAddress] Supabase error:', error);
        throw new Error(`Failed to add address: ${error.message}`);
      }

      console.log('[addAddress] Address added successfully:', newAddress.id);

      return {
        success: true,
        address: newAddress,
      };
    } catch (error: any) {
      console.error('[addAddress] Error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to add address',
      };
    }
  });
