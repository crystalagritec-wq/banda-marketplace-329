import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { supabase } from '@/lib/supabase';

export const createServiceProviderProfileProcedure = protectedProcedure
  .input(
    z.object({
      providerType: z.enum(['individual', 'organization']),
      personalDetails: z.object({
        fullName: z.string().optional(),
        idNumber: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        profilePhoto: z.string().optional(),
      }).optional(),
      organizationDetails: z.object({
        businessName: z.string().optional(),
        registrationNumber: z.string().optional(),
        taxId: z.string().optional(),
        contactPerson: z.string().optional(),
        email: z.string().optional(),
        logo: z.string().optional(),
      }).optional(),
      serviceTypes: z.array(z.enum([
        'agriculture', 'veterinary', 'fisheries', 'training',
        'pest_control', 'construction', 'survey', 'security',
        'transport', 'equipment_rental', 'consultation', 'other'
      ])),
      verification: z.object({
        idDocument: z.string().optional(),
        license: z.string().optional(),
        certificates: z.array(z.string()).optional(),
      }).optional(),
      availability: z.object({
        serviceAreas: z.array(z.string()),
        discoverable: z.boolean(),
        instantRequests: z.boolean(),
      }),
      payment: z.object({
        method: z.enum(['agripay', 'mpesa', 'bank']),
        accountDetails: z.string(),
        termsAccepted: z.boolean(),
      }),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;

    console.log('[CreateServiceProvider] Creating profile for user:', userId);

    const { data: existingProvider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProvider) {
      throw new Error('Service provider profile already exists');
    }

    const providerData: any = {
      user_id: userId,
      provider_type: input.providerType,
      service_areas: input.availability.serviceAreas,
      discoverable: input.availability.discoverable,
      instant_requests: input.availability.instantRequests,
      payment_method: input.payment.method,
      account_details: input.payment.accountDetails,
      terms_accepted: input.payment.termsAccepted,
      profile_completion: 60,
    };

    if (input.providerType === 'individual' && input.personalDetails) {
      providerData.full_name = input.personalDetails.fullName;
      providerData.id_number = input.personalDetails.idNumber;
      providerData.phone = input.personalDetails.phone;
      providerData.email = input.personalDetails.email;
      providerData.address = input.personalDetails.address;
      providerData.profile_photo = input.personalDetails.profilePhoto;
    } else if (input.providerType === 'organization' && input.organizationDetails) {
      providerData.business_name = input.organizationDetails.businessName;
      providerData.registration_number = input.organizationDetails.registrationNumber;
      providerData.tax_id = input.organizationDetails.taxId;
      providerData.contact_person = input.organizationDetails.contactPerson;
      providerData.organization_email = input.organizationDetails.email;
      providerData.logo = input.organizationDetails.logo;
    }

    if (input.verification) {
      providerData.id_document = input.verification.idDocument;
      providerData.license = input.verification.license;
      providerData.certificates = input.verification.certificates || [];
    }

    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .insert([providerData])
      .select()
      .single();

    if (providerError) {
      console.error('[CreateServiceProvider] Error creating provider:', providerError);
      throw new Error('Failed to create service provider profile');
    }

    console.log('[CreateServiceProvider] Provider created:', provider.id);

    if (input.serviceTypes.length > 0) {
      const serviceTypesData = input.serviceTypes.map(category => ({
        provider_id: provider.id,
        service_category: category,
      }));

      const { error: serviceTypesError } = await supabase
        .from('service_types')
        .insert(serviceTypesData);

      if (serviceTypesError) {
        console.error('[CreateServiceProvider] Error adding service types:', serviceTypesError);
      }
    }

    return {
      success: true,
      providerId: provider.id,
      message: 'Service provider profile created successfully',
    };
  });
