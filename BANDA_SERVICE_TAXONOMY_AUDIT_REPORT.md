# Banda Service Provider Labor & Skills Taxonomy - Comprehensive Audit Report

**Date:** 2026-01-05  
**System:** Banda Marketplace Service Provider Infrastructure  
**Focus:** Deep Labor & Skills Taxonomy Implementation

---

## Executive Summary

This audit analyzes the current Banda service provider system against the new comprehensive labor & skills taxonomy. The taxonomy expands from 22 generic service types to **100+ specific skill-based specializations** across 11 major industry categories, with detailed metadata for verification, licensing, risk management, and admin curation.

**Current Status:** Basic service marketplace exists but lacks:
- Granular skill categorization
- Certification/license tracking
- Risk-based verification
- Admin-curated trust system
- Tiered subscription logic
- Locked field management post-approval

---

## I. Current Implementation Analysis

### ✅ What Exists

#### 1. Database Schema (SUPABASE_SERVICE_PROVIDERS_ENHANCED_SCHEMA.sql)
```sql
✓ service_providers table (basic)
✓ service_specializations table
✓ service_requests table
✓ service_marketplace_posts table
✓ service_equipment table
✓ Request number generation
✓ Provider stats tracking
✓ Dashboard views
```

#### 2. Service Types (constants/service-types.ts)
```typescript
✓ 22 basic service categories
✓ Generic categorization (agriculture, veterinary, health, etc.)
✓ Basic metadata (provider_type, verification_notes)
```

#### 3. Backend Routes (tRPC)
```typescript
✓ createMarketplacePost
✓ getMarketplaceServices
✓ getMarketplaceEquipment
✓ createProfile
✓ getProfile
✓ getDashboardStats
```

#### 4. Frontend Screens
```typescript
✓ Services listing (/services.tsx)
✓ Service details (/service-details.tsx)
✓ Service creation (/management/services/listings/new.tsx)
✓ Equipment listing (/equipment.tsx)
✓ Equipment details (/equipment-details.tsx)
✓ Provider dashboard (/service-provider-dashboard.tsx)
```

#### 5. UI Components
```typescript
✓ ServiceCard (basic display)
✓ EquipmentCard
✓ EmptyState
✓ FilterBottomSheet
```

---

## II. Gap Analysis: What's Missing

### ❌ Critical Missing Features

#### 1. **Granular Taxonomy System**
**Current:** 22 broad categories  
**Required:** 100+ specific specializations with parent → category → subcategory → specialization hierarchy

**Impact:** 
- Users can't find specific skilled labor
- No differentiation between tractor operators vs manual plowing
- Search/discovery is too broad

---

#### 2. **Service Metadata & Verification System**

**Missing Fields:**
```typescript
❌ serviceType: 'Individual' | 'Team' | 'Company'
❌ skillLevel: 'Basic' | 'Skilled' | 'Expert' | 'Master'
❌ certificationRequired: boolean
❌ licenseRequired: boolean
❌ riskLevel: 'Low' | 'Medium' | 'High'
❌ bookingMode: ['Hourly', 'Daily', 'Project', 'Contract']
❌ toolsProvidedBy: 'Client' | 'Provider' | 'Both'
❌ insuranceRequired: boolean
❌ backgroundCheckStatus
❌ adminApprovalStatus
❌ lockedFields: string[]
```

**Impact:**
- No risk-based verification workflows
- No insurance requirement tracking
- No admin-curated trust system
- Can't enforce certification requirements

---

#### 3. **Tiered Subscription Access**

**Current:** All service types available to all providers  
**Required:** 
- Basic tier: Low-risk, basic labor services only
- Professional tier: Skilled labor with certifications
- Business tier: Company-level services with insurance
- Enterprise tier: High-risk operations with full licensing

**Missing Implementation:**
- Subscription tier checks in service creation
- Locked service types per tier
- Upgrade prompts when trying to list restricted services

---

#### 4. **Admin Curation & Approval System**

**Current:** Basic verification_status field  
**Required:**
- Admin approval workflow for high-risk services
- Field-locking after admin approval
- Specialist review queue
- Certification document verification
- Insurance policy validation

**Missing Components:**
- Admin approval dashboard
- Verification queue management
- Document review system
- Field lock enforcement
- Approval notification system

---

#### 5. **Certification & License Management**

**Current:** No license tracking  
**Required:**
```typescript
❌ Certification uploads per specialization
❌ License number validation
❌ Expiry date tracking
❌ Auto-deactivation on expiry
❌ Renewal reminders
❌ Multi-certification support (e.g., electrician + solar tech)
```

