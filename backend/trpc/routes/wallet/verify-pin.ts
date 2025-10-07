import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import bcrypt from 'bcryptjs';

export const verifyPinProcedure = protectedProcedure
  .input(
    z.object({
      pin: z.string().length(4, 'PIN must be 4 digits'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { pin } = input;
    const userId = ctx.user.id;

    console.log('🔍 Verifying wallet PIN for user:', userId);

    try {
      const { data: pinData, error: pinError } = await ctx.supabase
        .from('wallet_pins')
        .select('pin_hash')
        .eq('user_id', userId)
        .single();

      if (pinError || !pinData) {
        throw new Error('Wallet PIN not set');
      }

      const isPinValid = await bcrypt.compare(pin, pinData.pin_hash);

      if (!isPinValid) {
        console.log('❌ Invalid PIN attempt');
        return {
          success: false,
          valid: false,
          message: 'Invalid PIN',
        };
      }

      console.log('✅ PIN verified successfully');

      return {
        success: true,
        valid: true,
        message: 'PIN verified successfully',
      };

    } catch (error) {
      console.error('❌ Verify PIN error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to verify PIN');
    }
  });
