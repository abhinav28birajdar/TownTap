import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import { COLORS } from '../config/constants';
import { useAuthStore } from '../stores/authStore';

const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useAuthStore();

  const handleGetStarted = () => {
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to TownTap</Text>
        <Text style={styles.subtitle}>
          Your smart business companion for local commerce
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.feature}>🏪 Connect with local businesses</Text>
          <Text style={styles.feature}>📱 AI-powered business tools</Text>
          <Text style={styles.feature}>🚀 Boost your sales</Text>
          <Text style={styles.feature}>💼 Manage everything in one place</Text>
        </View>

        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    fontSize: 16,
    color: COLORS.gray[700],
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default OnboardingScreen;
