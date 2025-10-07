import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const optimizeSellerSelectionProcedure = publicProcedure
  .input(z.object({
    productId: z.string(),
    buyerLocation: z.object({
      city: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }),
    availableSellers: z.array(z.object({
      sellerId: z.string(),
      sellerName: z.string(),
      sellerLocation: z.string(),
      price: z.number(),
      stock: z.number(),
      trustScore: z.number(),
      fulfillmentRate: z.number(),
      averageDeliveryTime: z.number(),
      isOnline: z.boolean(),
      distance: z.number().optional(),
    })),
    buyerPreferences: z.object({
      prioritizePrice: z.boolean().default(true),
      prioritizeSpeed: z.boolean().default(false),
      prioritizeTrust: z.boolean().default(true),
    }).optional(),
  }))
  .query(async ({ input }) => {
    console.log('🧠 AI Seller Optimization for product:', input.productId);

    const { availableSellers, buyerPreferences } = input;
    const prefs = buyerPreferences || { prioritizePrice: true, prioritizeSpeed: false, prioritizeTrust: true };

    const scoredSellers = availableSellers.map(seller => {
      let score = 0;
      let reasons: string[] = [];

      if (!seller.isOnline) {
        score -= 1000;
        reasons.push('Seller offline');
        return { seller, score, reasons, recommendation: 'not_recommended' as const };
      }

      if (seller.stock <= 0) {
        score -= 1000;
        reasons.push('Out of stock');
        return { seller, score, reasons, recommendation: 'not_recommended' as const };
      }

      if (prefs.prioritizePrice) {
        const priceScore = 100 - (seller.price / 100);
        score += priceScore * 0.4;
        if (seller.price < 1000) reasons.push('Competitive price');
      }

      if (prefs.prioritizeSpeed) {
        const distance = seller.distance || 50;
        const speedScore = 100 - (distance / 2);
        score += speedScore * 0.3;
        if (distance < 10) reasons.push('Very close location');
        else if (distance < 30) reasons.push('Nearby location');
      }

      if (prefs.prioritizeTrust) {
        const trustScore = (seller.trustScore / 5) * 100;
        const fulfillmentScore = seller.fulfillmentRate;
        score += (trustScore * 0.2) + (fulfillmentScore * 0.1);
        if (seller.trustScore >= 4.5) reasons.push('Highly trusted seller');
        if (seller.fulfillmentRate >= 95) reasons.push('Excellent fulfillment rate');
      }

      const deliveryScore = 100 - (seller.averageDeliveryTime / 10);
      score += deliveryScore * 0.1;
      if (seller.averageDeliveryTime < 60) reasons.push('Fast delivery');

      let recommendation: 'best' | 'good' | 'acceptable' | 'not_recommended' = 'acceptable';
      if (score >= 80) {
        recommendation = 'best';
        reasons.unshift('⭐ Recommended for you');
      } else if (score >= 60) {
        recommendation = 'good';
      } else if (score < 40) {
        recommendation = 'not_recommended';
      }

      return { seller, score, reasons, recommendation };
    });

    scoredSellers.sort((a, b) => b.score - a.score);

    const bestSeller = scoredSellers[0];
    const backupSellers = scoredSellers.slice(1, 4).filter(s => s.recommendation !== 'not_recommended');

    const alternativeSavings = scoredSellers
      .filter(s => s.seller.sellerId !== bestSeller.seller.sellerId && s.recommendation !== 'not_recommended')
      .map(s => ({
        sellerId: s.seller.sellerId,
        sellerName: s.seller.sellerName,
        priceDifference: s.seller.price - bestSeller.seller.price,
        timeDifference: s.seller.averageDeliveryTime - bestSeller.seller.averageDeliveryTime,
        suggestion: s.seller.price < bestSeller.seller.price 
          ? `Save KSh ${bestSeller.seller.price - s.seller.price} by switching to ${s.seller.sellerName}`
          : s.seller.averageDeliveryTime < bestSeller.seller.averageDeliveryTime
          ? `Get ${bestSeller.seller.averageDeliveryTime - s.seller.averageDeliveryTime} mins faster delivery from ${s.seller.sellerName}`
          : null,
      }))
      .filter(s => s.suggestion !== null);

    console.log('✅ Best seller:', bestSeller.seller.sellerName, 'Score:', bestSeller.score.toFixed(1));

    return {
      recommendedSeller: {
        ...bestSeller.seller,
        score: Math.round(bestSeller.score),
        reasons: bestSeller.reasons,
        badge: bestSeller.recommendation === 'best' ? 'recommended' : 'good',
      },
      backupSellers: backupSellers.map(s => ({
        ...s.seller,
        score: Math.round(s.score),
        reasons: s.reasons,
      })),
      alternativeSavings: alternativeSavings.slice(0, 2),
      optimizationInsights: {
        totalSellersAnalyzed: availableSellers.length,
        onlineSellers: availableSellers.filter(s => s.isOnline).length,
        inStockSellers: availableSellers.filter(s => s.stock > 0).length,
        averagePrice: Math.round(availableSellers.reduce((sum, s) => sum + s.price, 0) / availableSellers.length),
        priceRange: {
          min: Math.min(...availableSellers.map(s => s.price)),
          max: Math.max(...availableSellers.map(s => s.price)),
        },
      },
    };
  });
