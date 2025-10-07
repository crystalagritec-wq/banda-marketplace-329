# Kenya Location System - Complete Implementation Guide

## ✅ Completed Tasks

### 1. **All 47 Counties Added** ✓
- Added complete data for all 47 Kenyan counties
- Each county includes:
  - County ID, name, code, capital
  - GPS coordinates (latitude/longitude)
  - Complete list of subcounties
  - All wards for each subcounty

**File**: `constants/kenya-locations-complete.ts`

**Counties Included**:
1. Mombasa (001) - 6 subcounties
2. Kwale (002) - 4 subcounties
3. Kilifi (003) - 7 subcounties
4. Tana River (004) - 3 subcounties
5. Lamu (005) - 2 subcounties
6. Taita Taveta (006) - 4 subcounties
7. Garissa (007) - 6 subcounties
8. Wajir (008) - 6 subcounties
9. Mandera (009) - 6 subcounties
10. Marsabit (010) - 4 subcounties
11. Isiolo (011) - 2 subcounties
12. Meru (012) - 9 subcounties
13. Tharaka Nithi (013) - 3 subcounties
14. Embu (014) - 4 subcounties
15. Kitui (015) - 8 subcounties
16. Machakos (016) - 8 subcounties
17. Makueni (017) - 6 subcounties
18. Nyandarua (018) - 5 subcounties
19. Nyeri (019) - 6 subcounties
20. Kirinyaga (020) - 4 subcounties
21. Murang'a (021) - 7 subcounties
22. Kiambu (022) - 12 subcounties
23. Turkana (023) - 7 subcounties
24. West Pokot (024) - 4 subcounties
25. Samburu (025) - 3 subcounties
26. Trans Nzoia (026) - 5 subcounties
27. Uasin Gishu (027) - 6 subcounties
28. Elgeyo Marakwet (028) - 4 subcounties
29. Nandi (029) - 6 subcounties
30. Baringo (030) - 6 subcounties
31. Laikipia (031) - 3 subcounties
32. Nakuru (032) - 11 subcounties
33. Narok (033) - 6 subcounties
34. Kajiado (034) - 5 subcounties
35. Kericho (035) - 6 subcounties
36. Bomet (036) - 5 subcounties
37. Kakamega (037) - 12 subcounties
38. Vihiga (038) - 5 subcounties
39. Bungoma (039) - 9 subcounties
40. Busia (040) - 7 subcounties
41. Siaya (041) - 6 subcounties
42. Kisumu (042) - 7 subcounties
43. Homa Bay (043) - 8 subcounties
44. Migori (044) - 8 subcounties
45. Kisii (045) - 9 subcounties
46. Nyamira (046) - 4 subcounties
47. Nairobi (047) - 17 subcounties

### 2. **Location Provider Updated** ✓
Enhanced `UserLocation` interface to support hierarchical location data:

```typescript
export interface UserLocation {
  coordinates: GeoCoordinates;
  label?: string;
  address?: string;
  city?: string;
  county?: string;
  countyId?: string;      // NEW
  subCounty?: string;
  subCountyId?: string;   // NEW
  ward?: string;
  wardId?: string;        // NEW
  timestamp: number;
}
```

### 3. **Hierarchical Location Selector Component** ✓
Created `components/HierarchicalLocationSelector.tsx` with:
- Three-step selection: County → SubCounty → Ward
- Real-time search across all levels
- Breadcrumb navigation
- Back button support
- Beautiful modal UI

**Features**:
- Search functionality across counties, subcounties, and wards
- Hierarchical drill-down navigation
- Formatted location string output
- Mobile-optimized UI

### 4. **Helper Functions** ✓
Added comprehensive utility functions in `kenya-locations-complete.ts`:

```typescript
// Get all counties
getAllCounties(): County[]

// Find county by ID or code
getCountyById(id: string): County | undefined

// Find county by name
getCountyByName(name: string): County | undefined

// Get subcounties for a county
getSubCountiesByCounty(countyId: string): SubCounty[]

// Get wards for a subcounty
getWardsBySubCounty(countyId: string, subCountyId: string): Ward[]

// Search across all location levels
searchLocations(query: string): {
  counties: County[];
  subCounties: (SubCounty & { countyName: string })[];
  wards: (Ward & { countyName: string; subCountyName: string })[];
}

// Get county names list
getCountyNames(): string[]

// Get county coordinates
getCountyCoordinates(countyId: string)

// Format location string
formatLocationString(county?: string, subCounty?: string, ward?: string): string

// Get location hierarchy from ward ID
getLocationHierarchy(wardId: string): {
  county?: County;
  subCounty?: SubCounty;
  ward?: Ward;
} | null
```

## 📋 Integration Guide

### How to Use in Shipping Address Screen

```typescript
import HierarchicalLocationSelector from '@/components/HierarchicalLocationSelector';
import { useState } from 'react';

function AddressScreen() {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    // location contains: county, subCounty, ward, formatted
    setSelectedLocation(location);
    
    // Update form data
    setFormData({
      ...formData,
      county: location.county.name,
      countyId: location.county.id,
      subCounty: location.subCounty.name,
      subCountyId: location.subCounty.id,
      ward: location.ward.name,
      wardId: location.ward.id,
      city: location.formatted, // Full formatted string
      coordinates: location.county.coordinates, // County coordinates
    });
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShowLocationPicker(true)}>
        <Text>Select Location</Text>
        {selectedLocation && (
          <Text>{selectedLocation.formatted}</Text>
        )}
      </TouchableOpacity>

      <HierarchicalLocationSelector
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={handleLocationSelect}
      />
    </>
  );
}
```

