# 🚨 URGENT: Database Setup Required

## The Problem
Your Banda app is failing because the database tables don't exist in your Supabase project. The error "Could not find the table 'public.users' in the schema cache" means the database schema hasn't been created yet.

## Quick Fix (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `nsdqzhxlckctkncviehf`

### Step 2: Run the Database Schema
1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy the ENTIRE contents of the file `SUPABASE_COMPLETE_SCHEMA.sql` (316 lines)
4. Paste it into the SQL editor
5. Click **"Run"** button

### Step 3: Verify Tables Were Created
1. Go to **"Table Editor"** in the left sidebar
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

### Step 4: Test Your App
1. Refresh your Banda app
2. The database connection errors should be gone
3. You should be able to sign up/sign in successfully

## What This Schema Creates

### Core Tables
- **users**: User profiles, roles, verification status
- **products**: Marketplace items
- **orders**: Purchase transactions
- **favorites**: User wishlist items
- **notifications**: In-app notifications

### Role System Tables
- **user_roles**: Multi-role support (buyer, seller, farmer, etc.)
- **verification_requests**: ID verification workflow
- **subscriptions**: Premium tier management

### Security Features
- **Row Level Security (RLS)**: Users can only access their own data
- **Proper indexes**: Fast queries
- **Data validation**: Ensures data integrity

## Troubleshooting

### If you get permission errors:
1. Make sure you're signed in as the project owner
2. Check that your project is active (not paused)

### If tables still don't appear:
1. Wait 30 seconds and refresh the Table Editor
2. Try running the schema again
3. Check the SQL editor for any error messages

### If you still get connection errors:
1. Verify your `.env.local` file has the correct URL and key
2. Restart your development server
3. Clear your browser cache

## Your Current Configuration ✅
- **Supabase URL**: `https://nsdqzhxlckctkncviehf.supabase.co`
- **Environment**: Properly configured
- **Schema File**: `SUPABASE_COMPLETE_SCHEMA.sql` (ready to run)

---

**⚡ Once you run the schema, your app will work immediately!**