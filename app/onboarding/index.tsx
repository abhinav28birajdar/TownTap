import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Discover Local Services',
    description: 'Find the best service providers in your area. From home cleaning to repairs, we\'ve got you covered.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    icon: 'search',
    backgroundColor: '#415D43',
  },
  {
    id: '2',
    title: 'Book with Ease',
    description: 'Schedule appointments in seconds. Choose your preferred time, date, and service provider.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
    icon: 'calendar',
    backgroundColor: '#2C3E50',
  },
  {
    id: '3',
    title: 'Track in Real-Time',
    description: 'Know exactly when your service provider will arrive. Get live updates and notifications.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    icon: 'location',
    backgroundColor: '#8E44AD',
  },
  {
    id: '4',
    title: 'Secure Payments',
    description: 'Pay safely with multiple payment options. Your transactions are protected and hassle-free.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
    icon: 'shield-checkmark',
    backgroundColor: '#27AE60',
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    router.replace('/auth/role-selection');
  };

  const handleGetStarted = () => {
    router.replace('/auth/role-selection');
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slideContainer}>
        <Animated.View style={[styles.imageContainer, { transform: [{ scale }], opacity }]}>
          <LinearGradient
            colors={[item.backgroundColor, item.backgroundColor + 'CC']}
            style={styles.imageGradient}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={64} color="#FFF" />
            </View>
          </LinearGradient>
        </Animated.View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{item.title}</ThemedText>
          <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip Button */}
      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <View style={styles.logoContainer}>
          <ThemedText style={[styles.logoText, { color: colors.primary }]}>TownTap</ThemedText>
        </View>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <ThemedText style={[styles.skipText, { color: colors.textSecondary }]}>Skip</ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {renderDots()}

        <View style={styles.buttonsContainer}>
          {currentIndex < slides.length - 1 ? (
            <>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary }]}
                onPress={handleGetStarted}
              >
                <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  Get Started
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={handleNext}
              >
                <ThemedText style={styles.primaryButtonText}>Next</ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.fullButton, { backgroundColor: colors.primary }]}
              onPress={handleGetStarted}
            >
              <ThemedText style={styles.fullButtonText}>Get Started</ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
  },
  slideContainer: {
    width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  imageGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 8,
  },
  fullButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
