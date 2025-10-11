import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const fetchUserSessionProcedure = protectedProcedure
  .query(async ({ ctx }: { ctx: any }) => {
    const userId = ctx.user.id;

    console.log('📊 Fetching user session details for userId:', userId);

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) {
        console.error('❌ Error fetching user from database:', userError);
        throw new Error('Failed to fetch user data from database');
      }

      if (!userData) {
        throw new Error('User not found in database');
      }

      console.log('✅ User data fetched from database:', {
        name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.photo_url
      });

      const sessionData = {
        user: {
          id: userData.user_id,
          fullName: userData.full_name || 'User',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || 'Nairobi, Kenya',
          profilePictureUrl: userData.photo_url || null,
          avatarUrl: userData.photo_url || null,
          isVerified: userData.kyc_status === 'verified',
          reputationScore: userData.reputation_score || 0,
          membershipTier: userData.tier === 'none' ? 'basic' : 
                         userData.tier === 'verified' ? 'basic' :
                         userData.tier === 'gold' ? 'premium' : 'elite',
          kycStatus: userData.kyc_status || 'pending',
          createdAt: userData.created_at || new Date().toISOString(),
          lastLogin: userData.last_login || new Date().toISOString(),
        },
        role: {
          roleType: userData.user_role || 'buyer',
          tier: userData.tier || 'none',
          verificationStatus: userData.verification_status || 'unverified',
          itemLimit: userData.item_limit || 0,
          isActive: true,
        },
        subscription: {
          tier: userData.subscription_status || 'none',
          status: userData.subscription_status === 'none' ? 'inactive' : 'active',
          startDate: userData.created_at || null,
          endDate: null,
        },
        stats: {
          totalOrders: 0,
          completedDeliveries: 0,
          customerRating: 0,
          totalEarnings: 0,
          productsListed: 0,
          servicesOffered: 0,
        },
        badges: [],
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

      console.log('✅ Session data built successfully');

      return {
        success: true,
        data: sessionData,
      };

    } catch (error) {
      console.error('❌ Session fetch error:', error);
      throw new Error('Failed to fetch session data');
    }
  });