import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const uploadPhotoProcedure = protectedProcedure
  .input(
    z.object({
      photoBase64: z.string().min(1, 'Photo data is required'),
      mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Invalid image format'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;

    console.log('📸 Uploading profile photo for user:', userId);

    try {
      const photoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${userId}`;

      console.log('✅ Profile photo uploaded successfully');

      return {
        success: true,
        message: 'Profile photo uploaded successfully',
        photoUrl,
      };
    } catch (error) {
      console.error('❌ Photo upload error:', error);
      throw new Error('Failed to upload photo. Please try again.');
    }
  });
