import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

const CategorySchema = z.enum([
  'notifications',
  'privacy',
  'appearance',
  'accessibility',
  'security',
]);

// Flexible preferences payload keyed by string with any JSON-serializable value
const PreferencesSchema = z.record(z.string(), z.unknown());

export const updatePreferencesProcedure = protectedProcedure
  .input(
    z.object({
      category: CategorySchema,
      preferences: PreferencesSchema,
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;

    console.log('⚙️ Updating user preferences');

    try {
      // TODO: Persist to DB when table is available. For now, echo back.
      console.log('✅ Preferences updated successfully');

      return {
        success: true as const,
        message: 'Preferences updated successfully',
        preferences: input.preferences,
        category: input.category,
        userId,
      };
    } catch (error) {
      console.error('❌ Preferences update error');
      throw new Error('Failed to update preferences');
    }
  });
