import { supabase, UserRole, UserTier, VerificationStatus, VerificationMethod, UserRoleRecord, VerificationRequest } from '@/lib/supabase';

export interface RoleUpgradeRequest {
  userId: string;
  roleType: UserRole;
  verificationMethod: VerificationMethod;
  documentUrls?: string[];
}

export interface RoleUpgradeResult {
  success: boolean;
  message?: string;
  error?: string;
  requiresVerification?: boolean;
  verificationRequestId?: string;
}

export interface TierLimits {
  itemLimit: number;
  features: string[];
  description: string;
  price?: number;
}

// Define tier limits for each role
const TIER_LIMITS: Record<UserRole, Record<UserTier, TierLimits>> = {
  buyer: {
    none: { itemLimit: 0, features: ['Browse marketplace', 'Make purchases'], description: 'Basic buyer access' },
    verified: { itemLimit: 0, features: ['Browse marketplace', 'Make purchases', 'Leave reviews'], description: 'Verified buyer' },
    gold: { itemLimit: 0, features: ['Browse marketplace', 'Make purchases', 'Leave reviews', 'Priority support'], description: 'Gold buyer' },
    premium: { itemLimit: 0, features: ['Browse marketplace', 'Make purchases', 'Leave reviews', 'Priority support', 'Exclusive deals'], description: 'Premium buyer' },
    elite: { itemLimit: 0, features: ['Browse marketplace', 'Make purchases', 'Leave reviews', 'Priority support', 'Exclusive deals', 'VIP access'], description: 'Elite buyer' }
  },
  seller: {
    none: { itemLimit: 0, features: [], description: 'No selling access' },
    verified: { itemLimit: 10, features: ['List up to 10 items', 'Basic seller dashboard'], description: 'Verified Seller (AI ID Check)', price: 0 },
    gold: { itemLimit: -1, features: ['Unlimited items', 'Local priority search', 'Seller analytics'], description: 'Gold Seller (Human + QR Verification)', price: 0 },
    premium: { itemLimit: -1, features: ['Unlimited items', 'Regional/national reach', 'Advanced analytics', 'Discounted logistics'], description: 'Premium Seller (Human + QR Verification)', price: 0 },
    elite: { itemLimit: -1, features: ['Multi-market/export access', 'Staff/agent accounts', 'Exclusive opportunities'], description: 'Elite Seller (Admin Approved)', price: 0 }
  },
  service_provider: {
    none: { itemLimit: 0, features: [], description: 'No service access' },
    verified: { itemLimit: 10, features: ['List services', 'Services dashboard'], description: 'Verified Service (AI ID Check)', price: 0 },
    gold: { itemLimit: -1, features: ['Unlimited services', 'Local priority search'], description: 'Gold Service', price: 0 },
    premium: { itemLimit: -1, features: ['Unlimited services', 'Regional/national reach'], description: 'Premium Service', price: 0 },
    elite: { itemLimit: -1, features: ['Institutional access', 'Staff accounts'], description: 'Elite Service (Admin Approved)', price: 0 }
  },
  logistics_provider: {
    none: { itemLimit: 0, features: [], description: 'No logistics access' },
    verified: { itemLimit: 10, features: ['Local deliveries only'], description: 'Basic Logistics (AI ID Check)', price: 0 },
    gold: { itemLimit: -1, features: ['Regional/national deliveries', 'Pooling requests'], description: 'Premium Logistics (Human + QR Verification)', price: 0 },
    premium: { itemLimit: -1, features: ['Regional/national deliveries', 'Pooling requests', 'Advanced routing'], description: 'Premium Logistics (Human + QR Verification)', price: 0 },
    elite: { itemLimit: -1, features: ['Export + bulk contracts', 'Staff accounts'], description: 'Elite Logistics (Admin Approved)', price: 0 }
  },
  farmer: {
    none: { itemLimit: 0, features: [], description: 'No farm access' },
    verified: { itemLimit: 1, features: ['Farm records', 'Basic management tools'], description: 'Verified Farm (AI ID Check)', price: 0 },
    gold: { itemLimit: -1, features: ['Advanced analytics', 'Advisory services'], description: 'Premium Farm', price: 0 },
    premium: { itemLimit: -1, features: ['Advanced analytics', 'Advisory services', 'Marketplace integration'], description: 'Premium Farm', price: 0 },
    elite: { itemLimit: -1, features: ['Advanced analytics', 'Advisory services', 'Marketplace integration', 'Export access'], description: 'Elite Farm (Admin Approved)', price: 0 }
  }
};

