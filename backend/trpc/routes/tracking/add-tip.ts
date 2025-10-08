import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const addTipProcedure = publicProcedure
  .input(
    z.object({
      orderId: z.string(),
      userId: z.string(),
      driverId: z.string(),
      amount: z.number().min(0),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log('💰 Adding tip:', input);

      const { error: tipError } = await supabase
        .from('driver_tips')
        .insert({
          order_id: input.orderId,
          user_id: input.userId,
          driver_id: input.driverId,
          amount: input.amount,
        });

      if (tipError) {
        console.error('Tip insert error:', tipError);
        throw new Error('Failed to add tip');
      }

      const { error: walletError } = await supabase.rpc('credit_driver_wallet', {
        p_driver_id: input.driverId,
        p_amount: input.amount,
        p_description: `Tip from order ${input.orderId}`,
      });

      if (walletError) {
        console.error('Wallet credit error:', walletError);
      }

      return {
        success: true,
        message: 'Tip added successfully',
      };
    } catch (error: any) {
      console.error('Add tip error:', error);
      throw new Error(error.message || 'Failed to add tip');
    }
  });
