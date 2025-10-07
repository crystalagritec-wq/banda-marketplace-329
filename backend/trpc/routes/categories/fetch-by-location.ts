import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const fetchCategoriesByLocationProcedure = publicProcedure
  .input(z.object({
    location_type: z.enum(['town', 'county', 'national']),
    location_id: z.string().optional(),
  }))
  .query(async ({ input, ctx }) => {
    console.log('fetchCategoriesByLocation:', input);
    
    try {
      // Mock data for now - replace with actual Supabase query
      const mockCategories = [
        { id: 'vegetables', name: 'Vegetables', location_filter: input.location_type, product_count: 45 },
        { id: 'fruits', name: 'Fruits', location_filter: input.location_type, product_count: 32 },
        { id: 'grains', name: 'Grains', location_filter: input.location_type, product_count: 28 },
        { id: 'dairy', name: 'Dairy', location_filter: input.location_type, product_count: 19 },
        { id: 'poultry', name: 'Poultry', location_filter: input.location_type, product_count: 15 },
        { id: 'livestock', name: 'Livestock', location_filter: input.location_type, product_count: 12 },
        { id: 'inputs', name: 'Inputs', location_filter: input.location_type, product_count: 23 },
        { id: 'equipment', name: 'Equipment', location_filter: input.location_type, product_count: 18 },
      ];

      // Adjust counts based on location type
      const multiplier = input.location_type === 'national' ? 1 : 
                        input.location_type === 'county' ? 0.6 : 0.3;
      
      return mockCategories.map(cat => ({
        ...cat,
        product_count: Math.floor(cat.product_count * multiplier)
      }));
    } catch (error) {
      console.error('Error fetching categories by location:', error);
      throw new Error('Failed to fetch categories');
    }
  });