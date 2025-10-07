export interface DeliveryProvider {
  id: string;
  name: string;
  type: 'boda' | 'van' | 'truck' | 'tractor' | 'pickup';
  description: string;
  estimatedTime: string;
  baseCost: number;
  costPerKm: number;
  rating: number;
  completedDeliveries: number;
  specialties: string[];
  maxWeight: number;
  maxDistance: number;
  available: boolean;
  bandaRecommended?: boolean;
  agriPayIntegrated: boolean;
  tradeGuardProtected: boolean;
  vehicleDetails: {
    licensePlate: string;
    model: string;
    year: number;
    insuranceVerified: boolean;
  };
  driverDetails: {
    name: string;
    phone: string;
    rating: number;
    yearsExperience: number;
    idVerified: boolean;
  };
  serviceAreas: string[];
  operatingHours: {
    start: string;
    end: string;
    days: string[];
  };
}

export const BANDA_DELIVERY_PROVIDERS: DeliveryProvider[] = [
  {
    id: 'bdp-001',
    name: 'Banda Express Boda',
    type: 'boda',
    description: 'Fast motorcycle delivery for small agricultural products',
    estimatedTime: '30-45 mins',
    baseCost: 120,
    costPerKm: 15,
    rating: 4.9,
    completedDeliveries: 2850,
    specialties: ['Small packages', 'Express delivery', 'Seeds', 'Fertilizers'],
    maxWeight: 25,
    maxDistance: 15,
    available: true,
    bandaRecommended: true,
    agriPayIntegrated: true,
    tradeGuardProtected: true,
    vehicleDetails: {
      licensePlate: 'KCA 123B',
      model: 'Honda CB 150',
      year: 2022,
      insuranceVerified: true,
    },
    driverDetails: {
      name: 'John Mwangi',
      phone: '+254712345001',
      rating: 4.9,
      yearsExperience: 5,
      idVerified: true,
    },
    serviceAreas: ['Nairobi', 'Kiambu', 'Machakos'],
    operatingHours: {
      start: '06:00',
      end: '20:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
  {
    id: 'bdp-002',
    name: 'Banda Probox Fleet',
    type: 'van',
    description: 'Reliable van service for medium agricultural loads',
    estimatedTime: '1-2 hours',
    baseCost: 250,
    costPerKm: 25,
    rating: 4.7,
    completedDeliveries: 1890,
    specialties: ['Fragile produce', 'Medium loads', 'Dairy products', 'Fresh vegetables'],
    maxWeight: 800,
    maxDistance: 50,
    available: true,
    bandaRecommended: true,
    agriPayIntegrated: true,
    tradeGuardProtected: true,
    vehicleDetails: {
      licensePlate: 'KBZ 456P',
      model: 'Toyota Probox',
      year: 2021,
      insuranceVerified: true,
    },
    driverDetails: {
      name: 'Mary Wanjiku',
      phone: '+254712345002',
      rating: 4.7,
      yearsExperience: 8,
      idVerified: true,
    },
    serviceAreas: ['Nairobi', 'Kiambu', 'Nakuru', 'Thika'],
    operatingHours: {
      start: '05:00',
      end: '21:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  },
  {
    id: 'bdp-003',
    name: 'Banda Hiace Cargo',
    type: 'van',
    description: 'Large van for bulk agricultural deliveries',
    estimatedTime: '2-3 hours',
    baseCost: 400,
    costPerKm: 35,
    rating: 4.8,
    completedDeliveries: 1250,
    specialties: ['Bulk orders', 'Long distance', 'Grain transport', 'Farm equipment'],
    maxWeight: 1500,
    maxDistance: 100,
    available: true,
    bandaRecommended: false,
    agriPayIntegrated: true,
    tradeGuardProtected: true,
    vehicleDetails: {
      licensePlate: 'KCD 789H',
      model: 'Toyota Hiace',
      year: 2020,
      insuranceVerified: true,
    },
    driverDetails: {
      name: 'Peter Kamau',
      phone: '+254712345003',
      rating: 4.8,
      yearsExperience: 12,
      idVerified: true,
    },
    serviceAreas: ['Nairobi', 'Kiambu', 'Nakuru', 'Eldoret', 'Mombasa'],
    operatingHours: {
      start: '04:00',
      end: '22:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  },
  {
    id: 'bdp-004',
    name: 'Banda Heavy Logistics',
    type: 'truck',
    description: 'Heavy-duty truck for large agricultural orders',
    estimatedTime: '3-4 hours',
    baseCost: 600,
    costPerKm: 45,
    rating: 4.6,
    completedDeliveries: 820,
    specialties: ['Heavy loads', 'Farm machinery', 'Bulk grain', 'Construction materials'],
    maxWeight: 5000,
    maxDistance: 200,
    available: true,
    bandaRecommended: false,
    agriPayIntegrated: true,
    tradeGuardProtected: true,
    vehicleDetails: {
      licensePlate: 'KBF 012T',
      model: 'Isuzu FRR',
      year: 2019,
      insuranceVerified: true,
    },
    driverDetails: {
      name: 'Samuel Kiprop',
      phone: '+254712345004',
      rating: 4.6,
      yearsExperience: 15,
      idVerified: true,
    },
    serviceAreas: ['Nairobi', 'Nakuru', 'Eldoret', 'Kisumu', 'Mombasa', 'Nyeri'],
    operatingHours: {
      start: '05:00',
      end: '19:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
  {
    id: 'bdp-005',
    name: 'Banda ColdChain Express',
    type: 'tractor',
    description: 'Specialized refrigerated transport for perishables',
    estimatedTime: '2-4 hours',
    baseCost: 800,
    costPerKm: 55,
    rating: 4.9,
    completedDeliveries: 450,
    specialties: ['Cold storage', 'Dairy products', 'Fresh produce', 'Meat transport'],
    maxWeight: 3000,
    maxDistance: 150,
    available: true,
    bandaRecommended: true,
    agriPayIntegrated: true,
    tradeGuardProtected: true,
    vehicleDetails: {
      licensePlate: 'KCF 345C',
      model: 'Scania R450',
      year: 2023,
      insuranceVerified: true,
    },
    driverDetails: {
      name: 'Grace Nyambura',
      phone: '+254712345005',
      rating: 4.9,
      yearsExperience: 10,
      idVerified: true,
    },
    serviceAreas: ['Nairobi', 'Kiambu', 'Nakuru', 'Eldoret', 'Meru'],
    operatingHours: {
      start: '03:00',
      end: '23:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  },
  {
    id: 'bdp-006',
    name: 'Banda Pickup Service',
    type: 'pickup',
    description: 'Versatile pickup truck for mixed agricultural goods',
    estimatedTime: '1.5-2.5 hours',
    baseCost: 300,
    costPerKm: 30,
    rating: 4.5,
    completedDeliveries: 950,
    specialties: ['Mixed loads', 'Farm tools', 'Animal feed', 'Building materials'],
    maxWeight: 1200,
    maxDistance: 80,
    available: true,
    bandaRecommended: false,
    agriPayIntegrated: true,
    tradeGuardProtected: true,
    vehicleDetails: {
      licensePlate: 'KBG 678P',
      model: 'Toyota Hilux',
      year: 2021,
      insuranceVerified: true,
    },
    driverDetails: {
      name: 'David Ochieng',
      phone: '+254712345006',
      rating: 4.5,
      yearsExperience: 7,
      idVerified: true,
    },
    serviceAreas: ['Nairobi', 'Kiambu', 'Machakos', 'Kajiado'],
    operatingHours: {
      start: '06:00',
      end: '18:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
];

export const DELIVERY_ZONES = {
  ZONE_1: {
    name: 'Nairobi Metro',
    areas: ['Nairobi CBD', 'Westlands', 'Karen', 'Langata', 'Kasarani'],
    baseDeliveryFee: 150,
    freeDeliveryThreshold: 2000,
  },
  ZONE_2: {
    name: 'Greater Nairobi',
    areas: ['Kiambu', 'Thika', 'Machakos', 'Kajiado'],
    baseDeliveryFee: 250,
    freeDeliveryThreshold: 3000,
  },
  ZONE_3: {
    name: 'Central Kenya',
    areas: ['Nakuru', 'Nyeri', 'Meru', 'Embu'],
    baseDeliveryFee: 400,
    freeDeliveryThreshold: 5000,
  },
  ZONE_4: {
    name: 'Extended Regions',
    areas: ['Eldoret', 'Kisumu', 'Mombasa', 'Garissa'],
    baseDeliveryFee: 600,
    freeDeliveryThreshold: 8000,
  },
};

export function calculateDeliveryFee(
  provider: DeliveryProvider,
  distance: number,
  orderValue: number,
  deliveryZone: keyof typeof DELIVERY_ZONES
): {
  baseFee: number;
  distanceFee: number;
  totalFee: number;
  isFreeDelivery: boolean;
  bandaDiscount: number;
} {
  const zone = DELIVERY_ZONES[deliveryZone];
  const baseFee = provider.baseCost;
  const distanceFee = distance * provider.costPerKm;
  const totalBeforeDiscount = baseFee + distanceFee;
  
  // Banda promotional discount for recommended providers
  const bandaDiscount = provider.bandaRecommended ? totalBeforeDiscount * 0.1 : 0;
  
  const totalFee = totalBeforeDiscount - bandaDiscount;
  const isFreeDelivery = orderValue >= zone.freeDeliveryThreshold;
  
  return {
    baseFee,
    distanceFee,
    totalFee: isFreeDelivery ? 0 : totalFee,
    isFreeDelivery,
    bandaDiscount,
  };
}

export function getRecommendedProvider(
  orderWeight: number,
  distance: number,
  productCategories: string[],
  urgency: 'standard' | 'express' | 'scheduled'
): DeliveryProvider | null {
  const lowerCats = productCategories.map(c => c.toLowerCase());
  const needsColdChain = lowerCats.some(c => ['dairy', 'meat', 'livestock'].includes(c));

  const suitableProviders = BANDA_DELIVERY_PROVIDERS.filter(provider => {
    if (!provider.available) return false;
    if (orderWeight > provider.maxWeight) return false;
    if (distance > provider.maxDistance) return false;

    if (!needsColdChain) {
      const hasCold = provider.specialties.some(s => s.toLowerCase().includes('cold'));
      if (hasCold) return false;
    }

    if (urgency === 'express') {
      return provider.type === 'boda' || provider.type === 'van' || provider.bandaRecommended;
    }

    return true;
  });

  if (suitableProviders.length === 0) return null;

  suitableProviders.sort((a, b) => {
    if (a.bandaRecommended && !b.bandaRecommended) return -1;
    if (!a.bandaRecommended && b.bandaRecommended) return 1;
    if (a.rating !== b.rating) return b.rating - a.rating;
    return a.baseCost - b.baseCost;
  });

  return suitableProviders[0];
}