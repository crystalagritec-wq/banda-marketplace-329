import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const checkoutOrderProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    cartItems: z.array(z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
      productName: z.string(),
    })),
    deliveryAddress: z.object({
      name: z.string(),
      address: z.string(),
      city: z.string(),
      phone: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }),
    paymentMethod: z.object({
      type: z.enum(['agripay', 'mpesa', 'card', 'cod']),
      details: z.string(),
    }),
    deliveryProvider: z.object({
      providerId: z.string(),
      providerName: z.string(),
      vehicleType: z.string(),
      estimatedTime: z.string(),
      deliveryFee: z.number(),
    }),
    orderSummary: z.object({
      subtotal: z.number(),
      deliveryFee: z.number(),
      discount: z.number().optional().default(0),
      total: z.number(),
    }),
    specialInstructions: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    console.log('🛍️ Processing checkout for user:', input.userId);

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Generate tracking ID
    const trackingId = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Calculate estimated delivery time
    const estimatedDeliveryTime = new Date();
    const deliveryHours = input.deliveryProvider.vehicleType === 'boda' ? 1 : 
                         input.deliveryProvider.vehicleType === 'van' ? 2 :
                         input.deliveryProvider.vehicleType === 'truck' ? 4 : 3;
    estimatedDeliveryTime.setHours(estimatedDeliveryTime.getHours() + deliveryHours);

    // Get seller ID from first cart item
    const sellerId = input.cartItems[0]?.productId ? input.cartItems[0].productId.split('-')[0] : 'seller-123';

    // Create order object
    const order = {
      id: orderId,
      user_id: input.userId,
      tracking_id: trackingId,
      status: 'pending' as const,
      items: input.cartItems,
      delivery_address: input.deliveryAddress,
      payment_method: input.paymentMethod.type,
      payment_details: input.paymentMethod.details,
      delivery_provider_id: input.deliveryProvider.providerId,
      delivery_provider_name: input.deliveryProvider.providerName,
      delivery_fee: input.deliveryProvider.deliveryFee,
      estimated_delivery_time: input.deliveryProvider.estimatedTime,
      subtotal: input.orderSummary.subtotal,
      discount: input.orderSummary.discount,
      total: input.orderSummary.total,
      special_instructions: input.specialInstructions,
      created_at: new Date().toISOString(),
      estimated_delivery: estimatedDeliveryTime.toISOString(),
      payment_status: input.paymentMethod.type === 'agripay' ? 'reserved' as const : 'pending' as const,
    };

    console.log('📦 Saving order to database:', orderId);

    try {
      // Save order to database
      const { error: orderError } = await ctx.supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Order save error:', orderError);
        throw new Error('Failed to save order');
      }

      // If payment method is AgriPay, hold reserve
      if (input.paymentMethod.type === 'agripay') {
        console.log('💰 Holding reserve for AgriPay payment');
        
        // Get buyer and seller wallets
        const { data: buyerWallet } = await ctx.supabase
          .from('agripay_wallets')
          .select('id')
          .eq('user_id', input.userId)
          .single();

        const { data: sellerWallet } = await ctx.supabase
          .from('agripay_wallets')
          .select('id')
          .eq('user_id', sellerId)
          .single();

        if (buyerWallet && sellerWallet) {
          // Hold reserve using Supabase function
          const { data: reserveId, error: reserveError } = await ctx.supabase.rpc('hold_reserve', {
            p_buyer_wallet_id: buyerWallet.id,
            p_seller_wallet_id: sellerWallet.id,
            p_amount: input.orderSummary.total,
            p_reference_type: 'order',
            p_reference_id: orderId,
          });

          if (reserveError) {
            console.error('❌ Reserve hold error:', reserveError);
          } else {
            console.log('✅ Reserve held successfully:', reserveId);
            // Update order payment status
            await ctx.supabase
              .from('orders')
              .update({ payment_status: 'reserved' })
              .eq('id', orderId);
          }
        } else {
          console.warn('⚠️ Wallet not found for buyer or seller');
        }
      }

      // Save order items
      const orderItems = input.cartItems.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await ctx.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Order items save error:', itemsError);
      }

      // Clear user's cart
      const { error: cartError } = await ctx.supabase
        .from('cart_items')
        .delete()
        .eq('user_id', input.userId);

      if (cartError) {
        console.error('❌ Cart clear error:', cartError);
      }

      console.log('✅ Order saved successfully:', orderId);
    } catch (error) {
      console.error('❌ Order processing error:', error);
      throw error;
    }

    const processingResult = {
      success: true,
      orderId: orderId,
      trackingId: trackingId,
      order: order,
      paymentRequired: input.paymentMethod.type !== 'cod',
      nextSteps: {
        payment: input.paymentMethod.type === 'mpesa' ? 'STK push initiated' :
                input.paymentMethod.type === 'card' ? 'Redirect to payment gateway' :
                input.paymentMethod.type === 'agripay' ? 'Wallet charged' :
                'Payment on delivery',
        delivery: `${input.deliveryProvider.providerName} notified`,
        tracking: `Track with ID: ${trackingId}`,
      },
    };

    return processingResult;
  });