import { publicProcedure } from '../../create-context';
import { z } from 'zod';

export const getShopProductsProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    search: z.string().optional(),
  }))
  .query(async ({ input }) => {
    console.log('[Shop Products] Fetching products for user:', input.userId);

    const products = [
      { 
        id: '1', 
        name: 'Fresh Tomatoes', 
        category: 'Vegetables', 
        price: 150, 
        stock: 45, 
        status: 'active' as const,
        views: 234,
        sales: 45,
      },
      { 
        id: '2', 
        name: 'Organic Carrots', 
        category: 'Vegetables', 
        price: 120, 
        stock: 8, 
        status: 'low_stock' as const,
        views: 189,
        sales: 38,
      },
      { 
        id: '3', 
        name: 'Sweet Potatoes', 
        category: 'Vegetables', 
        price: 100, 
        stock: 0, 
        status: 'out_of_stock' as const,
        views: 156,
        sales: 32,
      },
      { 
        id: '4', 
        name: 'Fresh Milk', 
        category: 'Dairy', 
        price: 80, 
        stock: 30, 
        status: 'active' as const,
        views: 201,
        sales: 28,
      },
      { 
        id: '5', 
        name: 'Farm Eggs', 
        category: 'Poultry', 
        price: 200, 
        stock: 15, 
        status: 'active' as const,
        views: 178,
        sales: 25,
      },
    ];

    const filtered = input.search
      ? products.filter(p => 
          p.name.toLowerCase().includes(input.search!.toLowerCase()) ||
          p.category.toLowerCase().includes(input.search!.toLowerCase())
        )
      : products;

    return {
      products: filtered,
      total: filtered.length,
    };
  });
