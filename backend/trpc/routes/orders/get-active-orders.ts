import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getActiveOrdersProcedure = publicProcedure
  .input(z.object({
    user_id: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    console.log('getActiveOrders:', input);
    
    try {
      // Query real orders from database
      const { data: orders, error } = await ctx.supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('user_id', input.user_id)
        .in('status', ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders');
      }

      if (!orders || orders.length === 0) {
        return {
          success: true,
          orders: [],
          count: 0
        };
      }

      // Transform orders to expected format
      const activeOrders = orders.map(order => ({
        id: order.id,
        user_id: order.user_id,
        status: order.status,
        total: order.total,
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'
        })),
        delivery_fee: order.delivery_fee || 0,
        service_fee: 0,
        created_at: order.created_at,
        estimated_delivery: order.estimated_delivery,
        seller: {
          id: 'seller_001',
          name: 'Banda Marketplace',
          phone: '+254712345678'
        },
        driver: null,
        tracking_updates: [],
      }));
      
      console.log('Active orders fetched successfully:', activeOrders.length);
      
      return {
        success: true,
        orders: activeOrders,
        count: activeOrders.length
      };
    } catch (error) {
      console.error('Error fetching active orders:', error);
      throw new Error('Failed to fetch active orders');
    }
  });
