import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const enable2FAProcedure = protectedProcedure
  .input(
    z.object({
      method: z.enum(['sms', 'app', 'email']),
      phone: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;

    console.log('🔐 Enabling 2FA:', { userId, method: input.method });

    try {
      const secret = 'JBSWY3DPEHPK3PXP';
      const qrCodeUrl = `otpauth://totp/Banda:${userId}?secret=${secret}&issuer=Banda`;

      console.log('✅ 2FA setup initiated');

      return {
        success: true,
        message: '2FA setup initiated',
        secret,
        qrCodeUrl,
        backupCodes: [
          '1234-5678',
          '2345-6789',
          '3456-7890',
          '4567-8901',
          '5678-9012',
        ],
      };
    } catch (error) {
      console.error('❌ 2FA setup error:', error);
      throw new Error('Failed to setup 2FA');
    }
  });
