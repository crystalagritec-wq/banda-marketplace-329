import { protectedProcedure } from '../../create-context';
import { z } from 'zod';

export const getPromotionsProcedure = protectedProcedure
  .input(z.object({
    vendorId: z.string(),
    status: z.enum(['all', 'active', 'scheduled', 'expired']).optional().default('all'),
  }))
  .query(async ({ input, ctx }) => {
    console.log('[Get Promotions] Fetching promotions for vendor:', input.vendorId);

    let query = ctx.supabase
      .from('promotions')
      .select('*')
      .eq('vendor_id', input.vendorId)
      .order('created_at', { ascending: false });

    const now = new Date().toISOString();

    if (input.status === 'active') {
      query = query
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);
    } else if (input.status === 'scheduled') {
      query = query
        .eq('is_active', true)
        .gt('start_date', now);
    } else if (input.status === 'expired') {
      query = query.lt('end_date', now);
    }

    const { data: promotions, error } = await query;

    if (error) {
      console.error('[Get Promotions] Error fetching promotions:', error);
      throw new Error('Failed to fetch promotions');
    }

    return { promotions: promotions || [] };
  });
