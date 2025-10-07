import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { X, ZoomIn, Share2, Heart, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  initialIndex?: number;
  onClose: () => void;
  onShare?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export default function ProductImageGallery({
  images,
  productName,
  initialIndex = 0,
  onClose,
  onShare,
  onToggleFavorite,
  isFavorite = false,
}: ProductImageGalleryProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gesture) => {
        if (!isZoomed) {
          setIsZoomed(true);
          Animated.spring(scale, {
            toValue: 2.5,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }).start();
        }
      },
      onPanResponderMove: (_, gesture) => {
        if (isZoomed) {
          translateX.setValue(gesture.dx * 0.5);
          translateY.setValue(gesture.dy * 0.5);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) < 10 && Math.abs(gesture.dy) < 10) {
          handleZoomOut();
        }
      },
    })
  ).current;

  const handleZoomOut = useCallback(() => {
    setIsZoomed(false);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
    ]).start();
  }, [scale, translateX, translateY]);

  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex - 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  }, [currentIndex, images.length]);

  return (
    <Modal visible={true} animationType="fade" statusBarTranslucent>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {productName}
            </Text>
            <Text style={styles.imageCounter}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {onShare && (
              <TouchableOpacity style={styles.headerButton} onPress={onShare}>
                <Share2 size={22} color="#FFF" />
              </TouchableOpacity>
            )}
            {onToggleFavorite && (
              <TouchableOpacity style={styles.headerButton} onPress={onToggleFavorite}>
                <Heart
                  size={22}
                  color={isFavorite ? '#EF4444' : '#FFF'}
                  fill={isFavorite ? '#EF4444' : 'transparent'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Image Gallery */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          scrollEnabled={!isZoomed}
        >
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.imageWrapper,
                  {
                    transform: [
                      { scale },
                      { translateX },
                      { translateY },
                    ],
                  },
                ]}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          ))}
        </ScrollView>

        {/* Navigation Arrows */}
        {!isZoomed && images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={goToPrevious}
              >
                <ChevronLeft size={32} color="#FFF" />
              </TouchableOpacity>
            )}
            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={goToNext}
              >
                <ChevronRight size={32} color="#FFF" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <View style={[styles.thumbnailStrip, { paddingBottom: insets.bottom + 16 }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailContainer}
            >
              {images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    currentIndex === index && styles.thumbnailActive,
                  ]}
                  onPress={() => {
                    scrollViewRef.current?.scrollTo({
                      x: index * SCREEN_WIDTH,
                      animated: true,
                    });
                  }}
                >
                  <Image source={{ uri: image }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Zoom Hint */}
        {!isZoomed && (
          <View style={styles.zoomHint}>
            <ZoomIn size={16} color="#FFF" />
            <Text style={styles.zoomHintText}>Tap and hold to zoom</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  imageCounter: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: 16,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#2E7D32',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  zoomHintText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
});
