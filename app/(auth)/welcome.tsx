import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Image,
  useWindowDimensions,
  StatusBar,
  Platform,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState
} from 'react-native';
import { useStorage } from '@/providers/storage-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: "Fresh from Farm to Table",
    subtitle: "Quality Produce Direct",
    description: "Connect directly with local farmers and vendors. Get the freshest fruits, vegetables, and agricultural products delivered to your doorstep.",
    image: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/vumbcbcmg045b1dwa1knd",
    primaryColor: '#2E7D32',
    secondaryColor: '#4CAF50',
    textColor: '#FFFFFF'
  },
  {
    id: 2,
    title: "Trusted Community Trading",
    subtitle: "Safe & Secure Transactions",
    description: "Join a community of verified farmers, vendors, and buyers. Trade with confidence using our Reserve protection and secure payment system.",
    image: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/a8vpzh390yxxn8tegqmed",
    primaryColor: '#FF6B35',
    secondaryColor: '#FF8A50',
    textColor: '#FFFFFF'
  },
  {
    id: 3,
    title: "Modern Agriculture Solutions",
    subtitle: "Technology Meets Farming",
    description: "Access modern farming equipment, livestock, and agricultural services. Grow your business with cutting-edge agricultural technology.",
    image: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/l1im9i5jbw2oir07x7gxa",
    primaryColor: '#1976D2',
    secondaryColor: '#42A5F5',
    textColor: '#FFFFFF'
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.8)).current;
  const swipeX = useRef(new Animated.Value(0)).current;
  const { getItem, setItem } = useStorage();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const seen = await getItem('onboarding_seen');
        if (isMounted && seen === 'true') {
          // Don't auto-navigate, let user choose to sign in or sign up
          console.log('Onboarding already seen, staying on welcome screen');
        }
      } catch (e) {
        console.log('onboarding check error', e);
      }
    })();
    return () => { isMounted = false; };
  }, [getItem]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1200,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        delay: 600,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      })
    ]).start();
  }, [currentSlide, fadeAnim, textFadeAnim, buttonScaleAnim]);

  useEffect(() => {
    // Reset animations when slide changes
    fadeAnim.setValue(0);
    textFadeAnim.setValue(0);
    buttonScaleAnim.setValue(0.8);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        delay: 400,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      })
    ]).start();
  }, [currentSlide, fadeAnim, textFadeAnim, buttonScaleAnim]);

  const handleNext = () => {
    if (isTransitioning) return;
    if (currentSlide < slides.length - 1) {
      animateToSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    if (currentSlide > 0) {
      animateToSlide(currentSlide - 1);
    }
  };

  const animateToSlide = (slideIndex: number) => {
    if (slideIndex < 0 || slideIndex >= slides.length || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Reset swipe position and fade out current content
    Animated.parallel([
      Animated.spring(swipeX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Change slide
      setCurrentSlide(slideIndex);
      
      // Fade in new content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScaleAnim, {
          toValue: 1,
          delay: 150,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        })
      ]).start(() => {
        setIsTransitioning(false);
      });
    });
  };

  // Pan responder for smooth swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // Only respond to horizontal swipes and ignore if transitioning
        return !isTransitioning && Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 100;
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animations and prepare for gesture
        swipeX.stopAnimation();
        swipeX.setValue(0);
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (isTransitioning) return;
        
        // Calculate movement with boundary resistance
        let movement = gestureState.dx;
        
        // Add resistance at boundaries
        if (currentSlide === 0 && gestureState.dx > 0) {
          movement = gestureState.dx * 0.25; // Strong resistance when trying to go before first slide
        } else if (currentSlide === slides.length - 1 && gestureState.dx < 0) {
          movement = gestureState.dx * 0.25; // Strong resistance when trying to go after last slide
        }
        
        swipeX.setValue(movement);
      },
      onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (isTransitioning) return;
        
        const threshold = width * 0.25; // Threshold for slide change
        const velocity = Math.abs(gestureState.vx);
        const distance = Math.abs(gestureState.dx);
        
        // Determine if we should change slides based on distance or velocity
        const shouldChangeSlide = distance > threshold || velocity > 0.8;
        
        if (shouldChangeSlide) {
          if (gestureState.dx > 0 && currentSlide > 0) {
            // Swipe right - go to previous slide
            animateToSlide(currentSlide - 1);
          } else if (gestureState.dx < 0 && currentSlide < slides.length - 1) {
            // Swipe left - go to next slide
            animateToSlide(currentSlide + 1);
          } else {
            // Snap back to current slide
            Animated.spring(swipeX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 150,
              friction: 8,
            }).start();
          }
        } else {
          // Snap back to current slide
          Animated.spring(swipeX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 150,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleGetStarted = async () => {
    try {
      await setItem('onboarding_seen', 'true');
      router.push('/(auth)/signup' as any);
    } catch (e) {
      console.log('onboarding set flag error', e);
      router.push('/(auth)/signup' as any);
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/signin' as any);
  };

  const handleSkip = async () => {
    try {
      await setItem('onboarding_seen', 'true');
      router.push('/(auth)/signin' as any);
    } catch (e) {
      console.log('onboarding skip error', e);
      router.push('/(auth)/signin' as any);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={currentSlideData.primaryColor}
        translucent={true}
      />
      
      {/* Full Screen Background Image */}
      <Image 
        source={{ uri: currentSlideData.image }}
        style={[styles.backgroundImage, { width, height }]}
        resizeMode="cover"
      />
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.3)',
          'rgba(0,0,0,0.1)',
          'rgba(0,0,0,0.7)'
        ]}
        locations={[0, 0.5, 1]}
        style={styles.overlay}
      />
      
      {/* Content Container */}
      <Animated.View 
        style={[
          styles.contentWrapper, 
          { 
            paddingTop: insets.top + 20, 
            paddingBottom: insets.bottom + 20,
            transform: [{ translateX: swipeX }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {currentSlide > 0 && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handlePrevious}
                testID="previous-button"
              >
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
            testID="skip-button"
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Pagination Dots */}
          <Animated.View style={[styles.pagination, { opacity: fadeAnim }]}>
            {slides.map((slide, index) => (
              <View
                key={slide.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.4)',
                    width: index === currentSlide ? 32 : 8,
                  }
                ]}
              />
            ))}
          </Animated.View>
          
          {/* Text Content */}
          <Animated.View 
            style={[
              styles.textContainer,
              {
                opacity: textFadeAnim,
                transform: [
                  {
                    translateY: textFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    })
                  }
                ]
              }
            ]}
          >
            {currentSlide === 0 && (
              <Text style={[styles.brandName, { color: currentSlideData.textColor }]}>
                BANDA
              </Text>
            )}
            <Text style={[styles.subtitle, { color: currentSlideData.textColor }]}>
              {currentSlideData.subtitle}
            </Text>
            <Text style={[styles.title, { color: currentSlideData.textColor }]}>
              {currentSlideData.title}
            </Text>
            <Text style={[styles.description, { color: currentSlideData.textColor }]}>
              {currentSlideData.description}
            </Text>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ scale: buttonScaleAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            testID="next-button"
          >
            <LinearGradient
              colors={[currentSlideData.primaryColor, currentSlideData.secondaryColor]}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextText}>
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
              </Text>
              <ArrowRight size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={handleSignIn}
            testID="sign-in-button"
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  skipText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    ...(Platform.OS === 'web' && {
      textShadow: '0px 0px 6px rgba(0,0,0,0.7), 0px 1px 3px rgba(0,0,0,0.5)',
    }),
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: 'all 0.3s ease',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: 400,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    ...(Platform.OS === 'web' && {
      textShadow: '0px 0px 8px rgba(0,0,0,0.8), 0px 2px 4px rgba(0,0,0,0.6)',
    }),
  },
  title: {
    fontSize: Platform.OS === 'web' ? 36 : 32,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 44 : 38,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    ...(Platform.OS === 'web' && {
      textShadow: '0px 0px 12px rgba(0,0,0,0.9), 0px 3px 6px rgba(0,0,0,0.7), 0px 0px 3px rgba(0,0,0,1)',
    }),
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.95,
    fontWeight: '400',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    ...(Platform.OS === 'web' && {
      textShadow: '0px 0px 8px rgba(0,0,0,0.8), 0px 2px 4px rgba(0,0,0,0.6)',
    }),
  },
  footer: {
    paddingBottom: 20,
  },
  nextButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  nextText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...(Platform.OS === 'web' && {
      textShadow: '0px 0px 4px rgba(0,0,0,0.5), 0px 1px 2px rgba(0,0,0,0.3)',
    }),
  },
  signInButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
  },
  signInText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...(Platform.OS === 'web' && {
      textShadow: '0px 0px 4px rgba(0,0,0,0.6), 0px 1px 2px rgba(0,0,0,0.4)',
    }),
  },
  signInLink: {
    color: 'white',
    fontWeight: '700',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    ...(Platform.OS === 'web' && {
      textShadow: '0px 0px 4px rgba(0,0,0,0.6), 0px 1px 2px rgba(0,0,0,0.4)',
    }),
  },
  brandName: {
    fontSize: Platform.OS === 'web' ? 48 : 42,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    ...(Platform.OS === 'web' && {
      textShadow: '0px 0px 16px rgba(0,0,0,0.9), 0px 4px 8px rgba(0,0,0,0.8), 0px 0px 4px rgba(0,0,0,1)',
    }),
  },
});