---

#### 6. **Risk-Based Workflows**

**Current:** Single approval flow for all services  
**Required:**
- **Low Risk:** Auto-approve with basic ID
- **Medium Risk:** Admin review + certification check
- **High Risk:** Full background check + insurance + license verification + field inspection

**Missing:**
- Risk scoring algorithm
- Conditional approval flows
- Insurance policy validation
- Background check integration
- Field agent verification system

---

#### 7. **Booking & Scheduling Logic**

**Current:** Generic "Instant or Scheduled"  
**Required:**
- Hourly bookings (e.g., electrician, plumber)
- Daily bookings (e.g., farm labor, welding)
- Project-based (e.g., construction, pond building)
- Contract-based (e.g., farm management, security)

**Missing:**
- Multi-mode pricing (hourly rate vs daily rate vs project quote)
- Availability calendar per booking mode
- Contract template management
- Milestone-based payments for projects

---

#### 8. **Tools & Equipment Attribution**

**Current:** Equipment listed separately, no link to services  
**Required:**
- Clear indication: "Tools Provided by Provider" vs "Client provides tools"
- Equipment rental cost calculation
- Tool inspection status
- Maintenance badges

**Missing:**
- Tools-to-service linkage
- Equipment cost breakdown in quotes
- Client tool requirements checklist

---

#### 9. **Insurance & Liability Tracking**

**Current:** No insurance management  
**Required:**
```typescript
❌ Insurance policy uploads
❌ Policy number & provider
❌ Coverage amount
❌ Expiry tracking
❌ Auto-deactivation on lapse
❌ Claim history (for high-risk services)
```

---

#### 10. **Search & Discovery Enhancements**

**Current:** Basic text search + category filter  
**Required:**
- Hierarchical filtering (Parent → Category → Subcategory → Specialization)
- Skill level filters
- Certification badges in search results
- Risk level indicators
- "Verified Expert" vs "Basic Labor" distinction
- "Instant Book" vs "Requires Approval" badges

---

## III. Database Schema Gaps

### Required Schema Additions

#### 1. Service Taxonomy Tables

```sql
-- NEW: Service taxonomy master table
CREATE TABLE service_taxonomy (
  id TEXT PRIMARY KEY,
  parent_category TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  specialization TEXT,
  icon TEXT,
  
  -- Metadata
  service_type TEXT CHECK (service_type IN ('Individual', 'Team', 'Company')),
  skill_level TEXT CHECK (skill_level IN ('Basic', 'Skilled', 'Expert', 'Master')),
  certification_required BOOLEAN DEFAULT false,
  license_required BOOLEAN DEFAULT false,
  risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')),
  booking_modes TEXT[] DEFAULT ARRAY[]::TEXT[],
  tools_provided_by TEXT CHECK (tools_provided_by IN ('Client', 'Provider', 'Both')),
  insurance_required BOOLEAN DEFAULT false,
  
  -- Subscription tiers
  minimum_tier TEXT CHECK (minimum_tier IN ('Basic', 'Professional', 'Business', 'Enterprise')),
  
  is_active BOOLEAN DEFAULT true,
  requires_admin_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Provider Certifications & Licenses

```sql
-- NEW: Provider certifications
CREATE TABLE provider_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  service_taxonomy_id TEXT NOT NULL REFERENCES service_taxonomy(id),
  
  certification_type TEXT NOT NULL,
  certificate_number TEXT,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  
  document_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_certifications_provider ON provider_certifications(provider_id);
CREATE INDEX idx_provider_certifications_status ON provider_certifications(verification_status);
CREATE INDEX idx_provider_certifications_expiry ON provider_certifications(expiry_date);
```

#### 3. Insurance Policies

```sql
-- NEW: Provider insurance policies
CREATE TABLE provider_insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  policy_number TEXT NOT NULL,
  insurance_provider TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  coverage_amount DECIMAL(12, 2),
  
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  
  document_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_insurance_provider ON provider_insurance(provider_id);
CREATE INDEX idx_provider_insurance_expiry ON provider_insurance(expiry_date);
CREATE INDEX idx_provider_insurance_active ON provider_insurance(is_active);
```

#### 4. Background Checks

```sql
-- NEW: Provider background checks
CREATE TABLE provider_background_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  check_type TEXT NOT NULL CHECK (check_type IN ('Criminal', 'Credit', 'Employment', 'Field Agent Verification')),
  check_provider TEXT,
  reference_number TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'expired')),
  result_summary TEXT,
  
  conducted_date DATE,
  expiry_date DATE,
  
  document_url TEXT,
  conducted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. Admin Approval Queue

