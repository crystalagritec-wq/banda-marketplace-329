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

export const locationAwareSearchProcedure = publicProcedure
  .input(
    z.object({
      query: z.string(),
      buyerLat: z.number(),
      buyerLng: z.number(),
      radiusKm: z.number().default(50),
      sortBy: z.enum(["distance", "price", "rating"]).default("distance"),
      limit: z.number().default(20),
    })
  )
  .query(async ({ input }) => {
    console.log("[locationAwareSearch] searching", input);

    const results = mockProducts
      .filter((product) => {
        const matchesQuery = product.name
          .toLowerCase()
          .includes(input.query.toLowerCase());
        
        if (!matchesQuery) return false;

        const distance = haversine(
          input.buyerLat,
          input.buyerLng,
          product.coordinates.lat,
          product.coordinates.lng
        );

        return distance <= input.radiusKm;
      })
      .map((product) => {
        const distance = haversine(
          input.buyerLat,
          input.buyerLng,
          product.coordinates.lat,
          product.coordinates.lng
        );

        const baseFee = 50;
        const perKmRate = 20;
        const deliveryFee = Math.round(baseFee + distance * perKmRate);

        return {
          ...product,
          distanceKm: parseFloat(distance.toFixed(1)),
          deliveryFee,
          etaMinutes: Math.round(distance * 3 + 15),
        };
      });

    const sorted = results.sort((a, b) => {
      switch (input.sortBy) {
        case "distance":
          return a.distanceKm - b.distanceKm;
        case "price":
          return a.price - b.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return {
      results: sorted.slice(0, input.limit),
      total: sorted.length,
      radiusKm: input.radiusKm,
    };
  });
