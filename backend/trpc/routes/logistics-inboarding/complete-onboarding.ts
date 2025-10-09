import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

const vehicleSchema = z.object({
  type: z.string(),
  registrationNumber: z.string(),
  color: z.string(),
  capacity: z.string(),
  photos: z.array(z.string()).default([]),
  ownershipType: z.enum(['owned', 'financed']),
});

export const completeLogisticsOnboardingProcedure = protectedProcedure
  .input(z.object({
    role: z.enum(['owner', 'driver']),
    ownerDetails: z.object({
      fullName: z.string(),
      phone: z.string(),
      kraPin: z.string().optional(),
      areaOfOperation: z.string(),
      vehicles: z.array(vehicleSchema).min(1),
    }).optional(),
    driverDetails: z.object({
      fullName: z.string(),
      phone: z.string(),
      idNumber: z.string(),
      license: z.string().optional(),
      selfie: z.string().optional(),
      discoverable: z.boolean().default(true),
    }).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('[CompleteLogisticsOnboarding] Starting for user:', userId);
    console.log('[CompleteLogisticsOnboarding] Role:', input.role);

    try {
      if (input.role === 'owner' && input.ownerDetails) {
        const { data: existingOwner } = await ctx.supabase
          .from('logistics_owners')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingOwner) {
          return {
            success: true,
            message: 'Owner profile already exists',
            ownerId: existingOwner.id,
          };
        }

        const { data: ownerProfile, error: ownerError } = await ctx.supabase
          .from('logistics_owners')
          .insert({
            user_id: userId,
            full_name: input.ownerDetails.fullName,
            phone: input.ownerDetails.phone,
            kra_pin: input.ownerDetails.kraPin || null,
            area_of_operation: input.ownerDetails.areaOfOperation,
            verified: false,
            status: 'active',
          })
          .select()
          .single();

        if (ownerError) {
          console.error('[CompleteLogisticsOnboarding] Owner creation error:', ownerError);
          throw new Error('Failed to create owner profile');
        }

        const vehicleInserts = input.ownerDetails.vehicles.map((vehicle) => ({
          owner_id: ownerProfile.id,
          type: vehicle.type,
          registration_number: vehicle.registrationNumber,
          color: vehicle.color,
          capacity: vehicle.capacity,
          photos: vehicle.photos,
          ownership_type: vehicle.ownershipType,
          status: 'available',
        }));

        const { error: vehiclesError } = await ctx.supabase
          .from('logistics_vehicles')
          .insert(vehicleInserts);

        if (vehiclesError) {
          console.error('[CompleteLogisticsOnboarding] Vehicles creation error:', vehiclesError);
        }

        console.log('[CompleteLogisticsOnboarding] Owner profile created:', ownerProfile.id);

        return {
          success: true,
          message: 'Logistics owner onboarding completed successfully',
          ownerId: ownerProfile.id,
          verified: ownerProfile.verified,
        };
      } else if (input.role === 'driver' && input.driverDetails) {
        const { data: existingDriver } = await ctx.supabase
          .from('logistics_drivers')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingDriver) {
          return {
            success: true,
            message: 'Driver profile already exists',
            driverId: existingDriver.id,
          };
        }

        const { data: driverProfile, error: driverError } = await ctx.supabase
          .from('logistics_drivers')
          .insert({
            user_id: userId,
            full_name: input.driverDetails.fullName,
            phone: input.driverDetails.phone,
            id_number: input.driverDetails.idNumber,
            license: input.driverDetails.license || null,
            selfie: input.driverDetails.selfie || null,
            discoverable: input.driverDetails.discoverable,
            verified: false,
            status: 'available',
          })
          .select()
          .single();

        if (driverError) {
          console.error('[CompleteLogisticsOnboarding] Driver creation error:', driverError);
          throw new Error('Failed to create driver profile');
        }

        console.log('[CompleteLogisticsOnboarding] Driver profile created:', driverProfile.id);

        return {
          success: true,
          message: 'Logistics driver onboarding completed successfully',
          driverId: driverProfile.id,
          verified: driverProfile.verified,
        };
      }

      throw new Error('Invalid role or missing details');
    } catch (error: any) {
      console.error('[CompleteLogisticsOnboarding] Error:', error);
      throw new Error(error.message || 'Failed to complete logistics onboarding');
    }
  });
