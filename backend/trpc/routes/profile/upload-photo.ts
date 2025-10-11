import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

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
      const base64Data = input.photoBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileExt = input.mimeType.split('/')[1];
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, buffer, {
          contentType: input.mimeType,
          upsert: true,
        });

      if (uploadError) {
        console.error('❌ Error uploading to storage:', uploadError);
        throw new Error('Failed to upload photo to storage');
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const photoUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          photo_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Error updating user photo_url:', updateError);
        throw new Error('Failed to update profile photo URL');
      }

      console.log('✅ Profile photo uploaded successfully:', photoUrl);

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
