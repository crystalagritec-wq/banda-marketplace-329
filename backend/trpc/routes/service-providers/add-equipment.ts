import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const addServiceEquipmentProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      type: z.string(),
      ownershipType: z.enum(['owned', 'leased', 'financed']),
      maintenanceStatus: z.enum(['excellent', 'good', 'fair', 'needs_service']),
      photos: z.array(z.string()).optional(),
      specifications: z.record(z.string(), z.string()).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;

    console.log('[AddEquipment] Adding equipment for user:', userId);

    const { data: provider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!provider) {
      throw new Error('Service provider profile not found');
    }

    const { data: equipment, error } = await supabase
      .from('service_equipment')
      .insert([{
        provider_id: provider.id,
        name: input.name,
        type: input.type,
        ownership_type: input.ownershipType,
        maintenance_status: input.maintenanceStatus,
        photos: input.photos || [],
        specifications: input.specifications || {},
      }])
      .select()
      .single();

    if (error) {
      console.error('[AddEquipment] Error adding equipment:', error);
      throw new Error('Failed to add equipment');
    }

    console.log('[AddEquipment] Equipment added:', equipment.id);

    return {
      success: true,
      equipment,
    };
  });
