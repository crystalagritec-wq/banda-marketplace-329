import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getAIDeliveryOptionsProcedure = publicProcedure
  .input(z.object({
    orderWeight: z.number(),
    distance: z.number(),
    productCategories: z.array(z.string()),
    urgency: z.enum(['standard', 'express']).optional().default('standard'),
    orderValue: z.number(),
    deliveryArea: z.string(),
  }))
  .query(async ({ input }) => {
    console.log('🤖 Getting AI delivery recommendations:', input);

    // AI recommendation logic based on order characteristics
    const getRecommendations = () => {
      const recommendations = [];

      // Check if cold chain is needed
      const needsColdChain = input.productCategories.some(cat => 
        ['dairy', 'meat', 'livestock', 'fresh produce'].includes(cat.toLowerCase())
      );

      // Weight-based recommendations
      if (input.orderWeight <= 25) {
        if (input.urgency === 'express') {
          recommendations.push({
            providerId: 'bdp-001',
            reason: 'Fast motorcycle delivery perfect for small, urgent orders',
            confidence: 0.95,
            vehicleType: 'boda',
            estimatedTime: '30-45 mins',
            maxWeight: 25,
            specialFeatures: ['Express delivery', 'Small packages', 'City navigation'],
          });
        } else {
          recommendations.push({
            providerId: 'bdp-002',
            reason: 'Reliable van service with better protection for your items',
            confidence: 0.85,
            vehicleType: 'van',
            estimatedTime: '1-2 hours',
            maxWeight: 800,
            specialFeatures: ['Fragile produce', 'Weather protection', 'Secure transport'],
          });
        }
      }

      // Medium weight orders
      if (input.orderWeight > 25 && input.orderWeight <= 800) {
        recommendations.push({
          providerId: 'bdp-002',
          reason: 'Optimal van capacity for medium-sized agricultural orders',
          confidence: 0.9,
          vehicleType: 'van',
          estimatedTime: '1-2 hours',
          maxWeight: 800,
          specialFeatures: ['Medium loads', 'Fresh vegetables', 'Dairy products'],
        });
      }

      // Heavy orders
      if (input.orderWeight > 800) {
        if (input.orderWeight <= 1500) {
          recommendations.push({
            providerId: 'bdp-003',
            reason: 'Large van capacity for bulk agricultural deliveries',
            confidence: 0.88,
            vehicleType: 'van',
            estimatedTime: '2-3 hours',
            maxWeight: 1500,
            specialFeatures: ['Bulk orders', 'Long distance', 'Grain transport'],
          });
        } else {
          recommendations.push({
            providerId: 'bdp-004',
            reason: 'Heavy-duty truck for large agricultural orders',
            confidence: 0.92,
            vehicleType: 'truck',
            estimatedTime: '3-4 hours',
            maxWeight: 5000,
            specialFeatures: ['Heavy loads', 'Farm machinery', 'Bulk grain'],
          });
        }
      }

      // Cold chain recommendation
      if (needsColdChain) {
        recommendations.unshift({
          providerId: 'bdp-005',
          reason: 'Specialized refrigerated transport required for perishable goods',
          confidence: 0.98,
          vehicleType: 'tractor',
          estimatedTime: '2-4 hours',
          maxWeight: 3000,
          specialFeatures: ['Cold storage', 'Dairy products', 'Fresh produce', 'Meat transport'],
          priority: true,
        });
      }

      // Distance-based adjustments
      if (input.distance > 50) {
        recommendations.forEach(rec => {
          if (rec.vehicleType === 'boda') {
            rec.confidence *= 0.7; // Reduce confidence for long-distance boda
          }
        });
      }

      // Sort by confidence and priority
      return recommendations.sort((a, b) => {
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return b.confidence - a.confidence;
      });
    };

    // Check if cold chain is needed (outside the function)
    const needsColdChain = input.productCategories.some(cat => 
      ['dairy', 'meat', 'livestock', 'fresh produce'].includes(cat.toLowerCase())
    );

    const recommendations = getRecommendations();
    const topRecommendation = recommendations[0];

    // Calculate delivery fee for top recommendation
    const deliveryZones = {
      'Nairobi': 'ZONE_1',
      'Kiambu': 'ZONE_2',
      'Nakuru': 'ZONE_3',
      'Eldoret': 'ZONE_4',
    };

    const zone = deliveryZones[input.deliveryArea as keyof typeof deliveryZones] || 'ZONE_1';
    
    return {
      topRecommendation,
      allRecommendations: recommendations,
      aiInsights: {
        orderAnalysis: {
          weight: input.orderWeight,
          categories: input.productCategories,
          urgency: input.urgency,
          needsColdChain: needsColdChain,
        },
        recommendation: topRecommendation ? {
          provider: topRecommendation.providerId,
          reason: topRecommendation.reason,
          confidence: Math.round(topRecommendation.confidence * 100),
          estimatedSavings: input.urgency === 'express' ? 0 : Math.round(input.orderValue * 0.05),
        } : null,
      },
      deliveryZone: zone,
    };
  });