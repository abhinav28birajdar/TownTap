import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: readonly [string, string, ...string[]];
}

const customerSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Discover Local Businesses',
    subtitle: 'Find services near you',
    description: 'Browse through hundreds of local businesses, read reviews, and discover new favorites in your neighborhood.',
    icon: 'storefront-outline',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 2,
    title: 'Easy Booking & Orders',
    subtitle: 'Book with just a few taps',
    description: 'Schedule appointments, place orders, and manage your bookings all from one convenient place.',
    icon: 'calendar-outline',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: 3,
    title: 'Real-time Updates',
    subtitle: 'Stay informed',
    description: 'Get instant notifications about your orders, appointments, and special offers from your favorite businesses.',
    icon: 'notifications-outline',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: 4,
    title: 'Secure Payments',
    subtitle: 'Pay safely & securely',
    description: 'Multiple payment options with bank-level security. Your financial information is always protected.',
    icon: 'card-outline',
    gradient: ['#43e97b', '#38f9d7'],
  },
];

const businessSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Grow Your Business',
    subtitle: 'Reach more customers',
    description: 'Connect with thousands of potential customers in your area and grow your business online.',
    icon: 'trending-up-outline',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 2,
    title: 'Manage Everything',
    subtitle: 'All-in-one dashboard',
    description: 'Handle orders, appointments, inventory, and customer communications from one powerful dashboard.',
    icon: 'bar-chart-outline',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: 3,
    title: 'Smart Analytics',
    subtitle: 'Data-driven insights',
    description: 'Get detailed insights about your customers, sales trends, and business performance to make informed decisions.',
    icon: 'analytics-outline',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: 4,
    title: 'Boost Revenue',
    subtitle: 'Increase your earnings',
    description: 'Use our marketing tools, loyalty programs, and promotional features to attract and retain customers.',
    icon: 'cash-outline',
    gradient: ['#43e97b', '#38f9d7'],
  },
];

interface OnboardingTabsProps {
  userType?: 'customer' | 'business';
}

export default function OnboardingTabs({ userType = 'customer' }: OnboardingTabsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'customer' | 'business'>(userType);
  
  const steps = selectedTab === 'customer' ? customerSteps : businessSteps;
  const currentStepData = steps[currentStep];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetStarted = () => {
    if (selectedTab === 'customer') {
      router.replace('/auth');
    } else {
      router.replace('/business/registration');
    }
  };

  const skipOnboarding = () => {
    router.replace('/auth');
  };

  return (
    <LinearGradient
      colors={currentStepData.gradient}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={skipOnboarding}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'customer' && styles.activeTab,
          ]}
          onPress={() => {
            setSelectedTab('customer');
            setCurrentStep(0);
          }}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'customer' && styles.activeTabText,
            ]}
          >
            I'm a Customer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'business' && styles.activeTab,
          ]}
          onPress={() => {
            setSelectedTab('business');
            setCurrentStep(0);
          }}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'business' && styles.activeTabText,
            ]}
          >
            I'm a Business
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={currentStepData.icon as any}
              size={80}
              color="#ffffff"
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>
          </View>

          {/* Step Indicators */}
          <View style={styles.indicatorContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentStep === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.backButton]}
            onPress={prevStep}
          >
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={nextStep}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeIndicator: {
    backgroundColor: '#ffffff',
    width: 24,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#ffffff',
    gap: 8,
  },
  nextButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
});