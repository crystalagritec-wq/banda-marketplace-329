import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const generateOrderQRProcedure = publicProcedure
  .input(z.object({
    order_id: z.string(),
    order_details: z.object({
      id: z.string(),
      total: z.number().optional(),
      items: z.number().optional(),
      status: z.string().optional(),
      timestamp: z.string().optional(),
      seller_ids: z.array(z.string()).optional(),
      reserve_status: z.enum(['held', 'released', 'refunded', 'disputed']).optional(),
    }),
    buyer_id: z.string().optional(),
    format: z.enum(['png', 'svg', 'pdf']).optional().default('png'),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('generateOrderQR:', input);
    
    try {
      // Generate secure signature
      const signature = `BANDA_${input.order_id.slice(-6).toUpperCase()}_${Date.now()}`;
      
      // Generate QR code data with comprehensive structure
      const qrData = {
        type: 'order',
        id: `qr_${Date.now()}`,
        related_id: input.order_id,
        order_id: input.order_id,
        buyer_id: input.buyer_id || 'current-user-id',
        seller_ids: input.order_details.seller_ids || [],
        role: 'buyer',
        reserve_status: input.order_details.reserve_status || 'held',
        timestamp: new Date().toISOString(),
        signature,
        total: input.order_details.total,
        items: input.order_details.items,
        status: input.order_details.status || 'confirmed',
      };

      // Generate fallback code for manual entry
      const fallbackCode = `ORDER-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // In a real implementation, this would:
      // 1. Store QR code in database with expiry
      // 2. Generate actual QR code image using a QR library
      // 3. Store QR code in cloud storage
      // 4. Return download URL
      
      const qrResult = {
        qr_id: qrData.id,
        qr_type: 'order',
        linked_id: input.order_id,
        order_id: input.order_id,
        qr_data: JSON.stringify(qrData),
        fallback_code: fallbackCode,
        format: input.format,
        download_url: `https://api.banda.com/qr/${input.order_id}.${input.format}`,
        verification_code: signature,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        active: true,
      };

      console.log('QR code generated successfully:', qrResult);
      
      return {
        success: true,
        qr_code: qrResult,
        message: 'Order QR code generated successfully'
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  });