```sql
-- NEW: Service listing approval queue
CREATE TABLE service_approval_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_post_id UUID REFERENCES service_marketplace_posts(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id),
  service_taxonomy_id TEXT NOT NULL REFERENCES service_taxonomy(id),
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'revision_required')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  assigned_to UUID REFERENCES profiles(id),
  review_notes TEXT,
  rejection_reason TEXT,
  
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);
```

#### 6. Locked Fields Management

```sql
-- NEW: Track locked fields after approval
CREATE TABLE service_locked_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_post_id UUID NOT NULL REFERENCES service_marketplace_posts(id) ON DELETE CASCADE,
  
  locked_fields JSONB DEFAULT '[]'::jsonb,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  locked_by UUID REFERENCES profiles(id),
  
  unlock_requested BOOLEAN DEFAULT false,
  unlock_reason TEXT,
  unlock_approved BOOLEAN,
  unlocked_at TIMESTAMPTZ
);
```

---

## IV. Backend Route Gaps

### Required New tRPC Routes

#### 1. Taxonomy Routes
```typescript
❌ /taxonomy/get-all
❌ /taxonomy/get-by-parent-category
❌ /taxonomy/get-subcategories
❌ /taxonomy/search-specializations
```

#### 2. Certification Routes
```typescript
❌ /certifications/upload
❌ /certifications/get-provider-certifications
❌ /certifications/verify (admin)
❌ /certifications/get-expiring-soon
```

#### 3. Insurance Routes
```typescript
❌ /insurance/add-policy
❌ /insurance/get-policies
❌ /insurance/verify-policy (admin)
❌ /insurance/check-coverage
```

#### 4. Approval Routes
```typescript
❌ /approvals/submit-for-review
❌ /approvals/get-queue (admin)
❌ /approvals/approve-service (admin)
❌ /approvals/reject-service (admin)
❌ /approvals/request-revision (admin)
```

#### 5. Background Check Routes
```typescript
❌ /background-checks/initiate
❌ /background-checks/get-status
❌ /background-checks/upload-result (admin)
```

#### 6. Field Lock Routes
```typescript
❌ /field-locks/lock-fields (admin)
❌ /field-locks/request-unlock
❌ /field-locks/approve-unlock (admin)
```

#### 7. Enhanced Service Routes
```typescript
❌ /services/create-with-taxonomy
❌ /services/get-by-taxonomy-filter
❌ /services/check-tier-eligibility
❌ /services/get-required-documents
```

---

## V. Frontend Screen Gaps

### Required New Screens

#### 1. Service Creation Flow (Multi-Step)
```
❌ Step 1: Select Parent Category
❌ Step 2: Select Category
❌ Step 3: Select Subcategory
❌ Step 4: Select Specialization
❌ Step 5: Review Requirements (Certs/License/Insurance)
❌ Step 6: Upload Documents
❌ Step 7: Service Details
❌ Step 8: Pricing per Booking Mode
❌ Step 9: Submit for Approval
```

#### 2. Provider Verification Center
```
❌ /verification-center.tsx
  - Certification management
  - License uploads
  - Insurance policy management
  - Background check status
  - Required vs Optional badges
  - Expiry alerts
```

#### 3. Admin Approval Dashboard
```
❌ /admin/service-approvals.tsx
  - Approval queue (priority sorted)
  - Service details review
  - Document verification
  - Risk assessment
  - Approve/Reject actions
  - Revision requests
```

#### 4. Service Search with Taxonomy
```
❌ Enhanced /services.tsx
  - Hierarchical category browser
  - Skill level filters
  - Certification badges
  - Risk indicators
  - "Verified Expert" badges
  - Tools provided indicators
```

#### 5. Subscription Tier Management
```
❌ /subscription/upgrade-prompt.tsx
  - Tier comparison table
  - Locked service types per tier
  - Upgrade benefits
  - Payment flow
```

---

## VI. Component Gaps

### Required New Components

#### 1. Taxonomy Components
```typescript
❌ <TaxonomySelector />         // Hierarchical picker
❌ <SpecializationCard />       // Display with metadata
❌ <SkillLevelBadge />         // Basic/Skilled/Expert/Master
❌ <RiskLevelIndicator />      // Low/Medium/High
❌ <CertificationBadge />      // Verified cert icon
❌ <InsuranceBadge />          // Insurance verified
```

