/**
 * Vendor Helper Utilities
 * Standardizes vendor naming and data access across the platform
 */

export interface VendorProfile {
  id: string;
  vendor_display_name?: string;
  business_name?: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  verified?: boolean;
  location?: string;
  location_city?: string;
  location_county?: string;
  location_lat?: number;
  location_lng?: number;
}

export interface ProductWithVendor {
  id: string;
  vendor_id?: string;
  user_id?: string;
  seller_id?: string;
  [key: string]: any;
}

/**
 * Get standardized vendor display name
 * Priority: vendor_display_name > business_name > full_name > fallback
 */
export function getVendorDisplayName(profile: VendorProfile | null | undefined): string {
  if (!profile) return 'Unknown Vendor';
  
  return (
    profile.vendor_display_name ||
    profile.business_name ||
    profile.full_name ||
    profile.name ||
    'Unknown Vendor'
  );
}

/**
 * Get vendor location string
 * Priority: city + county > location > fallback
 */
export function getVendorLocation(profile: VendorProfile | null | undefined): string {
  if (!profile) return 'Kenya';
  
  if (profile.location_city && profile.location_county) {
    return `${profile.location_city}, ${profile.location_county}`;
  }
  
  return profile.location || 'Kenya';
}

/**
 * Get vendor avatar URL with fallback
 */
export function getVendorAvatar(profile: VendorProfile | null | undefined): string | null {
  if (!profile) return null;
  return profile.avatar_url || null;
}

/**
 * Check if vendor is verified
 */
export function isVendorVerified(profile: VendorProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.verified === true;
}

/**
 * Get vendor coordinates
 */
export function getVendorCoordinates(profile: VendorProfile | null | undefined): { lat: number; lng: number } | null {
  if (!profile || !profile.location_lat || !profile.location_lng) {
    return null;
  }
  
  return {
    lat: profile.location_lat,
    lng: profile.location_lng,
  };
}

/**
 * Get vendor ID from product object
 * Handles multiple possible field names
 */
export function getVendorId(product: ProductWithVendor | null | undefined): string | null {
  if (!product) return null;
  
  return (
    product.vendor_id ||
    product.user_id ||
    product.seller_id ||
    null
  );
}

/**
 * Check if user has a shop
 * Checks both profile data and product existence
 */
export function hasShopProfile(shopData: any): boolean {
  if (!shopData) return false;
  return shopData.exists === true;
}

/**
 * Get shop info from query data
 */
export function getShopInfo(shopData: any) {
  if (!shopData || !shopData.exists) return null;
  
  return {
    id: shopData.shop?.id || shopData.profile?.id,
    name: shopData.shop?.name || getVendorDisplayName(shopData.profile),
    verified: shopData.shop?.verified || shopData.profile?.verified || false,
    avatar: shopData.shop?.avatar || shopData.profile?.avatar_url,
    location: shopData.shop?.location || getVendorLocation(shopData.profile),
    businessType: shopData.shop?.businessType || shopData.profile?.business_type,
    hasProducts: shopData.hasProducts || false,
  };
}

/**
 * Format vendor for display in product cards
 */
export function formatVendorForProduct(profile: VendorProfile | null | undefined) {
  return {
    name: getVendorDisplayName(profile),
    location: getVendorLocation(profile),
    verified: isVendorVerified(profile),
    avatar: getVendorAvatar(profile),
    coordinates: getVendorCoordinates(profile),
  };
}

/**
 * Convert marketplace product to cart product format
 */
export function convertToCartProduct(product: any): any {
  return {
    id: product.id,
    name: product.title || product.name,
    price: product.price,
    vendor: product.vendor_name || product.vendor || 'Unknown',
    location: product.location_county || product.location_city || product.location || 'Kenya',
    rating: product.rating || 0,
    image: Array.isArray(product.images) ? product.images[0] : product.image || '',
    category: product.category,
    discount: product.discount || 0,
    verified: product.status === 'active',
    coordinates: product.location_lat && product.location_lng ? {
      lat: product.location_lat,
      lng: product.location_lng
    } : product.coordinates || null,
    distanceKm: product.distanceKm || null,
    stock: product.stock || 0,
    unit: product.unit || 'unit',
    inStock: (product.stock || 0) > 0,
    vendorVerified: product.vendor_verified || product.vendorVerified || false,
    negotiable: product.negotiable || false,
    fastDelivery: product.fastDelivery || false,
  };
}
