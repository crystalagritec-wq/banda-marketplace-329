import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const updateProfileProcedure = protectedProcedure
  .input(
    z.object({
      fullName: z.string().min(1, 'Full name is required').optional(),
      email: z.string().email('Invalid email format').optional(),
      phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
      location: z.string().optional(),
      bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
      profilePictureUrl: z.string().url('Invalid URL format').optional(),
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
      // In production, update user profile in Supabase
      // const { data, error } = await supabase
      //   .from('users')
      //   .update({
      //     full_name: updateData.fullName,
      //     email: updateData.email,
      //     phone: updateData.phone,
      //     location: updateData.location,
      //     bio: updateData.bio,
      //     photo_url: updateData.profilePictureUrl,
      //     updated_at: new Date().toISOString(),
      //   })
      //   .eq('user_id', userId)
      //   .select()
      //   .single();

      // For now, simulate successful update
      const updatedProfile = {
        id: userId,
        fullName: updateData.fullName || 'John Farmer',
        email: updateData.email || 'john@example.com',
        phone: updateData.phone || '+254705256259',
        location: updateData.location || 'Nairobi, Kenya',
        bio: updateData.bio || 'Passionate farmer committed to sustainable agriculture',
        profilePictureUrl: updateData.profilePictureUrl || null,
        updatedAt: new Date().toISOString(),
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