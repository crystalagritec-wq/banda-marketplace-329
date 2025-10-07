import { protectedProcedure } from '@/backend/trpc/create-context';

export const getPreferencesProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.user.id;

    console.log('⚙️ Fetching user preferences:', userId);

    try {
      const preferences = {
        notifications: {
          push: {
            enabled: true,
            orders: true,
            payments: true,
            promotions: false,
            security: true,
            messages: true,
          },
          email: {
            enabled: true,
            orders: true,
            payments: true,
            promotions: true,
            security: true,
            newsletter: false,
          },
          sms: {
            enabled: false,
            orders: false,
            payments: true,
            security: true,
          },
        },
        privacy: {
          profileVisibility: 'public' as const,
          showEmail: false,
          showPhone: false,
          showLocation: true,
          allowMessagesFromStrangers: true,
          shareDataWithPartners: false,
        },
        appearance: {
          theme: 'system' as const,
          fontSize: 'medium' as const,
          language: 'en',
          currency: 'KES',
        },
        accessibility: {
          screenReader: false,
          highContrast: false,
          reduceMotion: false,
          largeText: false,
        },
        security: {
          twoFactorEnabled: false,
          biometricEnabled: false,
          sessionTimeout: 30,
          trustedDevices: ['device_123'],
        },
      };

      console.log('✅ Preferences fetched successfully');

      return {
        success: true,
        preferences,
      };
    } catch (error) {
      console.error('❌ Preferences fetch error:', error);
      throw new Error('Failed to fetch preferences');
    }
  });
