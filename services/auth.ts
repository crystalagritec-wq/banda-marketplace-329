import { supabase, User } from '@/lib/supabase';
import { generateUniqueUserId } from '@/utils/user-id-generator';
import { validatePhoneNumber, normalizePhoneNumber } from '@/utils/phone-validation';
import { Platform } from 'react-native';

export interface SocialAuthData {
  fullName: string;
  email: string;
  photo: string;
  providerID: string;
  providerType: 'google' | 'facebook' | 'apple';
}

export type SocialProvider = 'google' | 'facebook' | 'apple';

export interface AuthResult {
  success: boolean;
  user?: User;
  requiresProfile?: boolean;
  requiresOTP?: boolean;
  message?: string;
  error?: string;
}

export interface CreateUserData {
  fullName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  providerID?: string;
  providerType?: 'google' | 'facebook' | 'apple' | 'phone';
  countryCode?: string;
  termsAccepted: boolean;
}

export interface OTPVerificationData {
  identifier: string; // phone or email
  otp: string;
  channel: 'sms' | 'whatsapp' | 'email';
  countryCode?: string; // required for phone channels
}

class AuthService {
  private getDeviceId(): string {
    // In a real app, you'd use a proper device ID library
    return Platform.OS + '_' + Math.random().toString(36).substr(2, 9);
  }

  private isRecentLogin(lastLogin: string | null): boolean {
    if (!lastLogin) return false;
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    return new Date(lastLogin) > tenDaysAgo;
  }

  private isSameDevice(storedDeviceId: string | null): boolean {
    const currentDeviceId = this.getDeviceId();
    return storedDeviceId === currentDeviceId;
  }

