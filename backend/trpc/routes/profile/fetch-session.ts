import { protectedProcedure } from '@/backend/trpc/create-context';

export const fetchUserSessionProcedure = protectedProcedure
  .query(async ({ ctx }: { ctx: any }) => {
    const userId = ctx.user.id;

    console.log('📊 Fetching user session details:', { userId });

    try {
      // In production, fetch from Supabase with joins
      // const { data, error } = await supabase
      //   .from('users')
      //   .select(`
      //     *,
      //     user_roles(*),
      //     subscriptions(*),
      //     verification_requests(*)
      //   `)
      //   .eq('user_id', userId)
      //   .single();

      // Mock session data for demo
      const sessionData = {
        user: {
          id: userId,
          fullName: 'John Farmer',
          email: 'john@example.com',
          phone: '+254705256259',
          location: 'Nairobi, Kenya',
          profilePictureUrl: null,
          isVerified: true,
          reputationScore: 88,
          membershipTier: 'gold',
          kycStatus: 'verified',
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: new Date().toISOString(),
        },
        role: {
          roleType: 'vendor',
          tier: 'verified',
          verificationStatus: 'human_verified',
          itemLimit: 50,
          isActive: true,
        },
        subscription: {
          tier: 'gold',
          status: 'active',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
        },
        stats: {
          totalOrders: 47,
          completedDeliveries: 89,
          customerRating: 4.8,
          totalEarnings: 156800,
          productsListed: 24,
          servicesOffered: 6,
        },
        badges: [
          { name: 'Top Seller', earnedAt: '2024-02-15T00:00:00Z' },
          { name: 'Community Helper', earnedAt: '2024-03-01T00:00:00Z' },
          { name: 'Early Adopter', earnedAt: '2024-01-15T00:00:00Z' },
        ],
        preferences: {
          language: 'en',
          currency: 'KES',
          notifications: {
            email: true,
            sms: true,
            push: true,
          },
        },
      };

      console.log('✅ Session data fetched successfully');

      return {
        success: true,
        data: sessionData,
      };

    } catch (error) {
      console.error('❌ Session fetch error:', error);
      throw new Error('Failed to fetch session data');
    }
  });