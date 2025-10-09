import { supabase } from '@/lib/supabase';

export interface PopulateResult {
  success: boolean;
  message: string;
  counts?: {
    products?: number;
    services?: number;
    users?: number;
  };
  error?: string;
}

const SAMPLE_PRODUCTS = [
  {
    name: 'Fresh Tomatoes',
    description: 'Organic tomatoes freshly harvested from our farm. Perfect for salads and cooking.',
    category: 'Vegetables',
    subcategory: 'Fresh Produce',
    price: 120,
    stock_quantity: 500,
    images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&h=400&fit=crop'],
    location_county: 'Kiambu',
    location_subcounty: 'Limuru',
    delivery_available: true,
    pickup_available: true,
    delivery_fee: 150,
    estimated_delivery_days: 1,
    tags: ['organic', 'fresh', 'vegetables'],
    condition: 'new',
    rating: 4.8,
    review_count: 45,
    status: 'active',
    featured: true,
    verified: true,
  },
  {
    name: 'Maize Seeds - Hybrid',
    description: 'High-yield hybrid maize seeds suitable for various climatic conditions. Drought resistant.',
    category: 'Seeds',
    subcategory: 'Cereal Seeds',
    price: 3500,
    original_price: 4000,
    stock_quantity: 200,
    images: ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop'],
    location_county: 'Nakuru',
    location_subcounty: 'Njoro',
    delivery_available: true,
    pickup_available: true,
    delivery_fee: 200,
    estimated_delivery_days: 2,
    tags: ['seeds', 'maize', 'hybrid', 'drought-resistant'],
    brand: 'Kenya Seed Company',
    condition: 'new',
    rating: 4.9,
    review_count: 78,
    status: 'active',
    featured: true,
    verified: true,
  },
  {
    name: 'Dairy Cow - Friesian',
    description: 'Healthy Friesian dairy cow, 3 years old, producing 25 liters per day. Vaccinated and dewormed.',
    category: 'Livestock',
    subcategory: 'Dairy Cattle',
    price: 85000,
    stock_quantity: 5,
    images: ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop'],
    location_county: 'Nyandarua',
    location_subcounty: 'Ol Kalou',
    delivery_available: false,
    pickup_available: true,
    tags: ['livestock', 'dairy', 'friesian', 'cow'],
    condition: 'new',
    rating: 4.7,
    review_count: 23,
    status: 'active',
    featured: true,
    verified: true,
  },
  {
    name: 'Organic Fertilizer - 50kg',
    description: 'Premium organic fertilizer made from composted farm waste. Rich in nutrients.',
    category: 'Farm Inputs',
    subcategory: 'Fertilizers',
    price: 1200,
    stock_quantity: 300,
    images: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop'],
    location_county: 'Nairobi',
    location_subcounty: 'Kasarani',
    delivery_available: true,
    pickup_available: true,
    delivery_fee: 300,
    estimated_delivery_days: 2,
    tags: ['fertilizer', 'organic', 'farm-inputs'],
    brand: 'Green Farms',
    condition: 'new',
    rating: 4.6,
    review_count: 56,
    status: 'active',
    featured: false,
    verified: true,
  },
  {
    name: 'Avocado - Hass Variety',
    description: 'Premium Hass avocados, ready to eat. Rich, creamy texture perfect for export or local market.',
    category: 'Fruits',
    subcategory: 'Fresh Fruits',
    price: 80,
    stock_quantity: 1000,
    images: ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=400&fit=crop'],
    location_county: 'Murang\'a',
    location_subcounty: 'Kandara',
    delivery_available: true,
    pickup_available: true,
    delivery_fee: 200,
    estimated_delivery_days: 1,
    tags: ['fruits', 'avocado', 'hass', 'export-quality'],
    condition: 'new',
    rating: 4.9,
    review_count: 92,
    status: 'active',
    featured: true,
    verified: true,
  },
  {
    name: 'Chicken Feed - Layers Mash',
    description: 'Complete nutrition for laying hens. Increases egg production and quality.',
    category: 'Animal Feed',
    subcategory: 'Poultry Feed',
    price: 2800,
    stock_quantity: 150,
    images: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop'],
    location_county: 'Kiambu',
    location_subcounty: 'Thika',
    delivery_available: true,
    pickup_available: true,
    delivery_fee: 250,
    estimated_delivery_days: 1,
    tags: ['feed', 'poultry', 'layers', 'chicken'],
    brand: 'Unga Feeds',
    condition: 'new',
    rating: 4.7,
    review_count: 67,
    status: 'active',
    featured: false,
    verified: true,
  },
  {
    name: 'Greenhouse Kit - 8m x 15m',
    description: 'Complete greenhouse kit with UV-treated polythene, frame, and drip irrigation system.',
    category: 'Farm Equipment',
    subcategory: 'Greenhouse',
    price: 125000,
    stock_quantity: 10,
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop'],
    location_county: 'Nairobi',
    location_subcounty: 'Embakasi',
    delivery_available: true,
    pickup_available: true,
    delivery_fee: 2000,
    estimated_delivery_days: 5,
    tags: ['greenhouse', 'equipment', 'irrigation'],
    brand: 'Amiran Kenya',
    condition: 'new',
    rating: 4.8,
    review_count: 34,
    status: 'active',
    featured: true,
    verified: true,
  },
  {
    name: 'Cabbage - Fresh',
    description: 'Crisp and fresh cabbages, perfect for salads and cooking. Pesticide-free.',
    category: 'Vegetables',
    subcategory: 'Fresh Produce',
    price: 50,
    stock_quantity: 800,
    images: ['https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&h=400&fit=crop'],
    location_county: 'Nakuru',
    location_subcounty: 'Molo',
    delivery_available: true,
    pickup_available: true,
    delivery_fee: 150,
    estimated_delivery_days: 1,
    tags: ['vegetables', 'cabbage', 'fresh', 'pesticide-free'],
    condition: 'new',
    rating: 4.5,
    review_count: 41,
    status: 'active',
    featured: false,
    verified: true,
  },
];

