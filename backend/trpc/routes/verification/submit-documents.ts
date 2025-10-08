import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const submitDocumentsProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
      roleType: z.string(),
      verificationMethod: z.enum(['ai_id', 'human_qr', 'admin_approval']),
      documents: z.array(
        z.object({
          type: z.string(),
          url: z.string(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Verification] Submitting documents for user:', input.userId);

    try {
      const { data: existingRequest, error: fetchError } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', input.userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error('Failed to check existing requests');
      }

      if (existingRequest) {
        return {
          success: false,
          error: 'You already have a pending verification request',
        };
      }

      const { error: insertError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: input.userId,
          role_type: input.roleType,
          verification_method: input.verificationMethod,
          documents: input.documents,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error('Failed to submit verification request');
      }

      const estimatedTime = input.verificationMethod === 'ai_id' 
        ? '5-10 minutes'
        : input.verificationMethod === 'human_qr'
        ? '1-2 business days'
        : '3-5 business days';

      return {
        success: true,
        message: 'Verification documents submitted successfully!',
        estimatedTime,
      };
    } catch (error: any) {
      console.error('[Verification] Submit documents error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to submit documents',
      };
    }
  });
