import { ThemedButton, ThemedInput, ThemedText } from '@/components/ui';
import { Spacing } from '@/constants/spacing';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ResetPasswordScreen() {
  const colors = useColors();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleResetPassword = async () => {
    // Validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert('Invalid Password', passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      // TODO: Implement actual password reset with Supabase
      // const { error } = await supabase.auth.updateUser({
      //   password: newPassword,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        'Your password has been reset successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/sign-in'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: colors.textTertiary };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 1, label: 'Weak', color: colors.error };
    if (strength <= 3) return { strength: 2, label: 'Medium', color: colors.warning };
    return { strength: 3, label: 'Strong', color: colors.success };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Header Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="lock-closed-outline" size={60} color="#fff" />
        </View>

        {/* Title */}
        <ThemedText type="h1" weight="bold" style={styles.title}>
          Reset Password
        </ThemedText>

        {/* Subtitle */}
        <ThemedText style={styles.subtitle}>
          Create a new secure password for your account
        </ThemedText>

        {/* New Password Input */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>New Password</ThemedText>
          <View style={{ position: 'relative' }}>
            <ThemedInput
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={{ position: 'absolute', right: 12, top: 12 }}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                {[1, 2, 3].map((bar) => (
                  <View
                    key={bar}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          bar <= passwordStrength.strength
                            ? passwordStrength.color
                            : colors.border,
                      },
                    ]}
                  />
                ))}
              </View>
              <ThemedText style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Confirm Password</ThemedText>
          <View style={{ position: 'relative' }}>
            <ThemedInput
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={{ position: 'absolute', right: 12, top: 12 }}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {confirmPassword.length > 0 && confirmPassword !== newPassword && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <ThemedText style={[styles.errorText, { color: colors.error }]}>
                Passwords do not match
              </ThemedText>
            </View>
          )}
        </View>

        {/* Password Requirements */}
        <View style={[styles.requirementsCard, { backgroundColor: colors.muted }]}>
          <ThemedText weight="bold" style={styles.requirementsTitle}>
            Password must contain:
          </ThemedText>
          <View style={styles.requirement}>
            <Ionicons
              name={newPassword.length >= 8 ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={newPassword.length >= 8 ? colors.success : colors.textTertiary}
            />
            <ThemedText style={styles.requirementText}>At least 8 characters</ThemedText>
          </View>
          <View style={styles.requirement}>
            <Ionicons
              name={/[A-Z]/.test(newPassword) ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={/[A-Z]/.test(newPassword) ? colors.success : colors.textTertiary}
            />
            <ThemedText style={styles.requirementText}>One uppercase letter</ThemedText>
          </View>
          <View style={styles.requirement}>
            <Ionicons
              name={/[a-z]/.test(newPassword) ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={/[a-z]/.test(newPassword) ? colors.success : colors.textTertiary}
            />
            <ThemedText style={styles.requirementText}>One lowercase letter</ThemedText>
          </View>
          <View style={styles.requirement}>
            <Ionicons
              name={/[0-9]/.test(newPassword) ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={/[0-9]/.test(newPassword) ? colors.success : colors.textTertiary}
            />
            <ThemedText style={styles.requirementText}>One number</ThemedText>
          </View>
        </View>

        {/* Reset Button */}
        <ThemedButton
          title={loading ? 'Resetting Password...' : 'Reset Password'}
          onPress={handleResetPassword}
          disabled={
            loading ||
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword ||
            validatePassword(newPassword) !== null
          }
          style={styles.resetButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  strengthContainer: {
    marginTop: Spacing.sm,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: 12,
  },
  requirementsCard: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  requirementsTitle: {
    marginBottom: Spacing.md,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  requirementText: {
    fontSize: 14,
  },
  resetButton: {
    marginTop: Spacing.md,
  },
});
