import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

const BASE_FEE = 50;
const PER_KM_RATE = 20;

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

export const getDeliveryPreviewProcedure = publicProcedure
  .input(
    z.object({
      buyerLat: z.number(),
      buyerLng: z.number(),
      sellerLat: z.number(),
      sellerLng: z.number(),
    })
  )
  .query(async ({ input }) => {
    console.log("[getDeliveryPreview] calculating distance", input);

    const distance = haversine(
      input.buyerLat,
      input.buyerLng,
      input.sellerLat,
      input.sellerLng
    );

    const fee = BASE_FEE + distance * PER_KM_RATE;
    const etaMinutes = Math.round(distance * 3 + 15);

    return {
      distanceKm: parseFloat(distance.toFixed(1)),
      deliveryFee: Math.round(fee),
      etaMinutes,
      baseFee: BASE_FEE,
      perKmRate: PER_KM_RATE,
    };
  });
