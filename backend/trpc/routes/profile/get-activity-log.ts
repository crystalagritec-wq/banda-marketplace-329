import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const getActivityLogProcedure = protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      type: z.enum(['all', 'order', 'payment', 'security', 'profile', 'system']).default('all'),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const userId = ctx.user.id;

    console.log('📋 Fetching activity log:', { userId, ...input });

    try {
      const mockActivities = [
        {
          id: '1',
          type: 'order',
          title: 'Order #1234 placed',
          description: 'Placed order for 50kg maize',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metadata: { orderId: '1234', amount: 5000 },
          ipAddress: '192.168.1.1',
          device: 'iPhone 14 Pro',
          location: 'Nairobi, Kenya',
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment successful',
          description: 'Paid KSh 5,000 via M-Pesa',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          metadata: { transactionId: 'MPESA123', amount: 5000 },
          ipAddress: '192.168.1.1',
          device: 'iPhone 14 Pro',
          location: 'Nairobi, Kenya',
        },
        {
          id: '3',
          type: 'security',
          title: 'Password changed',
          description: 'Account password was updated',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          metadata: {},
          ipAddress: '192.168.1.2',
          device: 'MacBook Pro',
          location: 'Nairobi, Kenya',
        },
        {
          id: '4',
          type: 'profile',
          title: 'Profile updated',
          description: 'Updated profile information',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          metadata: { fields: ['name', 'phone'] },
          ipAddress: '192.168.1.1',
          device: 'iPhone 14 Pro',
          location: 'Nairobi, Kenya',
        },
        {
          id: '5',
          type: 'system',
          title: 'Login successful',
          description: 'Logged in from new device',
          timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          metadata: {},
          ipAddress: '192.168.1.3',
          device: 'iPad Air',
          location: 'Mombasa, Kenya',
        },
      ];

      const filteredActivities = input.type === 'all' 
        ? mockActivities 
        : mockActivities.filter(a => a.type === input.type);

      const paginatedActivities = filteredActivities.slice(
        input.offset,
        input.offset + input.limit
      );

      console.log('✅ Activity log fetched successfully');

      return {
        success: true,
        activities: paginatedActivities,
        total: filteredActivities.length,
        hasMore: input.offset + input.limit < filteredActivities.length,
      };
    } catch (error) {
      console.error('❌ Activity log fetch error:', error);
      throw new Error('Failed to fetch activity log');
    }
  });
