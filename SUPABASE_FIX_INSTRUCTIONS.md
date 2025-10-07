# 🔧 Supabase Missing Tables Fix - Step-by-Step Guide

## Problem Summary
Your Supabase database is missing the following tables and views:
- ❌ `public.vendors` table
- ❌ `public.vendor_policies` table  
- ❌ `public.product_policies` table
- ❌ `product_policies_view` view
- ❌ `products.vendor_id` column

These are required by your tRPC backend routes, specifically:
- `backend/trpc/routes/products/get-policies.ts`
- Multi-seller checkout system
- Intelligent checkout features

---

## 🚀 Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Fix Script
1. Open the file: `SUPABASE_MISSING_TABLES_FIX.sql`
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

### Step 3: Verify the Fix
After running the script, you should see output showing:

```
✅ vendors - EXISTS
✅ vendor_policies - EXISTS  
✅ product_policies - EXISTS
✅ product_policies_view - EXISTS
✅ products.vendor_id - EXISTS
```

If you see any ❌ MISSING, re-run the script.

---

## 📋 What the Script Does

### 1. Creates Missing Tables

#### `vendors` table
Stores vendor/seller information:
- Basic info (name, email, phone, location)
- Trust metrics (trust_score, fulfillment_rate)
- Default policies (escrow, returns, refunds)

#### `vendor_policies` table
Stores vendor-level policies:
- Escrow settings
- Return window (hours)
- Refund policy (none/partial/full)

#### `product_policies` table
Stores product-specific policy overrides:
- Same fields as vendor_policies
- Overrides vendor defaults for specific products

### 2. Adds Missing Column
- Adds `vendor_id` to `products` table
- Creates index for performance

### 3. Creates Unified View
`product_policies_view` combines:
- Product-specific policies (highest priority)
- Vendor policies (medium priority)
- Default policies (fallback)

**Important:** The view casts UUIDs to TEXT to avoid type mismatches.

### 4. Sets Up Security
- Enables Row Level Security (RLS)
- Creates policies for read/write access
- Grants appropriate permissions

---

## 🧪 Testing the Fix

### Test 1: Check Tables Exist
Run this in Supabase SQL Editor:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('vendors', 'vendor_policies', 'product_policies');
```

Should return 3 rows.

### Test 2: Check View Exists
```sql
SELECT * FROM product_policies_view LIMIT 1;
```

Should return a row (or empty result if no products yet).

### Test 3: Test tRPC Endpoint
In your app, try calling:
```typescript
const policies = await trpc.products.getPolicies.query({ 
  productId: 'some-product-id' 
});
```

Should return policy data without errors.

---

## 🔄 Optional: Add Sample Data

If you want to test with sample vendors, uncomment and run this section from the SQL file:

```sql
INSERT INTO vendors (id, name, user_id, email, phone, location, trust_score, fulfillment_rate) VALUES
  ('vendor_001', 'FreshCo Farms', 'user_001', 'contact@freshco.com', '+254712345678', 'Nairobi', 4.5, 95.5),
  ('vendor_002', 'AgroMart Kenya', 'user_002', 'info@agromart.co.ke', '+254723456789', 'Kiambu', 4.8, 98.2),
  ('vendor_003', 'Green Valley Supplies', 'user_003', 'sales@greenvalley.com', '+254734567890', 'Nakuru', 4.2, 92.0);

INSERT INTO vendor_policies (vendor_id, escrow_enabled, return_window_hours, refund_policy) VALUES
  ('vendor_001', TRUE, 48, 'full'),
  ('vendor_002', TRUE, 24, 'partial'),
  ('vendor_003', FALSE, 12, 'none');
```

---

## 🐛 Troubleshooting

### Error: "relation already exists"
✅ **Safe to ignore** - means the table was already created.

### Error: "column vendor_id already exists"
✅ **Safe to ignore** - means the column was already added.

### Error: "permission denied"
❌ **Action needed** - Make sure you're running as the database owner or have SUPERUSER privileges.

### Error: "function update_updated_at_column does not exist"
❌ **Action needed** - Run `SUPABASE_COMPLETE_SCHEMA.sql` first to create the trigger function.

### View returns no data
✅ **Normal** - If you have no products yet, the view will be empty. Add products first.

### Type mismatch errors in tRPC
❌ **Check** - Make sure the view casts `p.id::text` (not just `p.id`).

---

## 📊 Database Schema Overview

After running the fix, your schema will look like this:

```
products
├── id (UUID) → cast to TEXT in view
├── user_id (TEXT)
├── vendor_id (TEXT) ← NEW COLUMN
└── ... other fields

vendors
├── id (TEXT) PRIMARY KEY
├── name, email, phone, location
├── trust_score, fulfillment_rate
└── default policies

vendor_policies
├── vendor_id (TEXT) UNIQUE
├── escrow_enabled
├── return_window_hours
└── refund_policy

product_policies
├── product_id (TEXT) UNIQUE
├── escrow_enabled (overrides vendor)
├── return_window_hours (overrides vendor)
└── refund_policy (overrides vendor)

product_policies_view (VIEW)
└── Combines all three tables with fallbacks
```

---

## ✅ Next Steps

After fixing the database:

1. **Restart your development server** to clear any cached errors
2. **Test the checkout flow** with multiple sellers
3. **Verify policy display** in product screens
4. **Check wallet integration** works correctly

---

## 🆘 Still Having Issues?

If you're still seeing errors after running the fix:

1. **Check the exact error message** - Share it for specific help
2. **Verify all tables exist** - Run the verification queries
3. **Check RLS policies** - Make sure they're not blocking access
4. **Review tRPC logs** - Check backend console for detailed errors
5. **Test with sample data** - Insert test vendors/policies

---

## 📝 Summary

**What to do:**
1. Open Supabase SQL Editor
2. Copy and run `SUPABASE_MISSING_TABLES_FIX.sql`
3. Verify tables were created
4. Test your app

**Time required:** ~5 minutes

**Risk level:** ✅ Low (script is idempotent and safe to re-run)

---

**Need help?** Share the exact error message you're seeing after running the script.