  async handleSocialAuth(socialData: SocialAuthData): Promise<AuthResult> {
    try {
      console.log('🔐 Starting social auth for provider:', socialData.providerType);
      
      // Check if user exists by provider ID
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('provider_id', socialData.providerID)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('❌ Error finding user:', JSON.stringify(findError, null, 2));
        
        // Check if it's a table not found error (database not set up)
        if (findError.code === '42P01' || findError.message?.includes('relation "users" does not exist')) {
          return { 
            success: false, 
            error: 'Database not configured. Please set up your Supabase database tables first.' 
          };
        }
        
        // Check for connection errors
        if (findError.message?.includes('Failed to fetch') || findError.message?.includes('network')) {
          return { success: false, error: 'Network connection error. Please check your internet connection.' };
        }
        
        return { success: false, error: `Database error: ${findError.message || 'Please try again.'}` };
      }

      if (!existingUser) {
        // First-time sign-up
        console.log('👤 New user detected, requires profile completion');
        return {
          success: true,
          requiresProfile: true,
          message: 'Profile completion required'
        };
      }

      // Returning user
      const deviceId = this.getDeviceId();
      const isRecent = this.isRecentLogin(existingUser.last_login);
      const isSameDevice = this.isSameDevice(existingUser.device_id);

      if (isRecent && isSameDevice) {
        // Direct login
        await this.updateLastLogin(existingUser.user_id, deviceId);
        console.log('✅ Direct login successful');
        return {
          success: true,
          user: existingUser,
          message: `✅ Welcome back, ${existingUser.full_name}!`
        };
      } else {
        // Require OTP verification
        console.log('🔐 OTP verification required');
        return {
          success: true,
          user: existingUser,
          requiresOTP: true,
          message: 'OTP verification required'
        };
      }
    } catch (error) {
      console.error('❌ Social auth error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async createUser(userData: CreateUserData): Promise<AuthResult> {
    try {
      console.log('👤 Creating new user');

      if (!userData.termsAccepted) {
        return { success: false, error: 'Please agree to the Terms & Privacy Policy to continue.' };
      }

      // Validate full name
      if (!userData.fullName || userData.fullName.trim().length < 2) {
        return { success: false, error: 'Full name is required and must be at least 2 characters.' };
      }

      if (userData.fullName.length > 50) {
        return { success: false, error: 'Full name is too long.' };
      }

      if (!/^[a-zA-Z\s]+$/.test(userData.fullName)) {
        return { success: false, error: 'Special characters are not allowed in full name.' };
      }

      // Validate email if provided
      if (userData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          return { success: false, error: 'Invalid email format.' };
        }
        if (userData.email.length > 100) {
          return { success: false, error: 'Email is too long.' };
        }
      }

      // Validate phone if provided
      if (userData.phone && userData.countryCode) {
        const phoneValidation = validatePhoneNumber(userData.phone, userData.countryCode);
        if (!phoneValidation.isValid) {
          return { success: false, error: phoneValidation.error };
        }
      }

      // Generate unique user ID
      const userId = generateUniqueUserId();
      const deviceId = this.getDeviceId();

      // Normalize phone number
      const normalizedPhone = userData.phone && userData.countryCode 
        ? normalizePhoneNumber(userData.phone, userData.countryCode)
        : null;

      // Create user in database
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          full_name: userData.fullName.trim(),
          email: userData.email,
          phone: normalizedPhone,
          photo_url: userData.photoUrl,
          provider_id: userData.providerID,
          provider_type: userData.providerType,
          country_code: userData.countryCode,
          device_id: deviceId,
          last_login: new Date().toISOString(),
          is_verified: false,
          reputation_score: 0,
          membership_tier: 'bronze',
          kyc_status: 'pending',
          terms_accepted: true,
          // New role-based fields
          user_type: 'basic',
          user_role: 'buyer',
          tier: 'none',
          verification_status: 'unverified',
          subscription_status: 'none',
          item_limit: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user:', JSON.stringify(createError, null, 2));
        
        // Check if it's a table not found error (database not set up)
        if (createError.code === '42P01' || createError.message?.includes('relation "users" does not exist')) {
          return { 
            success: false, 
            error: 'Database not configured. Please set up your Supabase database tables first.' 
          };
        }
        
        if (createError.code === '23505') {
          return { success: false, error: 'This email or phone is already registered.' };
        }
        
        // Check for connection errors
        if (createError.message?.includes('Failed to fetch') || createError.message?.includes('network')) {
          return { success: false, error: 'Network connection error. Please check your internet connection.' };
        }
        
        return { success: false, error: `Database error: ${createError.message || 'Failed to create account. Please try again.'}` };
      }

      console.log('✅ User created successfully');
      return {
        success: true,
        user: newUser,
        message: '🎉 Account created successfully. Welcome aboard!'
      };
    } catch (error) {
      console.error('❌ Create user error:', error);
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  }

