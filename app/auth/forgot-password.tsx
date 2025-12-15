import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Import our modern UI components
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Import form validation
import { useFormWithValidation } from '@/hooks/use-form-validation';
import { ForgotPasswordFormData, forgotPasswordSchema } from '@/lib/validation-schemas';

// Import theme and constants
import { Gradients, Shadows } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { getThemeColors, useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const [emailSent, setEmailSent] = useState(false);

  // Enhanced form handling with validation
  const form = useFormWithValidation(forgotPasswordSchema, {
    defaultValues: {
      email: '',
    },
    successMessage: 'Password reset email sent! 📧',
  });

  const handleResetPassword = async (data: ForgotPasswordFormData) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: 'towntap://reset-password',
      });

      if (error) throw error;

      setEmailSent(true);
      setEmailSent(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset email. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: 'Forgot Password',
          headerTransparent: true,
          headerTintColor: colors.primaryForeground,
        }}
      />

      <LinearGradient
        colors={Gradients.primary}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!emailSent ? (
            <>
              {/* Animated Icon */}
              <MotiView
                from={{ opacity: 0, scale: 0.5, rotate: '45deg' }}
                animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
                transition={{ type: 'spring', delay: 200 }}
                style={styles.iconContainer}
              >
                <Text style={styles.lockIcon}>🔐</Text>
              </MotiView>

              {/* Title Section */}
              <MotiView
                from={{ opacity: 0, translateY: -30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: 400 }}
                style={styles.header}
              >
                <Text variant="display-small" style={styles.title}>
                  Forgot Password?
                </Text>
                <Text variant="body-large" style={styles.subtitle}>
                  Enter your email address and we'll send you a link to reset your password
                </Text>
              </MotiView>

              {/* Form Card */}
              <MotiView
                from={{ opacity: 0, translateY: 50 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', delay: 600 }}
              >
                <Card variant="elevated" style={styles.formCard}>
                  <View style={styles.form}>
                    <Input
                      label="Email Address"
                      placeholder="Enter your email"
                      value={form.watch('email')}
                      onChangeText={(text) => form.setValue('email', text)}
                      onBlur={() => form.trigger('email')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      leftIcon="mail"
                      error={form.isFieldInvalid('email') ? form.getFieldError('email') || 'Invalid email' : undefined}
                      hint={form.getFieldError('email')}
                      containerStyle={styles.input}
                    />

                    <Button
                      variant="primary"
                      size="lg"
                      onPress={() => form.submitWithToast(handleResetPassword)}
                      disabled={form.isSubmitting}
                      style={styles.resetButton}
                    >
                      {form.isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                    <TouchableOpacity
                      onPress={() => router.back()}
                      style={styles.backToSignIn}
                    >
                      <Text variant="body-medium" style={styles.backToSignInText}>
                        ← Back to Sign In
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </MotiView>
            </>
          ) : (
            /* Success State */
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              style={styles.successContainer}
            >
              <Text style={styles.successIcon}>📧</Text>
              <Text variant="display-small" style={styles.successTitle}>
                Check Your Email
              </Text>
              <Text variant="body-large" style={styles.successSubtitle}>
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </Text>

              <Button
                variant="secondary"
                size="lg"
                onPress={() => router.back()}
                style={styles.doneButton}
              >
                Back to Sign In
              </Button>

              <TouchableOpacity
                onPress={() => setEmailSent(false)}
                style={styles.resendContainer}
              >
                <Text variant="body-small" style={styles.resendText}>
                  Didn't receive the email? Try again
                </Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  lockIcon: {
    fontSize: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  formCard: {
    ...Shadows.xl,
  },
  form: {
    padding: Spacing.lg,
  },
  input: {
    marginBottom: Spacing.lg,
  },
  resetButton: {
    marginBottom: Spacing.md,
  },
  backToSignIn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  backToSignInText: {
    color: '#64748B',
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  successTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: '700',
  },
  successSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  doneButton: {
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
});
