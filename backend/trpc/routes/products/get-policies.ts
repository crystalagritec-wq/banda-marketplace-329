import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export type ProductPolicy = {
  productId: string;
  vendorId: string;
  escrowEnabled: boolean;
  returnWindowHours: number | null;
  refundPolicy: 'none' | 'partial' | 'full';
  notes?: string | null;
};

export const getProductPoliciesProcedure = publicProcedure
  .input(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
    })
  )
  .query(async ({ input, ctx }) => {
    const { productId } = input;

    try {
      // Join products -> vendors and vendor/product policy tables
      const { data, error } = await ctx.supabase
        .from('product_policies_view')
        .select('*')
        .eq('product_id', productId)
        .single();

      if (error) {
        console.warn('product_policies_view missing/failing, falling back:', error.message);
      }

      const row = (data as any) || {};

      const response: ProductPolicy = {
        productId,
        vendorId: row.vendor_id ?? '',
        escrowEnabled: Boolean(row.escrow_enabled ?? true),
        returnWindowHours: typeof row.return_window_hours === 'number' ? row.return_window_hours : 24,
        refundPolicy: (row.refund_policy as 'none' | 'partial' | 'full') ?? 'partial',
        notes: row.notes ?? null,
      };

      return response;
    } catch (e) {
      console.error('getProductPoliciesProcedure error', e);
      const fallback: ProductPolicy = {
        productId,
        vendorId: '',
        escrowEnabled: true,
        returnWindowHours: 24,
        refundPolicy: 'partial',
        notes: null,
      };
      return fallback;
    }
  });