### How to Use in Search Filtering

```typescript
import { useState } from 'react';
import HierarchicalLocationSelector from '@/components/HierarchicalLocationSelector';

function SearchScreen() {
  const [locationFilter, setLocationFilter] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleLocationSelect = (location) => {
    setLocationFilter({
      county: location.county.name,
      countyId: location.county.id,
      subCounty: location.subCounty.name,
      ward: location.ward.name,
    });
    
    // Apply filter to search
    applyLocationFilter(location);
  };

  const applyLocationFilter = (location) => {
    // Filter products by location
    const filtered = products.filter(product => {
      // Match by county, subcounty, or ward
      return product.county === location.county.name ||
             product.subCounty === location.subCounty.name ||
             product.ward === location.ward.name;
    });
    
    setFilteredProducts(filtered);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShowLocationPicker(true)}>
        <Text>Filter by Location</Text>
        {locationFilter && (
          <Text>{locationFilter.county} - {locationFilter.ward}</Text>
        )}
      </TouchableOpacity>

      <HierarchicalLocationSelector
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={handleLocationSelect}
      />
    </>
  );
}
```

### How to Use in Checkout Flow

```typescript
import { useLocation } from '@/providers/location-provider';
import HierarchicalLocationSelector from '@/components/HierarchicalLocationSelector';

function CheckoutScreen() {
  const { setManualLocation } = useLocation();
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleLocationSelect = async (location) => {
    // Update user location with hierarchical data
    await setManualLocation({
      coordinates: location.county.coordinates,
      label: location.formatted,
      county: location.county.name,
      countyId: location.county.id,
      subCounty: location.subCounty.name,
      subCountyId: location.subCounty.id,
      ward: location.ward.name,
      wardId: location.ward.id,
      city: location.formatted,
      timestamp: Date.now(),
    });

    // Recalculate delivery fees based on new location
    recalculateDeliveryFees();
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShowLocationPicker(true)}>
        <Text>Change Delivery Location</Text>
      </TouchableOpacity>

      <HierarchicalLocationSelector
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={handleLocationSelect}
      />
    </>
  );
}
```

## 🎯 Delivery Calculation Improvements

### Time-Conscious ETA
The `calculateTimeConsciousETA` function in `utils/geo-distance.ts` now accounts for:
- **Rush hour traffic** (7-9 AM, 5-7 PM): 40% slower
- **Night time** (10 PM - 5 AM): 30% faster
- **Weekends**: 10% faster
- **Vehicle type**: Different base speeds for boda, van, truck, pickup, tractor

### Granular Location-Based Delivery
With the hierarchical location system, you can now:
1. Calculate delivery fees based on ward-level precision
2. Find nearest sellers within the same subcounty
3. Optimize delivery routes by grouping orders in the same ward
4. Provide accurate ETAs based on actual road distances

## 🔧 Backend Integration Points

### Update Product Schema
Add location fields to products:
```typescript
interface Product {
  // ... existing fields
  county?: string;
  countyId?: string;
  subCounty?: string;
  subCountyId?: string;
  ward?: string;
  wardId?: string;
  coordinates: GeoCoordinates;
}
```

### Update Order Schema
Add delivery location fields:
```typescript
interface Order {
  // ... existing fields
  deliveryLocation: {
    county: string;
    countyId: string;
    subCounty: string;
    subCountyId: string;
    ward: string;
    wardId: string;
    coordinates: GeoCoordinates;
    formatted: string;
  };
}
```

### Location-Aware Search Query
```typescript
// backend/trpc/routes/search/location-aware-search.ts
export const locationAwareSearchProcedure = publicProcedure
  .input(z.object({
    query: z.string(),
    countyId: z.string().optional(),
    subCountyId: z.string().optional(),
    wardId: z.string().optional(),
    radiusKm: z.number().default(50),
  }))
  .query(async ({ input }) => {
    // Filter products by location hierarchy
    // Calculate distances from user location
    // Return sorted by distance
  });
```

## 📊 Benefits

1. **Accurate Delivery Estimates**: Ward-level precision for delivery calculations
2. **Better Search Results**: Filter products by county, subcounty, or ward
3. **Optimized Logistics**: Group deliveries by ward for efficiency
4. **User Experience**: Easy-to-use hierarchical location selector
5. **Scalability**: Complete data for all 47 counties ready to use
6. **Flexibility**: Search across all levels or drill down step-by-step

## 🚀 Next Steps

1. **Integrate into Address Screen**: Replace city input with HierarchicalLocationSelector
2. **Update Search Filters**: Add location filter using the selector
3. **Enhance Checkout**: Use hierarchical location for delivery address
4. **Backend Updates**: Update database schema to store hierarchical location data
5. **Analytics**: Track popular delivery locations by ward
6. **Delivery Optimization**: Group orders by ward for efficient routing

## 📝 Notes

- All county coordinates are approximate center points
- Ward boundaries are administrative, not GPS-based
- Distance calculations use Haversine formula for accuracy
- Time-conscious ETA accounts for Kenyan traffic patterns
- System supports both GPS coordinates and hierarchical location data
