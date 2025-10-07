import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const validateFallbackProcedure = publicProcedure
  .input(z.object({
    order_id: z.string(),
    fallback_code: z.string(),
    user_id: z.string(),
    gps_location: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    device_info: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('validateFallback:', input);
    
    try {
      // In a real implementation, this would:
      // 1. Query Supabase for the fallback code
      // 2. Verify it matches the order and user
      // 3. Check if it's still valid (not expired)
      // 4. Log the validation attempt
      // 5. Trigger the same actions as QR scan
      
      // Mock validation logic with enhanced checks
      const isValidFormat = /^[A-Z]+-[A-Z0-9]{6}$/.test(input.fallback_code);
      const isAuthorized = true; // In real app, check if user is buyer/seller/driver
      const isExpired = false; // In real app, check expiry time from database
      const isActive = true; // In real app, check if QR code is still active
      
      if (!isValidFormat) {
        throw new Error('Invalid fallback code format');
      }
      
      if (!isAuthorized) {
        throw new Error('User not authorized for this order');
      }
      
      if (isExpired) {
        throw new Error('Fallback code has expired');
      }
      
      if (!isActive) {
        throw new Error('Fallback code has been deactivated');
      }
      
      // Mock QR data for fallback validation
      const qrData = {
        type: 'order',
        id: `qr_${Date.now()}`,
        related_id: input.order_id,
        order_id: input.order_id,
        fallback_code: input.fallback_code,
        role: 'buyer', // Determine from user context
        timestamp: new Date().toISOString(),
      };
      
      // Process the same way as QR scan
      const actionResult = {
        type: 'order_action',
        action: 'fallback_validation',
        order_id: input.order_id,
        status_update: 'validated',
        method: 'fallback',
        timestamp: new Date().toISOString(),
      };
      
      // Mock validation log
      const validationResult = {
        validation_id: `val_${Date.now()}`,
        qr_id: qrData.id,
        order_id: input.order_id,
        fallback_code: input.fallback_code,
        validated_by: input.user_id,
        validation_method: 'fallback',
        gps_location: input.gps_location,
        device_info: input.device_info,
        success: true,
        action_result: actionResult,
        validated_at: new Date().toISOString(),
      };
      
      console.log('Fallback code validated successfully:', qrData);
      
      return {
        success: true,
        validation: validationResult,
        action_result: actionResult,
        qr_data: qrData,
        message: '✅ Fallback code validated successfully'
      };
    } catch (error) {
      console.error('Error validating fallback code:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed validation attempt
      const failedValidation = {
        validation_id: `val_${Date.now()}`,
        order_id: input.order_id,
        fallback_code: input.fallback_code,
        validated_by: input.user_id,
        validation_method: 'fallback',
        gps_location: input.gps_location,
        device_info: input.device_info,
        success: false,
        error: errorMessage,
        validated_at: new Date().toISOString(),
      };
      
      return {
        success: false,
        validation: failedValidation,
        error: errorMessage,
        message: `🚫 ${errorMessage}`
      };
    }
  });