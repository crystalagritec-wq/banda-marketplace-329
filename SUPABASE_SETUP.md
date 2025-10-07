# Supabase Integration Setup Guide for Banda App

This guide will help you set up Supabase as the backend for your Banda marketplace app.

## 🚀 Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization and fill in project details:
   - **Name**: `banda-marketplace`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users (e.g., `eu-west-1` for Europe, `us-east-1` for US)
4. Wait for the project to be created (2-3 minutes)

### 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Create Database Tables

Run the following SQL in your Supabase SQL Editor (**SQL Editor** → **New Query**):

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
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

-- Create products table
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    location TEXT,
    is_available BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    seller_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
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

-- Create favorites table
CREATE TABLE public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system' CHECK (type IN ('order', 'payment', 'message', 'system', 'promotion')),
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create disputes table
CREATE TABLE public.disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    complainant_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    respondent_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_provider_id ON users(provider_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read and update their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

-- Products are publicly readable, but only owners can modify
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (user_id = current_setting('app.current_user_id', true));

-- Orders are visible to buyers and sellers
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
    buyer_id = current_setting('app.current_user_id', true) OR 
    seller_id = current_setting('app.current_user_id', true)
);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (buyer_id = current_setting('app.current_user_id', true));
CREATE POLICY "Sellers can update orders" ON orders FOR UPDATE USING (seller_id = current_setting('app.current_user_id', true));

-- Favorites are private to users
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Notifications are private to users
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

-- Disputes are visible to involved parties
CREATE POLICY "Users can view own disputes" ON disputes FOR SELECT USING (
    complainant_id = current_setting('app.current_user_id', true) OR 
    respondent_id = current_setting('app.current_user_id', true)
);
CREATE POLICY "Users can create disputes" ON disputes FOR INSERT WITH CHECK (complainant_id = current_setting('app.current_user_id', true));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. Set Up Authentication

1. Go to **Authentication** → **Settings**
2. Configure your authentication settings:
   - **Site URL**: `http://localhost:8081` (for development)
   - **Redirect URLs**: Add your app's redirect URLs

3. Enable social providers (optional):
   - Go to **Authentication** → **Providers**
   - Enable Google, Facebook, Apple as needed
   - Configure OAuth credentials

### 6. Configure Storage (Optional)

If you want to store user avatars and product images:

1. Go to **Storage**
2. Create a new bucket called `avatars`
3. Create another bucket called `products`
4. Set up policies for public read access

## 🔧 Development Setup

### Testing the Integration

1. Start your Expo development server:
   ```bash
   npm start
   ```

2. The app will now use Supabase for:
   - User authentication and registration
   - Phone number verification
   - User profile management
   - Social login integration

### Key Features Implemented

✅ **User Management**
- Unique user ID generation
- Phone-based authentication
- Social login (Google, Facebook, Apple)
- Profile completion flow
- Device trust management

✅ **Security**
- Row Level Security (RLS)
- Phone number validation by country
- OTP verification
- Session management

✅ **Data Models**
- Users with comprehensive profiles
- Products with categories and images
- Orders with payment tracking
- Favorites and notifications
- Dispute management

## 📱 Usage in Your App

The integration is already set up in your auth provider. Here's how to use it:

```typescript
import { useAuth } from '@/providers/auth-provider';

function MyComponent() {
  const { 
    user, 
    createUser, 
    sendOTP, 
    socialLogin,
    authService 
  } = useAuth();

  // Create a new user
  const handleSignUp = async () => {
    const result = await createUser({
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '0712345678',
      countryCode: 'KE',
      termsAccepted: true
    });
  };

  // Send OTP
  const handleSendOTP = async () => {
    const result = await sendOTP('0712345678', 'KE');
  };
}
```

## 🚨 Important Notes

1. **Environment Variables**: Never commit your `.env.local` file to version control
2. **RLS Policies**: The database is secured with Row Level Security
3. **Phone Validation**: Supports Kenya, Tanzania, Uganda, Rwanda, South Sudan, and Ethiopia
4. **User IDs**: Uses format `BANDA-YYYYMMDD-XXXXX` for easy identification
5. **Development**: Use test phone numbers and OTP codes during development

## 🔄 Next Steps

1. **SMS Integration**: Replace the mock OTP service with a real SMS provider (Twilio, AWS SNS)
2. **Social Auth**: Configure actual OAuth credentials for Google, Facebook, Apple
3. **File Storage**: Set up Supabase Storage for user avatars and product images
4. **Real-time**: Use Supabase Realtime for live notifications and chat
5. **Analytics**: Add Supabase Analytics for user behavior tracking

## 🆘 Troubleshooting

**Connection Issues**:
- Check your environment variables
- Verify your Supabase project is active
- Ensure your IP is not blocked

**Authentication Errors**:
- Check RLS policies
- Verify user permissions
- Review Supabase logs in the dashboard

**Database Errors**:
- Check table schemas match the TypeScript types
- Verify foreign key constraints
- Review SQL query syntax

For more help, check the [Supabase Documentation](https://supabase.com/docs) or the [Banda App Issues](https://github.com/your-repo/issues).