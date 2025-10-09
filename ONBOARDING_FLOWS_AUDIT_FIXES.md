# Onboarding Flows Audit & Fixes

## Issues Identified

### 1. **Shop Creation Flow**
**Problems:**
- ❌ Users get stuck after completing shop tutorial
- ❌ No clear database sync happening
- ❌ Location requirement not enforced upfront
- ❌ Products created but shop profile not saved to database
- ❌ No vendor profile creation in `vendors` table

**User Journey Breaks At:**
- Step 4: Tutorial completion → Database sync fails silently

### 2. **Service Provider Creation Flow**
**Problems:**
- ❌ Multi-step form with no progress persistence
- ❌ No intermediate saves - lose all data if app closes
- ❌ Complex 9-step flow with no skip options
- ❌ Image upload not implemented (shows alert)
- ❌ No database profile creation until final step
- ❌ Service types selection not validated

**User Journey Breaks At:**
- Any step: App close/refresh loses all progress
- Step 2: Image upload fails
- Step 9: Final submission with no error handling

### 3. **Logistics Creation Flow**
**Problems:**
- ❌ Vehicle owner requires KRA PIN (blocks many users)
- ❌ Driver requires license upload (not implemented)
- ❌ No way to skip optional fields
- ❌ Verification documents required but upload not working
- ❌ No profile saved until verification complete

**User Journey Breaks At:**
- Owner: KRA PIN validation
- Driver: License document upload
- Both: Verification step with no skip option

### 4. **Farm Creation Flow**
**Problems:**
- ❌ GPS location required but no map picker
- ❌ Manual coordinate entry is confusing
- ❌ No farm profile table in database
- ❌ Crops/workers data not persisted
- ❌ No completion handler

**User Journey Breaks At:**
- Step 1: GPS location entry
- Step 4: No database save on completion

### 5. **Wallet Creation Flow**
**Problems:**
- ❌ Phone verification not actually implemented
- ❌ PIN creation works but no validation feedback
- ❌ Terms acceptance required but too long
- ❌ Wallet created but user not redirected properly
- ✅ Actually works better than others!

**User Journey Breaks At:**
- Minimal issues - mostly UX improvements needed

## Critical Fixes Needed

### Priority 1: Database Integration
1. Create vendor profile when shop is completed
2. Create service provider profile when service flow completes
3. Create logistics profile when logistics flow completes
4. Create farm profile table and save data

### Priority 2: Progress Persistence
1. Save form data to AsyncStorage on each step
2. Allow users to resume from where they left off
3. Add "Save as Draft" option

### Priority 3: Simplify Flows
1. Make optional fields actually optional
2. Add "Skip for now" buttons
3. Reduce required fields to minimum
4. Allow profile completion later

### Priority 4: Error Handling
1. Show clear error messages
2. Don't lose user data on errors
3. Add retry mechanisms
4. Log errors for debugging

## Implementation Plan

### Phase 1: Shop Flow Fixes (Highest Priority)
- [ ] Add vendor profile creation to tutorial completion
- [ ] Enforce location selection before starting
- [ ] Save shop data to database
- [ ] Add error handling and retry
- [ ] Show success confirmation

### Phase 2: Service Provider Fixes
- [ ] Implement image upload or make optional
- [ ] Add progress persistence
- [ ] Simplify to 5 steps instead of 9
- [ ] Make verification optional
- [ ] Add skip options

### Phase 3: Logistics Fixes
- [ ] Make KRA PIN optional
- [ ] Implement document upload or skip
- [ ] Add basic profile creation without verification
- [ ] Allow verification later

### Phase 4: Farm Fixes
- [ ] Add map picker for location
- [ ] Create farm profiles table
- [ ] Implement data persistence
- [ ] Add completion handler

### Phase 5: Wallet Improvements
- [ ] Simplify terms (add summary)
- [ ] Improve navigation after creation
- [ ] Add wallet tutorial

## Quick Wins (Implement First)

1. **Make all document uploads optional** - Biggest blocker
2. **Add "Complete Later" buttons** - Reduces abandonment
3. **Save progress automatically** - Prevents data loss
4. **Show clear error messages** - Helps debugging
5. **Add loading states** - Better UX feedback
