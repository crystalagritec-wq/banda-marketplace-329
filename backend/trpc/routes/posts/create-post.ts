import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const createPostProcedure = protectedProcedure
  .input(z.object({
    type: z.enum(['product', 'service', 'request']),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string(),
    price: z.number().optional(),
    quantity: z.number().optional(),
    unit: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    location: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isDraft: z.boolean().default(false)
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('📝 Creating post for:', userId);

    try {
      const { data, error } = await ctx.supabase.rpc('create_user_post', {
        p_user_id: userId,
        p_type: input.type,
        p_title: input.title,
        p_description: input.description,
        p_category: input.category,
        p_price: input.price || null,
        p_quantity: input.quantity || null,
        p_unit: input.unit || null,
        p_images: input.images ? JSON.stringify(input.images) : null,
        p_location: input.location || null,
        p_tags: input.tags ? JSON.stringify(input.tags) : null,
        p_is_draft: input.isDraft
      });

      if (error) {
        console.error('❌ Create post error:', error);
        throw new Error('Failed to create post');
      }

      console.log('✅ Post created successfully');
      
      return {
        success: true,
        message: input.isDraft ? 'Draft saved successfully' : 'Post created successfully',
        postId: data?.post_id
      };

    } catch (error) {
      console.error('❌ Create post error:', error);
      throw new Error('Failed to create post');
    }
  });