# Search, Marketplace & Product System Fixes

## ✅ Completed

### 1. Database Schema Created
**File:** `SUPABASE_MARKETPLACE_SCHEMA.sql`

Created comprehensive database schema including:
- ✅ `products` table with full-text search, location support (PostGIS), and analytics
- ✅ `services` table for service providers
- ✅ `search_history` table for user search tracking
- ✅ `trending_searches` table for popular searches
- ✅ `product_views` table for analytics
- ✅ `product_reviews` table for ratings and reviews
- ✅ PostgreSQL function `get_products_with_distance()` for location-aware search
- ✅ PostgreSQL function `track_trending_search()` for trending analytics
- ✅ Row Level Security (RLS) policies
- ✅ Automatic search vector updates with triggers
- ✅ Automatic rating calculation with triggers

### 2. Mock Data Utilities
**File:** `utils/insert-mock-data.ts`

Created utilities to populate database with test data:
- ✅ `insertMockProducts()` - Inserts 40 products from constants
- ✅ `insertSampleServices()` - Inserts 3 sample services
- ✅ `clearAllProducts()` - Removes all user products
- ✅ `checkProductsExist()` - Checks if products exist

### 3. Backend Routes Updated

#### Search Routes
**File:** `backend/trpc/routes/search/advanced-search.ts`
- ✅ Connected to Supabase `get_products_with_distance()` function
- ✅ Supports all filters: category, location, price, rating, distance
- ✅ Implements proper sorting: relevance, price, distance, rating, newest
- ✅ Tracks search history automatically
- ✅ Updates trending searches
- ✅ Fallback to mock data if database fails

**File:** `backend/trpc/routes/search/trending-searches.ts`
- ✅ `getTrendingSearchesProcedure` - Fetches from `trending_searches` table
- ✅ `getRecentSearchesProcedure` - Fetches user's recent searches
- ✅ `saveSearchProcedure` - Saves search to history and updates trending
- ✅ Fallback to mock data if database fails

---

## 🚧 In Progress / To Do

### 4. Update Marketplace Backend Route
**File:** `backend/trpc/routes/marketplace/get-items.ts`

**Current Status:** Uses Supabase RPC but needs update to match new schema

**Required Changes:**
```typescript
// Update to use get_products_with_distance function
const { data, error } = await supabase.rpc('get_products_with_distance', {
  user_lat: userLat,
  user_lng: userLng,
  search_query: null,
  filter_category: input.category || null,
  filter_county: input.location || null,
  // ... other filters
});
```

### 5. Update Product Details Backend Route
**File:** `backend/trpc/routes/products/get-product.ts`

**Current Status:** Queries Supabase but needs schema alignment

**Required Changes:**
```typescript
const { data: product, error } = await supabase
  .from('products')
  .select(`
    *,
    seller:seller_id (
      id,
      email,
      user_metadata
    )
  `)
  .eq('id', input.productId)
  .single();
```

### 6. Connect Marketplace Screen to tRPC
**File:** `app/(tabs)/marketplace.tsx`

**Current Status:** Uses `mockProducts` from constants

**Required Changes:**
```typescript
// Replace mockProducts with tRPC query
const productsQuery = trpc.marketplace.getItems.useQuery({
  category: selectedCategory,
  location: selectedLocation,
  sortBy: sortBy,
  limit: 20,
  offset: 0,
});

// Use productsQuery.data instead of mockProducts
const products = productsQuery.data?.products || [];
```

### 7. Connect Product Details Screen to tRPC
**File:** `app/(tabs)/product/[id].tsx`

**Current Status:** Uses `mockProducts.find()`

**Required Changes:**
```typescript
// Replace mockProducts.find() with tRPC query
const productQuery = trpc.products.get.useQuery(
  { productId: id as string },
  { enabled: !!id }
);

const product = productQuery.data;
```

### 8. Connect Search Screen to Database
**File:** `app/search.tsx`

**Current Status:** Already uses tRPC but needs filter updates

**Required Changes:**
- ✅ Already connected to `trpc.search.advanced.useQuery()`
- ⚠️ Need to ensure all filters are passed correctly
- ⚠️ Need to handle location from `useLocation()` provider

### 9. Implement Voice Search
**File:** `backend/trpc/routes/search/voice-search.ts`

**Required Implementation:**
```typescript
import { generateText } from "@rork-ai/toolkit-sdk";

export const voiceSearchProcedure = protectedProcedure
  .input(z.object({
    audioBase64: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    // 1. Send audio to STT API
    const formData = new FormData();
    formData.append('audio', {
      uri: `data:audio/wav;base64,${input.audioBase64}`,
      name: 'recording.wav',
      type: 'audio/wav',
    });

    const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
      method: 'POST',
      body: formData,
    });

    const { text } = await response.json();

    // 2. Use AI to extract search intent
    const searchIntent = await generateText({
      messages: [{
        role: 'user',
        content: `Extract product search keywords from: "${text}"`
      }]
    });

    // 3. Return transcription and search query
    return {
      transcription: text,
      searchQuery: searchIntent,
    };
  });
```

