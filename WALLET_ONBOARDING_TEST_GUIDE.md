# Wallet Onboarding - Quick Test Guide

## 🧪 How to Test the Wallet Onboarding Flow

### Prerequisites
- User must be logged in
- User must NOT have an existing wallet

---

## Test Scenario 1: New User Creates Wallet

### Step-by-Step Test
1. **Open Side Menu**
   - Tap hamburger menu icon
   - Verify side menu opens

2. **Navigate to Wallet**
   - Tap "AgriPay Wallet" menu item
   - **Expected:** Navigate to `/wallet-welcome` screen
   - **Verify:** See "Welcome to AgriPay" title

3. **Start Onboarding**
   - Tap "Create My Wallet" button
   - **Expected:** Navigate to `/wallet-onboarding` screen
   - **Verify:** See "Step 1 of 4" and progress bar

4. **Phone Verification (Step 1)**
   - **Verify:** Phone number is auto-filled from user profile
   - **Verify:** Green checkmark appears next to phone number
   - **Verify:** "Number verified successfully!" banner shows
   - Tap "Continue" button
   - **Expected:** Navigate to Step 2

5. **PIN Creation (Step 2)**
   - **Verify:** See "Step 2 of 4" title
   - **Verify:** See 4 empty PIN boxes
   - Enter 4-digit PIN (e.g., 1234)
   - **Verify:** Boxes fill as you type
   - Enter same PIN in "Confirm PIN"
   - **Verify:** Both sets of boxes are filled
   - Tap "Show PIN" toggle
   - **Verify:** PIN digits become visible
   - Tap "Continue" button
   - **Expected:** Navigate to Step 3

6. **Terms & Conditions (Step 3)**
   - **Verify:** See "Step 3 of 4" title
   - **Verify:** See scrollable terms content
   - Scroll through terms
   - **Verify:** "Create My Wallet" button is disabled (gray)
   - Tap checkbox "I have read and agree..."
   - **Verify:** Checkbox shows green checkmark
   - **Verify:** "Create My Wallet" button is enabled (green)
   - Tap "Create My Wallet" button
   - **Expected:** Loading spinner appears
   - **Expected:** After 2-3 seconds, navigate to Step 4

7. **Success Screen (Step 4)**
   - **Verify:** See "Wallet Created! 🎉" title
   - **Verify:** See wallet ID (e.g., BWMGGOZRRZ9C0S86)
   - **Verify:** See wallet details:
     - Wallet Address
     - Created date (today)
     - Current Balance: KES 0
     - Status: ● Active
   - Tap "Copy Wallet ID" button
   - **Expected:** Alert "Copied! Wallet ID copied to clipboard"
   - Tap "Continue to Dashboard" button
   - **Expected:** Navigate to `/(tabs)/wallet` screen

8. **Wallet Screen**
   - **Verify:** See "AgriPay Wallet" title
   - **Verify:** See balance card with KES 0
   - **Verify:** See "Add Money", "Send Money", "Pay Bills" buttons
   - **Verify:** See "Transaction History" section
   - **Verify:** See "No transactions yet" message

---

## Test Scenario 2: Existing User Accesses Wallet

### Step-by-Step Test
1. **Open Side Menu**
   - Tap hamburger menu icon

2. **Navigate to Wallet**
   - Tap "AgriPay Wallet" menu item
   - **Expected:** Navigate DIRECTLY to `/(tabs)/wallet` screen
   - **Verify:** NO welcome or onboarding screens shown
   - **Verify:** Wallet screen loads with user's balance and transactions

---

## Test Scenario 3: Error Handling

### Test 3.1: Invalid PIN
1. Navigate to PIN creation step
2. Enter PIN: 1234
3. Enter Confirm PIN: 5678 (different)
4. Tap "Continue"
5. **Expected:** Alert "PIN Mismatch - PINs do not match. Please try again."

### Test 3.2: Short PIN
1. Navigate to PIN creation step
2. Enter PIN: 123 (only 3 digits)
3. **Expected:** "Continue" button remains disabled

### Test 3.3: Terms Not Accepted
1. Navigate to Terms step
2. Do NOT check the checkbox
3. **Expected:** "Create My Wallet" button is disabled (gray)
4. **Expected:** Cannot proceed

### Test 3.4: Network Error
1. Turn off internet connection
2. Navigate to Terms step
3. Check checkbox
4. Tap "Create My Wallet"
5. **Expected:** Error alert with message
6. **Expected:** Can retry after reconnecting

