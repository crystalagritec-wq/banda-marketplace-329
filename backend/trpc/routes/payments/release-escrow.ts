import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const releaseEscrowProcedure = publicProcedure
  .input(z.object({
    escrowId: z.string(),
    subOrderId: z.string(),
    sellerId: z.string(),
    deliveryConfirmed: z.boolean(),
    buyerSignature: z.string().optional(),
    qrCodeScanned: z.boolean().optional(),
    buyerTrustScore: z.number().optional(),
    sellerReliability: z.number().optional(),
    hasDisputes: z.boolean().optional(),
    autoRelease: z.boolean().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('🔓 Releasing escrow for sub-order:', input.subOrderId);
    console.log('🔓 Escrow ID:', input.escrowId);
    console.log('🔓 Seller ID:', input.sellerId);

    if (!input.deliveryConfirmed) {
      throw new Error('Delivery must be confirmed before releasing escrow');
    }

    const buyerTrust = input.buyerTrustScore || 3.5;
    const sellerReliability = input.sellerReliability || 90;
    const hasDisputes = input.hasDisputes || false;

    const canAutoRelease = buyerTrust >= 4.5 && sellerReliability >= 95 && !hasDisputes;
    const requiresOtp = buyerTrust >= 4.0 && buyerTrust < 4.5 && !hasDisputes;
    const requiresQr = buyerTrust < 4.0 || hasDisputes;

    let releaseMethod: 'automatic' | 'otp_verified' | 'qr_verified' | 'manual' = 'manual';
    let releaseReason = 'delivery_confirmed';

    if (canAutoRelease && input.autoRelease !== false) {
      releaseMethod = 'automatic';
      releaseReason = 'auto_release_trusted_parties';
      console.log('✅ Auto-release enabled: Buyer trust >= 4.5, Seller reliability >= 95%');
    } else if (requiresOtp && input.buyerSignature) {
      releaseMethod = 'otp_verified';
      releaseReason = 'otp_confirmation';
      console.log('✅ OTP verification required and provided');
    } else if (requiresQr && input.qrCodeScanned) {
      releaseMethod = 'qr_verified';
      releaseReason = 'qr_scan_confirmation';
      console.log('✅ QR verification required and scanned');
    } else if (!canAutoRelease && !input.buyerSignature && !input.qrCodeScanned) {
      throw new Error(
        requiresQr 
          ? 'QR code scan required for escrow release (low trust score or active disputes)'
          : requiresOtp
          ? 'OTP verification required for escrow release'
          : 'Manual confirmation required for escrow release'
      );
    }

    const mockEscrowSplit = {
      id: `SPLIT-${input.escrowId}-1`,
      escrowId: input.escrowId,
      sellerId: input.sellerId,
      grossAmount: 2500,
      deliveryFee: 150,
      platformFee: 125,
      netPayout: 2375,
      status: 'held' as const,
    };

    const releasedSplit = {
      ...mockEscrowSplit,
      status: 'released' as const,
      releasedAt: new Date().toISOString(),
      releaseMethod,
      releaseReason,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      trustMetrics: {
        buyerTrustScore: buyerTrust,
        sellerReliability,
        autoReleaseEligible: canAutoRelease,
        verificationRequired: requiresOtp || requiresQr,
      },
    };

    console.log('✅ Escrow released:', releasedSplit.id);
    console.log('💰 Amount released to seller:', releasedSplit.netPayout);
    console.log('💵 Platform fee collected:', releasedSplit.platformFee);
    console.log('🚚 Delivery fee:', releasedSplit.deliveryFee);

    return {
      success: true,
      releasedSplit,
      message: canAutoRelease
        ? `KSh ${releasedSplit.netPayout.toLocaleString()} auto-released to seller wallet (trusted parties)`
        : `KSh ${releasedSplit.netPayout.toLocaleString()} released to seller wallet after verification`,
      sellerNotification: {
        title: 'Payment Received',
        message: `You've received KSh ${releasedSplit.netPayout.toLocaleString()} for order ${input.subOrderId}`,
        type: 'payment_received',
      },
      releaseInfo: {
        method: releaseMethod,
        reason: releaseReason,
        autoReleaseEligible: canAutoRelease,
        verificationUsed: requiresOtp ? 'OTP' : requiresQr ? 'QR Code' : 'None',
      },
    };
  });
