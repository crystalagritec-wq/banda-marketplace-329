import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';

const COLORS = {
  primary: '#2E7D32',
  secondary: '#F57C00',
  accent: '#E91E63',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  skeleton: '#E5E7EB',
  skeletonHighlight: '#F3F4F6',
} as const;

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: COLORS.skeleton,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface ProductCardSkeletonProps {
  cardStyle?: 'default' | 'compact' | 'featured' | 'trending';
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ 
  cardStyle = 'default' 
}) => {
  const { width: screenWidth } = useWindowDimensions();

  const getCardWidth = () => {
    switch (cardStyle) {
      case 'compact':
        return (screenWidth - 48) / 2;
      case 'featured':
        return screenWidth - 32;
      case 'trending':
        return 180;
      default:
        return (screenWidth - 48) / 2;
    }
  };

  const getImageHeight = () => {
    switch (cardStyle) {
      case 'compact':
        return 120;
      case 'featured':
        return 200;
      case 'trending':
        return 140;
      default:
        return 160;
    }
  };

  return (
    <View style={[styles.skeletonCard, { width: getCardWidth() }]}>
      {/* Image Skeleton */}
      <Skeleton 
        width="100%" 
        height={getImageHeight()} 
        borderRadius={0}
        style={styles.imageSkeleton}
      />
      
      {/* Content Skeleton */}
      <View style={styles.contentSkeleton}>
        {/* Product Name */}
        <Skeleton width="90%" height={16} style={styles.titleSkeleton} />
        <Skeleton width="70%" height={14} style={styles.subtitleSkeleton} />
        
        {/* Vendor Info */}
        <View style={styles.vendorSkeleton}>
          <Skeleton width="60%" height={12} />
          <Skeleton width={12} height={12} borderRadius={6} />
        </View>
        
        {/* Location */}
        <Skeleton width="50%" height={10} style={styles.locationSkeleton} />
        
        {/* Price */}
        <View style={styles.priceSkeleton}>
          <Skeleton width="40%" height={18} />
          <Skeleton width="20%" height={12} />
        </View>
        
        {/* Rating and Meta */}
        <View style={styles.metaSkeleton}>
          <Skeleton width="30%" height={12} />
          <Skeleton width="25%" height={12} />
        </View>
        
        {/* Button */}
        <Skeleton 
          width="100%" 
          height={cardStyle === 'featured' ? 48 : 40} 
          borderRadius={12}
          style={styles.buttonSkeleton}
        />
      </View>
    </View>
  );
};

interface SearchSkeletonProps {
  showFilters?: boolean;
}

export const SearchSkeleton: React.FC<SearchSkeletonProps> = ({ showFilters = true }) => {
  return (
    <View style={styles.searchSkeletonContainer}>
      {/* Search Bar */}
      <Skeleton width="100%" height={48} borderRadius={16} />
      
      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersSkeleton}>
          <Skeleton width={80} height={32} borderRadius={16} />
          <Skeleton width={100} height={32} borderRadius={16} />
          <Skeleton width={90} height={32} borderRadius={16} />
          <Skeleton width={70} height={32} borderRadius={16} />
        </View>
      )}
    </View>
  );
};

interface CategorySkeletonProps {
  count?: number;
}

export const CategorySkeleton: React.FC<CategorySkeletonProps> = ({ count = 5 }) => {
  return (
    <View style={styles.categorySkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.categoryItem}>
          <Skeleton width={60} height={60} borderRadius={30} />
          <Skeleton width={50} height={12} style={styles.categoryLabel} />
        </View>
      ))}
    </View>
  );
};

interface BannerSkeletonProps {
  count?: number;
}

export const BannerSkeleton: React.FC<BannerSkeletonProps> = ({ count = 3 }) => {
  const { width: screenWidth } = useWindowDimensions();
  
  return (
    <View style={styles.bannerContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton 
          key={index}
          width={screenWidth - 32} 
          height={160} 
          borderRadius={16}
          style={styles.bannerSkeleton}
        />
      ))}
      
      {/* Indicators */}
      <View style={styles.indicatorsSkeleton}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton 
            key={index}
            width={8} 
            height={8} 
            borderRadius={4}
            style={styles.indicatorSkeleton}
          />
        ))}
      </View>
    </View>
  );
};