### 10. Implement Image Search
**File:** `backend/trpc/routes/search/image-search.ts`

**Required Implementation:**
```typescript
import { generateText } from "@rork-ai/toolkit-sdk";

export const imageSearchProcedure = protectedProcedure
  .input(z.object({
    imageBase64: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Use AI vision to identify product in image
    const result = await generateText({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'What agricultural product is in this image? Provide search keywords.' },
          { type: 'image', image: input.imageBase64 }
        ]
      }]
    });

    return {
      suggestions: result.split(',').map(s => s.trim()),
      searchQuery: result,
    };
  });
```

### 11. Add Search Analytics
**File:** `backend/trpc/routes/analytics/search-analytics.ts`

**Required Implementation:**
```typescript
export const getSearchAnalyticsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    // Get search-to-purchase conversion rate
    const { data: conversions } = await supabase
      .from('search_history')
      .select(`
        id,
        query,
        clicked_result_id,
        orders!inner(id)
      `)
      .eq('user_id', ctx.user.id);

    // Get zero-result searches
    const { data: zeroResults } = await supabase
      .from('search_history')
      .select('query, results_count')
      .eq('user_id', ctx.user.id)
      .eq('results_count', 0);

    return {
      conversionRate: conversions?.length || 0,
      zeroResultSearches: zeroResults || [],
    };
  });
```

---

## 📋 Setup Instructions

### Step 1: Run Database Schema
```sql
-- In Supabase SQL Editor, run:
-- SUPABASE_MARKETPLACE_SCHEMA.sql
```

### Step 2: Insert Mock Data
```typescript
// In your app, create a setup screen or run once:
import { insertMockProducts, insertSampleServices } from '@/utils/insert-mock-data';

const userId = 'your-user-id';
await insertMockProducts(userId);
await insertSampleServices(userId);
```

### Step 3: Update Backend Routes
- Update marketplace route to use new schema
- Update product details route to use new schema
- Implement voice search
- Implement image search

### Step 4: Update Frontend Screens
- Connect marketplace to tRPC
- Connect product details to tRPC
- Add voice search UI
- Add image search UI

---

## 🎯 Expected Outcomes

### After Full Implementation:

1. **Real-time Search**
   - ✅ Products searchable by name, description, tags
   - ✅ Location-aware results with distance calculation
   - ✅ Advanced filters: category, price, rating, availability
   - ✅ Proper sorting: relevance, price, distance, rating, newest

2. **Marketplace**
   - ✅ Real-time inventory updates
   - ✅ Accurate pricing and availability
   - ✅ Distance-based sorting
   - ✅ Category filtering

3. **Product Details**
   - ✅ Real-time product information
   - ✅ Accurate stock levels
   - ✅ Seller information
   - ✅ Reviews and ratings

4. **Voice Search**
   - ✅ Record audio
   - ✅ Transcribe to text
   - ✅ Extract search intent
   - ✅ Execute search

5. **Image Search**
   - ✅ Capture/upload image
   - ✅ Identify product
   - ✅ Generate search keywords
   - ✅ Execute search

6. **Analytics**
   - ✅ Track all searches
   - ✅ Trending searches
   - ✅ Recent searches per user
   - ✅ Search-to-purchase conversion
   - ✅ Zero-result searches

---

## 🔍 Testing Checklist

### Database
- [ ] Run schema SQL in Supabase
- [ ] Verify all tables created
- [ ] Verify all functions created
- [ ] Verify RLS policies active

### Mock Data
- [ ] Insert mock products successfully
- [ ] Insert sample services successfully
- [ ] Verify data appears in Supabase dashboard
- [ ] Verify search vectors generated

### Backend
- [ ] Test advanced search with filters
- [ ] Test trending searches
- [ ] Test recent searches
- [ ] Test marketplace query
- [ ] Test product details query

### Frontend
- [ ] Marketplace shows real products
- [ ] Product details shows real data
- [ ] Search returns real results
- [ ] Filters work correctly
- [ ] Sorting works correctly

### Advanced Features
- [ ] Voice search records audio
- [ ] Voice search transcribes correctly
- [ ] Image search identifies products
- [ ] Analytics track searches
- [ ] Trending updates in real-time

---

## 📝 Notes

### Mock Data vs Real Data
- Mock data utilities are for testing only
- In production, sellers will create their own products
- Mock data helps verify the system works end-to-end

### Performance Considerations
- PostGIS indexes for fast location queries
- Full-text search indexes for fast text search
- Pagination to limit result sets
- Caching with React Query (staleTime)

### Error Handling
- All backend routes have try-catch with fallback
- Frontend shows loading states
- Graceful degradation if database unavailable

---

## 🚀 Next Steps

1. **Immediate:**
   - Run database schema
   - Insert mock data
   - Test search functionality

2. **Short-term:**
   - Update marketplace route
   - Update product details route
   - Connect frontend screens

3. **Medium-term:**
   - Implement voice search
   - Implement image search
   - Add analytics dashboard

4. **Long-term:**
   - AI-powered recommendations
   - Personalized search results
   - Advanced analytics and insights