  async verifyOTP(identifier: string, otp: string, channel: 'sms' | 'whatsapp' | 'email'): Promise<AuthResult> {
    try {
      console.log(`🔐 Verifying OTP for ${channel}:`, identifier);
      console.log('🔐 OTP received:', otp, 'Length:', otp?.length, 'Type:', typeof otp);

      // Validate OTP format
      if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        console.error('❌ OTP validation failed:', { otp, length: otp?.length, isDigits: /^\d{6}$/.test(otp || '') });
        return { success: false, error: 'OTP must be 6 digits.' };
      }

      // Check for demo OTP codes first (case-insensitive, trimmed)
      const demoOTPs = ['123456', '000000', '111111', '999999', '555555'];
      const normalizedOTP = otp.trim();
      console.log('🔍 Checking demo OTPs:', { normalizedOTP, demoOTPs, includes: demoOTPs.includes(normalizedOTP) });
      
      if (demoOTPs.includes(normalizedOTP)) {
        console.log('✅ Demo OTP code accepted:', normalizedOTP, 'for identifier:', identifier);
        
        // For demo mode, simulate successful verification
        try {
          // Check if user exists in our custom users table
          const { data: customUser, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq(channel === 'email' ? 'email' : 'phone', identifier)
            .single();

          if (findError && findError.code !== 'PGRST116') {
            console.log('⚠️ Database lookup error for demo OTP:', findError.code, findError.message);
            
            // Check if it's a table not found error (database not set up)
            if (findError.code === '42P01' || findError.message?.includes('relation "users" does not exist')) {
              // In demo mode, proceed anyway
              console.log('⚠️ Database not configured, proceeding with demo mode');
              return {
                success: true,
                requiresProfile: true,
                message: 'Demo OTP verified. Please complete your profile.'
              };
            }
            
            // For any other database errors in demo mode, proceed anyway
            console.log('⚠️ Database error in demo mode, proceeding anyway');
            return {
              success: true,
              requiresProfile: true,
              message: 'Demo OTP verified. Please complete your profile.'
            };
          }

          // If custom user exists, update their login info
          if (customUser) {
            const deviceId = this.getDeviceId();
            try {
              await this.updateLastLogin(customUser.user_id, deviceId);
            } catch (updateError) {
              console.log('⚠️ Failed to update last login, but proceeding with demo OTP');
            }
            
            console.log('✅ Demo OTP verification successful for existing user:', customUser.full_name);
            return {
              success: true,
              user: customUser,
              message: `🔓 Demo login successful. Welcome back, ${customUser.full_name}!`
            };
          }

          // If no custom user found, this is a new registration
          console.log('✅ Demo OTP verification successful for new user');
          return {
            success: true,
            requiresProfile: true,
            message: 'Demo OTP verified. Please complete your profile.'
          };
        } catch (demoError) {
          console.log('⚠️ Demo OTP database check failed, but proceeding anyway:', demoError);
          // In demo mode, always succeed even if database fails
          return {
            success: true,
            requiresProfile: true,
            message: 'Demo OTP verified. Please complete your profile.'
          };
        }
      }

      // For non-demo OTPs, use Supabase verification
      let authResult;
      
      if (channel === 'email') {
        // Verify email OTP with Supabase
        authResult = await supabase.auth.verifyOtp({
          email: identifier,
          token: otp,
          type: 'email'
        });
      } else {
        // Verify phone OTP with Supabase
        authResult = await supabase.auth.verifyOtp({
          phone: identifier,
          token: otp,
          type: 'sms'
        });
      }

      if (authResult.error) {
        console.error('❌ Supabase OTP verification error:', authResult.error);
        
        // Handle specific Supabase OTP errors
        if (authResult.error.message?.includes('Invalid token') || authResult.error.message?.includes('expired')) {
          return { success: false, error: 'Invalid or expired OTP. Please try again.' };
        }
        
        if (authResult.error.message?.includes('too many requests')) {
          return { success: false, error: 'Too many attempts. Please wait before trying again.' };
        }
        
        return { success: false, error: authResult.error.message || 'OTP verification failed.' };
      }

      if (!authResult.data.user) {
        return { success: false, error: 'Authentication failed. Please try again.' };
      }

      // Check if user exists in our custom users table
      const { data: customUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq(channel === 'email' ? 'email' : 'phone', identifier)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('❌ Error finding custom user:', findError);
        
        // Check if it's a table not found error (database not set up)
        if (findError.code === '42P01' || findError.message?.includes('relation "users" does not exist')) {
          return { 
            success: false, 
            error: 'Database not configured. Please set up your Supabase database tables first.' 
          };
        }
        
        // Check for connection errors
        if (findError.message?.includes('Failed to fetch') || findError.message?.includes('network')) {
          return { success: false, error: 'Network connection error. Please check your internet connection.' };
        }
        
        return { success: false, error: `Database error: ${findError.message || 'Please try again.'}` };
      }

      // If custom user exists, update their login info
      if (customUser) {
        const deviceId = this.getDeviceId();
        await this.updateLastLogin(customUser.user_id, deviceId);
        
        console.log('✅ OTP verification successful for existing user');
        return {
          success: true,
          user: customUser,
          message: '🔓 Login successful. Great to see you again!'
        };
      }

      // If no custom user found, this might be a new registration
      console.log('✅ OTP verification successful for new user');
      return {
        success: true,
        requiresProfile: true,
        message: 'OTP verified. Please complete your profile.'
      };
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      return { success: false, error: error?.message || 'OTP verification failed. Please try again.' };
    }
  }

