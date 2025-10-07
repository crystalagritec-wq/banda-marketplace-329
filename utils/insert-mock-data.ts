import { supabase } from '@/lib/supabase';
import { mockProducts } from '@/constants/products';

export interface InsertProductData {
  seller_id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  images: string[];
  location_county: string;
  location_subcounty?: string;
  location_ward?: string;
  location_coordinates?: string;
  delivery_available: boolean;
  pickup_available: boolean;
  delivery_fee?: number;
  estimated_delivery_days?: number;
  tags: string[];
  brand?: string;
  condition: string;
  rating: number;
  review_count: number;
  status: string;
  featured: boolean;
  verified: boolean;
}

export async function insertMockProducts(userId: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log('[InsertMockData] Starting mock product insertion for user:', userId);

    const productsToInsert: InsertProductData[] = mockProducts.map((product) => {
      const countyMatch = product.location.match(/^([^,]+)/);
      const county = countyMatch ? countyMatch[1].trim() : product.location;

      return {
        seller_id: userId,
        name: product.name,
        description: `High quality ${product.name.toLowerCase()} from ${product.vendor}. ${product.negotiable ? 'Price negotiable.' : 'Fixed price.'}`,
        category: product.category,
        subcategory: undefined,
        price: product.price,
        original_price: product.discount ? product.price / (1 - product.discount / 100) : undefined,
        stock_quantity: product.inStock ? 100 : 0,
        images: product.gallery || [product.image],
        location_county: county,
        location_subcounty: undefined,
        location_ward: undefined,
        location_coordinates: `POINT(${product.coordinates.lng} ${product.coordinates.lat})`,
        delivery_available: product.fastDelivery || true,
        pickup_available: true,
        delivery_fee: Math.floor(Math.random() * 200) + 50,
        estimated_delivery_days: product.fastDelivery ? 1 : Math.floor(Math.random() * 5) + 2,
        tags: [product.category, product.vendor, product.unit],
        brand: product.vendor,
        condition: 'new',
        rating: product.rating,
        review_count: Math.floor(Math.random() * 50),
        status: product.inStock ? 'active' : 'out_of_stock',
        featured: product.discount ? true : false,
        verified: product.vendorVerified || false,
      };
    });

    const { data, error } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select('id');

    if (error) {
      console.error('[InsertMockData] Error inserting products:', error);
      return { success: false, count: 0, error: error.message };
    }

    console.log('[InsertMockData] Successfully inserted', data?.length || 0, 'products');
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('[InsertMockData] Unexpected error:', error);
    return { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function clearAllProducts(userId: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log('[ClearMockData] Clearing all products for user:', userId);

    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('seller_id', userId)
      .select('id');

    if (error) {
      console.error('[ClearMockData] Error clearing products:', error);
      return { success: false, count: 0, error: error.message };
    }

    console.log('[ClearMockData] Successfully cleared', data?.length || 0, 'products');
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('[ClearMockData] Unexpected error:', error);
    return { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function checkProductsExist(userId: string): Promise<{ exists: boolean; count: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', userId);

    if (error) {
      console.error('[CheckProducts] Error checking products:', error);
      return { exists: false, count: 0, error: error.message };
    }

    return { exists: (count || 0) > 0, count: count || 0 };
  } catch (error) {
    console.error('[CheckProducts] Unexpected error:', error);
    return { 
      exists: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function insertSampleServices(userId: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log('[InsertMockData] Starting sample service insertion for user:', userId);

    const sampleServices = [
      {
        provider_id: userId,
        name: 'Land Ploughing Service',
        description: 'Professional land ploughing services with modern tractors. Suitable for all farm sizes.',
        category: 'Agricultural Services',
        subcategory: 'Mechanization Services',
        price_from: 3000,
        price_to: 8000,
        pricing_type: 'per_acre',
        images: ['https://images.unsplash.com/photo-1506804886640-20a2f86db47b?w=600&h=400&fit=crop'],
        location_county: 'Nakuru',
        location_coordinates: 'POINT(36.0800 -0.3031)',
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
        provider_id: userId,
        name: 'Veterinary Services',
        description: 'Comprehensive veterinary care for livestock and poultry. Vaccination, treatment, and AI services.',
        category: 'Agricultural Services',
        subcategory: 'Veterinary Services',
        price_from: 500,
        price_to: 5000,
        pricing_type: 'per_visit',
        images: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop'],
        location_county: 'Kiambu',
        location_coordinates: 'POINT(36.8356 -1.1714)',
        service_radius_km: 30,
        available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        available_hours: '8:00 AM - 5:00 PM',
        tags: ['veterinary', 'livestock', 'vaccination'],
        certifications: ['Kenya Veterinary Board Certified'],
        experience_years: 8,
        rating: 4.9,
        review_count: 78,
        status: 'active',
        featured: true,
        verified: true,
      },
      {
        provider_id: userId,
        name: 'Greenhouse Installation',
        description: 'Professional greenhouse construction and installation. All sizes available with drip irrigation setup.',
        category: 'Agricultural Services',
        subcategory: 'Farm Infrastructure',
        price_from: 50000,
        price_to: 500000,
        pricing_type: 'per_project',
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop'],
        location_county: 'Nairobi',
        location_coordinates: 'POINT(36.8219 -1.2921)',
        service_radius_km: 100,
        available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        available_hours: '8:00 AM - 6:00 PM',
        tags: ['greenhouse', 'irrigation', 'infrastructure'],
        experience_years: 12,
        rating: 4.7,
        review_count: 34,
        status: 'active',
        featured: false,
        verified: true,
      },
    ];

    const { data, error } = await supabase
      .from('services')
      .insert(sampleServices)
      .select('id');

    if (error) {
      console.error('[InsertMockData] Error inserting services:', error);
      return { success: false, count: 0, error: error.message };
    }

    console.log('[InsertMockData] Successfully inserted', data?.length || 0, 'services');
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('[InsertMockData] Unexpected error:', error);
    return { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
