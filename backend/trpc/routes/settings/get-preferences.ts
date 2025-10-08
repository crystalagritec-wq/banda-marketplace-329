import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

export const getPreferencesProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.user.id;

    console.log('⚙️ Fetching user preferences:', userId);

    try {
      const { data: prefs, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Database error fetching preferences:', error);
        throw new Error('Failed to fetch preferences from database');
      }

      if (!prefs) {
        const defaultPrefs = {
          user_id: userId,
          push_enabled: true,
          push_orders: true,
          push_payments: true,
          push_promotions: false,
          push_security: true,
          push_messages: true,
          email_enabled: true,
          email_orders: true,
          email_payments: true,
          email_promotions: true,
          email_security: true,
          email_newsletter: false,
          sms_enabled: false,
          sms_orders: false,
          sms_payments: true,
          sms_security: true,
          profile_visibility: 'public',
          show_email: false,
          show_phone: false,
          show_location: true,
          allow_messages_from_strangers: true,
          share_data_with_partners: false,
          activity_status: true,
          read_receipts: true,
          allow_tagging: true,
          theme: 'system',
          font_size: 'default',
          layout_density: 'default',
          language: 'en',
          currency: 'KES',
          screen_reader: false,
          high_contrast: false,
          reduce_motion: false,
          large_text: false,
          low_data_mode: false,
          two_factor_enabled: false,
          biometric_enabled: false,
          app_lock_enabled: false,
          session_timeout: 30,
        };

        const { error: createError } = await supabase
          .from('user_preferences')
          .insert(defaultPrefs)
          .select()
          .single();

        if (createError) {
          console.error('❌ Failed to create default preferences:', createError);
        }

        const preferences = {
          notifications: {
            push: {
              enabled: defaultPrefs.push_enabled,
              orders: defaultPrefs.push_orders,
              payments: defaultPrefs.push_payments,
              promotions: defaultPrefs.push_promotions,
              security: defaultPrefs.push_security,
              messages: defaultPrefs.push_messages,
            },
            email: {
              enabled: defaultPrefs.email_enabled,
              orders: defaultPrefs.email_orders,
              payments: defaultPrefs.email_payments,
              promotions: defaultPrefs.email_promotions,
              security: defaultPrefs.email_security,
              newsletter: defaultPrefs.email_newsletter,
            },
            sms: {
              enabled: defaultPrefs.sms_enabled,
              orders: defaultPrefs.sms_orders,
              payments: defaultPrefs.sms_payments,
              security: defaultPrefs.sms_security,
            },
          },
          privacy: {
            profileVisibility: defaultPrefs.profile_visibility,
            showEmail: defaultPrefs.show_email,
            showPhone: defaultPrefs.show_phone,
            showLocation: defaultPrefs.show_location,
            allowMessagesFromStrangers: defaultPrefs.allow_messages_from_strangers,
            shareDataWithPartners: defaultPrefs.share_data_with_partners,
            activityStatus: defaultPrefs.activity_status,
            readReceipts: defaultPrefs.read_receipts,
            allowTagging: defaultPrefs.allow_tagging,
          },
          appearance: {
            theme: defaultPrefs.theme,
            fontSize: defaultPrefs.font_size,
            layoutDensity: defaultPrefs.layout_density,
            language: defaultPrefs.language,
            currency: defaultPrefs.currency,
          },
          accessibility: {
            screenReader: defaultPrefs.screen_reader,
            highContrast: defaultPrefs.high_contrast,
            reduceMotion: defaultPrefs.reduce_motion,
            largeText: defaultPrefs.large_text,
            lowDataMode: defaultPrefs.low_data_mode,
          },
          security: {
            twoFactorEnabled: defaultPrefs.two_factor_enabled,
            biometricEnabled: defaultPrefs.biometric_enabled,
            appLockEnabled: defaultPrefs.app_lock_enabled,
            sessionTimeout: defaultPrefs.session_timeout,
            trustedDevices: [],
          },
        };

        console.log('✅ Default preferences created and returned');
        return { success: true, preferences };
      }

      const preferences = {
        notifications: {
          push: {
            enabled: prefs.push_enabled,
            orders: prefs.push_orders,
            payments: prefs.push_payments,
            promotions: prefs.push_promotions,
            security: prefs.push_security,
            messages: prefs.push_messages,
          },
          email: {
            enabled: prefs.email_enabled,
            orders: prefs.email_orders,
            payments: prefs.email_payments,
            promotions: prefs.email_promotions,
            security: prefs.email_security,
            newsletter: prefs.email_newsletter,
          },
          sms: {
            enabled: prefs.sms_enabled,
            orders: prefs.sms_orders,
            payments: prefs.sms_payments,
            security: prefs.sms_security,
          },
        },
        privacy: {
          profileVisibility: prefs.profile_visibility,
          showEmail: prefs.show_email,
          showPhone: prefs.show_phone,
          showLocation: prefs.show_location,
          allowMessagesFromStrangers: prefs.allow_messages_from_strangers,
          shareDataWithPartners: prefs.share_data_with_partners,
          activityStatus: prefs.activity_status,
          readReceipts: prefs.read_receipts,
          allowTagging: prefs.allow_tagging,
        },
        appearance: {
          theme: prefs.theme,
          fontSize: prefs.font_size,
          layoutDensity: prefs.layout_density,
          language: prefs.language,
          currency: prefs.currency,
        },
        accessibility: {
          screenReader: prefs.screen_reader,
          highContrast: prefs.high_contrast,
          reduceMotion: prefs.reduce_motion,
          largeText: prefs.large_text,
          lowDataMode: prefs.low_data_mode,
        },
        security: {
          twoFactorEnabled: prefs.two_factor_enabled,
          twoFactorMethod: prefs.two_factor_method,
          biometricEnabled: prefs.biometric_enabled,
          appLockEnabled: prefs.app_lock_enabled,
          appLockMethod: prefs.app_lock_method,
          sessionTimeout: prefs.session_timeout,
          trustedDevices: (prefs.trusted_devices as any) || [],
        },
      };

      console.log('✅ Preferences fetched successfully from database');

      return {
        success: true,
        preferences,
      };
    } catch (error) {
      console.error('❌ Preferences fetch error:', error);
      throw new Error('Failed to fetch preferences');
    }
  });
