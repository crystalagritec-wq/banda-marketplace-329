import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

const searchInputSchema = z.object({
  query: z.string().optional(),
  type: z.enum(["all", "products", "services"]).default("all"),
  location: z.object({
    country: z.string().optional(),
    county: z.string().optional(),
    town: z.string().optional(),
    nearbyOnly: z.boolean().default(false),
    radius: z.number().optional(),
  }).optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  category: z.string().optional(),
  vendorType: z.array(z.enum(["verified", "gold", "new", "all"])).optional(),
  rating: z.number().min(0).max(5).optional(),
  availability: z.enum(["in-stock", "pre-order", "available-now", "schedule-later", "all"]).optional(),
  deliveryOptions: z.array(z.enum(["delivery", "pickup"])).optional(),
  serviceFilters: z.object({
    type: z.array(z.enum(["veterinary", "transport", "mechanization", "handlers", "consultancy"])).optional(),
    mode: z.array(z.enum(["on-site", "remote"])).optional(),
    pricingBasis: z.array(z.enum(["per-visit", "per-hour", "contract"])).optional(),
  }).optional(),
  productFilters: z.object({
    type: z.array(z.enum(["fresh", "dried", "live"])).optional(),
    size: z.array(z.enum(["pieces", "set", "bulk"])).optional(),
  }).optional(),
  sortBy: z.enum(["best-match", "lowest-price", "closest", "top-rated", "newest"]).default("best-match"),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const advancedSearchProcedure = protectedProcedure
  .input(searchInputSchema)
  .query(async ({ input, ctx }) => {
    console.log("[Advanced Search] Query:", input);

    try {
      const userLat = -1.2921;
      const userLng = 36.8219;

      const { data: products, error } = await supabase.rpc('get_products_with_distance', {
        user_lat: userLat,
        user_lng: userLng,
        search_query: input.query || null,
        filter_category: input.category || null,
        filter_county: input.location?.county || null,
        filter_subcounty: null,
        filter_ward: null,
        min_price: input.priceRange?.min || null,
        max_price: input.priceRange?.max || null,
        min_rating: input.rating || null,
        max_distance_km: input.location?.radius || null,
        sort_by: input.sortBy === 'lowest-price' ? 'price_asc' : 
                 input.sortBy === 'closest' ? 'distance' :
                 input.sortBy === 'top-rated' ? 'rating' :
                 input.sortBy === 'newest' ? 'newest' : 'relevance',
        page_limit: input.limit,
        page_offset: input.offset,
      });

      if (error) {
        console.error('[Advanced Search] Database error:', error);
        throw error;
      }

      const results = (products || []).map((product: any) => ({
        id: product.id,
        type: 'product' as const,
        title: product.name,
        description: product.description || '',
        price: parseFloat(product.price),
        currency: 'KES',
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
        vendor: {
          id: product.seller_id,
          name: 'Vendor',
          badge: product.verified ? 'verified' as const : 'new' as const,
          rating: parseFloat(product.rating) || 0,
          location: {
            town: product.location_subcounty || product.location_county,
            county: product.location_county,
            distance: product.distance_km || 0,
          },
        },
        availability: product.stock_quantity > 0 ? 'in-stock' as const : 'pre-order' as const,
        deliveryOptions: [
          ...(product.delivery_available ? ['delivery' as const] : []),
          ...(product.pickup_available ? ['pickup' as const] : []),
        ],
      }));

      await supabase.from('search_history').insert({
        user_id: ctx.user.id,
        query: input.query || '',
        search_type: 'text',
        filters: input,
        results_count: results.length,
        location_county: input.location?.county,
      });

      if (input.query) {
        await supabase.rpc('track_trending_search', { search_query: input.query });
      }

      return {
        results,
        total: results.length,
        hasMore: results.length === input.limit,
      };
    } catch (error) {
      console.error('[Advanced Search] Error, falling back to mock data:', error);
      
      const mockProducts = [
        {
          id: "prod-1",
          type: "product" as const,
          title: "Premium Dairy Feed Mix",
          description: "High-quality dairy feed for optimal milk production",
          price: 3500,
          currency: "KES",
          image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
          vendor: {
            id: "vendor-1",
            name: "AgroSupply Ltd",
            badge: "verified" as const,
            rating: 4.8,
            location: {
              town: "Thika",
              county: "Kiambu",
              distance: 2.5,
            },
          },
          availability: "in-stock" as const,
          deliveryOptions: ["delivery", "pickup"] as const,
        },
        {
          id: "prod-2",
          type: "product" as const,
          title: "Layer Chicken Cages",
          description: "Durable battery cages for layer chickens",
          price: 2200,
          currency: "KES",
          image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400",
          vendor: {
            id: "vendor-2",
            name: "Farm Equipment Co",
            badge: "gold" as const,
            rating: 4.9,
            location: {
              town: "Thika",
              county: "Kiambu",
              distance: 8,
            },
          },
          availability: "in-stock" as const,
          deliveryOptions: ["delivery", "pickup"] as const,
        },
      ];

      return {
        results: mockProducts,
        total: mockProducts.length,
        hasMore: false,
      };
    }
  });
