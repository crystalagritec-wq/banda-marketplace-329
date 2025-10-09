import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';

export const getLiveTrackingProcedure = protectedProcedure
  .input(
    z.object({
      assignmentId: z.string().uuid(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { supabase, user } = ctx;

    const { data: assignment, error: assignmentError } = await supabase
      .from('logistics_assignments')
      .select(`
        *,
        provider:logistics_providers (
          id,
          name,
          phone,
          vehicle_type,
          current_location,
          rating
        ),
        order:orders (
          id,
          buyer_id,
          seller_id,
          total_amount
        )
      `)
      .eq('id', input.assignmentId)
      .single();

    if (assignmentError || !assignment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Delivery assignment not found',
      });
    }

    const isBuyer = assignment.order?.buyer_id === user.id;
    const isSeller = assignment.order?.seller_id === user.id;
    const isDriver = assignment.provider?.id && 
      (await supabase
        .from('logistics_providers')
        .select('id')
        .eq('id', assignment.provider.id)
        .eq('user_id', user.id)
        .single()).data;

    if (!isBuyer && !isSeller && !isDriver) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to track this delivery',
      });
    }

    return {
      assignment,
      currentLocation: assignment.provider?.current_location,
      pickupLocation: assignment.pickup_location,
      deliveryLocation: assignment.delivery_location,
      status: assignment.status,
      eta: assignment.eta,
      distance: assignment.distance_km,
      estimatedDuration: assignment.estimated_duration,
    };
  });
