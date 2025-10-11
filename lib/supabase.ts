import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

// Create Supabase client with proper configuration for session management
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  global: {
    headers: {
      'X-Client-Info': 'banda-app',
    },
  },
});

// User types and roles
export type UserType = 'basic' | 'seller' | 'service_provider' | 'logistics_provider' | 'farmer';
export type UserRole = 'buyer' | 'seller' | 'service_provider' | 'logistics_provider' | 'farmer';
export type UserTier = 'none' | 'verified' | 'gold' | 'premium' | 'elite';
export type VerificationStatus = 'unverified' | 'ai_verified' | 'human_verified' | 'qr_verified' | 'admin_approved';
export type VerificationMethod = 'ai_id' | 'human_qr' | 'admin_approval';
export type SubscriptionStatus = 'none' | 'active' | 'expired' | 'cancelled';

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          photo_url: string | null;
          country_code: string | null;
          provider_id: string | null;
          provider_type: 'google' | 'facebook' | 'apple' | 'phone' | null;
          is_verified: boolean;
          last_login: string | null;
          device_id: string | null;
          reputation_score: number;
          membership_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
          kyc_status: 'pending' | 'verified' | 'rejected';
          terms_accepted: boolean;
          // New role-based fields
          user_type: UserType;
          user_role: UserRole;
          tier: UserTier;
          verification_status: VerificationStatus;
          subscription_status: SubscriptionStatus;
          item_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          country_code?: string | null;
          provider_id?: string | null;
          provider_type?: 'google' | 'facebook' | 'apple' | 'phone' | null;
          is_verified?: boolean;
          last_login?: string | null;
          device_id?: string | null;
          reputation_score?: number;
          membership_tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
          kyc_status?: 'pending' | 'verified' | 'rejected';
          terms_accepted?: boolean;
          // New role-based fields
          user_type?: UserType;
          user_role?: UserRole;
          tier?: UserTier;
          verification_status?: VerificationStatus;
          subscription_status?: SubscriptionStatus;
          item_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          country_code?: string | null;
          provider_id?: string | null;
          provider_type?: 'google' | 'facebook' | 'apple' | 'phone' | null;
          is_verified?: boolean;
          last_login?: string | null;
          device_id?: string | null;
          reputation_score?: number;
          membership_tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
          kyc_status?: 'pending' | 'verified' | 'rejected';
          terms_accepted?: boolean;
          // New role-based fields
          user_type?: UserType;
          user_role?: UserRole;
          tier?: UserTier;
          verification_status?: VerificationStatus;
          subscription_status?: SubscriptionStatus;
          item_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          price: number;
          category: string;
          images: string[];
          condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
          location: string | null;
          is_available: boolean;
          views_count: number;
          favorites_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          price: number;
          category: string;
          images?: string[];
          condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
          location?: string | null;
          is_available?: boolean;
          views_count?: number;
          favorites_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: string;
          images?: string[];
          condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
          location?: string | null;
          is_available?: boolean;
          views_count?: number;
          favorites_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          quantity: number;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
          payment_method: string | null;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          shipping_address: any;
          tracking_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          quantity?: number;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
          payment_method?: string | null;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          shipping_address?: any;
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          seller_id?: string;
          product_id?: string;
          quantity?: number;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
          payment_method?: string | null;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          shipping_address?: any;
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'order' | 'payment' | 'message' | 'system' | 'promotion';
          is_read: boolean;
          data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'order' | 'payment' | 'message' | 'system' | 'promotion';
          is_read?: boolean;
          data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'order' | 'payment' | 'message' | 'system' | 'promotion';
          is_read?: boolean;
          data?: any;
          created_at?: string;
        };
      };
      disputes: {
        Row: {
          id: string;
          order_id: string;
          complainant_id: string;
          respondent_id: string;
          reason: string;
          description: string;
          status: 'open' | 'in_review' | 'resolved' | 'closed';
          resolution: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          complainant_id: string;
          respondent_id: string;
          reason: string;
          description: string;
          status?: 'open' | 'in_review' | 'resolved' | 'closed';
          resolution?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          complainant_id?: string;
          respondent_id?: string;
          reason?: string;
          description?: string;
          status?: 'open' | 'in_review' | 'resolved' | 'closed';
          resolution?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_type: UserRole;
          tier: UserTier;
          verification_status: VerificationStatus;
          verification_method: VerificationMethod | null;
          verification_date: string | null;
          item_limit: number;
          subscription_start: string | null;
          subscription_end: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_type: UserRole;
          tier?: UserTier;
          verification_status?: VerificationStatus;
          verification_method?: VerificationMethod | null;
          verification_date?: string | null;
          item_limit?: number;
          subscription_start?: string | null;
          subscription_end?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_type?: UserRole;
          tier?: UserTier;
          verification_status?: VerificationStatus;
          verification_method?: VerificationMethod | null;
          verification_date?: string | null;
          item_limit?: number;
          subscription_start?: string | null;
          subscription_end?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      verification_requests: {
        Row: {
          id: string;
          user_id: string;
          role_type: UserRole;
          verification_method: VerificationMethod;
          document_urls: string[];
          status: 'pending' | 'approved' | 'rejected';
          reviewer_id: string | null;
          review_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_type: UserRole;
          verification_method: VerificationMethod;
          document_urls?: string[];
          status?: 'pending' | 'approved' | 'rejected';
          reviewer_id?: string | null;
          review_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_type?: UserRole;
          verification_method?: VerificationMethod;
          document_urls?: string[];
          status?: 'pending' | 'approved' | 'rejected';
          reviewer_id?: string | null;
          review_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: UserTier;
          start_date: string;
          end_date: string;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          amount: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier: UserTier;
          start_date: string;
          end_date: string;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          amount: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: UserTier;
          start_date?: string;
          end_date?: string;
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          amount?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Dispute = Database['public']['Tables']['disputes']['Row'];
export type UserRoleRecord = Database['public']['Tables']['user_roles']['Row'];
export type VerificationRequest = Database['public']['Tables']['verification_requests']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];

// Test database connection with better error handling and fallback
export async function testDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔍 Testing database connection...');
    console.log('🔧 Using URL:', supabaseUrl);
    console.log('🔧 Using Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Not provided');
    
    // Validate configuration first
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
      return {
        success: false,
        error: '🚨 CONFIGURATION ERROR: EXPO_PUBLIC_SUPABASE_URL is not set or is using the default placeholder. Please update your .env.local file with your actual Supabase project URL.'
      };
    }
    
    if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
      return {
        success: false,
        error: '🚨 CONFIGURATION ERROR: EXPO_PUBLIC_SUPABASE_KEY is not set or is invalid. Please update your .env.local file with your actual Supabase anon key.'
      };
    }
    
    // Test basic connectivity with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error';
      const errorCode = typeof error === 'object' && error !== null ? (error as any).code : '';
      const errorDetails = typeof error === 'object' && error !== null ? (error as any).details : '';
      const errorHint = typeof error === 'object' && error !== null ? (error as any).hint : '';
      
      console.error('❌ Database connection test failed:', {
        message: errorMessage,
        details: errorDetails || 'No additional details',
        hint: errorHint || '',
        code: errorCode || ''
      });
      
      // Handle specific error cases
      if (errorCode === '42P01' || errorCode === 'PGRST116' || errorMessage?.includes('relation "users" does not exist') || errorMessage?.includes('Could not find the table')) {
        return {
          success: false,
          error: '🚨 DATABASE SCHEMA MISSING: Please run the complete SQL schema from SUPABASE_COMPLETE_SCHEMA.sql in your Supabase SQL editor. The users table and other required tables do not exist.'
        };
      }
      
      if (errorCode === 'PGRST205') {
        return {
          success: false,
          error: '🚨 TABLE NOT FOUND: The users table is not found in the schema cache. Please run the SQL schema from SUPABASE_COMPLETE_SCHEMA.sql in your Supabase SQL editor, then refresh this page.'
        };
      }
      
      if (errorMessage?.includes('Failed to fetch') || errorMessage?.includes('network') || errorCode === 'PGRST301') {
        return {
          success: false,
          error: '🌐 NETWORK ERROR: Cannot reach Supabase. Please check: 1) Your internet connection, 2) Your EXPO_PUBLIC_SUPABASE_URL is correct, 3) Your Supabase project is active.'
        };
      }
      
      if (errorMessage?.includes('JWT') || errorMessage?.includes('authentication') || errorCode === 'PGRST301') {
        return {
          success: false,
          error: '🔑 AUTH ERROR: Invalid Supabase key. Please verify your EXPO_PUBLIC_SUPABASE_KEY is correct in your .env.local file.'
        };
      }
      
      return {
        success: false,
        error: `❌ DATABASE ERROR (${errorCode || 'UNKNOWN'}): ${errorMessage || 'Unknown error occurred'}`
      };
    }
    
    console.log('✅ Database connection successful');
    console.log('📊 Query result:', data);
    return { success: true };
  } catch (error: any) {
    const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error');
    const errorString = typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error);
    
    console.error('❌ Database connection test error:', {
      message: errorMessage,
      details: errorString,
      stack: error?.stack
    });
    
    // Handle network errors at the fetch level
    if (errorMessage?.includes('Failed to fetch') || error?.name === 'TypeError') {
      return {
        success: false,
        error: '🌐 NETWORK ERROR: Unable to reach Supabase. This could be due to: 1) No internet connection, 2) Incorrect Supabase URL, 3) CORS issues, or 4) Supabase service is down.'
      };
    }
    
    return {
      success: false,
      error: `💥 CONNECTION ERROR: ${errorMessage || 'Failed to connect to database. Please check your configuration.'}`
    };
  }
}