#### 2. Verification Components
```typescript
❌ <CertificationUploader />   // Document upload + metadata
❌ <LicenseVerifier />         // License validation
❌ <InsurancePolicyCard />     // Policy details + expiry
❌ <BackgroundCheckStatus />   // Check progress
❌ <VerificationProgress />    // Overall completion %
```

#### 3. Admin Components
```typescript
❌ <ApprovalQueueItem />       // Queue entry with actions
❌ <DocumentReviewer />        // Document viewer + verify button
❌ <RiskAssessment />          // Risk scoring UI
❌ <ApprovalTimeline />        // Status history
❌ <FieldLockManager />        // Lock/unlock field controls
```

#### 4. Enhanced Service Card
```typescript
❌ Update <ServiceCard />
  + Certification badges
  + Insurance indicator
  + Risk level
  + Tools provided info
  + Booking modes
  + "Instant Book" vs "Approval Required"
```

---

## VII. Business Logic Gaps

### Critical Missing Logic

#### 1. **Tier-Based Service Access**
```typescript
// Missing: Subscription tier check before service creation
function canCreateService(
  userTier: SubscriptionTier,
  serviceId: string
): { allowed: boolean; reason?: string; upgradeRequired?: SubscriptionTier }
```

#### 2. **Risk-Based Approval Routing**
```typescript
// Missing: Auto-route to appropriate approval flow
function determineApprovalFlow(
  service: ServiceSpecialization
): 'auto_approve' | 'standard_review' | 'specialist_review' | 'field_verification'
```

#### 3. **Document Expiry Monitoring**
```typescript
// Missing: Cron job or scheduled check
function checkExpiringDocuments(): void {
  // Auto-deactivate services with expired certs/insurance
  // Send renewal reminders 30/14/7 days before expiry
  // Lock booking for expired providers
}
```

#### 4. **Field Lock Enforcement**
```typescript
// Missing: Prevent editing locked fields
function validateFieldEdit(
  postId: string,
  fieldName: string
): { allowed: boolean; reason?: string }
```

#### 5. **Multi-Mode Pricing Calculator**
```typescript
// Missing: Calculate quote based on booking mode
function calculateServiceQuote(
  serviceId: string,
  bookingMode: BookingMode,
  duration: number,
  includeTools: boolean
): { basePrice: number; toolsCost: number; total: number }
```

---

## VIII. Implementation Priority Matrix

### Phase 1: Foundation (Week 1-2)
**Priority: CRITICAL**

1. ✅ Create service-taxonomy.ts (DONE)
2. 🔴 Add taxonomy master table to database
3. 🔴 Seed database with 100+ specializations
4. 🔴 Create /taxonomy/get-all route
5. 🔴 Create <TaxonomySelector /> component
6. 🔴 Update service creation to use taxonomy

**Deliverable:** Users can select from granular taxonomy

---

### Phase 2: Verification System (Week 3-4)
**Priority: HIGH**

1. 🔴 Add certifications table
2. 🔴 Add insurance table
3. 🔴 Add background checks table
4. 🔴 Create certification upload routes
5. 🔴 Create insurance management routes
6. 🔴 Build /verification-center.tsx screen
7. 🔴 Create <CertificationUploader /> component
8. 🔴 Create <InsurancePolicyCard /> component

**Deliverable:** Providers can upload verification documents

---

### Phase 3: Admin Approval System (Week 5-6)
**Priority: HIGH**

1. 🔴 Add service_approval_queue table
2. 🔴 Add service_locked_fields table
3. 🔴 Create approval submission routes
4. 🔴 Create admin approval routes
5. 🔴 Build /admin/service-approvals.tsx dashboard
6. 🔴 Create <ApprovalQueueItem /> component
7. 🔴 Implement field locking logic
8. 🔴 Add approval notifications

**Deliverable:** Admins can review and approve services

---

### Phase 4: Tier-Based Access (Week 7-8)
**Priority: MEDIUM**

1. 🔴 Add minimum_tier to taxonomy
2. 🔴 Create tier eligibility check route
3. 🔴 Build /subscription/upgrade-prompt.tsx
4. 🔴 Add tier restrictions to service creation
5. 🔴 Create tier comparison UI
6. 🔴 Implement upgrade flow

**Deliverable:** Service access controlled by subscription tier

---

### Phase 5: Enhanced Discovery (Week 9-10)
**Priority: MEDIUM**

1. 🔴 Update service search with taxonomy filters
2. 🔴 Add hierarchical category browser
3. 🔴 Create skill level filters
4. 🔴 Add certification badge display
5. 🔴 Implement risk level indicators
6. 🔴 Add "Verified Expert" badges
7. 🔴 Create "Tools Provided" indicators

