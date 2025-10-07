import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { generateObject } from '@rork/toolkit-sdk';

export const getAIRecommendationsProcedure = publicProcedure
  .input(
    z.object({
      productId: z.string(),
      category: z.string(),
      userHistory: z.array(z.string()).optional(),
      limit: z.number().default(8),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log('[AI Recommendations] Generating for product:', input.productId);

    try {
      const { data: products, error } = await ctx.supabase
        .from('products')
        .select('id, name, price, category, image_url, rating, vendor_id')
        .eq('category', input.category)
        .neq('id', input.productId)
        .eq('in_stock', true)
        .limit(input.limit * 2);

      if (error) {
        console.warn('[AI Recommendations] DB query failed, using fallback');
      }

      const productList = products || [];

      if (productList.length === 0) {
        return {
          recommendations: [],
          reason: 'No similar products found',
        };
      }

      const aiResult = await generateObject({
        messages: [
          {
            role: 'user',
            content: `Given a user viewing product ${input.productId} in category ${input.category}, 
            and their history: ${input.userHistory?.join(', ') || 'none'}, 
            recommend the best ${input.limit} products from this list: ${JSON.stringify(productList.slice(0, 20).map(p => ({ id: p.id, name: p.name, price: p.price })))}. 
            Return product IDs in order of relevance with a brief reason.`,
          },
        ],
        schema: z.object({
          productIds: z.array(z.string()).max(input.limit),
          reason: z.string(),
        }),
      });

      const recommended = aiResult.productIds
        .map(id => productList.find(p => p.id === id))
        .filter(Boolean);

      console.log('[AI Recommendations] Generated', recommended.length, 'recommendations');

      return {
        recommendations: recommended,
        reason: aiResult.reason,
      };
    } catch (error: any) {
      console.error('[AI Recommendations] Error:', error);
      
      const { data: fallback } = await ctx.supabase
        .from('products')
        .select('id, name, price, category, image_url, rating, vendor_id')
        .eq('category', input.category)
        .neq('id', input.productId)
        .eq('in_stock', true)
        .limit(input.limit);

      return {
        recommendations: fallback || [],
        reason: 'Similar products in category',
      };
    }
  });
