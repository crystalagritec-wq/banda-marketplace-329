import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

export const uploadServiceProofProcedure = protectedProcedure
  .input(z.object({
    requestId: z.string().uuid(),
    proofImages: z.array(z.string().url()),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { data: request, error: requestError } = await supabase
      .from('service_requests')
      .select('*, service_providers!inner(user_id)')
      .eq('id', input.requestId)
      .single();

    if (requestError || !request) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Service request not found',
      });
    }

    if (request.service_providers.user_id !== ctx.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to upload proof for this request',
      });
    }

    const metadata = request.metadata || {};
    metadata.proof_images = input.proofImages;
    metadata.proof_uploaded_at = new Date().toISOString();
    if (input.notes) {
      metadata.proof_notes = input.notes;
    }

    const { data, error } = await supabase
      .from('service_requests')
      .update({
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.requestId)
      .select()
      .single();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to upload proof: ${error.message}`,
      });
    }

    return {
      success: true,
      request: data,
    };
  });
