import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getDetailedOrderProcedure = publicProcedure
  .input(z.object({
    order_id: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    console.log('getDetailedOrder:', input);
    
    try {
      // In a real implementation, this would query the database for detailed order info
      // including items, payments, QR codes, and tracking history
      
      // Mock detailed order data
      const orderDetails = {
        id: input.order_id,
        order_number: `BND-${input.order_id.slice(-6).toUpperCase()}`,
        status: 'out_for_delivery',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        estimated_delivery: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        
        // Items with detailed info
        items: [
          {
            id: 'item_001',
            name: '10kg Premium Rice',
            description: 'High quality basmati rice from Mwea',
            quantity: 2,
            unit_price: 1200,
            total_price: 2400,
            image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
            seller: {
              id: 'seller_001',
              name: 'Fresh Farm Supplies',
              location: 'Nakuru',
              rating: 4.8
            }
          },
          {
            id: 'item_002',
            name: '5kg Green Beans',
            description: 'Fresh green beans from local farms',
            quantity: 1,
            unit_price: 800,
            total_price: 800,
            image_url: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400',
            seller: {
              id: 'seller_002',
              name: 'Organic Greens Co.',
              location: 'Kiambu',
              rating: 4.6
            }
          }
        ],
        
        // Payment breakdown
        payment: {
          subtotal: 3200,
          delivery_fee: 300,
          service_fee: 200,
          tax: 0,
          total: 3700,
          method: 'M-Pesa',
          transaction_id: 'MP240927001',
          status: 'completed',
          paid_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        
        // Delivery info
        delivery: {
          address: {
            street: '123 Kenyatta Avenue',
            city: 'Nairobi',
            county: 'Nairobi',
            postal_code: '00100'
          },
          driver: {
            id: 'driver_001',
            name: 'John Mwangi',
            phone: '+254734567890',
            vehicle: 'KCA 123A',
            rating: 4.9
          },
          estimated_arrival: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          tracking_number: 'TRK-' + input.order_id.slice(-8).toUpperCase()
        },
        
        // QR Code info
        qr_code: {
          id: 'qr_' + input.order_id,
          verification_code: `BANDA_${input.order_id.slice(-6).toUpperCase()}`,
          download_url: `https://api.banda.com/qr/${input.order_id}.png`,
          expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString()
        },
        
        // Tracking timeline
        tracking_updates: [
          {
            status: 'placed',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            message: 'Order placed successfully',
            location: 'Nairobi'
          },
          {
            status: 'confirmed',
            timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
            message: 'Order confirmed by sellers',
            location: 'Nakuru & Kiambu'
          },
          {
            status: 'packed',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            message: 'Items packed and ready for pickup',
            location: 'Nakuru & Kiambu'
          },
          {
            status: 'picked_up',
            timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
            message: 'Items picked up by driver',
            location: 'Nakuru'
          },
          {
            status: 'out_for_delivery',
            timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
            message: 'Out for delivery to your location',
            location: 'En route to Nairobi'
          }
        ],
        
        // Available actions
        available_actions: [
          'track',
          'contact_driver',
          'view_qr',
          'download_invoice'
        ]
      };
      
      console.log('Detailed order fetched successfully:', orderDetails.id);
      
      return {
        success: true,
        order: orderDetails
      };
    } catch (error) {
      console.error('Error fetching detailed order:', error);
      throw new Error('Failed to fetch order details');
    }
  });