import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const deleteAddressProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    addressId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[deleteAddress] Deleting address:', input.addressId);

      const { data: addressToDelete } = await ctx.supabase
        .from('user_addresses')
        .select('is_default')
        .eq('id', input.addressId)
        .eq('user_id', input.userId)
        .single();

      const { error } = await ctx.supabase
        .from('user_addresses')
        .delete()
        .eq('id', input.addressId)
        .eq('user_id', input.userId);

      if (error) {
        console.error('[deleteAddress] Supabase error:', error);
        throw new Error(`Failed to delete address: ${error.message}`);
      }

      if (addressToDelete?.is_default) {
        const { data: remainingAddresses } = await ctx.supabase
          .from('user_addresses')
          .select('id')
          .eq('user_id', input.userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (remainingAddresses && remainingAddresses.length > 0) {
          await ctx.supabase
            .from('user_addresses')
            .update({ is_default: true })
            .eq('id', remainingAddresses[0].id);
        }
      }

      console.log('[deleteAddress] Address deleted successfully');

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[deleteAddress] Error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to delete address',
      };
    }
  });
