import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const addSpecializationProcedure = protectedProcedure
  .input(
    z.object({
      serviceTypeId: z.string(),
      serviceName: z.string(),
      category: z.string(),
      hourlyRate: z.number().optional(),
      dailyRate: z.number().optional(),
      customPricing: z.record(z.string(), z.any()).optional(),
      availability: z.string().default('Location-based'),
      requestType: z.string().default('Instant or Scheduled'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    console.log('[addSpecialization] Adding specialization for user:', userId);

    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (providerError || !provider) {
      console.error('[addSpecialization] Provider not found:', providerError);
      throw new Error('Service provider profile not found');
    }

    const { data: specialization, error: specializationError } = await supabase
      .from('service_specializations')
      .insert([
        {
          provider_id: provider.id,
          service_type_id: input.serviceTypeId,
          service_name: input.serviceName,
          category: input.category,
          hourly_rate: input.hourlyRate,
          daily_rate: input.dailyRate,
          custom_pricing: input.customPricing || {},
          availability: input.availability,
          request_type: input.requestType,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (specializationError) {
      console.error('[addSpecialization] Error adding specialization:', specializationError);
      throw new Error('Failed to add specialization');
    }

    const { data: currentProvider } = await supabase
      .from('service_providers')
      .select('service_categories')
      .eq('id', provider.id)
      .single();

    const currentCategories = currentProvider?.service_categories || [];
    const updatedCategories = currentCategories.includes(input.category)
      ? currentCategories
      : [...currentCategories, input.category];

    const { error: updateError } = await supabase
      .from('service_providers')
      .update({
        service_categories: updatedCategories,
      })
      .eq('id', provider.id);

    if (updateError) {
      console.warn('[addSpecialization] Failed to update service categories:', updateError);
    }

    console.log('[addSpecialization] Specialization added successfully:', specialization.id);

    return {
      success: true,
      specialization,
    };
  });
