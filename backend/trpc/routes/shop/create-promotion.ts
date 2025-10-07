import { protectedProcedure } from '../../create-context';
import { z } from 'zod';

export const createPromotionProcedure = protectedProcedure
  .input(z.object({
    vendorId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number(),
    productIds: z.array(z.string()).optional(),
    startDate: z.string(),
    endDate: z.string(),
    minPurchase: z.number().optional(),
    maxDiscount: z.number().optional(),
    usageLimit: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('[Create Promotion] Creating promotion for vendor:', input.vendorId);

    const { data: promotion, error } = await ctx.supabase
      .from('promotions')
      .insert({
        vendor_id: input.vendorId,
        name: input.name,
        description: input.description,
        discount_type: input.discountType,
        discount_value: input.discountValue,
        product_ids: input.productIds,
        start_date: input.startDate,
        end_date: input.endDate,
        min_purchase: input.minPurchase,
        max_discount: input.maxDiscount,
        usage_limit: input.usageLimit,
        usage_count: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[Create Promotion] Error creating promotion:', error);
      throw new Error('Failed to create promotion');
    }

    return { promotion };
  });