class RoleService {
  // Get tier limits for a specific role and tier
  getTierLimits(role: UserRole, tier: UserTier): TierLimits {
    return TIER_LIMITS[role][tier] || TIER_LIMITS[role].none;
  }

  // Get all available tiers for a role
  getAvailableTiers(role: UserRole): Array<{ tier: UserTier; limits: TierLimits }> {
    return Object.entries(TIER_LIMITS[role]).map(([tier, limits]) => ({
      tier: tier as UserTier,
      limits
    }));
  }

  // Check if user can upgrade to a specific tier
  canUpgradeToTier(currentTier: UserTier, targetTier: UserTier): boolean {
    const tierOrder: UserTier[] = ['none', 'verified', 'gold', 'premium', 'elite'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const targetIndex = tierOrder.indexOf(targetTier);
    return targetIndex > currentIndex;
  }

  // Get required verification method for tier upgrade
  getRequiredVerificationMethod(targetTier: UserTier): VerificationMethod {
    switch (targetTier) {
      case 'verified':
        return 'ai_id';
      case 'gold':
      case 'premium':
        return 'human_qr';
      case 'elite':
        return 'admin_approval';
      default:
        return 'ai_id';
    }
  }

  // Request role upgrade
  async requestRoleUpgrade(request: RoleUpgradeRequest): Promise<RoleUpgradeResult> {
    try {
      console.log('🔄 Requesting role upgrade:', request);

      // Check if user already has this role
      const { data: existingRole, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', request.userId)
        .eq('role_type', request.roleType)
        .eq('is_active', true)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('❌ Error checking existing role:', roleError);
        return { success: false, error: 'Failed to check existing role' };
      }

      if (existingRole) {
        return { success: false, error: 'You already have this role' };
      }

      // Create verification request
      const { data: verificationRequest, error: verificationError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: request.userId,
          role_type: request.roleType,
          verification_method: request.verificationMethod,
          document_urls: request.documentUrls || [],
          status: 'pending'
        })
        .select()
        .single();

      if (verificationError) {
        console.error('❌ Error creating verification request:', verificationError);
        return { success: false, error: 'Failed to create verification request' };
      }

      // For AI verification, auto-approve (simulate AI processing)
      if (request.verificationMethod === 'ai_id') {
        const approvalResult = await this.processAIVerification(verificationRequest.id, request.userId, request.roleType);
        if (approvalResult.success) {
          return {
            success: true,
            message: '🎉 Role upgrade approved! You can now access your new features.',
            verificationRequestId: verificationRequest.id
          };
        }
      }

      return {
        success: true,
        requiresVerification: true,
        message: 'Verification request submitted. You will be notified once reviewed.',
        verificationRequestId: verificationRequest.id
      };
    } catch (error) {
      console.error('❌ Role upgrade request error:', error);
      return { success: false, error: 'Failed to request role upgrade' };
    }
  }

