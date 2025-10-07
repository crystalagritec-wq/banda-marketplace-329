import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const raiseDisputeProcedure = publicProcedure
  .input(z.object({
    order_id: z.string(),
    user_id: z.string(),
    reason: z.string(),
    evidence_url: z.string().optional(),
    description: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('raiseDispute:', input);
    
    try {
      // In a real implementation, this would:
      // 1. Create a new dispute record in the database
      // 2. Update order status to 'disputed'
      // 3. Notify relevant parties (seller, driver, support team)
      // 4. Generate dispute QR code for agent verification
      
      const disputeId = `dispute_${Date.now()}`;
      
      const dispute = {
        id: disputeId,
        order_id: input.order_id,
        user_id: input.user_id,
        reason: input.reason,
        description: input.description,
        evidence_url: input.evidence_url,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Generate dispute QR for agent verification
        qr_code: {
          id: `qr_dispute_${Date.now()}`,
          verification_code: `DISPUTE_${disputeId.slice(-6).toUpperCase()}`,
          download_url: `https://api.banda.com/qr/dispute/${disputeId}.png`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        },
        
        // Estimated resolution time
        estimated_resolution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
        
        // Support contact info
        support_contact: {
          phone: '+254700123456',
          email: 'disputes@banda.com',
          hours: '8:00 AM - 6:00 PM, Mon-Fri'
        }
      };
      
      console.log('Dispute raised successfully:', dispute.id);
      
      return {
        success: true,
        dispute: dispute,
        message: 'Dispute raised successfully. Our team will review it within 24 hours.'
      };
    } catch (error) {
      console.error('Error raising dispute:', error);
      throw new Error('Failed to raise dispute');
    }
  });