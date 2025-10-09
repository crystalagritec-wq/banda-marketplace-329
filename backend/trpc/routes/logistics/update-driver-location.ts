import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';

export const updateDriverLocationProcedure = protectedProcedure
  .input(
    z.object({
      assignmentId: z.string().uuid(),
      location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional(),
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx;

    const { data: provider, error: providerError } = await supabase
      .from('logistics_providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (providerError || !provider) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Logistics provider profile not found',
      });
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from('logistics_assignments')
      .select('*')
      .eq('id', input.assignmentId)
      .eq('provider_id', provider.id)
      .single();

    if (assignmentError || !assignment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Delivery assignment not found',
      });
    }

    await supabase
      .from('logistics_providers')
      .update({
        current_location: input.location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', provider.id);

    console.log(`Driver location updated for assignment ${input.assignmentId}`);

    return {
      success: true,
      location: input.location,
    };
  });
