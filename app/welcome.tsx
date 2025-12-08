import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedText } from '@/components/ui/themed-text-enhanced';
import { Spacing } from '@/constants/spacing';
import { useColors } from '@/contexts/theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function WelcomeScreen() {
  const colors = useColors();

  const handleGetStarted = () => {
    router.push('/auth/role-selection');
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark, colors.secondary]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <ThemedText variant="displayLarge" style={styles.logo}>🏘️</ThemedText>
          <ThemedText variant="displayMedium" color="inverse" weight="bold" style={styles.appName}>
            TownTap
          </ThemedText>
          <ThemedText variant="titleLarge" color="inverse" style={styles.tagline}>
            Your Local Service Marketplace
          </ThemedText>
        </View>

        <View style={styles.features}>
          <FeatureItem
            emoji="🔍"
            text="Discover local businesses and services"
          />
          <FeatureItem
            emoji="📅"
            text="Book appointments instantly"
          />
          <FeatureItem
            emoji="⭐"
            text="Read reviews and ratings"
          />
          <FeatureItem
            emoji="💳"
            text="Secure payment options"
          />
          <FeatureItem
            emoji="📍"
            text="Real-time tracking"
          />
        </View>

        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Get Started"
            onPress={handleGetStarted}
            variant="secondary"
            size="large"
            fullWidth
            style={styles.button}
          />
          <ThemedButton
            title="Sign In"
            onPress={handleSignIn}
            variant="outline"
            size="large"
            fullWidth
            style={styles.button}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const FeatureItem = ({ emoji, text }: { emoji: string; text: string }) => (
  <View style={styles.featureItem}>
    <ThemedText variant="headlineMedium" style={styles.featureEmoji}>{emoji}</ThemedText>
    <ThemedText variant="bodyLarge" color="inverse" style={styles.featureText}>{text}</ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 100,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSize.xxxl + 8,
    fontWeight: '700',
    color: Colors.card,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSize.lg,
    color: Colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  features: {
    marginBottom: Spacing.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.card,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
});