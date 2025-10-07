# Supabase Social Login Setup Guide

This guide will help you set up social login (Google, Facebook, Apple) for your BANDA app using Supabase.

## 🔧 Supabase Configuration

### 1. Enable Social Providers

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable the providers you want:
   - **Google**: Enable and configure OAuth credentials
   - **Facebook**: Enable and configure App ID/Secret
   - **Apple**: Enable and configure Service ID/Key

### 2. Configure Redirect URLs

In **Authentication** → **Settings** → **Redirect URLs**, add:

```
# For mobile app
banda://auth/callback

# For web (optional)
https://your-domain.com/auth/callback
```

### 3. Provider-Specific Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase

#### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure Valid OAuth Redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Copy App ID and App Secret to Supabase

#### Apple OAuth Setup
1. Go to [Apple Developer](https://developer.apple.com/)
2. Create a new Service ID
3. Configure Sign In with Apple
4. Add return URLs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Generate and download private key
6. Configure in Supabase with Service ID and Key

## 📱 App Configuration

### 1. Deep Link Setup

Add to your `app.json`:

```json
{
  "expo": {
    "scheme": "banda",
    "web": {
      "bundler": "metro"
    }
  }
}
```

### 2. Environment Variables

Update your `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🚀 How It Works

### Mobile Flow
1. User taps social login button
2. App calls `authService.socialSignIn(provider)`
3. Supabase returns OAuth URL
4. App opens URL in browser/webview
5. User completes OAuth flow
6. Browser redirects to `banda://auth/callback`
7. App handles deep link and processes auth result
8. User is signed in or redirected to profile completion

### Web Flow
1. User clicks social login button
2. App calls `authService.socialSignIn(provider)`
3. Browser redirects to OAuth provider
4. User completes OAuth flow
5. Provider redirects to `/auth/callback`
6. Callback page processes auth result
7. User is signed in or redirected to profile completion

## 🔍 Testing

### Test Social Login
1. Run your app: `npm start`
2. Try signing in with each provider
3. Check that users are created in your Supabase `users` table
4. Verify deep links work on mobile
5. Test web redirects work properly

### Debug Issues
- Check Supabase logs in Dashboard → Logs
- Verify redirect URLs match exactly
- Ensure OAuth credentials are correct
- Test deep links with `npx uri-scheme open banda://auth/callback --ios`

## 🛠️ Customization

### Add More Providers
To add more OAuth providers (Twitter, GitHub, etc.):

1. Enable in Supabase dashboard
2. Add provider to `SocialProvider` type in `services/auth.ts`
3. Add button in signin/signup screens
4. Configure provider-specific OAuth settings

### Custom User Data
Modify `handleOAuthCallback` in `services/auth.ts` to extract additional user metadata:

```typescript
const userData = {
  fullName: supabaseUser.user_metadata?.full_name || 'User',
  email: supabaseUser.email!,
  photoUrl: supabaseUser.user_metadata?.avatar_url,
  // Add more fields as needed
  location: supabaseUser.user_metadata?.location,
  bio: supabaseUser.user_metadata?.bio,
};
```

## 🔒 Security Notes

- Never expose OAuth secrets in client code
- Use HTTPS for all redirect URLs
- Validate user data from OAuth providers
- Implement proper session management
- Consider rate limiting for auth endpoints

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)