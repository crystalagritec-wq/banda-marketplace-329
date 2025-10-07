import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export const verifyDeliveryQRProcedure = protectedProcedure
  .input(z.object({
    qrCode: z.string(),
    buyerId: z.string()
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('✅ Verifying delivery QR code:', input.qrCode);

      // Find the QR code and verify it's valid
      const { data: qrRecord, error: qrError } = await supabase
        .from('logistics_qr_codes')
        .select(`
          *,
          logistics_assignments!inner(
            id, order_id, provider_id, status,
            orders!inner(buyer_id)
          )
        `)
        .eq('code', input.qrCode)
        .eq('verified', false)
        .single();

      if (qrError || !qrRecord) {
        throw new Error('Invalid or already used QR code');
      }

      // Check if QR code has expired
      if (new Date(qrRecord.expires_at) < new Date()) {
        throw new Error('QR code has expired');
      }

      // Verify the buyer is authorized to use this QR code
      if (qrRecord.logistics_assignments.orders.buyer_id !== input.buyerId) {
        throw new Error('Unauthorized: This QR code is not for your order');
      }

      // Mark QR code as verified
      const { error: updateQRError } = await supabase
        .from('logistics_qr_codes')
        .update({ verified: true })
        .eq('id', qrRecord.id);

      if (updateQRError) {
        throw new Error(`Failed to verify QR code: ${updateQRError.message}`);
      }

      // Update assignment status to delivered
      const { error: updateAssignmentError } = await supabase
        .from('logistics_assignments')
        .update({ status: 'delivered' })
        .eq('id', qrRecord.assignment_id);

      if (updateAssignmentError) {
        throw new Error(`Failed to update delivery status: ${updateAssignmentError.message}`);
      }

      // Release escrow funds
      const { error: escrowError } = await supabase
        .from('logistics_escrows')
        .update({ status: 'released' })
        .eq('assignment_id', qrRecord.assignment_id);

      if (escrowError) {
        console.warn('⚠️ Warning: Failed to release escrow:', escrowError);
      }

      // Update payout status to pending (ready for withdrawal)
      const { error: payoutError } = await supabase
        .from('logistics_payouts')
        .update({ status: 'pending' })
        .eq('assignment_id', qrRecord.assignment_id);

      if (payoutError) {
        console.warn('⚠️ Warning: Failed to update payout status:', payoutError);
      }

      // Update order status to delivered
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', qrRecord.logistics_assignments.order_id);

      if (orderError) {
        console.warn('⚠️ Warning: Failed to update order status:', orderError);
      }

      return {
        success: true,
        message: 'Delivery confirmed successfully! Funds have been released to the provider.',
        assignmentId: qrRecord.assignment_id,
        orderId: qrRecord.logistics_assignments.order_id
      };
    } catch (error: any) {
      console.error('❌ Error in verifyDeliveryQRProcedure:', error);
      throw new Error(error.message || 'Failed to verify delivery');
    }
  });