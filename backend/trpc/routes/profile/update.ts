import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const updateProfileProcedure = protectedProcedure
  .input(
    z.object({
      fullName: z.string().min(1, 'Full name is required').optional(),
      email: z.string().email('Invalid email format').optional(),
      phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
      location: z.string().optional(),
      bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
      profilePictureUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
    const userId = ctx.user.id;
    const updateData = input;

    console.log('👤 Updating user profile:', {
      userId,
      updateData,
    });

    try {
      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateData.fullName !== undefined) {
        updatePayload.full_name = updateData.fullName;
      }
      if (updateData.email !== undefined) {
        updatePayload.email = updateData.email;
      }
      if (updateData.phone !== undefined) {
        updatePayload.phone = updateData.phone;
      }
      if (updateData.location !== undefined) {
        updatePayload.location = updateData.location;
      }
      if (updateData.profilePictureUrl !== undefined) {
        updatePayload.photo_url = updateData.profilePictureUrl;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user profile:', error);
        throw new Error('Failed to update profile in database');
      }

      const updatedProfile = {
        id: data.user_id,
        fullName: data.full_name || 'User',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        bio: updateData.bio || '',
        profilePictureUrl: data.photo_url || null,
        avatarUrl: data.photo_url || null,
        updatedAt: data.updated_at,
      };

      console.log('✅ Profile updated successfully:', updatedProfile);

      return {
        success: true,
        message: 'Profile updated successfully',
        profile: updatedProfile,
      };

    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw new Error('Failed to update profile. Please try again.');
    }
  });