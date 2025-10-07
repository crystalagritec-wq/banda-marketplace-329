import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const fetchProductDetailsProcedure = publicProcedure
  .input(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
    })
  )
  .query(async ({ input }) => {
    const { productId } = input;

    console.log('📦 Fetching product details:', { productId });

    try {
      // In production, fetch from Supabase with vendor details
      // const { data, error } = await supabase
      //   .from('products')
      //   .select(`
      //     *,
      //     users!products_user_id_fkey(
      //       full_name,
      //       phone,
      //       location,
      //       is_verified,
      //       reputation_score
      //     )
      //   `)
      //   .eq('id', productId)
      //   .single();

      // Mock product details for demo
      const productDetails = {
        id: productId,
        name: 'Premium Fresh Tomatoes',
        description: 'High-quality, organically grown tomatoes perfect for cooking and salads. Harvested fresh daily from our sustainable farm.',
        price: 120,
        originalPrice: 150, // For showing discount
        unit: 'kg',
        category: 'Vegetables',
        images: [
          'https://images.unsplash.com/photo-1546470427-e5ac89c8ba3b',
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
        ],
        inStock: true,
        stockQuantity: 500,
        location: 'Nairobi, Kenya',
        rating: 4.8,
        reviewCount: 124,
        negotiable: true,
        fastDelivery: true,
        varieties: ['Cherry Tomatoes', 'Roma Tomatoes', 'Beefsteak'],
        vendor: {
          id: 'vendor_123',
          name: 'Green Valley Farm',
          phone: '+254712345678',
          location: 'Kiambu, Kenya',
          isVerified: true,
          reputationScore: 92,
          rating: 4.9,
          totalProducts: 45,
          joinedDate: '2023-06-15T00:00:00Z',
        },
        features: [
          { name: 'Organic Certified', icon: 'leaf' },
          { name: 'Fresh Daily', icon: 'clock' },
          { name: 'Fast Delivery', icon: 'truck' },
          { name: 'Quality Guaranteed', icon: 'shield' },
        ],
        nutritionInfo: {
          calories: 18,
          protein: 0.9,
          carbs: 3.9,
          fiber: 1.2,
          vitaminC: 14,
        },
        harvestDate: '2024-01-20T00:00:00Z',
        expiryDate: '2024-01-27T00:00:00Z',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T08:15:00Z',
      };

      // Increment view count (in production)
      // await supabase.from('products').update({ views_count: productDetails.views_count + 1 }).eq('id', productId);

      console.log('✅ Product details fetched successfully');

      return {
        success: true,
        product: productDetails,
      };

    } catch (error) {
      console.error('❌ Fetch product details error:', error);
      throw new Error('Failed to fetch product details');
    }
  });