import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const updateCartProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    cartItems: z.array(z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
      productName: z.string(),
      productImage: z.string(),
      unit: z.string(),
    })),
    expiryTime: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('🛒 Updating cart for user:', input.userId);

    // In a real app, this would save to database
    // For now, we'll simulate cart persistence logic
    
    const cartData = {
      userId: input.userId,
      items: input.cartItems,
      updatedAt: new Date().toISOString(),
      expiryTime: input.expiryTime || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      itemCount: input.cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: input.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    };

    // Simulate database save
    console.log('💾 Cart saved:', cartData);

    return {
      success: true,
      cartId: `cart_${input.userId}_${Date.now()}`,
      expiryTime: cartData.expiryTime,
      itemCount: cartData.itemCount,
      subtotal: cartData.subtotal,
      message: 'Cart updated successfully. Items will be held for 3 days.',
    };
  });