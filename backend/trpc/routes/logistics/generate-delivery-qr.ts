import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const generateDeliveryQRProcedure = protectedProcedure
  .input(z.object({
    assignmentId: z.string(),
    providerId: z.string()
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('🔗 Generating delivery QR code for:', input);

      // Verify the assignment belongs to the provider
      const { data: assignment, error: assignmentError } = await supabase
        .from('logistics_assignments')
        .select('id, status, provider_id')
        .eq('id', input.assignmentId)
        .eq('provider_id', input.providerId)
        .single();

      if (assignmentError || !assignment) {
        throw new Error('Assignment not found or unauthorized');
      }

      if (assignment.status !== 'in_progress') {
        throw new Error('QR code can only be generated for deliveries in progress');
      }

      // Generate unique QR code
      const qrCode = `BANDA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

      // Insert QR code record
      const { error: qrError } = await supabase
        .from('logistics_qr_codes')
        .insert([{
          assignment_id: input.assignmentId,
          code: qrCode,
          expires_at: expiresAt.toISOString(),
          verified: false
        }])
        .select()
        .single();

      if (qrError) {
        console.error('❌ Error creating QR code:', qrError);
        throw new Error(`Failed to generate QR code: ${qrError.message}`);
      }

      return {
        success: true,
        qrCode: qrCode,
        expiresAt: expiresAt.toISOString(),
        assignmentId: input.assignmentId
      };
    } catch (error: any) {
      console.error('❌ Error in generateDeliveryQRProcedure:', error);
      throw new Error(error.message || 'Failed to generate QR code');
    }
  });