# 🚨 Database Setup Required

Your Banda app is experiencing database connection issues. Here's how to fix them:

## Issues Detected:
1. **Network Error**: "Failed to fetch" - connectivity issue
2. **Table Not Found**: "Could not find the table 'public.users'" - database schema missing

## 🔧 Step-by-Step Fix:

### Step 1: Verify Supabase Project Status
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Find your project: `nsdqzhxlckctkncviehf`
3. Make sure the project is **active** and not paused

### Step 2: Create Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `SUPABASE_COMPLETE_SCHEMA.sql` file
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

### Step 3: Verify Environment Variables
Your `.env.local` file should contain:
```
EXPO_PUBLIC_SUPABASE_URL=https://nsdqzhxlckctkncviehf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZHF6aHhsY2tjdGtuY3ZpZWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTg4ODIsImV4cCI6MjA3NDI5NDg4Mn0.eTX1NneeL4pAqx0ejVVRwwqnxrh3ITmgvypvVHYKq-w
```

### Step 4: Test Connection
1. After running the schema, restart your development server
2. The app should now connect successfully to the database

## 🔍 Troubleshooting:

### If you still get "Failed to fetch":
- Check your internet connection
- Verify the Supabase URL is correct
- Make sure your Supabase project is not paused

### If you get "Table not found":
- Make sure you ran the complete SQL schema
- Check that all tables were created in the Supabase dashboard under **Table Editor**

### If you get authentication errors:
- Verify your anon key is correct
- Check that RLS policies are properly set up (included in the schema)

## 📋 Expected Tables After Schema Setup:
- users
- products
- orders
- favorites
- notifications
- disputes
- user_roles
- verification_requests
- subscriptions

## 🎯 Next Steps:
Once the database is set up, your app will be able to:
- Create and authenticate users
- Store products and orders
- Handle notifications and disputes
- Manage user roles and verification
- Process subscriptions

---

**Need Help?** If you continue to experience issues after following these steps, please check:
1. Supabase project status
2. Network connectivity
3. Environment variable configuration