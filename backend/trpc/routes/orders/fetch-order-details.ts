import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const fetchOrderDetailsProcedure = publicProcedure
  .input(z.object({
    order_id: z.string(),
    include_qr: z.boolean().optional().default(false),
    include_tracking: z.boolean().optional().default(false),
  }))
  .query(async ({ input, ctx }) => {
    console.log('fetchOrderDetails:', input);
    
    try {
      // Mock order details - replace with actual database query
      const orderDetails: any = {
        id: input.order_id,
        status: 'confirmed',
        total_amount: 1250,
        currency: 'KSH',
        payment_method: 'M-Pesa',
        payment_status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Customer details
        customer: {
          id: 'customer_123',
          name: 'John Doe',
          phone: '+254700000000',
          email: 'john@example.com',
        },
        
        // Delivery address
        delivery_address: {
          name: 'John Doe',
          phone: '+254700000000',
          address: '123 Main Street',
          city: 'Nairobi',
          county: 'Nairobi',
          postal_code: '00100',
        },
        
        // Order items
        items: [
          {
            id: 'item_1',
            product_name: 'Fresh Tomatoes',
            quantity: 2,
            unit_price: 80,
            total_price: 160,
            vendor: 'John Farmer',
          },
          {
            id: 'item_2',
            product_name: 'Organic Maize',
            quantity: 5,
            unit_price: 45,
            total_price: 225,
            vendor: 'Mary Wanjiku',
          },
        ],
        
        // Delivery details
        delivery: {
          method: 'standard',
          fee: 150,
          estimated_time: '2-4 hours',
          driver_assigned: true,
          driver_name: 'Peter Kamau',
          driver_phone: '+254711000000',
        },
      };

      // Include QR code if requested
      if (input.include_qr) {
        orderDetails.qr_code = {
          verification_code: `BANDA_${input.order_id.slice(-6).toUpperCase()}`,
          qr_data: JSON.stringify({
            order_id: input.order_id,
            verification_code: `BANDA_${input.order_id.slice(-6).toUpperCase()}`,
            timestamp: new Date().toISOString(),
          }),
          image_url: `https://api.banda.com/qr/${input.order_id}.png`,
        };
      }

      // Include tracking if requested
      if (input.include_tracking) {
        orderDetails.tracking = {
          current_status: 'confirmed',
          estimated_delivery: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          tracking_events: [
            {
              status: 'order_placed',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              description: 'Order placed successfully',
            },
            {
              status: 'payment_confirmed',
              timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
              description: 'Payment confirmed via M-Pesa',
            },
            {
              status: 'order_confirmed',
              timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
              description: 'Order confirmed by vendor',
            },
          ],
        };
      }

      console.log('Order details fetched successfully:', orderDetails);
      
      return {
        success: true,
        order: orderDetails,
        message: 'Order details fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw new Error('Failed to fetch order details');
    }
  });