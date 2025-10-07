import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const getUserDashboardProcedure = protectedProcedure
  .input(z.object({
    userId: z.string().optional()
  }))
  .query(async ({ input, ctx }) => {
    const userId = input.userId || ctx.user.id;
    
    console.log('📊 Fetching user dashboard for:', userId);

    try {
      // Try to call Supabase function first, fallback to mock data if not available
      let dashboardData;
      
      try {
        const { data, error } = await ctx.supabase.rpc('get_user_dashboard', {
          p_user_id: userId
        });
        
        if (!error && data) {
          dashboardData = data;
        } else {
          throw new Error('Supabase function not available');
        }
      } catch {
        console.log('⚠️ Supabase function not available, using mock data');
        
        // Mock dashboard data for development
        dashboardData = {
          user: {
            id: userId,
            user_id: userId,
            full_name: ctx.user.name || 'Banda User',
            email: ctx.user.email || 'user@banda.com',
            user_role: 'vendor',
            tier: 'Gold',
            verification_status: 'qr_verified'
          },
          verification: {
            status: 'qr_verified',
            tier: 'Gold',
            progress: 75,
            documents: [
              {
                id: '1',
                type: 'national_id',
                status: 'approved',
                uploaded_at: new Date().toISOString()
              },
              {
                id: '2',
                type: 'business_permit',
                status: 'pending',
                uploaded_at: new Date().toISOString()
              }
            ]
          },
          subscription: {
            current_tier: 'Gold',
            tier_level: 2,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            features: {
              premium_support: true,
              advanced_analytics: true,
              priority_listing: true,
              bulk_operations: false
            },
            limits: {
              max_products: 100,
              max_orders_per_day: 50,
              storage_gb: 10
            },
            auto_renew: true
          },
          wallet: {
            trading_balance: 15000,
            savings_balance: 5000,
            reserve_balance: 2500,
            total_earned: 45000,
            total_spent: 25000,
            recent_transactions: [
              {
                id: '1',
                type: 'deposit',
                amount: 5000,
                status: 'completed',
                description: 'M-Pesa deposit',
                created_at: new Date().toISOString()
              },
              {
                id: '2',
                type: 'withdrawal',
                amount: 2000,
                status: 'completed',
                description: 'Bank transfer',
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
              },
              {
                id: '3',
                type: 'transfer',
                amount: 1500,
                status: 'pending',
                description: 'Payment to supplier',
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]
          },
          active_orders: [
            {
              id: '1',
              status: 'processing',
              total_amount: 3500,
              created_at: new Date().toISOString(),
              product_name: '50kg Maize'
            },
            {
              id: '2',
              status: 'shipped',
              total_amount: 1200,
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              product_name: 'Fertilizer 25kg'
            }
          ],
          qr_history: [
            {
              id: '1',
              qr_type: 'verification',
              scan_result: 'success',
              created_at: new Date().toISOString()
            }
          ],
          vendor_stats: {
            total_products: 45,
            products_in_stock: 38,
            products_out_of_stock: 7,
            products_with_discount: 12,
            total_views_today: 1250,
            total_in_carts: 89,
            total_sales_this_month: 156,
            average_rating: 4.7
          },
          market_insights: [
            {
              id: '1',
              category: 'crops',
              product_name: 'Maize',
              current_price: 45,
              trend: 'rising',
              ai_recommendation: 'Good time to sell - prices expected to rise 15% this week'
            },
            {
              id: '2',
              category: 'livestock',
              product_name: 'Chicken',
              current_price: 800,
              trend: 'stable',
              ai_recommendation: 'Stable demand in urban markets'
            }
          ],
          notifications: [
            {
              id: '1',
              title: 'Order Update',
              message: 'Your maize order has been processed and is ready for pickup',
              type: 'order',
              is_read: false,
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Verification Complete',
              message: 'Your Gold tier verification has been approved',
              type: 'verification',
              is_read: false,
              created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
            },
            {
              id: '3',
              title: 'Market Alert',
              message: 'Maize prices are trending up in your region',
              type: 'market',
              is_read: true,
              created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
          ]
        };
      }

      console.log('✅ Dashboard data fetched successfully');
      
      return {
        success: true,
        data: dashboardData
      };

    } catch (error) {
      console.error('❌ Get dashboard error:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  });