const SAMPLE_SERVICES = [
  {
    name: 'Land Ploughing Service',
    description: 'Professional land ploughing with modern tractors. Suitable for all farm sizes. Experienced operators.',
    category: 'Mechanization',
    subcategory: 'Tractor Services',
    price_from: 3000,
    price_to: 8000,
    pricing_type: 'per_acre',
    images: ['https://images.unsplash.com/photo-1506804886640-20a2f86db47b?w=600&h=400&fit=crop'],
    location_county: 'Nakuru',
    location_subcounty: 'Njoro',
    service_radius_km: 50,
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    available_hours: '7:00 AM - 6:00 PM',
    tags: ['ploughing', 'tractor', 'mechanization'],
    experience_years: 10,
    rating: 4.8,
    review_count: 45,
    status: 'active',
    featured: true,
    verified: true,
  },
  {
    name: 'Veterinary Services',
    description: 'Comprehensive veterinary care for livestock and poultry. Vaccination, treatment, AI services, and emergency care.',
    category: 'Veterinary',
    subcategory: 'Animal Health',
    price_from: 500,
    price_to: 5000,
    pricing_type: 'per_visit',
    images: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop'],
    location_county: 'Kiambu',
    location_subcounty: 'Kikuyu',
    service_radius_km: 30,
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    available_hours: '8:00 AM - 5:00 PM',
    tags: ['veterinary', 'livestock', 'vaccination', 'AI'],
    certifications: ['Kenya Veterinary Board Certified'],
    experience_years: 8,
    rating: 4.9,
    review_count: 78,
    status: 'active',
    featured: true,
    verified: true,
  },
  {
    name: 'Greenhouse Installation',
    description: 'Professional greenhouse construction and installation. All sizes available with drip irrigation setup and training.',
    category: 'Construction',
    subcategory: 'Farm Infrastructure',
    price_from: 50000,
    price_to: 500000,
    pricing_type: 'per_project',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop'],
    location_county: 'Nairobi',
    location_subcounty: 'Westlands',
    service_radius_km: 100,
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    available_hours: '8:00 AM - 6:00 PM',
    tags: ['greenhouse', 'irrigation', 'infrastructure', 'construction'],
    experience_years: 12,
    rating: 4.7,
    review_count: 34,
    status: 'active',
    featured: true,
    verified: true,
  },
  {
    name: 'Crop Spraying Services',
    description: 'Professional crop spraying using modern equipment. Pest and disease control for all crops.',
    category: 'Mechanization',
    subcategory: 'Spraying Services',
    price_from: 1500,
    price_to: 4000,
    pricing_type: 'per_acre',
    images: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop'],
    location_county: 'Nakuru',
    location_subcounty: 'Rongai',
    service_radius_km: 40,
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    available_hours: '6:00 AM - 6:00 PM',
    tags: ['spraying', 'pest-control', 'mechanization'],
    experience_years: 7,
    rating: 4.6,
    review_count: 52,
    status: 'active',
    featured: false,
    verified: true,
  },
  {
    name: 'Farm Management Consultation',
    description: 'Expert farm management advice, soil testing, crop planning, and financial analysis for optimal productivity.',
    category: 'Consultation',
    subcategory: 'Farm Advisory',
    price_from: 5000,
    price_to: 50000,
    pricing_type: 'per_project',
    images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop'],
    location_county: 'Nairobi',
    location_subcounty: 'Karen',
    service_radius_km: 200,
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    available_hours: '9:00 AM - 5:00 PM',
    tags: ['consultation', 'farm-management', 'advisory', 'soil-testing'],
    certifications: ['Certified Farm Manager', 'Agronomist'],
    experience_years: 15,
    rating: 4.9,
    review_count: 67,
    status: 'active',
    featured: true,
    verified: true,
  },
  {
    name: 'Borehole Drilling',
    description: 'Professional borehole drilling services with water testing and pump installation. Guaranteed water supply.',
    category: 'Construction',
    subcategory: 'Water Systems',
    price_from: 80000,
    price_to: 300000,
    pricing_type: 'per_project',
    images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop'],
    location_county: 'Machakos',
    location_subcounty: 'Machakos Town',
    service_radius_km: 150,
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    available_hours: '7:00 AM - 6:00 PM',
    tags: ['borehole', 'drilling', 'water', 'irrigation'],
    experience_years: 20,
    rating: 4.8,
    review_count: 89,
    status: 'active',
    featured: true,
    verified: true,
  },
];

