import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const addToCartProcedure = protectedProcedure
  .input(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      selectedVariety: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
    const { productId, quantity, selectedVariety } = input;
    const userId = ctx.user.id;

    console.log('🛒 Adding product to cart:', {
      userId,
      productId,
      quantity,
      selectedVariety,
    });

    try {
      // In production, add to cart table in Supabase
      // const { data, error } = await supabase
      //   .from('cart_items')
      //   .upsert({
      //     user_id: userId,
      //     product_id: productId,
      //     quantity,
      //     selected_variety: selectedVariety,
      //     added_at: new Date().toISOString(),
      //   })
      //   .select();

      // Mock cart item for demo
      const cartItem = {
        id: `cart_${Date.now()}`,
        userId,
        productId,
        quantity,
        selectedVariety,
        addedAt: new Date().toISOString(),
      };

      // Mock product details (in production, fetch from products table)
      const productDetails = {
        id: productId,
        name: 'Fresh Tomatoes',
        price: 120,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1546470427-e5ac89c8ba3b',
        vendor: 'Green Valley Farm',
        location: 'Nairobi, Kenya',
      };

      console.log('✅ Product added to cart successfully');

      return {
        success: true,
        message: `${productDetails.name} (${quantity} ${productDetails.unit}) added to cart`,
        cartItem,
        product: productDetails,
        cartCount: 3, // Mock cart count
      };

    } catch (error) {
      console.error('❌ Add to cart error:', error);
      throw new Error('Failed to add product to cart. Please try again.');
    }
  });