---

## Test Scenario 4: Navigation

### Test 4.1: Back Navigation
1. Start onboarding flow
2. On Step 2 (PIN), tap "Back" button
3. **Expected:** Return to Step 1 (Phone)
4. On Step 1, tap "Back" button
5. **Expected:** Return to Welcome screen

### Test 4.2: Cancel Onboarding
1. Start onboarding flow
2. Navigate to any step
3. Tap device back button (Android) or swipe back (iOS)
4. **Expected:** Return to previous screen
5. **Expected:** Wallet NOT created

---

## Test Scenario 5: UI/UX Verification

### Visual Checks
- [ ] Progress bar shows correct step (1/4, 2/4, 3/4, 4/4)
- [ ] Progress bar fills from left to right
- [ ] Green color scheme consistent throughout
- [ ] Icons display correctly (phone, lock, shield, checkmark)
- [ ] Text is readable and properly aligned
- [ ] Buttons have proper hover/press states
- [ ] Loading spinners appear during async operations
- [ ] Success animations smooth and polished

### Accessibility Checks
- [ ] All buttons have proper testID attributes
- [ ] Text inputs have proper labels
- [ ] Error messages are clear and actionable
- [ ] Color contrast meets WCAG standards
- [ ] Touch targets are at least 44x44 points

---

## Expected Console Logs

### During Onboarding
```
[WalletWelcome] Navigating to wallet onboarding...
[WalletOnboarding] Creating wallet...
[WalletOnboarding] Wallet created: <wallet-id>
[WalletOnboarding] Setting PIN...
[WalletOnboarding] Navigating to wallet screen
```

### During Wallet Access (Existing User)
```
[useWalletCheck] Checking wallet: { isLoading: false, hasWallet: true, walletId: <wallet-id> }
[useWalletCheck] Wallet found → navigating to /(tabs)/wallet
```

### During Wallet Access (New User)
```
[useWalletCheck] Checking wallet: { isLoading: false, hasWallet: false, walletId: null }
[useWalletCheck] No wallet → navigating to /wallet-welcome
```

---

## Common Issues & Solutions

### Issue 1: Infinite Loading on Wallet Screen
**Symptom:** Wallet screen shows loading spinner forever
**Solution:** Check that wallet was created successfully in Supabase
**Verify:** Run `trpc.agripay.getWallet.useQuery()` in console

### Issue 2: Navigation Doesn't Work
**Symptom:** Tapping buttons doesn't navigate
**Solution:** Check console for navigation errors
**Verify:** Ensure routes exist in `app/` directory

### Issue 3: Wallet Creation Fails
**Symptom:** Error alert during wallet creation
**Solution:** Check Supabase connection and `create_agripay_wallet` function
**Verify:** Check backend logs for errors

### Issue 4: PIN Not Saving
**Symptom:** PIN creation succeeds but wallet has no PIN
**Solution:** Check `trpc.agripay.setPin` mutation
**Verify:** Check `agripay_wallets.pin_hash` in database

---

## Database Verification

### Check Wallet Created
```sql
SELECT * FROM agripay_wallets WHERE user_id = '<user-id>';
```

**Expected Result:**
- `id`: UUID
- `user_id`: User's UUID
- `balance`: 0
- `reserve_balance`: 0
- `status`: 'active'
- `pin_hash`: (encrypted PIN)
- `created_at`: Current timestamp

### Check Wallet Transactions
```sql
SELECT * FROM agripay_wallet_transactions WHERE wallet_id = '<wallet-id>';
```

**Expected Result:** Empty (no transactions yet)

---

## Performance Benchmarks

### Expected Timings
- Welcome → Onboarding: < 100ms
- Step 1 → Step 2: < 100ms
- Step 2 → Step 3: < 100ms
- Wallet Creation: 2-3 seconds
- Success → Wallet Screen: < 200ms

### Memory Usage
- Onboarding screens: < 50MB
- Wallet screen: < 100MB

---

## Sign-Off Checklist

Before marking as complete, verify:
- [ ] All 5 test scenarios pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] UI matches design screenshots
- [ ] Navigation flows correctly
- [ ] Error handling works
- [ ] Database records created correctly
- [ ] Performance meets benchmarks
- [ ] Accessibility requirements met

---

## 🎉 Test Complete!

If all tests pass, the wallet onboarding flow is **production-ready**! ✅
