import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const splitPaymentProcedure = publicProcedure
  .input(z.object({
    masterOrderId: z.string(),
    totalAmount: z.number(),
    sellerSplits: z.array(z.object({
      sellerId: z.string(),
      sellerName: z.string(),
      amount: z.number(),
      deliveryFee: z.number(),
      platformFee: z.number().default(0),
    })),
    paymentMethod: z.enum(['mpesa', 'card', 'agripay', 'cod']),
    buyerId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('💰 Processing payment split for order:', input.masterOrderId);
    console.log('💰 Total amount:', input.totalAmount);
    console.log('💰 Sellers:', input.sellerSplits.length);

    const escrowId = `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const platformFeeRate = 0.05;
    
    const splits = input.sellerSplits.map((split, index) => {
      const platformFee = Math.round(split.amount * platformFeeRate);
      const sellerPayout = split.amount - platformFee;
      
      return {
        id: `SPLIT-${escrowId}-${index + 1}`,
        escrowId,
        sellerId: split.sellerId,
        sellerName: split.sellerName,
        grossAmount: split.amount,
        deliveryFee: split.deliveryFee,
        platformFee,
        netPayout: sellerPayout,
        status: 'held' as const,
        releaseCondition: 'delivery_confirmed' as const,
        createdAt: new Date().toISOString(),
      };
    });

    const totalPlatformFees = splits.reduce((sum, split) => sum + split.platformFee, 0);
    const totalSellerPayouts = splits.reduce((sum, split) => sum + split.netPayout, 0);
    const totalDeliveryFees = splits.reduce((sum, split) => sum + split.deliveryFee, 0);

    const escrowHold = {
      id: escrowId,
      masterOrderId: input.masterOrderId,
      buyerId: input.buyerId,
      totalAmount: input.totalAmount,
      totalPlatformFees,
      totalSellerPayouts,
      totalDeliveryFees,
      paymentMethod: input.paymentMethod,
      status: 'held' as const,
      splits,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    console.log('✅ Escrow created:', escrowId);
    console.log('💵 Platform fees:', totalPlatformFees);
    console.log('💵 Seller payouts:', totalSellerPayouts);
    console.log('🚚 Delivery fees:', totalDeliveryFees);

    return {
      success: true,
      escrowId,
      escrowHold,
      message: `Payment of KSh ${input.totalAmount.toLocaleString()} held in escrow. Funds will be released to sellers upon delivery confirmation.`,
      releaseSchedule: {
        automatic: true,
        condition: 'delivery_confirmed',
        maxHoldDuration: '30 days',
      },
    };
  });
