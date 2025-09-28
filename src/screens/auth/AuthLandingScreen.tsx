import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AuthLandingScreen() {
  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  const navigateToSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo and App Name */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>TT</Text>
            </View>
            <Text style={styles.appName}>TownTap</Text>
            <Text style={styles.tagline}>Connect with local businesses</Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <FeatureItem 
              icon="🏪" 
              text="Discover local businesses" 
            />
            <FeatureItem 
              icon="📱" 
              text="Easy online ordering" 
            />
            <FeatureItem 
              icon="🚚" 
              text="Fast delivery & pickup" 
            />
            <FeatureItem 
              icon="💰" 
              text="Exclusive local deals" 
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.loginButton]}
              onPress={navigateToLogin}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.signupButton]}
              onPress={navigateToSignUp}
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </Pressable>

            <Pressable
              style={styles.guestButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: string;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  featuresContainer: {
    marginTop: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#ffffff',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  signupButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  guestButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
});