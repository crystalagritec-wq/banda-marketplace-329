import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

export const uploadDeliveryProofProcedure = protectedProcedure
  .input(z.object({
    assignmentId: z.string().uuid(),
    proofImages: z.array(z.string().url()),
    notes: z.string().optional(),
    recipientName: z.string().optional(),
    recipientSignature: z.string().url().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { data: assignment, error: assignmentError } = await supabase
      .from('logistics_assignments')
      .select('*, logistics_drivers!inner(user_id)')
      .eq('id', input.assignmentId)
      .single();

    if (assignmentError || !assignment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Delivery assignment not found',
      });
    }

    if (assignment.logistics_drivers.user_id !== ctx.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to upload proof for this delivery',
      });
    }

    const metadata = {
      proof_images: input.proofImages,
      proof_uploaded_at: new Date().toISOString(),
      proof_notes: input.notes,
      recipient_name: input.recipientName,
      recipient_signature: input.recipientSignature,
    };

    const { data, error } = await supabase
      .from('logistics_assignments')
      .update({
        notes: JSON.stringify(metadata),
        actual_delivery_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.assignmentId)
      .select()
      .single();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to upload delivery proof: ${error.message}`,
      });
    }

    return {
      success: true,
      assignment: data,
    };
  });
