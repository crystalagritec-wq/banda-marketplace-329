import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const getVendorProfileProcedure = publicProcedure
  .input(z.object({
    vendorId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    console.log('[Vendor Profile] Fetching profile for:', input.vendorId);

    try {
      const { data: profile, error: profileError } = await ctx.supabase
        .from('profiles')
        .select('*')
        .eq('id', input.vendorId)
        .single();

      if (profileError) {
        console.error('[Vendor Profile] Profile fetch error:', profileError);
        throw new Error('Failed to fetch vendor profile');
      }

      const { data: products, error: productsError } = await ctx.supabase
        .from('marketplace_products')
        .select('id, status')
        .eq('user_id', input.vendorId);

      if (productsError) {
        console.error('[Vendor Profile] Products fetch error:', productsError);
      }

      const { data: orders, error: ordersError } = await ctx.supabase
        .from('orders')
        .select('id, status')
        .eq('seller_id', input.vendorId);

      if (ordersError) {
        console.error('[Vendor Profile] Orders fetch error:', ordersError);
      }

      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.status === 'active').length || 0;
      const totalOrders = orders?.length || 0;
      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;

      const stats = {
        totalProducts,
        activeProducts,
        totalOrders,
        completedOrders,
        rating: 4.8,
        reviewCount: totalOrders > 0 ? Math.floor(totalOrders * 0.7) : 0,
        responseTime: '< 2 hours',
        completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100,
        joinDate: new Date(profile.created_at).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }),
      };

      const vendorDisplayName = profile.business_name || profile.full_name || 'Unknown Vendor';
      
      return {
        profile: {
          id: profile.id,
          name: vendorDisplayName,
          vendor_name: vendorDisplayName,
          avatar: profile.avatar_url,
          location: profile.location || 'Kenya',
          location_city: profile.location_city,
          location_county: profile.location_county,
          location_lat: profile.location_lat,
          location_lng: profile.location_lng,
          bio: profile.bio || 'Welcome to my shop!',
          verified: profile.verified || false,
          businessName: profile.business_name || profile.full_name,
          businessType: profile.business_type || 'Vendor',
          phone: profile.phone,
          email: profile.email,
        },
        stats,
      };
    } catch (error) {
      console.error('[Vendor Profile] Error:', error);
      throw new Error('Failed to fetch vendor profile');
    }
  });
