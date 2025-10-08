import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const setDefaultAddressProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    addressId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      console.log('[setDefaultAddress] Setting default address:', input.addressId);

      const { error: clearError } = await ctx.supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', input.userId);

      if (clearError) {
        console.error('[setDefaultAddress] Error clearing defaults:', clearError);
      }

      const { error } = await ctx.supabase
        .from('user_addresses')
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', input.addressId)
        .eq('user_id', input.userId);

      if (error) {
        console.error('[setDefaultAddress] Supabase error:', error);
        throw new Error(`Failed to set default address: ${error.message}`);
      }

      console.log('[setDefaultAddress] Default address set successfully');

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[setDefaultAddress] Error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to set default address',
      };
    }
  });
