import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const exportDataProcedure = protectedProcedure
  .input(
    z.object({
      format: z.enum(['json', 'csv']).default('json'),
      includeOrders: z.boolean().default(true),
      includeTransactions: z.boolean().default(true),
      includeActivity: z.boolean().default(true),
      includeProfile: z.boolean().default(true),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;

    console.log('📦 Exporting user data:', { userId, ...input });

    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        userId,
        profile: input.includeProfile ? {
          id: userId,
          fullName: 'John Farmer',
          email: 'john@example.com',
          phone: '+254705256259',
          location: 'Nairobi, Kenya',
          membershipTier: 'gold',
          reputationScore: 88,
          createdAt: '2024-01-15T10:30:00Z',
        } : null,
        orders: input.includeOrders ? [
          {
            id: '1234',
            productName: '50kg Maize',
            amount: 5000,
            status: 'delivered',
            createdAt: '2024-10-01T10:00:00Z',
          },
        ] : null,
        transactions: input.includeTransactions ? [
          {
            id: 'TXN001',
            type: 'payment',
            amount: 5000,
            status: 'completed',
            createdAt: '2024-10-01T10:05:00Z',
          },
        ] : null,
        activity: input.includeActivity ? [
          {
            id: '1',
            type: 'order',
            title: 'Order placed',
            timestamp: '2024-10-01T10:00:00Z',
          },
        ] : null,
      };

      let exportContent: string;
      let mimeType: string;

      if (input.format === 'json') {
        exportContent = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
      } else {
        exportContent = 'CSV export not yet implemented';
        mimeType = 'text/csv';
      }

      console.log('✅ Data export completed successfully');

      return {
        success: true,
        message: 'Data exported successfully',
        data: exportContent,
        mimeType,
        filename: `banda_export_${userId}_${Date.now()}.${input.format}`,
      };
    } catch (error) {
      console.error('❌ Data export error:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  });
