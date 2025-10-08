import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const getSubscriptionPlansProcedure = protectedProcedure
  .input(
    z.object({
      role: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[Subscription] Fetching plans for role:', input.role);

    const plans: Record<string, any[]> = {
      buyer: [
        {
          tier: 'premium',
          name: 'Premium Buyer',
          price: 9.99,
          currency: 'USD',
          period: 'month',
          features: [
            'Priority customer support',
            'Exclusive deals and discounts',
            'Advanced search filters',
            'Purchase protection',
            'Early access to new features',
          ],
        },
      ],
      seller: [
        {
          tier: 'premium',
          name: 'Premium Seller',
          price: 29.99,
          currency: 'USD',
          period: 'month',
          features: [
            'Unlimited product listings',
            'Regional/national reach',
            'Advanced analytics dashboard',
            'Discounted logistics rates',
            'Priority listing placement',
            'Bulk upload tools',
          ],
          popular: true,
        },
        {
          tier: 'elite',
          name: 'Elite Seller',
          price: 99.99,
          currency: 'USD',
          period: 'month',
          features: [
            'Multi-market/export access',
            'Staff/agent account management',
            'Exclusive business opportunities',
            'Dedicated account manager',
            'Custom branding options',
            'API access for integrations',
          ],
        },
      ],
      service_provider: [
        {
          tier: 'premium',
          name: 'Premium Service',
          price: 24.99,
          currency: 'USD',
          period: 'month',
          features: [
            'Unlimited service listings',
            'Regional/national reach',
            'Advanced booking system',
            'Customer management tools',
            'Performance analytics',
          ],
          popular: true,
        },
        {
          tier: 'elite',
          name: 'Elite Service',
          price: 79.99,
          currency: 'USD',
          period: 'month',
          features: [
            'Institutional access (NGOs, gov)',
            'Staff account management',
            'Contract management system',
            'Dedicated support',
            'Custom service packages',
          ],
        },
      ],
      logistics_provider: [
        {
          tier: 'premium',
          name: 'Premium Logistics',
          price: 39.99,
          currency: 'USD',
          period: 'month',
          features: [
            'Regional/national deliveries',
            'Advanced route optimization',
            'Pooling request system',
            'Fleet management tools',
            'Real-time tracking',
          ],
          popular: true,
        },
        {
          tier: 'elite',
          name: 'Elite Logistics',
          price: 149.99,
          currency: 'USD',
          period: 'month',
          features: [
            'Export + bulk contracts',
            'Staff account management',
            'Enterprise integrations',
            'Dedicated logistics manager',
            'Custom pricing models',
          ],
        },
      ],
      farmer: [
        {
          tier: 'premium',
          name: 'Premium Farm',
          price: 19.99,
          currency: 'USD',
          period: 'month',
          features: [
            'Advanced farm analytics',
            'Advisory services access',
            'Marketplace integration',
            'Weather forecasting',
            'Crop planning tools',
          ],
          popular: true,
        },
        {
          tier: 'elite',
          name: 'Elite Farm',
          price: 59.99,
          currency: 'USD',
          period: 'month',
          features: [
            'Export market access',
            'Dedicated farm advisor',
            'Supply chain management',
            'Quality certification support',
            'Bulk buyer connections',
          ],
        },
      ],
    };

    return {
      success: true,
      plans: plans[input.role] || plans.buyer,
    };
  });
