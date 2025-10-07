import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";
import { generateObject } from "@rork/toolkit-sdk";

interface DeliveryLocation {
  lat: number;
  lng: number;
  address: string;
}



export const optimizeDeliveryRoutesProcedure = protectedProcedure
  .input(z.object({
    orderIds: z.array(z.string()),
    maxProvidersToConsider: z.number().optional().default(5),
    prioritizeSpeed: z.boolean().optional().default(false)
  }))
  .mutation(async ({ input }) => {
    try {
      console.log('🤖 Optimizing delivery routes for orders:', input.orderIds);

      // Fetch order details with locations
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, buyer_id, seller_id, total_amount,
          shipping_address,
          products!inner(name, category)
        `)
        .in('id', input.orderIds)
        .eq('status', 'confirmed');

      if (ordersError || !orders?.length) {
        throw new Error('No valid orders found for route optimization');
      }

      // Fetch available logistics providers
      const { data: providers, error: providersError } = await supabase
        .from('logistics_providers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(input.maxProvidersToConsider);

      if (providersError || !providers?.length) {
        throw new Error('No available logistics providers found');
      }

      // Extract delivery locations from orders
      const deliveryLocations: (DeliveryLocation & { orderId: string })[] = orders.map(order => ({
        orderId: order.id,
        lat: order.shipping_address?.lat || 0,
        lng: order.shipping_address?.lng || 0,
        address: order.shipping_address?.address || 'Unknown location'
      }));

      // Use AI to optimize routes for each provider
      const aiPrompt = `
        You are an AI logistics optimizer for Banda delivery system. 
        
        Orders to deliver: ${JSON.stringify(deliveryLocations)}
        Available providers: ${JSON.stringify(providers.map(p => ({
          id: p.id,
          name: p.name,
          vehicleType: p.vehicle_type,
          rating: p.rating,
          currentLocation: p.current_location
        })))}
        
        Optimize delivery routes considering:
        1. Distance efficiency (minimize total travel distance)
        2. Vehicle capacity constraints
        3. Provider ratings and reliability
        4. Traffic patterns and delivery time windows
        5. Fuel costs and environmental impact
        6. ${input.prioritizeSpeed ? 'Prioritize speed over cost' : 'Balance speed and cost'}
        
        For each provider, calculate:
        - Optimal route sequence
        - Total distance and estimated time
        - Delivery fee based on distance and vehicle type
        - Route efficiency score (0-100)
        
        Return the top 3 most efficient route options.
      `;

      const optimizedRoutes = await generateObject({
        messages: [{ role: 'user', content: aiPrompt }],
        schema: z.object({
          routes: z.array(z.object({
            providerId: z.string(),
            providerName: z.string(),
            vehicleType: z.string(),
            rating: z.number(),
            totalDistance: z.number(),
            estimatedTime: z.number(),
            deliveryFee: z.number(),
            stops: z.array(z.object({
              orderId: z.string(),
              location: z.object({
                lat: z.number(),
                lng: z.number(),
                address: z.string()
              }),
              priority: z.number()
            })),
            efficiency: z.number()
          }))
        })
      });

      // Check if any routes can be pooled (multiple orders for same provider)
      const pooledRoutes = optimizedRoutes.routes.map(route => ({
        ...route,
        isPooled: route.stops.length > 1,
        poolingDiscount: route.stops.length > 1 ? 0.15 : 0, // 15% discount for pooled deliveries
        finalFee: route.deliveryFee * (route.stops.length > 1 ? 0.85 : 1)
      }));

      // Sort by efficiency and cost
      const sortedRoutes = pooledRoutes.sort((a, b) => {
        if (input.prioritizeSpeed) {
          return a.estimatedTime - b.estimatedTime;
        }
        return b.efficiency - a.efficiency;
      });

      return {
        success: true,
        optimizedRoutes: sortedRoutes.slice(0, 3), // Return top 3 options
        totalOrders: input.orderIds.length,
        poolingOpportunities: sortedRoutes.filter(r => r.isPooled).length,
        estimatedSavings: sortedRoutes
          .filter(r => r.isPooled)
          .reduce((sum, r) => sum + (r.deliveryFee * r.poolingDiscount), 0)
      };
    } catch (error: any) {
      console.error('❌ Error in optimizeDeliveryRoutesProcedure:', error);
      throw new Error(error.message || 'Failed to optimize delivery routes');
    }
  });