export async function populateProducts(userId: string): Promise<PopulateResult> {
  try {
    console.log('[PopulateDB] Starting product population for user:', userId);

    const productsToInsert = SAMPLE_PRODUCTS.map((product) => ({
      ...product,
      seller_id: userId,
      currency: 'KES',
    }));

    const { data, error } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select('id');

    if (error) {
      console.error('[PopulateDB] Error inserting products:', error);
      return {
        success: false,
        message: 'Failed to populate products',
        error: error.message,
      };
    }

    console.log('[PopulateDB] Successfully inserted', data?.length || 0, 'products');
    return {
      success: true,
      message: `Successfully added ${data?.length || 0} products`,
      counts: { products: data?.length || 0 },
    };
  } catch (error) {
    console.error('[PopulateDB] Unexpected error:', error);
    return {
      success: false,
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function populateServices(userId: string): Promise<PopulateResult> {
  try {
    console.log('[PopulateDB] Starting service population for user:', userId);

    const servicesToInsert = SAMPLE_SERVICES.map((service) => ({
      ...service,
      provider_id: userId,
      currency: 'KES',
    }));

    const { data, error } = await supabase
      .from('services')
      .insert(servicesToInsert)
      .select('id');

    if (error) {
      console.error('[PopulateDB] Error inserting services:', error);
      return {
        success: false,
        message: 'Failed to populate services',
        error: error.message,
      };
    }

    console.log('[PopulateDB] Successfully inserted', data?.length || 0, 'services');
    return {
      success: true,
      message: `Successfully added ${data?.length || 0} services`,
      counts: { services: data?.length || 0 },
    };
  } catch (error) {
    console.error('[PopulateDB] Unexpected error:', error);
    return {
      success: false,
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function populateAll(userId: string): Promise<PopulateResult> {
  try {
    console.log('[PopulateDB] Starting full database population for user:', userId);

    const productResult = await populateProducts(userId);
    const serviceResult = await populateServices(userId);

    const totalSuccess = productResult.success && serviceResult.success;
    const totalCounts = {
      products: productResult.counts?.products || 0,
      services: serviceResult.counts?.services || 0,
    };

    if (!totalSuccess) {
      return {
        success: false,
        message: 'Some items failed to populate',
        counts: totalCounts,
        error: `Products: ${productResult.error || 'OK'}, Services: ${serviceResult.error || 'OK'}`,
      };
    }

    return {
      success: true,
      message: `Successfully populated database with ${totalCounts.products} products and ${totalCounts.services} services`,
      counts: totalCounts,
    };
  } catch (error) {
    console.error('[PopulateDB] Unexpected error:', error);
    return {
      success: false,
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function clearAllData(userId: string): Promise<PopulateResult> {
  try {
    console.log('[PopulateDB] Clearing all data for user:', userId);

    const { data: products, error: productError } = await supabase
      .from('products')
      .delete()
      .eq('seller_id', userId)
      .select('id');

    const { data: services, error: serviceError } = await supabase
      .from('services')
      .delete()
      .eq('provider_id', userId)
      .select('id');

    if (productError || serviceError) {
      return {
        success: false,
        message: 'Failed to clear some data',
        error: `Products: ${productError?.message || 'OK'}, Services: ${serviceError?.message || 'OK'}`,
      };
    }

    return {
      success: true,
      message: `Cleared ${products?.length || 0} products and ${services?.length || 0} services`,
      counts: {
        products: products?.length || 0,
        services: services?.length || 0,
      },
    };
  } catch (error) {
    console.error('[PopulateDB] Unexpected error:', error);
    return {
      success: false,
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkDataExists(userId: string): Promise<{ products: number; services: number }> {
  try {
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', userId);

    const { count: serviceCount } = await supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', userId);

    return {
      products: productCount || 0,
      services: serviceCount || 0,
    };
  } catch (error) {
    console.error('[PopulateDB] Error checking data:', error);
    return { products: 0, services: 0 };
  }
}
