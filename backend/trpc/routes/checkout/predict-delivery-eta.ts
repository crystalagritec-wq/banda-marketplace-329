import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const predictDeliveryEtaProcedure = publicProcedure
  .input(z.object({
    sellerId: z.string(),
    sellerLocation: z.string(),
    buyerLocation: z.object({
      city: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }),
    deliveryProvider: z.object({
      type: z.enum(['boda', 'van', 'truck', 'tractor', 'pickup']),
      averageSpeed: z.number().optional(),
    }),
    orderWeight: z.number(),
    timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
    dayOfWeek: z.enum(['weekday', 'weekend']).optional(),
  }))
  .query(async ({ input }) => {
    console.log('⏰ Predicting delivery ETA for seller:', input.sellerId);

    const now = new Date();
    const currentHour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    const timeOfDay = input.timeOfDay || (
      currentHour < 12 ? 'morning' :
      currentHour < 17 ? 'afternoon' :
      currentHour < 21 ? 'evening' : 'night'
    );

    const dayOfWeek = input.dayOfWeek || (isWeekend ? 'weekend' : 'weekday');

    const baseDistance = 15 + Math.random() * 20;

    const providerSpeeds: Record<string, number> = {
      boda: 35,
      van: 40,
      truck: 30,
      tractor: 20,
      pickup: 38,
    };

    const baseSpeed = input.deliveryProvider.averageSpeed || providerSpeeds[input.deliveryProvider.type] || 35;

    const trafficMultipliers: Record<string, Record<string, number>> = {
      morning: { weekday: 0.7, weekend: 0.9 },
      afternoon: { weekday: 0.6, weekend: 0.85 },
      evening: { weekday: 0.75, weekend: 0.9 },
      night: { weekday: 1.0, weekend: 1.0 },
    };

    const trafficMultiplier = trafficMultipliers[timeOfDay][dayOfWeek];
    const adjustedSpeed = baseSpeed * trafficMultiplier;

    const travelTime = (baseDistance / adjustedSpeed) * 60;

    const preparationTime = input.orderWeight > 50 ? 25 : input.orderWeight > 20 ? 15 : 10;

    const driverAvailabilityDelay = Math.random() > 0.7 ? 10 : 0;

    const totalMinutes = Math.round(travelTime + preparationTime + driverAvailabilityDelay);

    const etaStart = new Date(now.getTime() + totalMinutes * 60000);
    const etaEnd = new Date(etaStart.getTime() + 30 * 60000);

    const formatTime = (date: Date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm}`;
    };

    const confidence = trafficMultiplier > 0.8 ? 'high' : trafficMultiplier > 0.6 ? 'medium' : 'low';

    const factors = [];
    if (trafficMultiplier < 0.7) factors.push('Heavy traffic expected');
    if (timeOfDay === 'afternoon' && dayOfWeek === 'weekday') factors.push('Peak hours');
    if (input.orderWeight > 50) factors.push('Large order requires extra prep time');
    if (driverAvailabilityDelay > 0) factors.push('Driver assignment in progress');
    if (input.deliveryProvider.type === 'boda') factors.push('Fast motorcycle delivery');
    if (trafficMultiplier > 0.9) factors.push('Clear roads, optimal conditions');

    console.log('✅ Predicted ETA:', formatTime(etaStart), '-', formatTime(etaEnd), `(${totalMinutes} mins)`);

    return {
      estimatedDeliveryWindow: {
        start: etaStart.toISOString(),
        end: etaEnd.toISOString(),
        startFormatted: formatTime(etaStart),
        endFormatted: formatTime(etaEnd),
        totalMinutes,
      },
      breakdown: {
        travelTime: Math.round(travelTime),
        preparationTime,
        driverAvailabilityDelay,
        distance: Number(baseDistance.toFixed(1)),
        averageSpeed: Number(adjustedSpeed.toFixed(1)),
      },
      confidence,
      factors,
      trafficConditions: {
        timeOfDay,
        dayOfWeek,
        trafficLevel: trafficMultiplier < 0.7 ? 'heavy' : trafficMultiplier < 0.85 ? 'moderate' : 'light',
        multiplier: trafficMultiplier,
      },
      recommendation: confidence === 'high'
        ? `Delivery highly likely between ${formatTime(etaStart)} and ${formatTime(etaEnd)}`
        : confidence === 'medium'
        ? `Delivery expected around ${formatTime(etaStart)}, may vary by 15-20 mins`
        : `Delivery estimated for ${formatTime(etaStart)}, but traffic may cause delays`,
    };
  });
