import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const changePhoneProcedure = protectedProcedure
  .input(
    z.object({
      newPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
      otp: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;

    console.log('📱 Changing phone number for user:', userId);

    try {
      if (!input.otp) {
        const { error } = await supabase.auth.updateUser({
          phone: input.newPhone,
        });

        if (error) {
          console.error('❌ Failed to send OTP:', error);
          throw new Error('Failed to send verification code');
        }

        console.log('✅ OTP sent to new phone number');
        return {
          success: true,
          message: 'Verification code sent to your new phone number',
          requiresOtp: true,
        };
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: input.newPhone,
        token: input.otp,
        type: 'phone_change',
      });

      if (error) {
        console.error('❌ OTP verification failed:', error);
        throw new Error('Invalid verification code');
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ phone: input.newPhone })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Failed to update phone in users table:', updateError);
      }

      console.log('✅ Phone number changed successfully');

      return {
        success: true,
        message: 'Phone number updated successfully',
        requiresOtp: false,
        user: data.user,
      };
    } catch (error: any) {
      console.error('❌ Phone change error:', error);
      throw new Error(error.message || 'Failed to change phone number');
    }
  });
