import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Find Local Services',
    subtitle: 'Instantly',
    description: 'Discover trusted service providers near you. From home cleaning to repairs, we have it all covered.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
    icon: 'search',
    color: '#4CAF50',
  },
  {
    id: '2',
    title: 'Book with',
    subtitle: 'Confidence',
    description: 'Read reviews, compare prices, and book verified professionals with our secure booking system.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600',
    icon: 'shield-checkmark',
    color: '#2196F3',
  },
  {
    id: '3',
    title: 'Track in',
    subtitle: 'Real-Time',
    description: 'Know exactly when your service provider arrives. Track bookings and get live updates.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600',
    icon: 'location',
    color: '#9C27B0',
  },
  {
    id: '4',
    title: 'Pay',
    subtitle: 'Securely',
    description: 'Multiple payment options with secure transactions. Pay online or in cash - your choice.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600',
    icon: 'wallet',
    color: '#FF9800',
  },
];

export default function OnboardingFlowScreen() {
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/auth/sign-in');
    }
  };

  const handleSkip = () => {
    router.replace('/auth/sign-in');
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
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View style={[styles.imageContainer, { transform: [{ scale }], opacity }]}>
          <Image source={{ uri: item.image }} style={styles.slideImage} />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.imageGradient}
          />
          <View style={[styles.iconBadge, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon as any} size={28} color="#FFF" />
          </View>
        </Animated.View>

        <View style={styles.contentContainer}>
          <ThemedText style={styles.slideTitle}>{item.title}</ThemedText>
          <ThemedText style={[styles.slideSubtitle, { color: item.color }]}>
            {item.subtitle}
          </ThemedText>
          <ThemedText style={[styles.slideDescription, { color: colors.textSecondary }]}>
            {item.description}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
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

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Ionicons name="storefront" size={24} color="#FFF" />
          </View>
          <ThemedText style={styles.logoText}>TownTap</ThemedText>
        </View>
        {!isLastSlide && (
          <TouchableOpacity onPress={handleSkip}>
            <ThemedText style={[styles.skipText, { color: colors.textSecondary }]}>
              Skip
            </ThemedText>
          </TouchableOpacity>
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderPagination()}

        {isLastSlide ? (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.getStartedButton, { backgroundColor: colors.primary }]}
              onPress={handleGetStarted}
            >
              <ThemedText style={styles.getStartedText}>Get Started</ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.signInLink}
              onPress={() => router.replace('/auth/sign-in')}
            >
              <ThemedText style={[styles.signInText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
                <ThemedText style={{ color: colors.primary, fontWeight: '600' }}>
                  Sign In
                </ThemedText>
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.navigationContainer}>
            <View style={styles.progressContainer}>
              <ThemedText style={[styles.progressText, { color: colors.textSecondary }]}>
                {currentIndex + 1} of {slides.length}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
            >
              <ThemedText style={styles.nextButtonText}>Next</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Features Preview (on last slide) */}
      {isLastSlide && (
        <View style={[styles.featuresPreview, { backgroundColor: colors.card }]}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </View>
            <ThemedText style={styles.featureText}>Verified Providers</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="shield" size={18} color={colors.info} />
            </View>
            <ThemedText style={styles.featureText}>Secure Payments</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="star" size={18} color={colors.warning} />
            </View>
            <ThemedText style={styles.featureText}>Top Rated</ThemedText>
          </View>
        </View>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.85,
    height: height * 0.4,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 10,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  iconBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 30,
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  slideSubtitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {},
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonsContainer: {
    alignItems: 'center',
    gap: 16,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 10,
    width: '100%',
  },
  getStartedText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signInLink: {
    padding: 8,
  },
  signInText: {
    fontSize: 14,
  },
  featuresPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
