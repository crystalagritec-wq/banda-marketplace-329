import { Product, Category } from '../types';

export const categories: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', icon: '📱' },
  { id: '2', name: 'Fashion', slug: 'fashion', icon: '👕' },
  { id: '3', name: 'Home & Garden', slug: 'home-garden', icon: '🏠' },
  { id: '4', name: 'Sports', slug: 'sports', icon: '⚽' },
  { id: '5', name: 'Books', slug: 'books', icon: '📚' },
  { id: '6', name: 'Beauty', slug: 'beauty', icon: '💄' },
];

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'Electronics',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    seller: {
      id: 'seller1',
      name: 'TechStore Pro',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    }
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt in various colors.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'Fashion',
    rating: 4.2,
    reviews: 89,
    inStock: true,
    seller: {
      id: 'seller2',
      name: 'EcoFashion',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100'
    }
  },
  {
    id: '3',
    name: 'Smart Home Security Camera',
    description: '1080p HD security camera with night vision and mobile app control.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'Electronics',
    rating: 4.7,
    reviews: 203,
    inStock: true,
    seller: {
      id: 'seller3',
      name: 'SmartHome Solutions',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    }
  },
  {
    id: '4',
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with carrying strap, perfect for all yoga practices.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    category: 'Sports',
    rating: 4.4,
    reviews: 156,
    inStock: true,
    seller: {
      id: 'seller4',
      name: 'Fitness World',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    }
  },
  {
    id: '5',
    name: 'Programming Book Collection',
    description: 'Complete set of programming books covering JavaScript, React, and Node.js.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    category: 'Books',
    rating: 4.8,
    reviews: 67,
    inStock: true,
    seller: {
      id: 'seller5',
      name: 'TechBooks Store',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    }
  },
  {
    id: '6',
    name: 'Skincare Set',
    description: 'Complete skincare routine with cleanser, toner, and moisturizer.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400',
    category: 'Beauty',
    rating: 4.3,
    reviews: 94,
    inStock: true,
    seller: {
      id: 'seller6',
      name: 'Beauty Essentials',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100'
    }
  }
];