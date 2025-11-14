import { Button } from '@/components/ui/button';
import { DemoModeToggle } from '@/components/ui/demo-toggle';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, Spacing } from '@/constants/spacing';
import { useDemo } from '@/contexts/demo-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const { isDemo, setDemo } = useDemo();

  const handleGetStarted = () => {
    if (isDemo) {
      setDemo(true);
      router.replace('/(tabs)/home');
    } else {
      router.push('/auth/role-selection');
    }
  };

  const handleSignIn = () => {
    if (isDemo) {
      setDemo(true);
      router.replace('/(tabs)/home');
    } else {
      router.push('/auth/sign-in');
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark, Colors.secondary]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏘️</Text>
          <Text style={styles.appName}>TownTap</Text>
          <Text style={styles.tagline}>
            Your Local Service Marketplace
          </Text>
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

        <DemoModeToggle />

        <View style={styles.buttonContainer}>
          <Button
            title={isDemo ? "Enter Demo Mode" : "Get Started"}
            onPress={handleGetStarted}
            variant="secondary"
            size="large"
            style={styles.button}
          />
          <Button
            title={isDemo ? "Demo Dashboard" : "Sign In"}
            onPress={handleSignIn}
            variant="outline"
            size="large"
            style={styles.button}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const FeatureItem = ({ emoji, text }: { emoji: string; text: string }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={styles.featureText}>{text}</Text>
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