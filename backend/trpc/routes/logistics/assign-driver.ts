import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { TRPCError } from '@trpc/server';

export const assignDriverProcedure = protectedProcedure
  .input(z.object({
    assignmentId: z.string().uuid(),
    driverId: z.string().uuid(),
    vehicleId: z.string().uuid().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { supabase } = ctx;

    const { data: driver, error: driverError } = await supabase
      .from('logistics_drivers')
      .select('*')
      .eq('id', input.driverId)
      .eq('verified', true)
      .eq('availability', 'active')
      .single();

    if (driverError || !driver) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Driver not found or not available',
      });
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from('logistics_assignments')
      .update({
        driver_id: input.driverId,
        vehicle_id: input.vehicleId,
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.assignmentId)
      .select()
      .single();

    if (assignmentError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to assign driver: ${assignmentError.message}`,
      });
    }

    await supabase
      .from('logistics_drivers')
      .update({
        availability: 'idle',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.driverId);

    return {
      success: true,
      assignment,
    };
  });
