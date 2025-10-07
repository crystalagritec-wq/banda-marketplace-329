import { GeoCoordinates } from '@/constants/products';

export function calculateDistance(
  coord1: GeoCoordinates | undefined | null,
  coord2: GeoCoordinates | undefined | null
): number {
  if (!coord1 || !coord2) {
    console.warn('[GeoDistance] Invalid coordinates provided:', { coord1, coord2 });
    return 0;
  }
  
  if (isNaN(coord1.lat) || isNaN(coord1.lng) || isNaN(coord2.lat) || isNaN(coord2.lng)) {
    console.warn('[GeoDistance] NaN coordinates detected:', { coord1, coord2 });
    return 0;
  }
  
  const R = 6371;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
    Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDeliveryFee(distanceKm: number): number {
  if (isNaN(distanceKm) || distanceKm <= 0) {
    console.warn('[GeoDistance] Invalid distance for fee calculation:', distanceKm);
    return 150;
  }
  
  const baseFee = 100;
  const perKmRate = 15;
  
  if (distanceKm <= 5) {
    return baseFee;
  } else if (distanceKm <= 20) {
    return baseFee + (distanceKm - 5) * perKmRate;
  } else if (distanceKm <= 50) {
    return baseFee + (15 * perKmRate) + (distanceKm - 20) * 12;
  } else {
    return baseFee + (15 * perKmRate) + (30 * 12) + (distanceKm - 50) * 10;
  }
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  }
  return `${distanceKm}km away`;
}

export function calculateTimeConsciousETA(
  distanceKm: number,
  vehicleType: 'boda' | 'van' | 'truck' | 'pickup' | 'tractor',
  deliveryTime?: Date
): { etaMinutes: number; etaText: string } {
  const now = deliveryTime || new Date();
  const currentHour = now.getHours();
  
  const isRushHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);
  const isNightTime = currentHour >= 22 || currentHour <= 5;
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  
  const baseSpeedKmh = {
    boda: 35,
    van: 40,
    truck: 35,
    pickup: 40,
    tractor: 25,
  };
  
  let speedMultiplier = 1.0;
  
  if (isRushHour) {
    speedMultiplier = 0.6;
  } else if (isNightTime) {
    speedMultiplier = 1.3;
  } else if (isWeekend) {
    speedMultiplier = 1.1;
  }
  
  const adjustedSpeed = baseSpeedKmh[vehicleType] * speedMultiplier;
  const travelTimeHours = distanceKm / adjustedSpeed;
  const etaMinutes = Math.ceil(travelTimeHours * 60);
  
  let etaText = '';
  if (etaMinutes < 60) {
    etaText = `${etaMinutes} mins`;
  } else if (etaMinutes < 120) {
    const hours = Math.floor(etaMinutes / 60);
    const mins = etaMinutes % 60;
    etaText = mins > 0 ? `${hours}h ${mins}m` : `${hours} hour`;
  } else {
    const hours = Math.ceil(etaMinutes / 60);
    etaText = `${hours} hours`;
  }
  
  return { etaMinutes, etaText };
}
