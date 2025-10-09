import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

export const rateDriverProcedure = protectedProcedure
  .input(z.object({
    assignmentId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { data: assignment, error: assignmentError } = await supabase
      .from('logistics_assignments')
      .select('*, orders!inner(buyer_id), logistics_drivers!inner(user_id)')
      .eq('id', input.assignmentId)
      .single();

    if (assignmentError || !assignment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Delivery assignment not found',
      });
    }

    if (assignment.orders.buyer_id !== ctx.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only rate deliveries for your orders',
      });
    }

    if (assignment.status !== 'delivered') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You can only rate completed deliveries',
      });
    }

    const { data: existingRating } = await supabase
      .from('logistics_ratings')
      .select('id')
      .eq('assignment_id', input.assignmentId)
      .eq('rater_user_id', ctx.user.id)
      .single();

    if (existingRating) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You have already rated this driver',
      });
    }

    const { data: rating, error: ratingError } = await supabase
      .from('logistics_ratings')
      .insert({
        rated_user_id: assignment.logistics_drivers.user_id,
        rater_user_id: ctx.user.id,
        assignment_id: input.assignmentId,
        role: 'driver',
        rating: input.rating,
        comment: input.comment,
      })
      .select()
      .single();

    if (ratingError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to submit rating: ${ratingError.message}`,
      });
    }

    return {
      success: true,
      rating,
    };
  });
