import { Dimensions } from 'react-native';

export interface VariantOption {
  value: string;
  priceModifier?: number;
  stock?: number;
  image?: string;
}

export interface VariantGroup {
  name: string;
  options: VariantOption[];
}

export interface FlashSale {
  endsAt: string; // ISO datetime
  discountPercent: number;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  vendor: string;
  location: string;
  coordinates: GeoCoordinates;
  rating: number;
  image: string;
  category: string;
  inStock: boolean;
  discount?: number;
  vendorVerified?: boolean;
  fastDelivery?: boolean;
  negotiable?: boolean;
  variants?: VariantGroup[];
  flashSale?: FlashSale;
  gallery?: string[];
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  color?: string;
}

export interface CategoryItem {
  key: string;
  label: string;
  image: string;
  color?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  items: string[];
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  image: string;
  subcategories: SubCategory[];
}

export interface MarketplaceSchema {
  categories: Category[];
  lastUpdated: string;
  version: string;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Fresh Tomatoes',
    price: 80,
    unit: 'kg',
    vendor: 'John Farmer',
    location: 'Kiambu',
    coordinates: { lat: -1.1714, lng: 36.8356 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1546470427-e5ac89c8ba3b?w=600&h=400&fit=crop',
    category: 'Vegetables',
    inStock: true,
    discount: 15,
    vendorVerified: true,
    fastDelivery: true,
    negotiable: true,
  },
  {
    id: '2',
    name: 'Organic Maize',
    price: 45,
    unit: 'kg',
    vendor: 'Mary Wanjiku',
    location: 'Nakuru',
    coordinates: { lat: -0.3031, lng: 36.0800 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&h=400&fit=crop',
    category: 'Grains',
    inStock: true,
    vendorVerified: true,
    negotiable: false,
  },
  {
    id: '3',
    name: 'Fresh Milk',
    price: 60,
    unit: 'liter',
    vendor: 'Dairy Co-op',
    location: 'Meru',
    coordinates: { lat: 0.0469, lng: 37.6506 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=400&fit=crop',
    category: 'Dairy',
    inStock: true,
    fastDelivery: true,
    negotiable: false,
  },
  {
    id: '4',
    name: 'Bananas',
    price: 120,
    unit: 'bunch',
    vendor: 'Coastal Farms',
    location: 'Mombasa',
    coordinates: { lat: -4.0435, lng: 39.6682 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=400&fit=crop',
    category: 'Fruits',
    inStock: true,
    negotiable: true,
  },
  {
    id: '5',
    name: 'Irish Potatoes',
    price: 55,
    unit: 'kg',
    vendor: 'Highland Farms',
    location: 'Nyandarua',
    coordinates: { lat: -0.1833, lng: 36.4667 },
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&h=400&fit=crop',
    category: 'Vegetables',
    inStock: false,
    negotiable: false,
  },
  {
    id: '6',
    name: 'Free Range Eggs',
    price: 15,
    unit: 'piece',
    vendor: 'Poultry Plus',
    location: 'Thika',
    coordinates: { lat: -1.0332, lng: 37.0690 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=400&fit=crop',
    category: 'Poultry',
    inStock: true,
    vendorVerified: true,
    negotiable: false,
  },
  {
    id: '7',
    name: 'Avocados',
    price: 200,
    unit: 'kg',
    vendor: 'Green Valley Farm',
    location: 'Murang\'a',
    coordinates: { lat: -0.7167, lng: 37.1500 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=400&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1496344960433-9efb1d26ac9b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=1200&h=800&fit=crop',
    ],
    category: 'Fruits',
    inStock: true,
    discount: 20,
    vendorVerified: true,
    fastDelivery: true,
    negotiable: true,
    variants: [
      {
        name: 'Size',
        options: [
          { value: 'Small', priceModifier: -20, stock: 120 },
          { value: 'Medium', priceModifier: 0, stock: 80 },
          { value: 'Large', priceModifier: 40, stock: 40 },
        ],
      },
      {
        name: 'Packaging',
        options: [
          { value: 'Loose', priceModifier: 0 },
          { value: 'Crate (20kg)', priceModifier: 200 },
        ],
      },
    ],
    flashSale: {
      endsAt: '2025-12-31T23:59:59.000Z',
      discountPercent: 30,
    },
  },
  {
    id: '8',
    name: 'Sukuma Wiki',
    price: 30,
    unit: 'bunch',
    vendor: 'Urban Greens',
    location: 'Nairobi',
    coordinates: { lat: -1.2921, lng: 36.8219 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=400&fit=crop',
    category: 'Vegetables',
    inStock: true,
    vendorVerified: true,
    negotiable: false,
  },
  {
    id: '9',
    name: 'White Beans',
    price: 120,
    unit: 'kg',
    vendor: 'Machakos Farmers',
    location: 'Machakos',
    coordinates: { lat: -1.5177, lng: 37.2634 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop',
    category: 'Grains',
    inStock: true,
    discount: 10,
    fastDelivery: true,
    negotiable: true,
  },
  {
    id: '10',
    name: 'Chicken (Live)',
    price: 800,
    unit: 'piece',
    vendor: 'Kienyeji Poultry',
    location: 'Embu',
    coordinates: { lat: -0.5310, lng: 37.4570 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&h=400&fit=crop',
    category: 'Poultry',
    inStock: true,
    vendorVerified: true,
    negotiable: true,
  },
  {
    id: '11',
    name: 'Mangoes',
    price: 150,
    unit: 'kg',
    vendor: 'Tropical Fruits Co',
    location: 'Kilifi',
    coordinates: { lat: -3.6309, lng: 39.8493 },
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=400&fit=crop',
    category: 'Fruits',
    inStock: true,
    fastDelivery: true,
    negotiable: false,
  },
  {
    id: '12',
    name: 'Carrots',
    price: 70,
    unit: 'kg',
    vendor: 'Fresh Harvest',
    location: 'Nanyuki',
    coordinates: { lat: -0.0167, lng: 37.0667 },
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&h=400&fit=crop',
    category: 'Vegetables',
    inStock: true,
    negotiable: false,
  },
  {
    id: '13',
    name: 'Yogurt',
    price: 80,
    unit: 'cup',
    vendor: 'Dairy Fresh',
    location: 'Eldoret',
    coordinates: { lat: 0.5143, lng: 35.2698 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1571212515416-fca88c2d2c3e?w=600&h=400&fit=crop',
    category: 'Dairy',
    inStock: true,
    vendorVerified: true,
    negotiable: false,
  },
  {
    id: '14',
    name: 'Fertilizer NPK',
    price: 3500,
    unit: '50kg bag',
    vendor: 'AgriSupply Kenya',
    location: 'Kitale',
    coordinates: { lat: 1.0167, lng: 35.0000 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    category: 'Inputs',
    inStock: true,
    discount: 5,
    vendorVerified: true,
    negotiable: true,
  },
  {
    id: '15',
    name: 'Hand Hoe',
    price: 450,
    unit: 'piece',
    vendor: 'Farm Tools Ltd',
    location: 'Nyeri',
    coordinates: { lat: -0.4197, lng: 36.9475 },
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1506804886640-20a2f86db47b?w=600&h=400&fit=crop',
    category: 'Equipment',
    inStock: true,
    negotiable: false,
  },
  {
    id: '16',
    name: 'Pineapples',
    price: 100,
    unit: 'piece',
    vendor: 'Sweet Fruits Farm',
    location: 'Thika',
    coordinates: { lat: -1.0332, lng: 37.0690 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=400&fit=crop',
    category: 'Fruits',
    inStock: true,
    fastDelivery: true,
    negotiable: false,
  },
  {
    id: '17',
    name: 'Onions',
    price: 90,
    unit: 'kg',
    vendor: 'Valley Produce',
    location: 'Kajiado',
    coordinates: { lat: -1.8524, lng: 36.7820 },
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&h=400&fit=crop',
    category: 'Vegetables',
    inStock: true,
    negotiable: true,
  },
  {
    id: '18',
    name: 'Goat Meat',
    price: 650,
    unit: 'kg',
    vendor: 'Pastoral Meats',
    location: 'Isiolo',
    coordinates: { lat: 0.3556, lng: 37.5820 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop',
    category: 'Livestock',
    inStock: true,
    vendorVerified: true,
    negotiable: true,
  },
  {
    id: '19',
    name: 'Sweet Potatoes',
    price: 65,
    unit: 'kg',
    vendor: 'Coastal Farms',
    location: 'Kwale',
    coordinates: { lat: -4.1742, lng: 39.4520 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop',
    category: 'Vegetables',
    inStock: true,
    discount: 12,
    negotiable: true,
  },
  {
    id: '20',
    name: 'Passion Fruits',
    price: 180,
    unit: 'kg',
    vendor: 'Highland Fruits',
    location: 'Meru',
    coordinates: { lat: 0.0469, lng: 37.6506 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=400&fit=crop',
    category: 'Fruits',
    inStock: true,
    discount: 25,
    vendorVerified: true,
    fastDelivery: true,
    negotiable: false,
  },
  {
    id: '21',
    name: 'Cabbage',
    price: 40,
    unit: 'head',
    vendor: 'Green Valley',
    location: 'Nyandarua',
    coordinates: { lat: -0.1833, lng: 36.4667 },
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&h=400&fit=crop',
    category: 'Vegetables',
    inStock: true,
    vendorVerified: true,
    negotiable: false,
  },
  {
    id: '22',
    name: 'Watermelons',
    price: 250,
    unit: 'piece',
    vendor: 'Desert Oasis Farm',
    location: 'Garissa',
    coordinates: { lat: -0.4536, lng: 39.6401 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=400&fit=crop',
    category: 'Fruits',
    inStock: true,
    discount: 18,
    fastDelivery: true,
    negotiable: true,
  },
  {
    id: '23',
    name: 'Sorghum',
    price: 85,
    unit: 'kg',
    vendor: 'Arid Lands Co-op',
    location: 'Turkana',
    coordinates: { lat: 3.1167, lng: 35.5986 },
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&h=400&fit=crop',
    category: 'Grains',
    inStock: true,
    discount: 8,
    negotiable: true,
  },
  {
    id: '24',
    name: 'Cheese (Gouda)',
    price: 450,
    unit: 'kg',
    vendor: 'Artisan Dairy',
    location: 'Nakuru',
    coordinates: { lat: -0.3031, lng: 36.0800 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1571212515416-fca88c2d2c3e?w=600&h=400&fit=crop',
    category: 'Dairy',
    inStock: true,
    vendorVerified: true,
    fastDelivery: true,
    negotiable: false,
  },
  {
    id: '25',
    name: 'Duck Eggs',
    price: 25,
    unit: 'piece',
    vendor: 'Wetland Poultry',
    location: 'Kisumu',
    coordinates: { lat: -0.0917, lng: 34.7680 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=400&fit=crop',
    category: 'Poultry',
    inStock: true,
    discount: 15,
    negotiable: false,
  },
  {
    id: '26',
    name: 'Oranges',
    price: 120,
    unit: 'kg',
    vendor: 'Citrus Grove',
    location: 'Machakos',
    coordinates: { lat: -1.5177, lng: 37.2634 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=400&fit=crop',
    category: 'Fruits',
    inStock: true,
    discount: 22,
    vendorVerified: true,
    negotiable: true,
  },
  {
    id: '27',
    name: 'Green Beans',
    price: 95,
    unit: 'kg',
    vendor: 'Export Quality Farms',
    location: 'Kirinyaga',
    coordinates: { lat: -0.6590, lng: 37.3830 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop',
    category: 'Vegetables',
    inStock: true,
    vendorVerified: true,
    fastDelivery: true,
    negotiable: false,
  },
  {
    id: '28',
    name: 'Beef (Premium)',
    price: 750,
    unit: 'kg',
    vendor: 'Ranch Meats',
    location: 'Laikipia',
    coordinates: { lat: 0.3667, lng: 36.7833 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop',
    category: 'Livestock',
    inStock: true,
    discount: 10,
    vendorVerified: true,
    negotiable: true,
  },
  {
    id: '29',
    name: 'Pesticide (Organic)',
    price: 850,
    unit: 'liter',
    vendor: 'EcoFarm Solutions',
    location: 'Nairobi',
    coordinates: { lat: -1.2921, lng: 36.8219 },
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    category: 'Inputs',
    inStock: true,
    vendorVerified: true,
    negotiable: false,
  },
  {
    id: '30',
    name: 'Wheelbarrow',
    price: 2800,
    unit: 'piece',
    vendor: 'Farm Equipment Co',
    location: 'Eldoret',
    coordinates: { lat: 0.5143, lng: 35.2698 },
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1506804886640-20a2f86db47b?w=600&h=400&fit=crop',
    category: 'Equipment',
    inStock: true,
    discount: 5,
    negotiable: true,
  },
  {
    id: '31',
    name: 'Lemons',
    price: 140,
    unit: 'kg',
    vendor: 'Citrus Valley',
    location: 'Embu',
    coordinates: { lat: -0.5310, lng: 37.4570 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=400&fit=crop',
    category: 'Fruits',
    inStock: true,
    discount: 20,
    fastDelivery: true,
    negotiable: false,
  },
  {
    id: '32',
    name: 'Spinach',
    price: 35,
    unit: 'bunch',
    vendor: 'Leafy Greens Co',
    location: 'Kiambu',
    coordinates: { lat: -1.1714, lng: 36.8356 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=400&fit=crop',
    category: 'Vegetables',
    inStock: true,
    vendorVerified: true,
    negotiable: false,
  },
  {
    id: '33',
    name: 'Millet',
    price: 95,
    unit: 'kg',
    vendor: 'Traditional Grains',
    location: 'Kitui',
    coordinates: { lat: -1.3667, lng: 38.0167 },
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&h=400&fit=crop',
    category: 'Grains',
    inStock: true,
    discount: 12,
    negotiable: true,
  },
  {
    id: '34',
    name: 'Butter',
    price: 320,
    unit: '500g',
    vendor: 'Creamy Dairy',
    location: 'Nyandarua',
    coordinates: { lat: -0.1833, lng: 36.4667 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1571212515416-fca88c2d2c3e?w=600&h=400&fit=crop',
    category: 'Dairy',
    inStock: true,
    vendorVerified: true,
    negotiable: false,
  },
  {
    id: '35',
    name: 'Quail Eggs',
    price: 8,
    unit: 'piece',
    vendor: 'Specialty Birds',
    location: 'Nyeri',
    coordinates: { lat: -0.4197, lng: 36.9475 },
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=400&fit=crop',
    category: 'Poultry',
    inStock: true,
    discount: 10,
    fastDelivery: true,
    negotiable: false,
  },
  {
    id: '36',
    name: 'Papaya',
    price: 80,
    unit: 'piece',
    vendor: 'Tropical Paradise',
    location: 'Taita Taveta',
    coordinates: { lat: -3.3167, lng: 38.4833 },
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=400&fit=crop',
    category: 'Fruits',
    inStock: true,
    negotiable: true,
  },
  {
    id: '37',
    name: 'Bell Peppers',
    price: 180,
    unit: 'kg',
    vendor: 'Greenhouse Produce',
    location: 'Nakuru',
    coordinates: { lat: -0.3031, lng: 36.0800 },
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&h=400&fit=crop',
    category: 'Vegetables',
    inStock: true,
    discount: 15,
    vendorVerified: true,
    fastDelivery: true,
    negotiable: false,
  },
  {
    id: '38',
    name: 'Lamb Meat',
    price: 850,
    unit: 'kg',
    vendor: 'Highland Livestock',
    location: 'Samburu',
    coordinates: { lat: 1.2167, lng: 36.9500 },
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop',
    category: 'Livestock',
    inStock: true,
    vendorVerified: true,
    negotiable: true,
  },
  {
    id: '39',
    name: 'Seeds (Hybrid Maize)',
    price: 450,
    unit: '2kg pack',
    vendor: 'AgriSeeds Kenya',
    location: 'Kitale',
    coordinates: { lat: 1.0167, lng: 35.0000 },
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    category: 'Inputs',
    inStock: true,
    discount: 8,
    vendorVerified: true,
    negotiable: false,
  },
  {
    id: '40',
    name: 'Irrigation Pipes',
    price: 1200,
    unit: '50m roll',
    vendor: 'Water Solutions',
    location: 'Mombasa',
    coordinates: { lat: -4.0435, lng: 39.6682 },
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1506804886640-20a2f86db47b?w=600&h=400&fit=crop',
    category: 'Equipment',
    inStock: true,
    negotiable: true,
  },
];

// Comprehensive Banda Marketplace Categories Schema
export const bandaMarketplaceSchema: MarketplaceSchema = {
  version: "1.0.0",
  lastUpdated: "2025-01-28",
  categories: [
    {
      id: "farm-produce",
      name: "Farm Produce",
      emoji: "🌾",
      description: "Fresh agricultural produce from farms across Kenya",
      color: "#2E7D32",
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop",
      subcategories: [
        {
          id: "cereals-grains",
          name: "Cereals & Grains",
          description: "Staple grains and cereals",
          items: [
            "White Maize", "Yellow Maize", "Green Maize", "Pishori Rice", "Basmati Rice", "IR Rice Varieties",
            "Soft Wheat", "Hard Wheat", "Barley", "Sorghum", "Millet", "Oats"
          ]
        },
        {
          id: "legumes-pulses",
          name: "Legumes & Pulses",
          description: "Protein-rich legumes and pulses",
          items: [
            "Rosecoco Beans", "Black Beans", "Yellow Beans", "Njahi (Black Beans)", "Green Peas", "Pigeon Peas",
            "Cowpeas", "Red Valencia Groundnuts", "Spanish Groundnuts", "Lentils", "Chickpeas"
          ]
        },
        {
          id: "fruits",
          name: "Fruits",
          description: "Fresh tropical and exotic fruits",
          items: [
            "Mangoes", "Pineapples", "Avocados", "Papayas", "Bananas", "Oranges", "Lemons", "Tangerines", "Limes",
            "Strawberries", "Blueberries", "Raspberries", "Passion Fruit", "Dragon Fruit", "Guava", "Watermelons"
          ]
        },
        {
          id: "vegetables",
          name: "Vegetables",
          description: "Fresh vegetables and leafy greens",
          items: [
            "Kale (Sukuma Wiki)", "Spinach", "Cabbage", "Lettuce", "Carrots", "Beetroots", "Onions", "Garlic", "Ginger",
            "Tomatoes", "Peppers", "Bell Peppers", "Eggplants", "Cucumbers", "Zucchini", "Pumpkins"
          ]
        },
        {
          id: "roots-tubers",
          name: "Roots & Tubers",
          description: "Root vegetables and tubers",
          items: [
            "Cassava", "Sweet Potatoes", "Irish Potatoes", "Yams", "Arrowroots"
          ]
        },
        {
          id: "cash-crops",
          name: "Cash Crops",
          description: "Commercial cash crops",
          items: [
            "Arabica Coffee", "Robusta Coffee", "Black Tea", "Green Tea", "Purple Tea", "Sugarcane", "Cotton"
          ]
        }
      ]
    },
    {
      id: "livestock-poultry",
      name: "Livestock & Poultry",
      emoji: "🐓",
      description: "Live animals, poultry, and aquaculture products",
      color: "#7C3AED",
      image: "https://images.unsplash.com/photo-1549980384-d1411f8b6e1a?w=400&h=300&fit=crop",
      subcategories: [
        {
          id: "poultry",
          name: "Poultry",
          description: "Chickens, ducks, and other poultry",
          items: [
            "Day-old Layer Chicks", "Day-old Broiler Chicks", "Improved Kienyeji Chicks", "Mature Layers",
            "Mature Broilers", "Kienyeji Chickens", "Ducks", "Turkeys", "Geese", "Quails"
          ]
        },
        {
          id: "livestock",
          name: "Livestock",
          description: "Cattle, goats, sheep, and pigs",
          items: [
            "Friesian Cattle", "Jersey Cattle", "Ayrshire Cattle", "Boran Cattle", "Sahiwal Cattle", "Zebu Cattle",
            "Toggenburg Goats", "Saanen Goats", "Boer Goats", "Galla Goats", "Dorper Sheep", "Red Maasai Sheep",
            "Merino Sheep", "Large White Pigs", "Landrace Pigs", "Duroc Pigs"
          ]
        },
        {
          id: "aquaculture",
          name: "Aquaculture",
          description: "Fish farming and aquaculture products",
          items: [
            "Tilapia Fish", "Catfish", "Trout", "Tilapia Fingerlings", "Catfish Fingerlings", "Fish Feed", "Fish Tanks", "Fish Ponds"
          ]
        },
        {
          id: "beekeeping",
          name: "Beekeeping (Apis)",
          description: "Bee colonies and honey products",
          items: [
            "Italian Bee Colonies", "African Honeybee Colonies", "Raw Honey", "Beeswax", "Propolis", "Royal Jelly"
          ]
        }
      ]
    },
    {
      id: "agri-inputs-equipment",
      name: "Agri Inputs & Equipment",
      emoji: "🏭",
      description: "Agricultural inputs, equipment, and farming tools",
      color: "#10B981",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
      subcategories: [
        {
          id: "seeds-seedlings",
          name: "Seeds & Seedlings",
          description: "Quality seeds and seedlings for planting",
          items: [
            "Hybrid Maize Seeds", "Hybrid Vegetable Seeds", "Indigenous Seeds", "Fruit Tree Seedlings",
            "Timber Tree Seedlings", "Vegetable Seedlings"
          ]
        },
        {
          id: "fertilizers-chemicals",
          name: "Fertilizers & Chemicals",
          description: "Organic and inorganic fertilizers, crop protection",
          items: [
            "Organic Manure", "Compost", "Biofertilizers", "NPK Fertilizer", "DAP Fertilizer", "UREA Fertilizer",
            "Fungicides", "Herbicides", "Pesticides", "Organic Pesticides"
          ]
        },
        {
          id: "animal-feeds",
          name: "Animal Feeds & Supplements",
          description: "Feeds and supplements for livestock and poultry",
          items: [
            "Chick Mash", "Growers Mash", "Layers Mash", "Broiler Finisher", "Dairy Meal", "Pig Feed",
            "Mineral Licks", "Mineral Blocks", "Silage", "Hay"
          ]
        },
        {
          id: "farm-equipment",
          name: "Farm Equipment",
          description: "Mechanization, irrigation, and farm structures",
          items: [
            "Tractors", "Ploughs", "Harrows", "Planters", "Harvesters", "Drip Irrigation Kits", "Sprinklers",
            "Water Pumps", "Irrigation Pipes", "Greenhouses", "Shade Nets", "Fish Tanks", "Poultry Cages",
            "Feeders", "Drinkers", "Incubators", "Beehives", "Honey Extractors", "Bee Smokers", "Protective Gear"
          ]
        }
      ]
    },
    {
      id: "processed-value-added",
      name: "Processed & Value-Added Products",
      emoji: "🏠",
      description: "Processed agricultural products and value-added goods",
      color: "#F9A825",
      image: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=400&h=300&fit=crop",
      subcategories: [
        {
          id: "dairy-products",
          name: "Dairy Products",
          description: "Fresh and processed dairy products",
          items: [
            "Raw Milk", "Pasteurized Milk", "Packaged Milk", "Cheese", "Yoghurt", "Ghee", "Butter"
          ]
        },
        {
          id: "meat-products",
          name: "Meat Products",
          description: "Fresh and processed meat products",
          items: [
            "Fresh Beef", "Fresh Goat Meat", "Fresh Pork", "Fresh Chicken", "Sausages", "Smoked Meat", "Bacon"
          ]
        },
        {
          id: "grain-flour",
          name: "Grain & Flour Products",
          description: "Processed grains and flour products",
          items: [
            "Maize Flour (Unga)", "Wheat Flour", "Animal Feed Mixes", "Processed Rice"
          ]
        },
        {
          id: "fruits-vegetables-processed",
          name: "Processed Fruits & Vegetables",
          description: "Processed and preserved fruits and vegetables",
          items: [
            "Mango Juice", "Orange Juice", "Passion Fruit Juice", "Fruit Jams", "Fruit Preserves",
            "Dried Mango", "Dried Pineapple", "Banana Chips", "Tomato Paste"
          ]
        },
        {
          id: "honey-byproducts",
          name: "Honey & By-Products",
          description: "Processed honey and bee products",
          items: [
            "Processed Honey", "Beeswax Candles", "Propolis Extract", "Honey Comb"
          ]
        }
      ]
    },
    {
      id: "services",
      name: "Agricultural Services",
      emoji: "🛠",
      description: "Professional agricultural and farming services",
      color: "#0EA5E9",
      image: "https://images.unsplash.com/photo-1506804886640-20a2f86db47b?w=400&h=300&fit=crop",
      subcategories: [
        {
          id: "veterinary-services",
          name: "Veterinary Services",
          description: "Animal health and veterinary care",
          items: [
            "Animal Vaccination", "Artificial Insemination (AI)", "Veterinary Treatment", "Animal Check-ups",
            "Deworming Services", "Livestock Health Monitoring"
          ]
        },
        {
          id: "mechanization-services",
          name: "Mechanization Services",
          description: "Farm mechanization and equipment services",
          items: [
            "Land Ploughing", "Land Harrowing", "Planting Services", "Combine Harvesting", "Manual Harvest Teams",
            "Tractor Hire", "Equipment Rental"
          ]
        },
        {
          id: "extension-advisory",
          name: "Extension & Advisory",
          description: "Training and advisory services",
          items: [
            "Farm Management Training", "Crop Husbandry Advice", "Animal Husbandry Advice", "Financial Literacy Training",
            "Agricultural Consultancy", "Soil Testing"
          ]
        },
        {
          id: "agri-finance",
          name: "Agri-Finance",
          description: "Financial services for agriculture",
          items: [
            "Agricultural Microloans", "Farm Insurance", "Input Credit (BNPL)", "Crop Insurance", "Livestock Insurance"
          ]
        },
        {
          id: "storage-warehousing",
          name: "Storage & Warehousing",
          description: "Storage and warehousing solutions",
          items: [
            "Cold Storage", "Dry Storage", "Grain Silos", "Warehouse Rental", "Produce Storage"
          ]
        },
        {
          id: "processing-services",
          name: "Processing Services",
          description: "Value addition and processing services",
          items: [
            "Maize Milling", "Wheat Milling", "Packaging Services", "Value Addition Units", "Food Processing"
          ]
        }
      ]
    }
  ]
};

// Legacy categories for backward compatibility
export const categoriesList: CategoryItem[] = bandaMarketplaceSchema.categories.map(category => ({
  key: category.id,
  label: category.name,
  image: category.image,
  color: category.color
}));

// Helper functions for category management
export const getCategoryById = (id: string): Category | undefined => {
  return bandaMarketplaceSchema.categories.find(cat => cat.id === id);
};

export const getSubcategoryById = (categoryId: string, subcategoryId: string): SubCategory | undefined => {
  const category = getCategoryById(categoryId);
  return category?.subcategories.find(sub => sub.id === subcategoryId);
};

export const getAllItems = (): string[] => {
  return bandaMarketplaceSchema.categories.flatMap(category => 
    category.subcategories.flatMap(subcategory => subcategory.items)
  );
};

export const searchItems = (query: string): { category: string; subcategory: string; items: string[] }[] => {
  const results: { category: string; subcategory: string; items: string[] }[] = [];
  const searchTerm = query.toLowerCase();
  
  bandaMarketplaceSchema.categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      const matchingItems = subcategory.items.filter(item => 
        item.toLowerCase().includes(searchTerm)
      );
      
      if (matchingItems.length > 0) {
        results.push({
          category: category.name,
          subcategory: subcategory.name,
          items: matchingItems
        });
      }
    });
  });
  
  return results;
};

export const heroBanners: Banner[] = [
  {
    id: 'b1',
    title: '🔥 Flash Sale – 30% off Seeds Today',
    subtitle: 'Limited time. Shop now.',
    image:
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&h=500&fit=crop',
    color: '#2E7D32',
  },
  {
    id: 'b2',
    title: '🚚 Farm-to-Market in 2hrs',
    subtitle: 'Fast delivery with TradeGuard',
    image:
      'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=1200&h=500&fit=crop',
    color: '#1976D2',
  },
  {
    id: 'b3',
    title: '👛 AgriPay Wallet',
    subtitle: 'Pay and get paid instantly',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=500&fit=crop',
    color: '#F57C00',
  },
];

export const screenWidth = Dimensions.get('window').width;