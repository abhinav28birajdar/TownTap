import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const slides: OnboardingSlide[] = [
    {
      id: '1',
      title: t('onboarding.slide1Title'),
      subtitle: t('onboarding.slide1Subtitle'),
      description: t('onboarding.slide1Description'),
      icon: 'storefront',
      color: '#667eea',
    },
    {
      id: '2',
      title: t('onboarding.slide2Title'),
      subtitle: t('onboarding.slide2Subtitle'),
      description: t('onboarding.slide2Description'),
      icon: 'sparkles',
      color: '#8b5cf6',
    },
    {
      id: '3',
      title: t('onboarding.slide3Title'),
      subtitle: t('onboarding.slide3Subtitle'),
      description: t('onboarding.slide3Description'),
      icon: 'analytics',
      color: '#10b981',
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      scrollViewRef.current?.scrollTo({
        x: prevIndex * width,
        animated: true,
      });
    }
  };

  const handleGetStarted = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleSkip = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const onScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View key={slide.id} style={styles.slide}>
      <View style={styles.slideContent}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${slide.color}20` }]}>
          <Ionicons name={slide.icon as any} size={80} color={slide.color} />
        </View>

        {/* Content */}
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: slide.color }]}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="business" size={32} color="#667eea" />
          </View>
          <Text style={styles.logoText}>TownTap</Text>
        </View>
        
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map(renderSlide)}
      </ScrollView>

      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentIndex ? slides[currentIndex].color : '#e5e7eb',
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <View style={styles.navigationButtons}>
          {currentIndex > 0 && (
            <Button
              title={t('onboarding.previous')}
              onPress={handlePrevious}
              variant="outline"
              style={styles.previousButton}
            />
          )}
          
          <Button
            title={
              currentIndex === slides.length - 1
                ? t('onboarding.getStarted')
                : t('onboarding.next')
            }
            onPress={handleNext}
            style={StyleSheet.flatten(
              currentIndex === 0 
                ? [styles.nextButton, { backgroundColor: slides[currentIndex].color }, styles.singleButton]
                : [styles.nextButton, { backgroundColor: slides[currentIndex].color }]
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 32,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  textContent: {
    alignItems: 'center',
    maxWidth: width - 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  navigationContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  previousButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  singleButton: {
    flex: 1,
    marginLeft: 0,
  },
});

export default OnboardingScreen;
