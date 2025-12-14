import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Spacing } from '@/constants/spacing';

type Role = 'customer' | 'business_owner' | null;

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    router.push(`/auth/sign-up?role=${selectedRole}`);
  };

  const handleDemoCustomer = () => {
    router.replace('/(tabs)/home');
  };

  const handleDemoOwner = () => {
    router.replace('/business-owner/dashboard');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoBox}>
            <Text style={styles.logo}>🏘️</Text>
            <Text style={styles.logoText}>TownTap</Text>
          </View>
        </View>

        <Text style={styles.title}>Join TownTap</Text>
        <Text style={styles.subtitle}>How would you like to use TownTap?</Text>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {/* Customer Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'customer' && styles.roleCardSelected,
            ]}
            onPress={() => setSelectedRole('customer')}
            activeOpacity={0.7}
          >
            <View style={styles.roleIconWrapper}>
              <View style={[styles.roleIconCircle, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="person" size={48} color="#2196F3" />
              </View>
            </View>
            <Text style={styles.roleTitle}>I'm a Customer</Text>
            <Text style={styles.roleDescription}>
              Book services from local businesses in your area
            </Text>
            {selectedRole === 'customer' && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>

          {/* Business Owner Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'business_owner' && styles.roleCardSelected,
            ]}
            onPress={() => setSelectedRole('business_owner')}
            activeOpacity={0.7}
          >
            <View style={styles.roleIconWrapper}>
              <View style={[styles.roleIconCircle, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="briefcase" size={48} color="#FF9800" />
              </View>
            </View>
            <Text style={styles.roleTitle}>I'm a Business Owner</Text>
            <Text style={styles.roleDescription}>
              Offer your services and grow your business
            </Text>
            {selectedRole === 'business_owner' && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Section */}
        <View style={styles.demoSection}>
          <View style={styles.demoDivider}>
            <View style={styles.demoDividerLine} />
            <Text style={styles.demoDividerText}>TRY DEMO</Text>
            <View style={styles.demoDividerLine} />
          </View>
          <View style={styles.demoButtons}>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoCustomer}
              activeOpacity={0.7}
            >
              <Text style={styles.demoButtonIcon}>🛍️</Text>
              <Text style={styles.demoButtonText}>Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoOwner}
              activeOpacity={0.7}
            >
              <Text style={styles.demoButtonIcon}>🏪</Text>
              <Text style={styles.demoButtonText}>Business</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8E6C9',
  },
  scrollView: {
    flex: 1,
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
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    fontSize: 42,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    marginBottom: Spacing.xxl,
    textAlign: 'center',
  },
  rolesContainer: {
    width: '100%',
    maxWidth: 380,
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roleCardSelected: {
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
  },
  roleIconWrapper: {
    marginBottom: Spacing.md,
  },
  roleIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: Spacing.sm,
  },
  roleDescription: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  continueButton: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#5B9BD5',
    borderRadius: 16,
    paddingVertical: Spacing.md + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    shadowColor: '#5B9BD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#616161',
    fontSize: 14,
  },
  signInLink: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  demoSection: {
    width: '100%',
    maxWidth: 380,
    marginTop: Spacing.lg,
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  demoDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(27, 94, 32, 0.3)',
  },
  demoDividerText: {
    color: '#1B5E20',
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: Spacing.md,
    letterSpacing: 1,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  demoButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(27, 94, 32, 0.3)',
    borderRadius: 16,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  demoButtonText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '600',
  },
});
