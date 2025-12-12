import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedText } from '@/components/ui/themed-text-enhanced';
import { Spacing } from '@/constants/spacing';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push('/auth/role-selection');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo Container */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoBox}>
            <ThemedText variant="displayLarge" style={styles.logo}>🏘️</ThemedText>
          </View>
        </View>

        {/* Title */}
        <ThemedText variant="displayMedium" weight="bold" style={styles.appName}>
          Welcome to TownTap
        </ThemedText>

        {/* Subtitle */}
        <ThemedText variant="titleMedium" style={styles.tagline}>
          Connect With Your Local Businesses
        </ThemedText>

        {/* Description */}
        <ThemedText variant="bodyMedium" style={styles.description}>
          Discover trusted shops, services, and professionals right in your neighborhood.
        </ThemedText>

        {/* Features List */}
        <View style={styles.features}>
          <FeatureItem
            emoji="🔍"
            title="Find anything instantly"
            subtitle="salons, plumbers, electricians, cafés & more"
          />
          <FeatureItem
            emoji="📍"
            title="Location smart"
            subtitle="see nearby services with accurate GPS"
          />
          <FeatureItem
            emoji="🖤"
            title="Personalized for you"
            subtitle="favorites, categories, and smart suggestions"
          />
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Next Button */}
        <ThemedButton
          title="Next"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          fullWidth
          style={styles.button}
        />
      </ScrollView>
    </View>
  );
}

const FeatureItem = ({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) => (
  <View style={styles.featureItem}>
    <ThemedText variant="headlineMedium" style={styles.featureEmoji}>{emoji}</ThemedText>
    <View style={styles.featureTextContainer}>
      <ThemedText variant="titleMedium" weight="semibold" style={styles.featureTitle}>
        {title} —
      </ThemedText>
      <ThemedText variant="bodySmall" style={styles.featureSubtitle}>
        {subtitle}
      </ThemedText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8E6C9', // Light green background from the image
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: Spacing.xl,
  },
  logoBox: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    fontSize: 72,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    color: '#2E7D32',
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: '#424242',
    marginBottom: Spacing.xxl,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  features: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  featureEmoji: {
    fontSize: 28,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    color: '#1B5E20',
    marginBottom: 2,
    fontWeight: '600',
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 18,
  },
  pagination: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A5D6A7',
  },
  dotActive: {
    backgroundColor: '#2E7D32',
    width: 24,
  },
  button: {
    width: '100%',
    backgroundColor: '#2E7D32',
  },
});
