import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const addDeliveryInstructionsProcedure = publicProcedure
  .input(
    z.object({
      orderId: z.string(),
      instructions: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('📝 Adding delivery instructions:', input);

      const { error } = await supabase
        .from('orders')
        .update({
          delivery_instructions: input.instructions,
        })
        .eq('id', input.orderId);

      if (error) {
        console.error('Instructions update error:', error);
        throw new Error('Failed to add instructions');
      }

      return {
        success: true,
        message: 'Instructions added successfully',
      };
    } catch (error: any) {
      console.error('Add delivery instructions error:', error);
      throw new Error(error.message || 'Failed to add delivery instructions');
    }
  });