**Deliverable:** Users can discover services with rich metadata

---

### Phase 6: Multi-Mode Booking (Week 11-12)
**Priority: LOW**

1. 🔴 Add booking mode pricing to services
2. 🔴 Create booking mode selector
3. 🔴 Build pricing calculator
4. 🔴 Add availability calendar per mode
5. 🔴 Implement contract templates
6. 🔴 Add milestone payments for projects

**Deliverable:** Flexible booking options per service type

---

## IX. Quick Wins (Immediate Action Items)

### Can Be Done Today

1. ✅ **Create comprehensive taxonomy constant file** (DONE)
2. 🟡 **Add taxonomy to database** (SQL script ready)
3. 🟡 **Create /taxonomy/get-all route** (30 min)
4. 🟡 **Update ServiceCard to show metadata** (1 hour)
5. 🟡 **Add skill level badges** (1 hour)

### Can Be Done This Week

1. 🟡 **Build hierarchical category selector** (4 hours)
2. 🟡 **Create certification upload screen** (6 hours)
3. 🟡 **Add insurance policy management** (6 hours)
4. 🟡 **Build admin approval dashboard skeleton** (8 hours)
5. 🟡 **Implement tier check on service creation** (4 hours)

---

## X. Risk Assessment

### High Risk Areas

1. **Data Migration:** Existing service listings need taxonomy assignment
2. **Breaking Changes:** New required fields may break existing flows
3. **Admin Overload:** Manual approval queue may become bottleneck
4. **Verification Lag:** Document verification delays may frustrate providers

### Mitigation Strategies

1. **Data Migration Script:** Auto-map old services to closest taxonomy match
2. **Graceful Degradation:** Allow services without taxonomy (marked as legacy)
3. **Auto-Approval for Low Risk:** Reduce admin burden with risk-based routing
4. **Self-Service Verification:** Use OCR + AI to pre-validate documents

---

## XI. Success Metrics

### Key Performance Indicators

1. **Taxonomy Coverage:** % of services using granular taxonomy
2. **Verification Completion:** % of providers with verified credentials
3. **Admin Approval Time:** Average time from submission to approval
4. **Search Precision:** Increase in successful service bookings
5. **Provider Tier Distribution:** % in each subscription tier
6. **High-Risk Compliance:** % of high-risk services fully verified

---

## XII. Final Recommendations

### Must Do (Non-Negotiable)

1. ✅ **Implement taxonomy system** (foundation for everything else)
2. 🔴 **Add verification tracking** (trust & compliance)
3. 🔴 **Build admin approval flow** (quality control)
4. 🔴 **Create field locking** (prevent post-approval edits)

### Should Do (High Value)

1. 🟡 **Tier-based access control** (monetization + quality)
2. 🟡 **Multi-mode booking** (flexibility + UX)
3. 🟡 **Enhanced search with metadata** (discovery + conversion)

### Could Do (Nice to Have)

1. ⚪ **AI-powered taxonomy suggestion** (ease of use)
2. ⚪ **Automated credential verification** (reduce admin load)
3. ⚪ **Provider skill assessments** (objective validation)

---

## XIII. Next Steps

### Immediate (This Week)

1. Review and approve this audit report
2. Set up taxonomy master table in Supabase
3. Seed database with 100+ specializations
4. Create basic taxonomy API routes
5. Build hierarchical category selector component

### Short Term (Next 2 Weeks)

1. Implement verification document system
2. Build admin approval dashboard
3. Create certification/insurance management screens
4. Add field locking enforcement

### Medium Term (Next 4 Weeks)

1. Complete tier-based access control
2. Enhance search with taxonomy filters
3. Implement multi-mode booking
4. Launch provider verification center

---

## XIV. Conclusion

The current Banda service provider system has a solid foundation but lacks the granularity, verification infrastructure, and admin controls needed for a production-grade labor & skills marketplace.

**The new taxonomy system is the cornerstone** that enables:
- Precise skill matching
- Risk-based verification
- Tiered subscription logic
- Admin-curated trust
- Compliance tracking
- Professional differentiation

**Estimated Total Effort:** 10-12 weeks for complete implementation

**Recommended Approach:** Phased rollout with Phase 1 (Foundation) as non-negotiable.

---

**Status:** 🔴 Implementation Required  
**Priority:** CRITICAL - Core marketplace functionality depends on this system

---

**Prepared by:** Rork AI System  
**Review Required:** Product, Engineering, Operations  
**Next Review Date:** After Phase 1 completion
