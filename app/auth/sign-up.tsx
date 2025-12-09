import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

// Import our modern UI components
import { ThemedButton, ThemedCard, ThemedInput, ThemedText } from '@/components/ui';

// Import form validation
import { useFormWithValidation } from '@/hooks/use-form-validation';
import { SignUpFormData, signUpSchema } from '@/lib/validation-schemas';

// Import theme and auth
import { Gradients, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';

export default function SignUpScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { signUp } = useAuth();
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Enhanced form handling with validation
  const form = useFormWithValidation(signUpSchema, {
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      termsAccepted: false,
      marketingOptIn: false,
    },
    successMessage: 'Account created successfully! 🎉',
  });

  const userRole = (role as 'customer' | 'business_owner') || 'customer';

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      await signUp(
        data.email,
        data.password,
        `${data.firstName} ${data.lastName}`,
        data.phone || '',
        userRole
      );
      
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account. Please try again.');
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: 'Create Account',
          headerTransparent: true,
          headerTintColor: colors.textInverse,
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
          {/* Animated Header */}
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: -50 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 200 }}
            style={styles.header}
          >
            <ThemedText style={styles.logo}>🏘️</ThemedText>
            <ThemedText variant="displaySmall" style={styles.title}>
              Create Account
            </ThemedText>
            <ThemedText variant="bodyLarge" style={styles.subtitle}>
              Join TownTap as {userRole === 'business_owner' ? 'Business Owner' : 'Customer'}
            </ThemedText>
          </MotiView>

          {/* Modern Form ThemedCard */}
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 400 }}
          >
            <ThemedCard variant="elevated" style={styles.formCard}>
              <View style={styles.form}>
                {/* Name Fields */}
                <View style={styles.nameRow}>
                  <ThemedInput
                    label="First Name"
                    placeholder="John"
                    value={form.watch('firstName')}
                    onChangeText={(text) => form.setValue('firstName', text)}
                    onBlur={() => form.trigger('firstName')}
                    leftIcon="person"
                    error={form.isFieldInvalid('firstName') ? form.getFieldError('firstName') : undefined}
                    helperText={form.getFieldError('firstName')}
                    style={[styles.input, styles.nameInput]}
                  />
                  
                  <ThemedInput
                    label="Last Name"
                    placeholder="Doe"
                    value={form.watch('lastName')}
                    onChangeText={(text) => form.setValue('lastName', text)}
                    onBlur={() => form.trigger('lastName')}
                    leftIcon="person"
                    error={form.isFieldInvalid('lastName') ? form.getFieldError('lastName') : undefined}
                    helperText={form.getFieldError('lastName')}
                    style={[styles.input, styles.nameInput]}
                  />
                </View>

                {/* Email ThemedInput */}
                <ThemedInput
                  label="Email Address"
                  placeholder="john.doe@example.com"
                  value={form.watch('email')}
                  onChangeText={(text) => form.setValue('email', text)}
                  onBlur={() => form.trigger('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon="mail"
                  error={form.isFieldInvalid('email') ? form.getFieldError('email') : undefined}
                  helperText={form.getFieldError('email')}
                  style={styles.input}
                />

                {/* Phone ThemedInput */}
                <ThemedInput
                  label="Phone Number (Optional)"
                  placeholder="(555) 123-4567"
                  value={form.watch('phone')}
                  onChangeText={(text) => form.setValue('phone', text)}
                  onBlur={() => form.trigger('phone')}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  leftIcon="call"
                  error={form.isFieldInvalid('phone') ? form.getFieldError('phone') : undefined}
                  helperText={form.getFieldError('phone')}
                  style={styles.input}
                />

                {/* Password Fields */}
                <ThemedInput
                  label="Password"
                  placeholder="Create a strong password"
                  value={form.watch('password')}
                  onChangeText={(text) => form.setValue('password', text)}
                  onBlur={() => form.trigger('password')}
                  secureTextEntry={!showPassword}
                  leftIcon="lock-closed"
                  rightIcon={showPassword ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  error={form.isFieldInvalid('password') ? form.getFieldError('password') : undefined}
                  helperText={form.getFieldError('password') || 'Must be at least 8 characters with uppercase, lowercase, and number'}
                  style={styles.input}
                />

                <ThemedInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={form.watch('confirmPassword')}
                  onChangeText={(text) => form.setValue('confirmPassword', text)}
                  onBlur={() => form.trigger('confirmPassword')}
                  secureTextEntry={!showConfirmPassword}
                  leftIcon="lock-closed"
                  rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  error={form.isFieldInvalid('confirmPassword') ? form.getFieldError('confirmPassword') : undefined}
                  helperText={form.getFieldError('confirmPassword')}
                  style={styles.input}
                />

                {/* Terms and Conditions */}
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => form.setValue('termsAccepted', !form.watch('termsAccepted'))}
                  >
                    <View style={[
                      styles.checkboxBox,
                      form.watch('termsAccepted') && styles.checkboxChecked
                    ]}>
                      {form.watch('termsAccepted') && (
                        <Ionicons name="checkmark" size={12} color={colors.textInverse} />
                      )}
                    </View>
                    <ThemedText variant="bodySmall" style={styles.checkboxText}>
                      I agree to the{' '}
                      <ThemedText style={styles.linkText}>Terms of Service</ThemedText>
                      {' '}and{' '}
                      <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>
                    </ThemedText>
                  </TouchableOpacity>
                  {form.isFieldInvalid('termsAccepted') && (
                    <ThemedText variant="bodySmall" style={styles.errorText}>
                      {form.getFieldError('termsAccepted')}
                    </ThemedText>
                  )}
                </View>

                {/* Marketing Opt-in */}
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => form.setValue('marketingOptIn', !form.watch('marketingOptIn'))}
                >
                  <View style={[
                    styles.checkboxBox,
                    form.watch('marketingOptIn') && styles.checkboxChecked
                  ]}>
                    {form.watch('marketingOptIn') && (
                      <Ionicons name="checkmark" size={12} color={colors.textInverse} />
                    )}
                  </View>
                  <ThemedText variant="bodySmall" style={styles.checkboxText}>
                    Send me updates and promotional offers
                  </ThemedText>
                </TouchableOpacity>

                {/* Sign Up ThemedButton */}
                <ThemedButton
                  variant="primary"
                  size="large"
                  onPress={() => form.submitWithToast(handleSignUp)}
                  disabled={form.isSubmitting}
                  style={styles.signUpButton}
                >
                  {form.isSubmitting ? 'Creating Account...' : 'Create Account'}
                </ThemedButton>

                {/* Sign In Link */}
                <View style={styles.signInContainer}>
                  <ThemedText variant="bodyMedium" style={styles.signInText}>
                    Already have an account?{' '}
                  </ThemedText>
                  <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
                    <ThemedText variant="bodyMedium" style={styles.signInLink}>
                      Sign In
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedCard>
          </MotiView>
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
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: 60,
    marginBottom: Spacing.sm,
  },
  title: {
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: Spacing.xl,
    ...Shadows.xl,
  },
  form: {
    padding: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    marginBottom: Spacing.md,
  },
  checkboxContainer: {
    marginBottom: Spacing.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: Spacing.sm,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxText: {
    flex: 1,
    color: '#64748B',
    lineHeight: 20,
  },
  linkText: {
    color: '#2563EB',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#EF4444',
    marginTop: Spacing.xs,
  },
  signUpButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#64748B',
  },
  signInLink: {
    color: '#2563EB',
    fontWeight: '600',
  },
});


