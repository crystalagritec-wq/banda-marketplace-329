# Banda Marketplace

A modern, full-featured React marketplace application built with TypeScript, Tailwind CSS, and Zustand for state management.

## 🚀 Features

### Core Functionality
- **Product Catalog**: Browse and search through a comprehensive product catalog
- **Product Details**: Detailed product pages with images, descriptions, and reviews
- **Shopping Cart**: Add/remove items, quantity management, and persistent cart state
- **Search & Filtering**: Advanced search with category, price range, and sorting options
- **Responsive Design**: Mobile-first design that works on all devices

### User Experience
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Fast Navigation**: React Router for seamless page transitions
- **State Management**: Zustand for efficient state management with persistence
- **Type Safety**: Full TypeScript support for better development experience

### Technical Features
- **Vite**: Lightning-fast build tool and development server
- **React 18**: Latest React features with hooks and concurrent rendering
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Heroicons**: Beautiful SVG icons from the makers of Tailwind CSS
- **Zustand**: Lightweight state management with persistence

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Heroicons
- **UI Components**: Headless UI

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd banda-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   └── ProductCard.tsx # Product display card
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Products.tsx    # Product listing page
│   ├── ProductDetail.tsx # Individual product page
│   └── Cart.tsx        # Shopping cart page
├── store/              # State management
│   └── useStore.ts     # Zustand store configuration
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
├── data/               # Sample data
│   └── sampleData.ts   # Mock products and categories
└── utils/              # Utility functions
```

## 🎨 Key Components

### Header
- Logo and branding
- Search functionality
- User account access
- Shopping cart with item count
- Navigation menu

### ProductCard
- Product image with hover effects
- Product information display
- Add to cart functionality
- Favorite/wishlist toggle
- Seller information

### ProductDetail
- Large product images with gallery
- Detailed product information
- Quantity selector
- Add to cart and buy now buttons
- Customer reviews section
- Seller profile

### Cart
- Item management (add/remove/update quantities)
- Order summary with pricing
- Shipping calculations
- Checkout process initiation

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Features in Detail

### Search & Filtering
- Real-time search across product names and descriptions
- Category-based filtering
- Price range filtering
- Sorting by price, rating, and date
- URL-based filter persistence

### Shopping Cart
- Persistent cart state using localStorage
- Quantity management
- Item removal
- Subtotal, tax, and shipping calculations
- Free shipping threshold

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚀 Getting Started

1. **Browse Products**: Visit the home page to see featured products
2. **Search**: Use the search bar to find specific items
3. **Filter**: Use the filter options to narrow down results
4. **View Details**: Click on any product to see detailed information
5. **Add to Cart**: Add items to your cart and manage quantities
6. **Checkout**: Proceed to checkout when ready to purchase

## 🔮 Future Enhancements

- User authentication and profiles
- Seller dashboard and product management
- Payment integration
- Order tracking
- Real-time notifications
- Advanced search with filters
- Product recommendations
- Review and rating system
- Wishlist functionality
- Multi-language support

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices with:
- Touch-friendly interface
- Responsive navigation
- Optimized product cards
- Mobile-optimized cart experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for the community by Rork