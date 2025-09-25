// =====================================================
// ENHANCED TOWNTAP - ONBOARDING SCREEN
// AI-powered user type selection and preference setup
// =====================================================

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiText, MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors, LightTheme } from '../../constants/YYY.01_colors';
import { FontSizes, FontWeights } from '../../constants/YYY.02_typography';
import { BorderRadius, Spacing } from '../../constants/YYY.03_dimensions';
import { useAuthActions, useAuthStore } from '../../stores/authStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string]; // Fixed gradient type to ensure at least 2 colors
  features?: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Enhanced TownTap',
    subtitle: 'Your Hyperlocal Business Ecosystem',
    description: 'Discover, connect, and thrive with AI-powered local commerce. Experience the future of community-driven business interactions.',
    icon: 'storefront-outline',
    gradient: [Colors.primary[500], Colors.primary[700]],
    features: [
      'Real-time business discovery',
      'AI-powered recommendations',
      'Seamless transactions',
      'Community engagement'
    ],
  },
  {
    id: 'user_type',
    title: 'Choose Your Journey',
    subtitle: 'Tailored Experience Just for You',
    description: 'Select your role to unlock personalized features designed specifically for your needs.',
    icon: 'people-outline',
    gradient: [Colors.secondary[400], Colors.secondary[600]],
  },
  {
    id: 'ai_features',
    title: 'AI-Powered Intelligence',
    subtitle: 'Smart Assistant at Your Service',
    description: 'Our advanced AI learns your preferences, suggests relevant businesses, and helps optimize your experience.',
    icon: 'bulb-outline',
    gradient: [Colors.info[400], Colors.info[600]],
    features: [
      'Intelligent search & discovery',
      'Personalized recommendations',
      'Predictive insights',
      'Natural language queries'
    ],
  },
  {
    id: 'ready',
    title: 'Ready to Explore',
    subtitle: 'Your Local Community Awaits',
    description: 'Everything is set up! Start discovering amazing local businesses and services in your area.',
    icon: 'rocket-outline',
    gradient: [Colors.success[400], Colors.success[600]],
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<'customer' | 'business_owner' | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { user } = useAuthStore();
  const { completeOnboarding, setUserType: setStoreUserType } = useAuthActions();

  useEffect(() => {
    // Auto-scroll to current step
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentStep * SCREEN_WIDTH,
        animated: true,
      });
    }
  }, [currentStep]);

  const handleUserTypeSelection = (type: 'customer' | 'business_owner') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUserType(type);
    setStoreUserType(type);
  };

  const handleNext = () => {
    if (currentStep === 1 && !userType) {
      Alert.alert('Selection Required', 'Please choose your role to continue with personalized features.');
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!userType) {
      Alert.alert('Selection Required', 'Please choose your role to continue.');
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Complete onboarding with AI preferences
      const aiPreferences = {
        user_type: userType,
        onboarding_version: '2.0',
        features_interested: onboardingSteps[0].features || [],
        completed_at: new Date().toISOString(),
      };

      if (user) {
        await completeOnboarding(userType, aiPreferences);
      }

      onComplete();
    } catch (error) {
      console.error('Onboarding completion error:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserTypeSelection = () => (
    <View style={styles.userTypeContainer}>
      <TouchableOpacity
        style={[
          styles.userTypeCard,
          userType === 'customer' && styles.userTypeCardSelected,
        ]}
        onPress={() => handleUserTypeSelection('customer')}
        activeOpacity={0.8}
      >
        <MotiView
          animate={{
            scale: userType === 'customer' ? 1.05 : 1,
            backgroundColor: userType === 'customer' ? '#E3F2FD' : 'white',
          }}
          transition={{
            scale: { type: 'spring', damping: 15 },
            backgroundColor: { type: 'spring', damping: 15 }
          }}
          style={styles.userTypeCardContent}
        >
          <View style={styles.userTypeIconContainer}>
            <Ionicons
              name="person-outline"
              size={48}
              color={userType === 'customer' ? LightTheme.primary : LightTheme.textSecondary}
            />
          </View>
          <Text style={[
            styles.userTypeTitle,
            userType === 'customer' && styles.userTypeTitleSelected
          ]}>
            I'm a Customer
          </Text>
          <Text style={styles.userTypeDescription}>
            Discover local businesses, place orders, and enjoy seamless shopping experiences
          </Text>
          <View style={styles.userTypeFeatures}>
            <Text style={styles.userTypeFeature}>• Browse nearby businesses</Text>
            <Text style={styles.userTypeFeature}>• AI-powered recommendations</Text>
            <Text style={styles.userTypeFeature}>• Real-time order tracking</Text>
            <Text style={styles.userTypeFeature}>• Exclusive offers & deals</Text>
          </View>
        </MotiView>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.userTypeCard,
          userType === 'business_owner' && styles.userTypeCardSelected,
        ]}
        onPress={() => handleUserTypeSelection('business_owner')}
        activeOpacity={0.8}
      >
        <MotiView
          animate={{
            scale: userType === 'business_owner' ? 1.05 : 1,
            backgroundColor: userType === 'business_owner' ? '#E8F5E8' : 'white',
          }}
          transition={{
            scale: { type: 'spring', damping: 15 },
            backgroundColor: { type: 'spring', damping: 15 }
          }}
          style={styles.userTypeCardContent}
        >
          <View style={styles.userTypeIconContainer}>
            <Ionicons
              name="business-outline"
              size={48}
              color={userType === 'business_owner' ? LightTheme.secondary : LightTheme.textSecondary}
            />
          </View>
          <Text style={[
            styles.userTypeTitle,
            userType === 'business_owner' && styles.userTypeTitleSelectedBusiness
          ]}>
            I'm a Business Owner
          </Text>
          <Text style={styles.userTypeDescription}>
            Manage your business, reach more customers, and grow with AI-powered insights
          </Text>
          <View style={styles.userTypeFeatures}>
            <Text style={styles.userTypeFeature}>• Business dashboard & analytics</Text>
            <Text style={styles.userTypeFeature}>• AI content generation</Text>
            <Text style={styles.userTypeFeature}>• Customer management</Text>
            <Text style={styles.userTypeFeature}>• Real-time notifications</Text>
          </View>
        </MotiView>
      </TouchableOpacity>
    </View>
  );

  const renderStep = (step: OnboardingStep, index: number) => (
    <View key={step.id} style={styles.stepContainer}>
      <LinearGradient
        colors={step.gradient as readonly [string, string]}
        style={styles.stepGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            opacity: { type: 'timing', duration: 800, delay: index * 200 },
            translateY: { type: 'timing', duration: 800, delay: index * 200 }
          }}
          style={styles.stepContent}
        >
          <View style={styles.stepIconContainer}>
            <View style={styles.stepIconBg}>
              <Ionicons name={step.icon} size={64} color="white" />
            </View>
          </View>

          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.stepTitle}
          >
            {step.title}
          </MotiText>

          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.stepSubtitle}
          >
            {step.subtitle}
          </MotiText>

          <MotiText
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            style={styles.stepDescription}
          >
            {step.description}
          </MotiText>

          {step.features && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 600 }}
              style={styles.stepFeatures}
            >
              {step.features.map((feature, idx) => (
                <View key={idx} style={styles.stepFeatureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.stepFeatureText}>{feature}</Text>
                </View>
              ))}
            </MotiView>
          )}

          {step.id === 'user_type' && renderUserTypeSelection()}
        </MotiView>
      </LinearGradient>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingSteps.map((_, index) => (
        <MotiView
          key={index}
          animate={{
            width: index === currentStep ? 24 : 8,
            backgroundColor: index === currentStep ? 'white' : 'rgba(255, 255, 255, 0.5)',
          }}
            transition={{
              width: { type: 'spring', damping: 15 },
              backgroundColor: { type: 'spring', damping: 15 }
            }}
          style={styles.paginationDot}
        />
      ))}
    </View>
  );

  const renderControls = () => (
    <View style={styles.controls}>
      {currentStep > 0 && (
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePrevious}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.controlButtonText}>Back</Text>
        </TouchableOpacity>
      )}

      <View style={styles.controlButtonSpacer} />

      <TouchableOpacity
        style={[styles.controlButton, styles.controlButtonPrimary]}
        onPress={handleNext}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={[styles.controlButtonText, styles.controlButtonTextPrimary]}>
          {loading ? 'Setting up...' : currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
        </Text>
        <Ionicons 
          name={currentStep === onboardingSteps.length - 1 ? 'rocket' : 'chevron-forward'} 
          size={24} 
          color={LightTheme.primary} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {onboardingSteps.map(renderStep)}
      </ScrollView>

      <View style={styles.footer}>
        {renderPagination()}
        {renderControls()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  stepGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[6], // lg = 24px
  },
  stepContent: {
    alignItems: 'center',
    maxWidth: 350,
  },
  stepIconContainer: {
    marginBottom: Spacing[12], // xl = 48px
  },
  stepIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepTitle: {
    fontSize: FontSizes['2xl'], // h2 = 24px
    fontWeight: FontWeights.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: Spacing[2], // sm = 8px
  },
  stepSubtitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: Spacing[4], // md = 16px
  },
  stepDescription: {
    fontSize: FontSizes.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing[6], // lg = 24px
  },
  stepFeatures: {
    alignSelf: 'stretch',
    marginTop: Spacing[4], // md = 16px
  },
  stepFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[2], // sm = 8px
  },
  stepFeatureText: {
    fontSize: FontSizes.base,
    color: 'white',
    marginLeft: Spacing[2], // sm = 8px
    flex: 1,
  },
  userTypeContainer: {
    marginTop: Spacing[12], // xl = 48px
    width: '100%',
  },
  userTypeCard: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing[4], // md = 16px
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  userTypeCardSelected: {
    borderWidth: 2,
    borderColor: LightTheme.primary,
  },
  userTypeCardContent: {
    padding: Spacing[6], // lg = 24px
    alignItems: 'center',
  },
  userTypeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[4], // md = 16px
  },
  userTypeTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: LightTheme.text,
    marginBottom: Spacing[2], // sm = 8px
    textAlign: 'center',
  },
  userTypeTitleSelected: {
    color: LightTheme.primary,
  },
  userTypeTitleSelectedBusiness: {
    color: LightTheme.secondary,
  },
  userTypeDescription: {
    fontSize: FontSizes.sm,
    color: LightTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing[4], // md = 16px
  },
  userTypeFeatures: {
    alignSelf: 'stretch',
  },
  userTypeFeature: {
    fontSize: FontSizes.xs,
    color: Colors.text.tertiary,
    marginBottom: 4,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Spacing[6], // lg = 24px
    paddingHorizontal: Spacing[6], // lg = 24px
    backgroundColor: 'transparent',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[6], // lg = 24px
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[4], // md = 16px
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4], // md = 16px
    paddingHorizontal: Spacing[6], // lg = 24px
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonPrimary: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  controlButtonSpacer: {
    flex: 1,
  },
  controlButtonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    color: 'white',
    marginHorizontal: Spacing[2], // sm = 8px
  },
  controlButtonTextPrimary: {
    color: LightTheme.primary,
  },
});
