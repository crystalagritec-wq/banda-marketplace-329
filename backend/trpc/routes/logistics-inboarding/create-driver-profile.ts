import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';

const driverVerificationSchema = z.object({
  goodConductUri: z.string().optional(),
  qrVerified: z.boolean(),
  backgroundCheckPassed: z.boolean(),
  verified: z.boolean(),
});

export const createDriverProfileProcedure = protectedProcedure
  .input(
    z.object({
      fullName: z.string(),
      phone: z.string(),
      selfieUri: z.string(),
      nationalIdUri: z.string(),
      driverLicenseUri: z.string(),
      licenseClass: z.string(),
      allowDiscovery: z.boolean(),
      availability: z.enum(['active', 'idle']),
      verification: driverVerificationSchema.optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx;

    console.log('[CreateDriverProfile] Creating driver profile for user:', user.id);

    const { data: existingProfile, error: checkError } = await supabase
      .from('logistics_drivers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[CreateDriverProfile] Error checking existing profile:', checkError);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check existing profile',
      });
    }

    if (existingProfile) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Driver profile already exists',
      });
    }

    const { data: driverProfile, error: driverError } = await supabase
      .from('logistics_drivers')
      .insert({
        user_id: user.id,
        full_name: input.fullName,
        phone: input.phone,
        selfie_uri: input.selfieUri,
        national_id_uri: input.nationalIdUri,
        driver_license_uri: input.driverLicenseUri,
        license_class: input.licenseClass,
        allow_discovery: input.allowDiscovery,
        availability: input.availability,
        verified: input.verification?.verified || false,
        verification_documents: input.verification
          ? {
              good_conduct: input.verification.goodConductUri,
              qr_verified: input.verification.qrVerified,
              background_check_passed: input.verification.backgroundCheckPassed,
            }
          : null,
      })
      .select()
      .single();

    if (driverError) {
      console.error('[CreateDriverProfile] Error creating driver profile:', driverError);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create driver profile',
      });
    }

    console.log('[CreateDriverProfile] Driver profile created successfully');

    return {
      success: true,
      driverId: driverProfile.id,
      verified: driverProfile.verified,
    };
  });
