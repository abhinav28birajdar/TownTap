import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark, Colors.secondary]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏪</Text>
          <Text style={styles.appName}>TownTap</Text>
          <Text style={styles.tagline}>
            Connect with local businesses in your neighborhood
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem icon="🔍" text="Discover local services" />
          <FeatureItem icon="📍" text="Track orders in real-time" />
          <FeatureItem icon="⭐" text="Read trusted reviews" />
          <FeatureItem icon="💳" text="Easy & secure payments" />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={() => router.push('/auth/role-selection')}
            variant="primary"
            size="large"
            fullWidth
            style={styles.primaryButton}
          />
          <Button
            title="Sign In"
            onPress={() => router.push('/auth/sign-in')}
            variant="outline"
            size="large"
            fullWidth
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSize.xxxl + 8,
    fontWeight: FontWeight.bold,
    color: Colors.background,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.background,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: Spacing.lg,
  },
  features: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    fontSize: FontSize.xxl,
  },
  featureText: {
    fontSize: FontSize.md,
    color: Colors.background,
    fontWeight: FontWeight.medium,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.background,
  },
  secondaryButton: {
    borderColor: Colors.background,
    borderWidth: 2,
  },
});
