import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getCartUpsellsProcedure = publicProcedure
  .input(z.object({
    cartItems: z.array(z.object({
      productId: z.string(),
      productName: z.string(),
      category: z.string(),
      quantity: z.number(),
      price: z.number(),
    })),
    userId: z.string().optional(),
  }))
  .query(async ({ input }) => {
    console.log('🛍️ Generating cart upsells for', input.cartItems.length, 'items');

    const upsellRules: Record<string, { complements: string[]; reason: string }> = {
      'chicks': {
        complements: ['feeders', 'vaccines', 'brooder', 'feed'],
        reason: 'Essential for raising healthy chicks',
      },
      'maize': {
        complements: ['storage bags', 'pesticide', 'fertilizer'],
        reason: 'Protect and store your harvest',
      },
      'tomatoes': {
        complements: ['fertilizer', 'pesticide', 'stakes', 'irrigation'],
        reason: 'Maximize your tomato yield',
      },
      'seeds': {
        complements: ['fertilizer', 'pesticide', 'irrigation', 'tools'],
        reason: 'Everything you need to grow',
      },
      'fertilizer': {
        complements: ['pesticide', 'irrigation', 'tools'],
        reason: 'Complete your farming toolkit',
      },
      'dairy': {
        complements: ['feed', 'supplements', 'milking equipment'],
        reason: 'Boost milk production',
      },
      'feed': {
        complements: ['supplements', 'feeders', 'water troughs'],
        reason: 'Optimize animal nutrition',
      },
    };

    const categories = input.cartItems.map(item => item.category.toLowerCase());
    const productNames = input.cartItems.map(item => item.productName.toLowerCase());

    const suggestedUpsells: {
      productId: string;
      productName: string;
      category: string;
      price: number;
      reason: string;
      relevance: 'high' | 'medium' | 'low';
      discount?: number;
    }[] = [];

    const mockProducts: Record<string, { id: string; name: string; category: string; price: number }> = {
      feeders: { id: 'prod-feeders-1', name: 'Automatic Chicken Feeder', category: 'Equipment', price: 1200 },
      vaccines: { id: 'prod-vaccines-1', name: 'Newcastle Disease Vaccine', category: 'Veterinary', price: 450 },
      brooder: { id: 'prod-brooder-1', name: 'Chick Brooder Lamp', category: 'Equipment', price: 800 },
      feed: { id: 'prod-feed-1', name: 'Starter Feed (25kg)', category: 'Feed', price: 1800 },
      'storage bags': { id: 'prod-bags-1', name: 'Hermetic Storage Bags (5 pack)', category: 'Storage', price: 650 },
      pesticide: { id: 'prod-pesticide-1', name: 'Organic Pesticide Spray', category: 'Chemicals', price: 550 },
      fertilizer: { id: 'prod-fertilizer-1', name: 'NPK Fertilizer (50kg)', category: 'Fertilizer', price: 2200 },
      stakes: { id: 'prod-stakes-1', name: 'Tomato Stakes (50 pack)', category: 'Equipment', price: 400 },
      irrigation: { id: 'prod-irrigation-1', name: 'Drip Irrigation Kit', category: 'Equipment', price: 3500 },
      tools: { id: 'prod-tools-1', name: 'Garden Tool Set', category: 'Tools', price: 1500 },
      supplements: { id: 'prod-supplements-1', name: 'Mineral Supplement', category: 'Feed', price: 900 },
      'milking equipment': { id: 'prod-milking-1', name: 'Manual Milking Machine', category: 'Equipment', price: 4500 },
      'water troughs': { id: 'prod-troughs-1', name: 'Automatic Water Trough', category: 'Equipment', price: 1100 },
    };

    for (const [key, rule] of Object.entries(upsellRules)) {
      const hasRelatedItem = categories.some(cat => cat.includes(key)) || 
                            productNames.some(name => name.includes(key));

      if (hasRelatedItem) {
        for (const complement of rule.complements) {
          const alreadyInCart = productNames.some(name => name.toLowerCase().includes(complement));
          if (!alreadyInCart && mockProducts[complement]) {
            const product = mockProducts[complement];
            const relevance: 'high' | 'medium' | 'low' = 
              rule.complements.indexOf(complement) === 0 ? 'high' :
              rule.complements.indexOf(complement) === 1 ? 'medium' : 'low';

            const discount = relevance === 'high' ? 10 : relevance === 'medium' ? 5 : 0;

            suggestedUpsells.push({
              productId: product.id,
              productName: product.name,
              category: product.category,
              price: product.price,
              reason: rule.reason,
              relevance,
              discount,
            });
          }
        }
      }
    }

    suggestedUpsells.sort((a, b) => {
      const relevanceOrder = { high: 3, medium: 2, low: 1 };
      return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
    });

    const topUpsells = suggestedUpsells.slice(0, 6);

    const bundleOpportunities = [];
    const hasChicks = productNames.some(name => name.includes('chick'));
    const hasMaize = productNames.some(name => name.includes('maize'));

    if (hasChicks && topUpsells.some(u => u.productName.includes('Feeder'))) {
      bundleOpportunities.push({
        bundleId: 'bundle-chick-starter',
        bundleName: 'Chick Starter Bundle',
        items: ['Automatic Chicken Feeder', 'Newcastle Disease Vaccine', 'Starter Feed (25kg)'],
        originalPrice: 1200 + 450 + 1800,
        bundlePrice: 3000,
        savings: 450,
        reason: 'Save KSh 450 on essential chick supplies',
      });
    }

    if (hasMaize && topUpsells.some(u => u.productName.includes('Storage'))) {
      bundleOpportunities.push({
        bundleId: 'bundle-maize-storage',
        bundleName: 'Maize Storage Bundle',
        items: ['Hermetic Storage Bags (5 pack)', 'Organic Pesticide Spray'],
        originalPrice: 650 + 550,
        bundlePrice: 1000,
        savings: 200,
        reason: 'Save KSh 200 on maize storage essentials',
      });
    }

    const totalUpsellValue = topUpsells.reduce((sum, item) => sum + item.price, 0);
    const potentialSavings = topUpsells.reduce((sum, item) => sum + (item.discount || 0) * item.price / 100, 0);

    console.log('✅ Generated', topUpsells.length, 'upsells. Total value: KSh', totalUpsellValue);

    return {
      upsells: topUpsells,
      bundleOpportunities,
      summary: {
        totalUpsells: topUpsells.length,
        highRelevance: topUpsells.filter(u => u.relevance === 'high').length,
        totalValue: totalUpsellValue,
        potentialSavings: Math.round(potentialSavings),
      },
      message: topUpsells.length > 0
        ? `We found ${topUpsells.length} items that complement your cart`
        : 'No upsells available for your current cart',
    };
  });
