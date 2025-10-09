import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

export const rateServiceProviderProcedure = protectedProcedure
  .input(z.object({
    requestId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    review: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { data: request, error: requestError } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', input.requestId)
      .single();

    if (requestError || !request) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Service request not found',
      });
    }

    if (request.requester_id !== ctx.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only rate requests you created',
      });
    }

    if (request.status !== 'completed') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You can only rate completed requests',
      });
    }

    if (request.provider_rating) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You have already rated this service provider',
      });
    }

    const { data, error } = await supabase
      .from('service_requests')
      .update({
        provider_rating: input.rating,
        provider_review: input.review,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.requestId)
      .select()
      .single();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to submit rating: ${error.message}`,
      });
    }

    return {
      success: true,
      request: data,
    };
  });
