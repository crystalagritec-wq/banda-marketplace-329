import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const scanQRProcedure = publicProcedure
  .input(z.object({
    qr_value: z.string(),
    user_id: z.string(),
    gps_location: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    device_info: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('scanQR:', input);
    
    try {
      // Parse QR data
      let qrData;
      try {
        qrData = JSON.parse(input.qr_value);
      } catch {
        // Try fallback code format
        if (input.qr_value.includes('-')) {
          const [type, code] = input.qr_value.split('-');
          qrData = {
            type: type.toLowerCase(),
            fallback_code: input.qr_value,
            signature: code,
          };
        } else {
          throw new Error('Invalid QR code format');
        }
      }

      // Validate QR code
      if (!qrData.type || !qrData.signature) {
        throw new Error('Invalid QR code data');
      }

      // Check if QR is expired (mock check)
      const isExpired = false; // In real implementation, check against database

      if (isExpired) {
        throw new Error('QR code has expired');
      }

      // Log the scan
      const scanLog = {
        scan_id: `scan_${Date.now()}`,
        qr_id: qrData.id || 'fallback',
        scanned_by: input.user_id,
        gps_location: input.gps_location,
        device_info: input.device_info,
        success: true,
        scanned_at: new Date().toISOString(),
      };

      // Determine action based on QR type
      let actionResult;
      switch (qrData.type) {
        case 'order':
          actionResult = await handleOrderQRScan(qrData, input.user_id);
          break;
        case 'delivery':
          actionResult = await handleDeliveryQRScan(qrData, input.user_id);
          break;
        case 'user':
          actionResult = await handleUserQRScan(qrData, input.user_id);
          break;
        case 'receipt':
          actionResult = await handleReceiptQRScan(qrData, input.user_id);
          break;
        case 'dispute':
          actionResult = await handleDisputeQRScan(qrData, input.user_id);
          break;
        default:
          throw new Error('Unknown QR code type');
      }

      console.log('QR scan processed successfully:', actionResult);
      
      return {
        success: true,
        scan_log: scanLog,
        action_result: actionResult,
        message: `${qrData.type} QR code scanned successfully`
      };
    } catch (error) {
      console.error('Error scanning QR code:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed scan
      const failedScanLog = {
        scan_id: `scan_${Date.now()}`,
        qr_id: 'unknown',
        scanned_by: input.user_id,
        gps_location: input.gps_location,
        device_info: input.device_info,
        success: false,
        reason: errorMessage,
        scanned_at: new Date().toISOString(),
      };

      return {
        success: false,
        scan_log: failedScanLog,
        error: errorMessage,
        message: 'Failed to scan QR code'
      };
    }
  });

// Helper functions for different QR types
async function handleOrderQRScan(qrData: any, userId: string) {
  // Handle order pickup, delivery, or verification
  const orderAction = qrData.role === 'driver' ? 'pickup' : 'delivery';
  
  return {
    type: 'order_action',
    action: orderAction,
    order_id: qrData.order_id,
    status_update: orderAction === 'pickup' ? 'shipped' : 'delivered',
    reserve_action: orderAction === 'delivery' ? 'released' : null,
    timestamp: new Date().toISOString(),
  };
}

async function handleDeliveryQRScan(qrData: any, userId: string) {
  // Handle driver verification
  return {
    type: 'driver_verification',
    driver_id: qrData.driver_id,
    verified: true,
    timestamp: new Date().toISOString(),
  };
}

async function handleUserQRScan(qrData: any, userId: string) {
  // Handle user verification
  return {
    type: 'user_verification',
    user_id: qrData.user_id,
    tier: qrData.tier || 'basic',
    verified: true,
    timestamp: new Date().toISOString(),
  };
}

async function handleReceiptQRScan(qrData: any, userId: string) {
  // Handle receipt verification
  return {
    type: 'receipt_verification',
    receipt_id: qrData.receipt_id,
    order_id: qrData.order_id,
    reserve_status: qrData.reserve_status,
    verified: true,
    timestamp: new Date().toISOString(),
  };
}

async function handleDisputeQRScan(qrData: any, userId: string) {
  // Handle dispute verification by agent
  return {
    type: 'dispute_verification',
    dispute_id: qrData.dispute_id,
    agent_id: userId,
    verified: true,
    timestamp: new Date().toISOString(),
  };
}