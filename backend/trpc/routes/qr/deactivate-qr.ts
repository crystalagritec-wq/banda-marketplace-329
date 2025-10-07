import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const deactivateQRProcedure = publicProcedure
  .input(z.object({
    qr_id: z.string(),
    reason: z.string().optional(),
    deactivated_by: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('deactivateQR:', input);
    
    try {
      // In a real implementation, this would:
      // 1. Update QR code status to inactive in Supabase
      // 2. Log the deactivation reason and user
      // 3. Notify relevant parties if needed
      // 4. Prevent future scans of this QR code
      
      // Mock validation - check if QR exists and is active
      const qrExists = true; // In real app, query database
      const isActive = true; // In real app, check current status
      const hasPermission = true; // In real app, check user permissions
      
      if (!qrExists) {
        throw new Error('QR code not found');
      }
      
      if (!isActive) {
        throw new Error('QR code is already inactive');
      }
      
      if (!hasPermission) {
        throw new Error('Insufficient permissions to deactivate this QR code');
      }
      
      const deactivationResult = {
        qr_id: input.qr_id,
        deactivated_at: new Date().toISOString(),
        deactivated_by: input.deactivated_by,
        reason: input.reason || 'Manual deactivation',
        previous_status: 'active',
        new_status: 'inactive',
        active: false,
      };
      
      console.log('QR code deactivated successfully:', deactivationResult);
      
      return {
        success: true,
        deactivation_result: deactivationResult,
        message: '🔒 QR code deactivated successfully'
      };
    } catch (error) {
      console.error('Error deactivating QR code:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        error: errorMessage,
        message: `❌ Failed to deactivate QR code: ${errorMessage}`
      };
    }
  });