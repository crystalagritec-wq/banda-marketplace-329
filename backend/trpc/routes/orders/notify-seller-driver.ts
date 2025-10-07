import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const notifySellerDriverProcedure = publicProcedure
  .input(z.object({
    order_id: z.string(),
    seller_ids: z.array(z.string()),
    message: z.string(),
    notification_type: z.enum(['sms', 'email', 'push', 'all']).optional().default('all'),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('notifySellerDriver:', input);
    
    try {
      const notifications = [];
      
      // Notify each seller
      for (const sellerId of input.seller_ids) {
        const notification = {
          id: `notif_${Date.now()}_${sellerId}`,
          recipient_id: sellerId,
          recipient_type: 'seller',
          order_id: input.order_id,
          message: input.message,
          notification_type: input.notification_type,
          status: 'sent',
          created_at: new Date().toISOString(),
        };
        
        notifications.push(notification);
        
        // In a real implementation, this would:
        // 1. Send SMS via SMS provider (e.g., Twilio, Africa's Talking)
        // 2. Send email via email service
        // 3. Send push notification
        // 4. Create in-app notification
        console.log(`Notification sent to seller ${sellerId}:`, notification);
      }
      
      // Also notify assigned driver if available
      const driverNotification = {
        id: `notif_${Date.now()}_driver`,
        recipient_type: 'driver',
        order_id: input.order_id,
        message: `New delivery assignment for order ${input.order_id}`,
        notification_type: input.notification_type,
        status: 'sent',
        created_at: new Date().toISOString(),
      };
      
      notifications.push(driverNotification);
      console.log('Driver notification sent:', driverNotification);
      
      return {
        success: true,
        notifications_sent: notifications.length,
        notifications: notifications,
        message: 'Seller and driver notifications sent successfully'
      };
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw new Error('Failed to send notifications');
    }
  });