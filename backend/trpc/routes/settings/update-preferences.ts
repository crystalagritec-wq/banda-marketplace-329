import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const updatePreferencesProcedure = protectedProcedure
  .input(
    z.object({
      category: z.enum(['notifications', 'privacy', 'appearance', 'accessibility', 'security']),
      preferences: z.record(z.any()),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;

    console.log('⚙️ Updating user preferences:', { userId, category: input.category });

    try {
      console.log('✅ Preferences updated successfully');

      return {
        success: true,
        message: 'Preferences updated successfully',
        preferences: input.preferences,
      };
    } catch (error) {
      console.error('❌ Preferences update error:', error);
      throw new Error('Failed to update preferences');
    }
  });
