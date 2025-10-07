import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getReviewStatsProcedure = publicProcedure
  .input(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
    })
  )
  .query(async ({ input, ctx }) => {
    const { productId } = input;

    try {
      const { data, error } = await ctx.supabase
        .from('reviews')
        .select('rating, verified')
        .eq('product_id', productId);

      if (error) {
        console.warn('[Reviews] Failed to fetch review stats:', error.message);
        return {
          totalReviews: 0,
          averageRating: 0,
          verifiedReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      const reviews = data || [];
      const totalReviews = reviews.length;
      const verifiedReviews = reviews.filter((r) => r.verified).length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      const ratingDistribution = reviews.reduce(
        (acc, r) => {
          acc[r.rating as 1 | 2 | 3 | 4 | 5] = (acc[r.rating as 1 | 2 | 3 | 4 | 5] || 0) + 1;
          return acc;
        },
        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
      );

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        verifiedReviews,
        ratingDistribution,
      };
    } catch (e: any) {
      console.error('[Reviews] getReviewStats error:', e);
      return {
        totalReviews: 0,
        averageRating: 0,
        verifiedReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
  });
