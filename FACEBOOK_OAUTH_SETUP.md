# Facebook OAuth Setup Guide

## Issue: m.facebook.com Refused to Connect

This error occurs when Facebook OAuth redirects to the mobile web version (m.facebook.com) which is blocked by the app's security policies.

## Solution

### 1. Supabase Configuration

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/nsdqzhxlckctkncviehf
   - Go to: Authentication > Providers

2. **Enable Facebook Provider**
   - Click on "Facebook"
   - Toggle "Enable Sign in with Facebook"

3. **Configure Facebook App**
   - You need to create a Facebook App at: https://developers.facebook.com/
   - Get your Facebook App ID and App Secret
   - Enter them in Supabase:
     - Facebook App ID: `[Your App ID]`
     - Facebook App Secret: `[Your App Secret]`

4. **Configure Redirect URLs**
   - Supabase automatically handles the redirect URL
   - The URL will be: `https://nsdqzhxlckctkncviehf.supabase.co/auth/v1/callback`

### 2. Facebook Developer Console Setup

1. **Create Facebook App** (if you haven't already)
   - Go to: https://developers.facebook.com/apps/
   - Click "Create App"
   - Choose "Consumer" as app type
   - Fill in app details

2. **Configure Facebook Login**
   - In your Facebook App dashboard
   - Go to: Products > Facebook Login > Settings
   - Add Valid OAuth Redirect URIs:
     ```
     https://nsdqzhxlckctkncviehf.supabase.co/auth/v1/callback
     ```
   - For mobile app, also add:
     ```
     banda://auth/callback
     ```

3. **Configure App Domains**
   - Go to: Settings > Basic
   - Add App Domains:
     ```
     nsdqzhxlckctkncviehf.supabase.co
     rork.com
     ```

4. **Make App Public**
   - Go to: Settings > Basic
   - Toggle "App Mode" to "Live"
   - This allows anyone to use Facebook Login

### 3. Mobile App Configuration

The app is already configured with:
- Deep linking scheme: `banda://`
- OAuth callback route: `/auth/callback`

### 4. Testing

#### Test on Web
1. Open app in browser: https://rork.com
2. Click "Sign in with Facebook"
3. Complete Facebook OAuth flow
4. Should redirect back to app with success message

#### Test on Mobile
1. Install app on device
2. Click "Sign in with Facebook"
3. Facebook app/browser opens
4. Complete authentication
5. Should return to app via deep link

### 5. Troubleshooting

#### Error: "URL Blocked: This redirect failed"
- **Cause**: Redirect URI not added to Facebook App
- **Solution**: Add the Supabase callback URL to Facebook App settings

#### Error: "App Not Setup: This app is still in development mode"
- **Cause**: Facebook App is not public
- **Solution**: Make app "Live" in Facebook App settings

#### Error: "Invalid OAuth Redirect URI"
- **Cause**: Mismatch between configured and actual redirect URI
- **Solution**: Ensure Supabase callback URL matches Facebook App settings

#### Error: "m.facebook.com refused to connect"
- **Cause**: Mobile web redirect blocked
- **Solution**: Use native OAuth flow (already implemented)

### 6. Security Considerations

1. **Never commit Facebook App Secret**
   - Store in Supabase only
   - Never expose in client code

2. **Use HTTPS only**
   - All redirect URIs must use HTTPS
   - Exception: Deep links (banda://)

3. **Validate redirect URIs**
   - Only add trusted domains
   - Use exact match, not wildcards

### 7. Alternative: Google OAuth

If Facebook OAuth continues to have issues, Google OAuth is already configured and working:
- Google OAuth is more reliable
- Better mobile support
- Easier setup process

To prioritize Google:
1. Move Google button first in the UI
2. Add "Recommended" badge to Google button
3. Keep Facebook as secondary option

### 8. User Data Sync

After successful OAuth:
1. User data is fetched from Supabase
2. Synced to local storage
3. Available in:
   - Side menu (name, email)
   - Profile screen (all data)
   - Edit profile (pre-filled)
   - Dashboards (user info)

### 9. Session Management

Sessions are:
- Stored in AsyncStorage
- Auto-refreshed by Supabase
- Persistent across app restarts
- Expire after 30 days (configurable)

### 10. Next Steps

1. Create Facebook App (if not done)
2. Configure OAuth settings in Facebook Console
3. Add App ID and Secret to Supabase
4. Test OAuth flow on web and mobile
5. Monitor error logs for any issues

## Support Resources

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Facebook Login Docs: https://developers.facebook.com/docs/facebook-login
- Expo Linking Docs: https://docs.expo.dev/guides/linking/
