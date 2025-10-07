# Supabase Database Setup for Banda

⚠️ **IMPORTANT**: If you're seeing database connection errors, this setup is required!

This guide will help you set up the required database tables in Supabase for the Banda authentication system.

## Quick Fix for Current Errors

If you're seeing these errors:
- "Could not find the table 'public.users'"
- "Failed to fetch" or network errors

You need to:
1. **Set up your database schema** (see step 4 below)
2. **Verify your Supabase credentials** (see step 3 below)

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update your `.env.local` file with the correct values

## Required Environment Variables

Create or update your `.env.local` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

Run the following SQL commands in your Supabase SQL editor to create the required tables:

### 1. Users Table

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  country_code TEXT,
  provider_id TEXT,
  provider_type TEXT CHECK (provider_type IN ('google', 'facebook', 'apple', 'phone')),
  is_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  device_id TEXT,
  reputation_score INTEGER DEFAULT 0,
  membership_tier TEXT DEFAULT 'bronze' CHECK (membership_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  terms_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_provider_id ON users(provider_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);
```

### 2. Products Table

```sql
-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  location TEXT,
  is_available BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_available ON products(is_available);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view available products" ON products
  FOR SELECT USING (is_available = true);

CREATE POLICY "Users can manage their own products" ON products
  FOR ALL USING (auth.uid()::text = user_id);
```

### 3. Orders Table

```sql
-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'disputed')),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid()::text = buyer_id OR auth.uid()::text = seller_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = buyer_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid()::text = buyer_id OR auth.uid()::text = seller_id);
```

### 4. Favorites Table

```sql
-- Create favorites table
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own favorites" ON favorites
  FOR ALL USING (auth.uid()::text = user_id);
```

### 5. Notifications Table

```sql
-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system' CHECK (type IN ('order', 'payment', 'message', 'system', 'promotion')),
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id);
```

### 6. Disputes Table

```sql
-- Create disputes table
CREATE TABLE disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  complainant_id TEXT NOT NULL,
  respondent_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_complainant_id ON disputes(complainant_id);
CREATE INDEX idx_disputes_respondent_id ON disputes(respondent_id);

-- Enable RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view disputes they're involved in" ON disputes
  FOR SELECT USING (auth.uid()::text = complainant_id OR auth.uid()::text = respondent_id);

CREATE POLICY "Users can create disputes" ON disputes
  FOR INSERT WITH CHECK (auth.uid()::text = complainant_id);
```

### 7. Role-Based System (Advanced)

For the complete role-based access control system, run the SQL from `SUPABASE_ROLES_SCHEMA.sql`:

```sql
-- This adds user roles, verification, and subscription features
-- Copy and paste the entire content of SUPABASE_ROLES_SCHEMA.sql
-- into your Supabase SQL editor
```

**Note**: The role-based system is optional but recommended for production apps.

## Testing the Setup

After running the SQL commands, you can test the database connection by:

1. Starting your Expo app
2. Check the console logs for "✅ Database connection successful"
3. Try the social login functionality

## Troubleshooting

### Common Issues:

1. **"relation 'users' does not exist"**
   - Make sure you've run all the SQL commands above
   - Check that you're connected to the correct Supabase project

2. **"JWT authentication error"**
   - Verify your `EXPO_PUBLIC_SUPABASE_ANON_KEY` is correct
   - Make sure the key has the proper permissions

3. **"Network connection error"**
   - Check your `EXPO_PUBLIC_SUPABASE_URL` is correct
   - Ensure you have internet connectivity

4. **Row Level Security errors**
   - The policies above should handle most cases
   - For development, you can temporarily disable RLS with: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

## Next Steps

Once your database is set up:

1. Test the authentication flow
2. Customize the user fields as needed for your app
3. Add additional tables for your specific features
4. Set up proper backup and monitoring

For more advanced features, consider:
- Setting up database functions for complex operations
- Adding triggers for automatic updates
- Implementing real-time subscriptions
- Setting up database backups