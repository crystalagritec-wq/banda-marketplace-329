import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { mockProducts } from "@/constants/products";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const getNearestSellersProcedure = publicProcedure
  .input(
    z.object({
      productId: z.string(),
      buyerLat: z.number(),
      buyerLng: z.number(),
      limit: z.number().default(5),
    })
  )
  .query(async ({ input }) => {
    console.log("[getNearestSellers] finding nearest sellers", input);

    const product = mockProducts.find((p) => p.id === input.productId);
    
    if (!product) {
      return {
        sellers: [],
        nearestSeller: null,
      };
    }

    const sameCategoryProducts = mockProducts.filter(
      (p) => p.category === product.category && p.id !== product.id
    );

    const sellersWithDistance = [product, ...sameCategoryProducts]
      .map((p) => {
        const distance = haversine(
          input.buyerLat,
          input.buyerLng,
          p.coordinates.lat,
          p.coordinates.lng
        );

        const baseFee = 50;
        const perKmRate = 20;
        const deliveryFee = Math.round(baseFee + distance * perKmRate);
        const etaMinutes = Math.round(distance * 3 + 15);

        return {
          productId: p.id,
          productName: p.name,
          vendor: p.vendor,
          vendorVerified: p.vendorVerified,
          location: p.location,
          coordinates: p.coordinates,
          price: p.price,
          rating: p.rating,
          distanceKm: parseFloat(distance.toFixed(1)),
          deliveryFee,
          etaMinutes,
          inStock: p.inStock,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, input.limit);

    return {
      sellers: sellersWithDistance,
      nearestSeller: sellersWithDistance[0] || null,
    };
  });
