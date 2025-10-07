import { protectedProcedure } from '../../create-context';

export const getMyShopProcedure = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;

  console.log('[GetMyShop] Fetching shop for user:', userId);

  const { data: profile, error: profileError } = await ctx.supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('[GetMyShop] Error fetching profile:', profileError);
    throw new Error('Failed to fetch profile');
  }

  const hasShop = Boolean(
    profile.business_name || 
    profile.business_type === 'Vendor' ||
    profile.business_type === 'Shop'
  );

  const { data: products } = await ctx.supabase
    .from('marketplace_products')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  const hasProducts = Boolean(products && products.length > 0);

  console.log('[GetMyShop] Shop status:', { hasShop, hasProducts });

  return {
    exists: hasShop || hasProducts,
    profile: hasShop ? profile : null,
    hasProducts,
  };
});
