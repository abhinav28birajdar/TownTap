import { Button } from '@/components/ui/button';
import { BorderRadius, FontSize, Spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Role = 'customer' | 'business_owner' | null;

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    router.push(`/auth/sign-up?role=${selectedRole}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Choose Your Role',
          headerTransparent: true,
          headerTintColor: Colors.card,
        }}
      />

      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark, Colors.secondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Join TownTap</Text>
          <Text style={styles.subtitle}>How would you like to use TownTap?</Text>

          <View style={styles.rolesContainer}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'customer' && styles.roleCardSelected,
              ]}
              onPress={() => setSelectedRole('customer')}
            >
              <View style={styles.roleIcon}>
                <Ionicons name="person" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.roleTitle}>I'm a Customer</Text>
              <Text style={styles.roleDescription}>
                Book services from local businesses in your area
              </Text>
              {selectedRole === 'customer' && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'business_owner' && styles.roleCardSelected,
              ]}
              onPress={() => setSelectedRole('business_owner')}
            >
              <View style={styles.roleIcon}>
                <Ionicons name="briefcase" size={48} color={Colors.secondary} />
              </View>
              <Text style={styles.roleTitle}>I'm a Business Owner</Text>
              <Text style={styles.roleDescription}>
                Offer your services and grow your business
              </Text>
              {selectedRole === 'business_owner' && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Button
            title="Continue"
            onPress={handleContinue}
            variant="secondary"
            size="large"
            disabled={!selectedRole}
            style={styles.continueButton}
          />

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
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
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.card,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.card,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: Spacing.xxl,
  },
  rolesContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  roleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  roleCardSelected: {
    borderColor: Colors.success,
    backgroundColor: Colors.card,
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  roleTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  roleDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  continueButton: {
    marginBottom: Spacing.md,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: Colors.card,
    fontSize: FontSize.md,
  },
  signInLink: {
    color: Colors.card,
    fontSize: FontSize.md,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});