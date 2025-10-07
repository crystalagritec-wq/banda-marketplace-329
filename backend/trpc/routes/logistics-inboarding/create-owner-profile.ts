import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { TRPCError } from '@trpc/server';

const vehicleSchema = z.object({
  type: z.string(),
  registrationNumber: z.string(),
  color: z.string(),
  capacity: z.string(),
  photos: z.array(z.string()),
  ownershipType: z.enum(['owned', 'financed']),
});

const ownerVerificationSchema = z.object({
  logbookUri: z.string().optional(),
  insuranceUri: z.string().optional(),
  ntsaInspectionUri: z.string().optional(),
  maintenanceStatus: z.string().optional(),
  verified: z.boolean(),
});

export const createOwnerProfileProcedure = protectedProcedure
  .input(
    z.object({
      fullName: z.string(),
      phone: z.string(),
      kraPin: z.string(),
      areaOfOperation: z.string(),
      vehicles: z.array(vehicleSchema),
      assignedDriver: z.string().optional(),
      verification: ownerVerificationSchema.optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { supabase, user } = ctx;

    console.log('[CreateOwnerProfile] Creating owner profile for user:', user.id);

    const { data: existingProfile, error: checkError } = await supabase
      .from('logistics_owners')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[CreateOwnerProfile] Error checking existing profile:', checkError);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check existing profile',
      });
    }

    if (existingProfile) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Owner profile already exists',
      });
    }

    const { data: ownerProfile, error: ownerError } = await supabase
      .from('logistics_owners')
      .insert({
        user_id: user.id,
        full_name: input.fullName,
        phone: input.phone,
        kra_pin: input.kraPin,
        area_of_operation: input.areaOfOperation,
        assigned_driver: input.assignedDriver,
        verified: input.verification?.verified || false,
        verification_documents: input.verification
          ? {
              logbook: input.verification.logbookUri,
              insurance: input.verification.insuranceUri,
              ntsa_inspection: input.verification.ntsaInspectionUri,
              maintenance_status: input.verification.maintenanceStatus,
            }
          : null,
      })
      .select()
      .single();

    if (ownerError) {
      console.error('[CreateOwnerProfile] Error creating owner profile:', ownerError);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create owner profile',
      });
    }

    const vehicleInserts = input.vehicles.map((vehicle) => ({
      owner_id: ownerProfile.id,
      type: vehicle.type,
      registration_number: vehicle.registrationNumber,
      color: vehicle.color,
      capacity: vehicle.capacity,
      photos: vehicle.photos,
      ownership_type: vehicle.ownershipType,
      status: 'available',
    }));

    const { error: vehiclesError } = await supabase
      .from('logistics_vehicles')
      .insert(vehicleInserts);

    if (vehiclesError) {
      console.error('[CreateOwnerProfile] Error creating vehicles:', vehiclesError);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create vehicles',
      });
    }

    console.log('[CreateOwnerProfile] Owner profile created successfully');

    return {
      success: true,
      ownerId: ownerProfile.id,
      verified: ownerProfile.verified,
    };
  });
