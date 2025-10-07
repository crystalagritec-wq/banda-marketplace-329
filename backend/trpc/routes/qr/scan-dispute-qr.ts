import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const scanDisputeQRProcedure = publicProcedure
  .input(z.object({
    qr_value: z.string(), // Can be QR data or fallback code
    agent_id: z.string(),
    gps_location: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    device_info: z.string().optional(),
    resolution_notes: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('scanDisputeQR:', input);
    
    try {
      // Parse QR data or fallback code
      let qrData;
      let disputeId;
      
      try {
        // Try to parse as JSON QR data
        qrData = JSON.parse(input.qr_value);
        disputeId = qrData.dispute_id || qrData.related_id;
      } catch {
        // Try fallback code format
        if (input.qr_value.startsWith('DISPUTE-')) {
          disputeId = input.qr_value.split('-')[1];
          qrData = {
            type: 'dispute',
            dispute_id: disputeId,
            fallback_code: input.qr_value,
          };
        } else {
          throw new Error('Invalid dispute QR code format');
        }
      }
      
      if (!disputeId) {
        throw new Error('Dispute ID not found in QR code');
      }
      
      // In a real implementation, this would:
      // 1. Verify agent has permission to handle disputes
      // 2. Load dispute details from Supabase
      // 3. Update dispute status to 'investigating'
      // 4. Log agent scan with GPS location and device info
      // 5. Create audit trail for dispute resolution
      
      // Mock validation
      const isAuthorizedAgent = true; // In real app, check agent permissions
      const disputeExists = true; // In real app, query database
      const disputeIsOpen = true; // In real app, check dispute status
      
      if (!isAuthorizedAgent) {
        throw new Error('Agent not authorized to handle disputes');
      }
      
      if (!disputeExists) {
        throw new Error('Dispute not found');
      }
      
      if (!disputeIsOpen) {
        throw new Error('Dispute is already resolved or closed');
      }
      
      const disputeVerification = {
        scan_id: `scan_${Date.now()}`,
        dispute_id: disputeId,
        agent_id: input.agent_id,
        verified_at: new Date().toISOString(),
        gps_location: input.gps_location,
        device_info: input.device_info,
        previous_status: 'open',
        new_status: 'investigating',
        verification_code: `DISPUTE_${disputeId.slice(-6).toUpperCase()}`,
        resolution_notes: input.resolution_notes,
      };
      
      // Mock comprehensive dispute details
      const disputeDetails = {
        dispute_id: disputeId,
        order_id: `order_${Math.random().toString(36).substr(2, 8)}`,
        dispute_type: 'quality',
        reason: 'Product quality does not match description',
        evidence_urls: [
          'https://banda.com/evidence/photo1.jpg',
          'https://banda.com/evidence/photo2.jpg',
          'https://banda.com/evidence/video1.mp4'
        ],
        raised_by: 'buyer_123',
        raised_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'investigating',
        order_details: {
          order_number: 'BND-ORD123',
          total_amount: 3500,
          items: [
            { name: '10kg Premium Rice', quantity: 2, unit_price: 1200 },
            { name: '5kg Green Beans', quantity: 1, unit_price: 800 }
          ],
          seller_info: {
            name: 'Fresh Farm Supplies',
            location: 'Nakuru',
            rating: 4.8
          }
        },
        timeline: [
          {
            status: 'raised',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            message: 'Dispute raised by buyer',
            actor: 'buyer_123'
          },
          {
            status: 'investigating',
            timestamp: new Date().toISOString(),
            message: 'Banda agent started investigation',
            actor: input.agent_id
          }
        ]
      };
      
      console.log('Dispute QR scanned successfully:', disputeVerification);
      
      return {
        success: true,
        scan_result: disputeVerification,
        dispute_details: disputeDetails,
        qr_data: qrData,
        available_actions: [
          'add_notes',
          'request_evidence',
          'contact_parties',
          'schedule_inspection',
          'resolve_dispute',
          'escalate_dispute'
        ],
        message: '⚖️ Dispute QR code scanned successfully - Investigation started'
      };
    } catch (error) {
      console.error('Error scanning dispute QR code:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed scan attempt
      const failedScan = {
        scan_id: `scan_${Date.now()}`,
        agent_id: input.agent_id,
        qr_value: input.qr_value,
        gps_location: input.gps_location,
        device_info: input.device_info,
        success: false,
        error: errorMessage,
        scanned_at: new Date().toISOString(),
      };
      
      return {
        success: false,
        scan_result: failedScan,
        error: errorMessage,
        message: `🚫 Failed to scan dispute QR code: ${errorMessage}`
      };
    }
  });