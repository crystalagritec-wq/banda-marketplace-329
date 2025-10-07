# Supabase OTP Authentication Setup

This app now uses Supabase's built-in OTP authentication for SMS, WhatsApp, and Email verification.

## Features Implemented

✅ **Email OTP Authentication**
- Send OTP via email using Supabase Auth
- Verify email OTP codes
- Auto-proceed when OTP matches

✅ **SMS OTP Authentication** 
- Send OTP via SMS using Supabase Auth
- Verify SMS OTP codes
- Phone number validation by country

✅ **WhatsApp OTP Authentication**
- Send OTP via WhatsApp using Supabase Auth
- Channel switching between SMS/WhatsApp/Email
- Unified verification flow

✅ **Multi-Channel Support**
- Switch between SMS, WhatsApp, and Email
- Resend OTP functionality
- Auto-detection and clipboard monitoring

## Supabase Configuration Required

### 1. Enable Phone Authentication
In your Supabase dashboard:
1. Go to Authentication → Settings
2. Enable "Phone" provider
3. Configure your SMS provider (Twilio, MessageBird, etc.)

### 2. Enable Email Authentication  
1. Go to Authentication → Settings
2. Enable "Email" provider
3. Configure SMTP settings or use Supabase's default

### 3. Configure Auth Settings
```sql
-- Enable phone signup
UPDATE auth.config SET phone_autoconfirm = false;

-- Set OTP expiry (default 60 seconds)
UPDATE auth.config SET phone_otp_exp = 300; -- 5 minutes

-- Set email OTP expiry
UPDATE auth.config SET email_otp_exp = 300; -- 5 minutes
```

### 4. Environment Variables
Make sure these are set in your `.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How It Works

### Signup Flow
1. User enters details and email
2. `authService.signUpWithOTP()` sends OTP via Supabase
3. User enters OTP on verification screen
4. `authService.verifyOTP()` verifies with Supabase
5. If verified, user is created in custom users table

### Signin Flow  
1. User enters phone/email
2. `authService.sendOTP()` sends OTP via Supabase
3. User enters OTP on verification screen
4. `authService.verifyOTP()` verifies with Supabase
5. If verified, user is logged in

### Channel Switching
- Users can switch between SMS, WhatsApp, and Email
- Each channel uses Supabase's appropriate OTP method
- Unified verification regardless of channel

## Key Files Modified

- `services/auth.ts` - Updated with Supabase OTP methods
- `app/(auth)/otp-verification.tsx` - Uses real Supabase verification
- `app/(auth)/signup.tsx` - Sends OTP before navigation

## Testing

The app will now send real OTP codes via your configured Supabase providers. Make sure to:

1. Configure your SMS provider in Supabase
2. Set up SMTP for email OTP
3. Test with real phone numbers and email addresses
4. Verify OTP codes are received and work correctly

## Error Handling

The implementation includes proper error handling for:
- Invalid OTP codes
- Expired OTP codes  
- Network connection issues
- Rate limiting
- Provider-specific errors

## Security Features

- Real OTP verification through Supabase
- Automatic OTP expiry
- Rate limiting protection
- Secure token validation
- Multi-factor authentication support