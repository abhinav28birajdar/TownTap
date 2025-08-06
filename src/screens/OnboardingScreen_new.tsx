import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModernTheme } from '../context/ModernThemeContext';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const { width, height } = Dimensions.get('window');

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { colors } = useModernTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.colors?.background || '#FFFFFF' }]}>
      <View style={styles.content}>
        {/* Logo and Welcome */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.colors?.text || '#1E293B' }]}>
            Welcome to TownTap
          </Text>
          <Text style={[styles.subtitle, { color: colors.colors?.textSecondary || '#64748B' }]}>
            Discover local businesses near you with real-time updates
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.colors?.primary || '#3B82F6' }]}>
              <Text style={styles.featureIconText}>🏪</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.colors?.text || '#1E293B' }]}>
              Local Businesses
            </Text>
            <Text style={[styles.featureDesc, { color: colors.colors?.textSecondary || '#64748B' }]}>
              Find restaurants, shops, and services within 20km
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.colors?.secondary || '#34D399' }]}>
              <Text style={styles.featureIconText}>⚡</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.colors?.text || '#1E293B' }]}>
              Real-time Updates
            </Text>
            <Text style={[styles.featureDesc, { color: colors.colors?.textSecondary || '#64748B' }]}>
              Live business status, ratings, and availability
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.colors?.accent || '#F59E0B' }]}>
              <Text style={styles.featureIconText}>🚚</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.colors?.text || '#1E293B' }]}>
              Easy Ordering
            </Text>
            <Text style={[styles.featureDesc, { color: colors.colors?.textSecondary || '#64748B' }]}>
              Order food, book services, and track deliveries
            </Text>
          </View>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          style={[styles.getStartedButton, { backgroundColor: colors.colors?.primary || '#3B82F6' }]}
          onPress={onComplete}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={[styles.skipText, { color: colors.colors?.textSecondary || '#64748B' }]}>
          Start exploring local businesses right away!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginBottom: 48,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 32,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  getStartedButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  skipText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default OnboardingScreen;