  async sendOTP(identifier: string, channel: 'sms' | 'whatsapp' | 'email', countryCode?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📱 Sending OTP via ${channel} to:`, identifier);

      if (channel === 'email') {
        // Send OTP via email using Supabase
        const { error } = await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            shouldCreateUser: false,
            data: {
              channel: 'email'
            }
          }
        });

        if (error) {
          console.error('❌ Email OTP error:', error);
          return { success: false, error: error.message || 'Failed to send email OTP' };
        }
      } else {
        // For SMS and WhatsApp, validate phone number first
        if (!countryCode) {
          return { success: false, error: 'Country code is required for phone OTP' };
        }

        const phoneValidation = validatePhoneNumber(identifier, countryCode);
        if (!phoneValidation.isValid) {
          return { success: false, error: phoneValidation.error };
        }

        const normalizedPhone = normalizePhoneNumber(identifier, countryCode);

        // Send OTP via SMS using Supabase
        const { error } = await supabase.auth.signInWithOtp({
          phone: normalizedPhone,
          options: {
            shouldCreateUser: false,
            data: {
              channel: channel
            }
          }
        });

        if (error) {
          console.error(`❌ ${channel} OTP error:`, error);
          return { success: false, error: error.message || `Failed to send ${channel} OTP` };
        }
      }

      console.log(`✅ OTP sent successfully via ${channel}`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Send OTP error:', error);
      return { success: false, error: error?.message || 'Failed to send OTP. Please try again.' };
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user:', JSON.stringify(error, null, 2));
        
        // Check if it's a table not found error (database not set up)
        if (error.code === '42P01' || error.message?.includes('relation "users" does not exist')) {
          console.error('❌ Database not configured. Please set up your Supabase database tables first.');
        }
        
        return null;
      }

      return user;
    } catch (error) {
      console.error('❌ Get user error:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user:', JSON.stringify(error, null, 2));
        
        // Check if it's a table not found error (database not set up)
        if (error.code === '42P01' || error.message?.includes('relation "users" does not exist')) {
          return { 
            success: false, 
            error: 'Database not configured. Please set up your Supabase database tables first.' 
          };
        }
        
        // Check for connection errors
        if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) {
          return { success: false, error: 'Network connection error. Please check your internet connection.' };
        }
        
        return { success: false, error: `Database error: ${error.message || 'Failed to update user profile.'}` };
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('❌ Update user error:', error);
      return { success: false, error: 'Failed to update user profile.' };
    }
  }

  private async updateLastLogin(userId: string, deviceId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          device_id: deviceId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
        
      if (error) {
        console.error('❌ Error updating last login:', JSON.stringify(error, null, 2));
        
        // Check if it's a table not found error (database not set up)
        if (error.code === '42P01' || error.message?.includes('relation "users" does not exist')) {
          console.error('❌ Database not configured. Please set up your Supabase database tables first.');
        }
      }
    } catch (error) {
      console.error('❌ Update last login error:', error);
    }
  }

  async resendOTP(identifier: string, channel: 'sms' | 'whatsapp' | 'email', countryCode?: string): Promise<{ success: boolean; error?: string }> {
    // Resend OTP is the same as sending OTP
    return this.sendOTP(identifier, channel, countryCode);
  }

  async signUpWithOTP(identifier: string, channel: 'sms' | 'whatsapp' | 'email', userData?: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📝 Starting signup with OTP for ${channel}:`, identifier);