  // Process AI verification (simulate AI processing)
  private async processAIVerification(requestId: string, userId: string, roleType: UserRole): Promise<RoleUpgradeResult> {
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate 90% success rate for AI verification
      const isApproved = Math.random() > 0.1;

      if (isApproved) {
        // Update verification request status
        await supabase
          .from('verification_requests')
          .update({
            status: 'approved',
            review_notes: 'Automatically approved by AI verification system'
          })
          .eq('id', requestId);

        // Create user role record
        await this.createUserRole(userId, roleType, 'verified', 'ai_verified');

        return { success: true, message: 'AI verification successful' };
      } else {
        // Update verification request status
        await supabase
          .from('verification_requests')
          .update({
            status: 'rejected',
            review_notes: 'AI verification failed. Please ensure documents are clear and valid.'
          })
          .eq('id', requestId);

        return { success: false, error: 'AI verification failed. Please try again with clearer documents.' };
      }
    } catch (error) {
      console.error('❌ AI verification error:', error);
      return { success: false, error: 'AI verification processing failed' };
    }
  }

  // Create user role record
  private async createUserRole(userId: string, roleType: UserRole, tier: UserTier, verificationStatus: VerificationStatus): Promise<void> {
    const limits = this.getTierLimits(roleType, tier);
    
    await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_type: roleType,
        tier: tier,
        verification_status: verificationStatus,
        verification_method: this.getRequiredVerificationMethod(tier),
        verification_date: new Date().toISOString(),
        item_limit: limits.itemLimit,
        is_active: true
      });

    // Update user's current role and tier
    await supabase
      .from('users')
      .update({
        current_role: roleType,
        tier: tier,
        verification_status: verificationStatus,
        item_limit: limits.itemLimit,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  }

  // Get user's current roles
  async getUserRoles(userId: string): Promise<UserRoleRecord[]> {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user roles:', error);
        return [];
      }

      return roles || [];
    } catch (error) {
      console.error('❌ Get user roles error:', error);
      return [];
    }
  }

  // Get user's verification requests
  async getUserVerificationRequests(userId: string): Promise<VerificationRequest[]> {
    try {
      const { data: requests, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching verification requests:', error);
        return [];
      }

      return requests || [];
    } catch (error) {
      console.error('❌ Get verification requests error:', error);
      return [];
    }
  }

  // Check if user can perform action based on role and tier
  async canPerformAction(userId: string, action: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('current_role, tier, item_limit')
        .eq('user_id', userId)
        .single();

      if (error || !user) {
        return false;
      }

      const limits = this.getTierLimits(user.current_role, user.tier);

      switch (action) {
        case 'create_listing':
          if (user.current_role === 'buyer') return false;
          if (limits.itemLimit === -1) return true; // Unlimited
          
          // Check current item count
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_available', true);

          return (count || 0) < limits.itemLimit;

        case 'access_analytics':
          return limits.features.some(f => f.includes('analytics'));

        case 'priority_support':
          return limits.features.includes('Priority support');

        case 'staff_accounts':
          return limits.features.includes('Staff accounts') || limits.features.includes('Staff/agent accounts');

        default:
          return true;
      }
    } catch (error) {
      console.error('❌ Error checking user permissions:', error);
      return false;
    }
  }

  // Get role upgrade path for user
  async getRoleUpgradePath(userId: string, targetRole: UserRole): Promise<{
    currentTier: UserTier;
    availableUpgrades: Array<{
      tier: UserTier;
      limits: TierLimits;
      verificationMethod: VerificationMethod;
      canUpgrade: boolean;
    }>;
  }> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('tier')
        .eq('user_id', userId)
        .single();

      const currentTier = user?.tier || 'none';
      const availableTiers = this.getAvailableTiers(targetRole);

      const availableUpgrades = availableTiers.map(({ tier, limits }) => ({
        tier,
        limits,
        verificationMethod: this.getRequiredVerificationMethod(tier),
        canUpgrade: this.canUpgradeToTier(currentTier, tier)
      }));

      return {
        currentTier,
        availableUpgrades
      };
    } catch (error) {
      console.error('❌ Error getting upgrade path:', error);
      return {
        currentTier: 'none',
        availableUpgrades: []
      };
    }
  }
}

export const roleService = new RoleService();