import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const completeServiceOnboardingProcedure = protectedProcedure
  .input(z.object({
    providerType: z.enum(['individual', 'organization']),
    personalDetails: z.object({
      fullName: z.string(),
      idNumber: z.string().optional(),
      phone: z.string(),
      email: z.string(),
      address: z.string().optional(),
      profilePhoto: z.string().optional(),
    }).optional(),
    organizationDetails: z.object({
      businessName: z.string(),
      registrationNumber: z.string().optional(),
      taxId: z.string().optional(),
      contactPerson: z.string(),
      email: z.string(),
      logo: z.string().optional(),
    }).optional(),
    serviceTypes: z.array(z.string()).min(1),
    serviceAreas: z.array(z.string()).min(1),
    discoverable: z.boolean().default(true),
    instantRequests: z.boolean().default(true),
    paymentMethod: z.enum(['agripay', 'mpesa', 'bank']).default('agripay'),
    accountDetails: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user.id;
    
    console.log('[CompleteServiceOnboarding] Starting for user:', userId);

    try {
      const { data: existingProvider } = await ctx.supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingProvider) {
        return {
          success: true,
          message: 'Service provider profile already exists',
          providerId: existingProvider.id,
        };
      }

      const providerData: any = {
        user_id: userId,
        provider_type: input.providerType,
        service_areas: input.serviceAreas,
        discoverable: input.discoverable,
        instant_requests: input.instantRequests,
        payment_method: input.paymentMethod,
        account_details: input.accountDetails || '',
        terms_accepted: true,
        profile_completion: 70,
        status: 'active',
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

      const { data: provider, error: providerError } = await ctx.supabase
        .from('service_providers')
        .insert([providerData])
        .select()
        .single();

      if (providerError) {
        console.error('[CompleteServiceOnboarding] Provider creation error:', providerError);
        throw new Error('Failed to create service provider profile');
      }

      if (input.serviceTypes.length > 0) {
        const serviceTypesData = input.serviceTypes.map(category => ({
          provider_id: provider.id,
          service_category: category,
        }));

        await ctx.supabase
          .from('service_types')
          .insert(serviceTypesData);
      }

      console.log('[CompleteServiceOnboarding] Provider created:', provider.id);

      return {
        success: true,
        message: 'Service provider onboarding completed successfully',
        providerId: provider.id,
      };
    } catch (error: any) {
      console.error('[CompleteServiceOnboarding] Error:', error);
      throw new Error(error.message || 'Failed to complete service provider onboarding');
    }
  });
