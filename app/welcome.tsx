import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/ui/themed-button';
import { Spacing } from '@/constants/spacing';
import { BorderRadius, FontSize } from '@/constants/theme';
import { useColors } from '@/contexts/theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function WelcomeScreen() {
  const colors = useColors();

  const handleGetStarted = useCallback(() => {
    try {
      router.push('/auth/role-selection');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);

  const handleSignIn = useCallback(() => {
    try {
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);

  const handleDemoCustomer = useCallback(() => {
    try {
      // Clear navigation stack and go to home
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);

  const handleDemoOwner = useCallback(() => {
    try {
      // Clear navigation stack and go to business owner dashboard
      router.replace('/business-owner/dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);

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
          <ThemedText type="h1" style={styles.logo}>🏘️</ThemedText>
          <ThemedText type="h2" weight="bold" style={styles.appName}>
            TownTap
          </ThemedText>
          <ThemedText type="subtitle" style={styles.tagline}>
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
          
          {/* Demo Buttons */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>OR TRY DEMO</ThemedText>
            <View style={styles.dividerLine} />
          </View>
          
          <ThemedButton
            title="🛍️ Demo as Customer"
            onPress={handleDemoCustomer}
            variant="outline"
            size="large"
            fullWidth
            style={[styles.button, styles.demoButton]}
          />
          <ThemedButton
            title="🏪 Demo as Business Owner"
            onPress={handleDemoOwner}
            variant="outline"
            size="large"
            fullWidth
            style={[styles.button, styles.demoButton]}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const FeatureItem = ({ emoji, text }: { emoji: string; text: string }) => (
  <View style={styles.featureItem}>
    <ThemedText type="h3" style={styles.featureEmoji}>{emoji}</ThemedText>
    <ThemedText type="body1" style={styles.featureText}>{text}</ThemedText>
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
    fontSize: FontSize['3xl'] + 8,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSize.lg,
    color: '#ffffff',
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
    fontSize: FontSize.base,
    color: '#ffffff',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  demoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});