      if (channel === 'email') {
        // Sign up with email OTP
        const { error } = await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            shouldCreateUser: true,
            data: userData || {}
          }
        });

        if (error) {
          console.error('❌ Email signup OTP error:', error);
          return { success: false, error: error.message || 'Failed to send signup email OTP' };
        }
      } else {
        // Sign up with phone OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone: identifier,
          options: {
            shouldCreateUser: true,
            data: userData || {}
          }
        });

        if (error) {
          console.error(`❌ ${channel} signup OTP error:`, error);
          return { success: false, error: error.message || `Failed to send signup ${channel} OTP` };
        }
      }

      console.log(`✅ Signup OTP sent successfully via ${channel}`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Signup OTP error:', error);
      return { success: false, error: error?.message || 'Failed to send signup OTP. Please try again.' };
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  }

  async socialSignIn(provider: SocialProvider): Promise<{ success: boolean; error?: string; url?: string }> {
    try {
      console.log(`🔐 Starting ${provider} social sign in...`);
      
      // Determine redirect URL based on platform
      let redirectTo: string;
      if (Platform.OS === 'web') {
        // For web, use the current origin + /auth/callback
        redirectTo = typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/callback`
          : 'https://rork.com/auth/callback';
      } else {
        // For mobile, use deep link
        redirectTo = 'banda://auth/callback';
      }
      
      console.log(`📍 OAuth redirect URL: ${redirectTo}`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo,
          skipBrowserRedirect: Platform.OS !== 'web', // Skip redirect on mobile, we'll handle it manually
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error(`❌ ${provider} OAuth error:`, error);
        return { success: false, error: error.message };
      }

      if (!data.url) {
        console.error('❌ No OAuth URL received from Supabase');
        return { success: false, error: 'No OAuth URL received' };
      }

      console.log(`✅ OAuth URL generated: ${data.url.substring(0, 50)}...`);

      if (Platform.OS === 'web') {
        // For web, redirect to the OAuth URL
        window.location.href = data.url;
        return { success: true };
      } else {
        // For mobile, return the URL to open in browser
        return { success: true, url: data.url };
      }
    } catch (error: any) {
      console.error(`❌ ${provider} social sign in error:`, error);
      return { success: false, error: error?.message || 'Social sign in failed' };
    }
  }

  async handleOAuthCallback(url: string): Promise<AuthResult> {
    try {
      console.log('🔐 Handling OAuth callback:', url);
      
      // Parse URL fragments for OAuth callback
      const urlObj = new URL(url);
      const fragment = urlObj.hash.substring(1);
      const params = new URLSearchParams(fragment);
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (!accessToken) {
        return { success: false, error: 'No access token found in callback' };
      }
      
      // Set the session manually
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ''
      });
      
      if (error) {
        console.error('❌ OAuth callback error:', error);
        return { success: false, error: error.message };
      }

      if (!data.session?.user) {
        return { success: false, error: 'No user session found' };
      }

      const supabaseUser = data.session.user;
      console.log('✅ OAuth user authenticated:', supabaseUser.email);

      // Check if user exists in our custom users table
      const { data: customUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', supabaseUser.email)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('❌ Error finding custom user:', findError);
        return { success: false, error: 'Database error occurred' };
      }

      if (customUser) {
        // Existing user - update login info
        const deviceId = this.getDeviceId();
        await this.updateLastLogin(customUser.user_id, deviceId);
        
        console.log('✅ Social login successful for existing user');
        return {
          success: true,
          user: customUser,
          message: `Welcome back, ${customUser.full_name}!`
        };
      } else {
        // New user - create profile
        const userData = {
          fullName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
          email: supabaseUser.email!,
          photoUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
          providerID: supabaseUser.id,
          providerType: supabaseUser.app_metadata?.provider as 'google' | 'facebook' | 'apple',
          termsAccepted: true
        };

        const createResult = await this.createUser(userData);
        
        if (createResult.success) {
          console.log('✅ Social signup successful for new user');
          return {
            success: true,
            user: createResult.user,
            message: `Welcome to BANDA, ${userData.fullName}!`
          };
        } else {
          return { success: false, error: createResult.error };
        }
      }
    } catch (error: any) {
      console.error('❌ OAuth callback handling error:', error);
      return { success: false, error: error?.message || 'OAuth callback failed' };
    }
  }

  async getCurrentSession(): Promise<{ user: any; session: any } | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Get session error:', error);
        return null;
      }

      return session ? { user: session.user, session } : null;
    } catch (error) {
      console.error('❌ Get current session error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();