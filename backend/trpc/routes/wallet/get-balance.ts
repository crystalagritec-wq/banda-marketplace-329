import { protectedProcedure } from '@/backend/trpc/create-context';

export const getWalletBalanceProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.user.id;

    console.log('💰 Fetching wallet balance for:', userId);

    try {
      const { data, error } = await ctx.supabase.rpc('get_user_wallet', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Wallet balance fetch error:', error);
        throw new Error('Failed to fetch wallet balance');
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No wallet found, creating one...');
        
        const { error: insertError } = await ctx.supabase
          .from('wallet')
          .insert({
            user_id: userId,
            trading_balance: 0,
            savings_balance: 0,
            reserve_balance: 0,
            total_earned: 0,
            total_spent: 0
          });

        if (insertError) {
          console.error('❌ Wallet creation error:', insertError);
          throw new Error('Failed to create wallet');
        }

        return {
          success: true,
          wallet: {
            user_id: userId,
            trading_balance: 0,
            savings_balance: 0,
            reserve_balance: 0,
            total_balance: 0,
            total_earned: 0,
            total_spent: 0,
            has_pin: false
          }
        };
      }

      const walletData = data[0];

      const { data: pinData } = await ctx.supabase
        .from('wallet_pins')
        .select('id')
        .eq('user_id', userId)
        .single();

      console.log('✅ Wallet balance fetched successfully');
      
      return {
        success: true,
        wallet: {
          user_id: walletData.user_id,
          trading_balance: parseFloat(walletData.trading_balance),
          savings_balance: parseFloat(walletData.savings_balance),
          reserve_balance: parseFloat(walletData.reserve_balance),
          total_balance: parseFloat(walletData.total_balance),
          total_earned: parseFloat(walletData.total_earned),
          total_spent: parseFloat(walletData.total_spent),
          has_pin: !!pinData
        }
      };

    } catch (error) {
      console.error('❌ Get wallet balance error:', error);
      throw new Error('Failed to fetch wallet balance');
    }
  });
