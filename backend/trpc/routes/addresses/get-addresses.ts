import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const getAddressesProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    try {
      console.log('[getAddresses] Fetching addresses for user:', input.userId);

      const { data: addresses, error } = await ctx.supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', input.userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[getAddresses] Supabase error:', error);
        throw new Error(`Failed to fetch addresses: ${error.message}`);
      }

      console.log('[getAddresses] Found addresses:', addresses?.length || 0);

      return {
        success: true,
        addresses: addresses || [],
      };
    } catch (error: any) {
      console.error('[getAddresses] Error:', error);
      return {
        success: false,
        addresses: [],
        error: error?.message || 'Failed to fetch addresses',
      };
    }
  });
