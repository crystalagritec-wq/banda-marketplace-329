# 🚀 Quick Database Setup Guide

## The Problem
Your Banda app is getting database connection errors because the required tables don't exist in your Supabase database yet.

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `nsdqzhxlckctkncviehf`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Complete Schema
1. Copy the entire contents of `SUPABASE_COMPLETE_SCHEMA.sql` file
2. Paste it into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Setup
1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - ✅ users
   - ✅ products  
   - ✅ orders
   - ✅ favorites
   - ✅ notifications
   - ✅ disputes
   - ✅ user_roles
   - ✅ verification_requests
   - ✅ subscriptions

### Step 4: Test Connection
1. Refresh your Banda app
2. The database connection errors should be gone ✅

## 🔧 What This Creates
- **Complete Banda database schema** with all required tables
- **Row Level Security (RLS)** policies for data protection
- **Indexes** for better performance
- **Triggers** for automatic timestamp updates
- **User roles system** for Buyer/Seller/Farmer/Logistics/Service Provider
- **Verification & subscription system**

## 🚨 If You Still Get Errors
1. Make sure your `.env.local` file has the correct keys:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://nsdqzhxlckctkncviehf.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Check that your Supabase project is active and not paused

3. Verify the SQL ran successfully (no red error messages in SQL Editor)

## 🎯 Next Steps
Once the database is set up, your Banda app will be able to:
- ✅ Create and authenticate users
- ✅ Handle social logins (Google, Facebook, Apple)
- ✅ Manage user roles and verification
- ✅ Store products, orders, and marketplace data
- ✅ Handle disputes and notifications

That's it! Your database should now be ready for the Banda marketplace app.