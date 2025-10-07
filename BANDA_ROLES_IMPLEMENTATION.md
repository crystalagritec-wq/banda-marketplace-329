# Banda User Roles & Verification System Implementation

This document outlines the comprehensive user roles, verification, and access control system implemented for Banda using Supabase and React Native.

## 🏗️ System Architecture

### Core Components

1. **Database Schema** (`SUPABASE_ROLES_SCHEMA.sql`)
   - Extended user table with role-based fields
   - User roles tracking table
   - Verification requests management
   - Subscriptions and tier management

2. **Role Service** (`services/role-service.ts`)
   - Role upgrade requests
   - Tier limit management
   - Verification processing
   - Permission checking

3. **UI Components**
   - Role selection screen (`app/role-selection.tsx`)
   - Verification flow (`app/verification.tsx`)
   - Success confirmation (`app/verification-success.tsx`)

## 👥 User Types & Roles

### 1. Basic User (Default)
- **Role**: Buyer
- **Access**: Browse marketplace, make purchases
- **Restrictions**: Cannot sell, deliver, or offer services

### 2. Seller Roles

#### Verified Seller (AI ID Check)
- **Tier**: Verified
- **Item Limit**: 10 items
- **Features**: Basic seller dashboard
- **Verification**: AI ID verification

#### Gold Seller (Human + QR Verification)
- **Tier**: Gold
- **Item Limit**: Unlimited
- **Features**: Local priority search, seller analytics
- **Verification**: Human review + QR verification

#### Premium Seller (Human + QR Verification)
- **Tier**: Premium
- **Item Limit**: Unlimited
- **Features**: Regional/national reach, advanced analytics, discounted logistics
- **Verification**: Human review + QR verification

#### Elite Seller (Admin Approved)
- **Tier**: Elite
- **Item Limit**: Unlimited
- **Features**: Multi-market/export access, staff accounts, exclusive opportunities
- **Verification**: Admin approval required

### 3. Service Provider Roles

#### Verified Service (AI ID Check)
- **Tier**: Verified
- **Service Limit**: 10 services
- **Features**: List services, services dashboard

#### Gold Service
- **Tier**: Gold
- **Service Limit**: Unlimited
- **Features**: Local priority search

#### Premium Service
- **Tier**: Premium
- **Service Limit**: Unlimited
- **Features**: Regional/national reach

#### Elite Service (Admin Approved)
- **Tier**: Elite
- **Service Limit**: Unlimited
- **Features**: Institutional access, staff accounts

### 4. Logistics Provider Roles

#### Basic Logistics (AI ID Check)
- **Tier**: Verified
- **Features**: Local deliveries only

#### Premium Logistics (Human + QR Verification)
- **Tier**: Gold/Premium
- **Features**: Regional/national deliveries, pooling requests

#### Elite Logistics (Admin Approved)
- **Tier**: Elite
- **Features**: Export + bulk contracts, staff accounts

### 5. Farmer Roles

#### Verified Farm (AI ID Check)
- **Tier**: Verified
- **Features**: Farm records, basic management tools

#### Premium Farm
- **Tier**: Gold/Premium
- **Features**: Advanced analytics, advisory services, marketplace integration

## 🔐 Verification System

### Verification Methods

1. **AI ID Verification** (`ai_id`)
   - Automated document processing
   - 2-5 minute processing time
   - 90% success rate simulation
   - Required documents: ID front, ID back, selfie

2. **Human + QR Verification** (`human_qr`)
   - Human review by field agents
   - QR code verification
   - 1-2 business days processing
   - Required documents: ID, business license, location proof

3. **Admin Approval** (`admin_approval`)
   - Manual admin review
   - 3-5 business days processing
   - Required documents: Application form, business plan, references

### Verification Flow

1. **Role Selection**: User chooses desired role after account creation
2. **Document Upload**: User uploads required documents based on verification method
3. **Processing**: System processes verification request
4. **Approval/Rejection**: User receives notification of result
5. **Role Activation**: Approved users get access to new role features

## 🛡️ Access Control & Permissions

### Database-Level Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Admin users have elevated permissions
- System functions handle role upgrades securely

### Application-Level Permissions

```typescript
// Example permission checks
const canCreateListing = await roleService.canPerformAction(userId, 'create_listing');
const hasAnalytics = await roleService.canPerformAction(userId, 'access_analytics');
const hasPrioritySupport = await roleService.canPerformAction(userId, 'priority_support');
```