interface ProductGridSkeletonProps {
  count?: number;
  cardStyle?: 'default' | 'compact' | 'featured' | 'trending';
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({ 
  count = 6, 
  cardStyle = 'default' 
}) => {
  return (
    <View style={styles.gridSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} cardStyle={cardStyle} />
      ))}
    </View>
  );
};

interface ListSkeletonProps {
  count?: number;
  itemHeight?: number;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  count = 5, 
  itemHeight = 80 
}) => {
  return (
    <View style={styles.listSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.listItem, { height: itemHeight }]}>
          <Skeleton width={60} height={60} borderRadius={8} />
          <View style={styles.listItemContent}>
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={12} style={styles.listItemSubtitle} />
            <Skeleton width="40%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
};

interface HeaderSkeletonProps {
  showSearch?: boolean;
  showNotification?: boolean;
}

export const HeaderSkeleton: React.FC<HeaderSkeletonProps> = ({ 
  showSearch = true, 
  showNotification = true 
}) => {
  return (
    <View style={styles.headerSkeleton}>
      <Skeleton width={40} height={40} borderRadius={20} />
      
      {showSearch && (
        <Skeleton width="60%" height={40} borderRadius={20} />
      )}
      
      {showNotification && (
        <Skeleton width={40} height={40} borderRadius={20} />
      )}
    </View>
  );
};

interface StatsSkeletonProps {
  count?: number;
}

export const StatsSkeleton: React.FC<StatsSkeletonProps> = ({ count = 3 }) => {
  return (
    <View style={styles.statsSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.statCard}>
          <Skeleton width="60%" height={20} />
          <Skeleton width="80%" height={12} style={styles.statLabel} />
        </View>
      ))}
    </View>
  );
};

// Smart Loading Component that shows different skeletons based on content type
interface SmartLoadingProps {
  type: 'marketplace' | 'products' | 'search' | 'categories' | 'banners' | 'list' | 'header' | 'stats';
  count?: number;
  cardStyle?: 'default' | 'compact' | 'featured' | 'trending';
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({ 
  type, 
  count, 
  cardStyle 
}) => {
  switch (type) {
    case 'marketplace':
      return (
        <View style={styles.marketplaceSkeleton}>
          <HeaderSkeleton />
          <SearchSkeleton />
          <BannerSkeleton count={3} />
          <CategorySkeleton count={5} />
          <ProductGridSkeleton count={6} cardStyle="default" />
        </View>
      );
    
    case 'products':
      return <ProductGridSkeleton count={count} cardStyle={cardStyle} />;
    
    case 'search':
      return <SearchSkeleton />;
    
    case 'categories':
      return <CategorySkeleton count={count} />;
    
    case 'banners':
      return <BannerSkeleton count={count} />;
    
    case 'list':
      return <ListSkeleton count={count} />;
    
    case 'header':
      return <HeaderSkeleton />;
    
    case 'stats':
      return <StatsSkeleton count={count} />;
    
    default:
      return <ProductGridSkeleton count={count} cardStyle={cardStyle} />;
  }
};

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageSkeleton: {
    backgroundColor: COLORS.skeleton,
  },
  contentSkeleton: {
    padding: 12,
    gap: 8,
  },
  titleSkeleton: {
    marginBottom: 4,
  },
  subtitleSkeleton: {
    marginBottom: 8,
  },
  vendorSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  locationSkeleton: {
    marginBottom: 8,
  },
  priceSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  metaSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  buttonSkeleton: {
    marginTop: 4,
  },
  
  searchSkeletonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  filtersSkeleton: {
    flexDirection: 'row',
    gap: 8,
  },
  
  categorySkeleton: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryLabel: {
    marginTop: 4,
  },
  
  bannerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerSkeleton: {
    marginHorizontal: 8,
  },
  indicatorsSkeleton: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  indicatorSkeleton: {
    marginHorizontal: 2,
  },
  
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  
  listSkeleton: {
    gap: 12,
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
  },
  listItemContent: {
    flex: 1,
    gap: 6,
  },
  listItemSubtitle: {
    marginTop: 4,
  },
  
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
  },
  
  statsSkeleton: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    marginTop: 4,
  },
  
  marketplaceSkeleton: {
    flex: 1,
    backgroundColor: COLORS.background,
    gap: 16,
    paddingVertical: 16,
  },
});

export default SmartLoading;