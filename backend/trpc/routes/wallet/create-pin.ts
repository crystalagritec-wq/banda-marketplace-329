import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import bcrypt from 'bcryptjs';

export const createPinProcedure = protectedProcedure
  .input(
    z.object({
      pin: z.string().length(4, 'PIN must be 4 digits').regex(/^\d{4}$/, 'PIN must contain only digits'),
      confirmPin: z.string().length(4, 'PIN must be 4 digits'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { pin, confirmPin } = input;
    const userId = ctx.user.id;

    console.log('🔐 Creating wallet PIN for user:', userId);

    try {
      if (pin !== confirmPin) {
        throw new Error('PINs do not match');
      }

      const { data: existingPin } = await ctx.supabase
        .from('wallet_pins')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingPin) {
        throw new Error('Wallet PIN already exists. Use reset PIN instead.');
      }

      const pinHash = await bcrypt.hash(pin, 10);

      const { error } = await ctx.supabase
        .from('wallet_pins')
        .insert({
          user_id: userId,
          pin_hash: pinHash,
        });

      if (error) {
        console.error('❌ PIN creation error:', error);
        throw new Error('Failed to create PIN');
      }

      console.log('✅ Wallet PIN created successfully');

      return {
        success: true,
        message: 'Wallet PIN created successfully',
      };

    } catch (error) {
      console.error('❌ Create PIN error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create PIN');
    }
  });