### Tier Limits Enforcement

- **Item Limits**: Enforced at database level
- **Feature Access**: Controlled by tier-based feature flags
- **Geographic Reach**: Local vs regional vs national access
- **Staff Accounts**: Elite tiers can create sub-accounts

## 📱 User Experience Flow

### New User Journey

1. **Account Creation**: User creates account (defaults to Basic Buyer)
2. **Role Selection**: User chooses desired role from options
3. **Verification**: User completes verification process if required
4. **Approval**: User receives notification of verification result
5. **Feature Access**: User gains access to role-specific features

### Existing User Upgrade

1. **Role Request**: User requests role upgrade from profile
2. **Verification**: User completes higher-tier verification
3. **Processing**: System processes upgrade request
4. **Activation**: New role features become available

## 🔧 Technical Implementation

### Database Schema

```sql
-- Core tables
- users (extended with role fields)
- user_roles (multiple roles per user)
- verification_requests (verification tracking)
- subscriptions (tier subscriptions)

-- Key functions
- get_user_tier_limits(user_id, role)
- can_user_perform_action(user_id, action)
- upgrade_user_role(user_id, role, tier, status)
```

### React Native Components

```typescript
// Key components
- RoleSelectionScreen: Choose user role
- VerificationScreen: Document upload flow
- VerificationSuccessScreen: Confirmation
- RoleService: Backend integration
```

### State Management

- **Auth Provider**: Manages user authentication and role state
- **Role Service**: Handles role upgrades and permissions
- **Supabase Integration**: Real-time data synchronization

## 🚀 Deployment & Setup

### Database Setup

1. Run `SUPABASE_ROLES_SCHEMA.sql` in your Supabase SQL editor
2. Verify all tables and functions are created
3. Test RLS policies are working correctly

### Environment Configuration

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Application Integration

1. Import role service in your components
2. Use auth provider for role state management
3. Implement permission checks in UI components
4. Test verification flows end-to-end

## 📊 Monitoring & Analytics

### Key Metrics to Track

- **Verification Success Rates**: By method and role type
- **Role Distribution**: Number of users per role/tier
- **Upgrade Conversion**: Users upgrading to higher tiers
- **Feature Usage**: Tier-specific feature adoption

### Error Handling

- **Database Errors**: Graceful fallbacks and user messaging
- **Verification Failures**: Clear error messages and retry options
- **Permission Denials**: Informative upgrade prompts

## 🔮 Future Enhancements

### Planned Features

1. **Subscription Management**: Paid tier subscriptions
2. **Staff Account Management**: Sub-accounts for Elite users
3. **Advanced Analytics**: Role-specific dashboards
4. **Automated Tier Upgrades**: Based on performance metrics
5. **Multi-Region Support**: Geographic role restrictions

### Scalability Considerations

- **Caching**: Role permissions and tier limits
- **Background Processing**: Verification queue management
- **Rate Limiting**: Verification request throttling
- **Audit Logging**: Role change tracking

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check Supabase URL and keys
   - Verify network connectivity
   - Ensure RLS policies are correct

2. **Verification Failures**
   - Check document upload functionality
   - Verify AI processing simulation
   - Test notification system

3. **Permission Errors**
   - Verify user role assignments
   - Check tier limit calculations
   - Test permission functions

### Debug Tools

- **Console Logging**: Comprehensive error tracking
- **Supabase Dashboard**: Real-time data monitoring
- **React Native Debugger**: State inspection

## 📚 API Reference

### Role Service Methods

```typescript
// Get available tiers for a role
roleService.getAvailableTiers(role: UserRole)

// Request role upgrade
roleService.requestRoleUpgrade(request: RoleUpgradeRequest)

// Check user permissions
roleService.canPerformAction(userId: string, action: string)

// Get upgrade path
roleService.getRoleUpgradePath(userId: string, targetRole: UserRole)
```

### Database Functions

```sql
-- Get tier limits
SELECT * FROM get_user_tier_limits('user_id', 'seller');

-- Check permissions
SELECT can_user_perform_action('user_id', 'create_listing');

-- Upgrade role
SELECT upgrade_user_role('user_id', 'seller', 'verified', 'ai_verified');
```

This comprehensive system provides a scalable foundation for role-based access control in Banda, with clear upgrade paths and robust verification processes.