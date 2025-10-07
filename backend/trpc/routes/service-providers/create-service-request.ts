import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const createServiceRequestProcedure = protectedProcedure
  .input(
    z.object({
      providerId: z.string().optional(),
      serviceTypeId: z.string(),
      serviceName: z.string(),
      category: z.string(),
      description: z.string(),
      locationCounty: z.string(),
      locationSubCounty: z.string().optional(),
      locationWard: z.string().optional(),
      locationAddress: z.string().optional(),
      locationLat: z.number().optional(),
      locationLng: z.number().optional(),
      requestType: z.enum(['Instant', 'Scheduled']),
      scheduledDate: z.string().optional(),
      scheduledTimeStart: z.string().optional(),
      scheduledTimeEnd: z.string().optional(),
      estimatedDurationHours: z.number().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('[createServiceRequest] Creating request for user:', userId);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('[createServiceRequest] Profile not found:', profileError);
      throw new Error('User profile not found');
    }

    const { data: request, error: requestError } = await supabase
      .from('service_requests')
      .insert([
        {
          requester_id: profile.id,
          provider_id: input.providerId || null,
          service_type_id: input.serviceTypeId,
          service_name: input.serviceName,
          category: input.category,
          description: input.description,
          location_county: input.locationCounty,
          location_sub_county: input.locationSubCounty,
          location_ward: input.locationWard,
          location_address: input.locationAddress,
          location_lat: input.locationLat,
          location_lng: input.locationLng,
          request_type: input.requestType,
          scheduled_date: input.scheduledDate,
          scheduled_time_start: input.scheduledTimeStart,
          scheduled_time_end: input.scheduledTimeEnd,
          estimated_duration_hours: input.estimatedDurationHours,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (requestError) {
      console.error('[createServiceRequest] Error creating request:', requestError);
      throw new Error('Failed to create service request');
    }

    console.log('[createServiceRequest] Request created successfully:', request.id);

    return {
      success: true,
      request,
    };
  });
