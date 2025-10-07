import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const submitReviewProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      productId: z.string(),
      vendorId: z.string(),
      orderId: z.string().optional(),
      rating: z.number().min(1).max(5),
      title: z.string().optional(),
      comment: z.string(),
      images: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Reviews] Submitting review:', input);

    try {
      const { data: review, error: insertError} = await supabase
        .from('reviews')
        .insert({
          user_id: input.userId,
          product_id: input.productId,
          vendor_id: input.vendorId,
          order_id: input.orderId,
          rating: input.rating,
          title: input.title,
          comment: input.comment,
          images: input.images || [],
          verified: !!input.orderId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Reviews] Error inserting review:', insertError);
        throw new Error('Failed to submit review');
      }

      console.log('[Reviews] Review submitted successfully:', review.id);

      return {
        success: true,
        reviewId: review.id,
        message: 'Review submitted successfully',
      };
    } catch (error: any) {
      console.error('[Reviews] Submit review error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to submit review',
      };
    }
  });
