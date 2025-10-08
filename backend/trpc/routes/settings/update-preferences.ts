import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';
import { supabase } from '@/lib/supabase';

const CategorySchema = z.enum([
  'notifications',
  'privacy',
  'appearance',
  'accessibility',
  'security',
]);

const PreferencesSchema = z.record(z.string(), z.unknown());

export const updatePreferencesProcedure = protectedProcedure
  .input(
    z.object({
      category: CategorySchema,
      preferences: PreferencesSchema,
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;

    console.log('⚙️ Updating user preferences:', input.category, input.preferences);

    try {
      const updateData: Record<string, any> = {};

      if (input.category === 'notifications') {
        const prefs = input.preferences;
        if (prefs.push && typeof prefs.push === 'object') {
          const push = prefs.push as Record<string, any>;
          if (typeof push.enabled === 'boolean') updateData.push_enabled = push.enabled;
          if (typeof push.orders === 'boolean') updateData.push_orders = push.orders;
          if (typeof push.payments === 'boolean') updateData.push_payments = push.payments;
          if (typeof push.promotions === 'boolean') updateData.push_promotions = push.promotions;
          if (typeof push.security === 'boolean') updateData.push_security = push.security;
          if (typeof push.messages === 'boolean') updateData.push_messages = push.messages;
        }
        if (prefs.email && typeof prefs.email === 'object') {
          const email = prefs.email as Record<string, any>;
          if (typeof email.enabled === 'boolean') updateData.email_enabled = email.enabled;
          if (typeof email.orders === 'boolean') updateData.email_orders = email.orders;
          if (typeof email.payments === 'boolean') updateData.email_payments = email.payments;
          if (typeof email.promotions === 'boolean') updateData.email_promotions = email.promotions;
          if (typeof email.security === 'boolean') updateData.email_security = email.security;
          if (typeof email.newsletter === 'boolean') updateData.email_newsletter = email.newsletter;
        }
        if (prefs.sms && typeof prefs.sms === 'object') {
          const sms = prefs.sms as Record<string, any>;
          if (typeof sms.enabled === 'boolean') updateData.sms_enabled = sms.enabled;
          if (typeof sms.orders === 'boolean') updateData.sms_orders = sms.orders;
          if (typeof sms.payments === 'boolean') updateData.sms_payments = sms.payments;
          if (typeof sms.security === 'boolean') updateData.sms_security = sms.security;
        }
      }

      if (input.category === 'privacy') {
        const prefs = input.preferences;
        if (typeof prefs.profileVisibility === 'string') updateData.profile_visibility = prefs.profileVisibility;
        if (typeof prefs.showEmail === 'boolean') updateData.show_email = prefs.showEmail;
        if (typeof prefs.showPhone === 'boolean') updateData.show_phone = prefs.showPhone;
        if (typeof prefs.showLocation === 'boolean') updateData.show_location = prefs.showLocation;
        if (typeof prefs.allowMessagesFromStrangers === 'boolean') updateData.allow_messages_from_strangers = prefs.allowMessagesFromStrangers;
        if (typeof prefs.shareDataWithPartners === 'boolean') updateData.share_data_with_partners = prefs.shareDataWithPartners;
        if (typeof prefs.activityStatus === 'boolean') updateData.activity_status = prefs.activityStatus;
        if (typeof prefs.readReceipts === 'boolean') updateData.read_receipts = prefs.readReceipts;
        if (typeof prefs.allowTagging === 'boolean') updateData.allow_tagging = prefs.allowTagging;
      }

      if (input.category === 'appearance') {
        const prefs = input.preferences;
        if (typeof prefs.theme === 'string') updateData.theme = prefs.theme;
        if (typeof prefs.fontSize === 'string') updateData.font_size = prefs.fontSize;
        if (typeof prefs.layoutDensity === 'string') updateData.layout_density = prefs.layoutDensity;
        if (typeof prefs.language === 'string') updateData.language = prefs.language;
        if (typeof prefs.currency === 'string') updateData.currency = prefs.currency;
      }

      if (input.category === 'accessibility') {
        const prefs = input.preferences;
        if (typeof prefs.screenReader === 'boolean') updateData.screen_reader = prefs.screenReader;
        if (typeof prefs.highContrast === 'boolean') updateData.high_contrast = prefs.highContrast;
        if (typeof prefs.reduceMotion === 'boolean') updateData.reduce_motion = prefs.reduceMotion;
        if (typeof prefs.largeText === 'boolean') updateData.large_text = prefs.largeText;
        if (typeof prefs.lowDataMode === 'boolean') updateData.low_data_mode = prefs.lowDataMode;
      }

      if (input.category === 'security') {
        const prefs = input.preferences;
        if (typeof prefs.twoFactorEnabled === 'boolean') updateData.two_factor_enabled = prefs.twoFactorEnabled;
        if (typeof prefs.twoFactorMethod === 'string') updateData.two_factor_method = prefs.twoFactorMethod;
        if (typeof prefs.biometricEnabled === 'boolean') updateData.biometric_enabled = prefs.biometricEnabled;
        if (typeof prefs.appLockEnabled === 'boolean') updateData.app_lock_enabled = prefs.appLockEnabled;
        if (typeof prefs.appLockMethod === 'string') updateData.app_lock_method = prefs.appLockMethod;
        if (typeof prefs.appLockPin === 'string') updateData.app_lock_pin = prefs.appLockPin;
        if (typeof prefs.appLockPattern === 'string') updateData.app_lock_pattern = prefs.appLockPattern;
        if (typeof prefs.sessionTimeout === 'number') updateData.session_timeout = prefs.sessionTimeout;
        if (prefs.trustedDevices && Array.isArray(prefs.trustedDevices)) updateData.trusted_devices = prefs.trustedDevices;
      }

      if (Object.keys(updateData).length === 0) {
        console.log('⚠️ No valid preferences to update');
        return {
          success: true as const,
          message: 'No changes to save',
          preferences: input.preferences,
          category: input.category,
          userId,
        };
      }

      const { error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Database error updating preferences:', error);
        throw new Error('Failed to update preferences in database');
      }

      console.log('✅ Preferences updated successfully in database');

      return {
        success: true as const,
        message: 'Preferences updated successfully',
        preferences: input.preferences,
        category: input.category,
        userId,
      };
    } catch (error) {
      console.error('❌ Preferences update error:', error);
      throw new Error('Failed to update preferences');
    }
  });
