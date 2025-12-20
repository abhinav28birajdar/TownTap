import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

// Import our modern UI components
import { ThemedButton, ThemedInput, ThemedText } from '@/components/ui';

// Import form validation
import { useFormWithValidation } from '@/hooks/use-form-validation';
import { SignInFormData, signInSchema } from '@/lib/validation-schemas';

// Import theme and auth
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/auth-context';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Enhanced form handling with validation
  const form = useFormWithValidation(signInSchema, {
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    successMessage: 'Welcome back! 🎉',
  });

  const handleSignIn = useCallback(async (data: SignInFormData) => {
    try {
      await signIn(data.email, data.password);
      // Replace the entire stack to avoid back navigation to sign-in
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    }
  }, [signIn]);

  const handleDemoCustomer = useCallback(() => {
    try {
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);

  const handleDemoOwner = useCallback(() => {
    try {
      router.replace('/business-owner/dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Logo Container */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoBox}>
            <ThemedText type="h1" style={styles.logo}>🏘️</ThemedText>
          </View>
        </View>

        {/* Title */}
        <ThemedText type="h2" weight="bold" style={styles.title}>
          Hello Again
        </ThemedText>

        {/* Subtitle */}
        <ThemedText type="body1" style={styles.subtitle}>
          Welcome Back You've Been Missed!
        </ThemedText>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <ThemedText type="default" style={styles.label}>
              Email
            </ThemedText>
            <ThemedInput
              placeholder="example@gmail.com"
              value={form.watch('email')}
              onChangeText={(text) => form.setValue('email', text)}
              onBlur={() => form.trigger('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={form.isFieldInvalid('email') ? form.getFieldError('email') : undefined}
              style={styles.input}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <ThemedText type="default" style={styles.label}>
              Password
            </ThemedText>
            <ThemedInput
              placeholder="password"
              value={form.watch('password')}
              onChangeText={(text) => form.setValue('password', text)}
              onBlur={() => form.trigger('password')}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye-off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={form.isFieldInvalid('password') ? form.getFieldError('password') : undefined}
              style={styles.input}
            />
          </View>

          {/* Sign In Button */}
          <ThemedButton
            variant="primary"
            size="large"
            onPress={() => form.submitWithToast(handleSignIn)}
            disabled={form.isSubmitting}
            style={styles.signInButton}
          >
            {form.isSubmitting ? 'Signing In...' : 'Sign in'}
          </ThemedButton>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText type="caption" style={styles.dividerText}>
              or
            </ThemedText>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign In Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={28} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={28} color="#4267B2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <ThemedText type="default" style={styles.signUpText}>
            Don't have an account?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/auth/role-selection')}>
            <ThemedText type="default" style={styles.signUpLink}>
              Sign up
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Demo Buttons Section */}
        <View style={styles.demoSection}>
          <View style={styles.demoDivider}>
            <View style={styles.demoDividerLine} />
            <ThemedText style={styles.demoDividerText}>TRY DEMO</ThemedText>
            <View style={styles.demoDividerLine} />
          </View>

          <View style={styles.demoButtons}>
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={handleDemoCustomer}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.demoButtonIcon}>🛍️</ThemedText>
              <ThemedText style={styles.demoButtonText}>Customer</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.demoButton}
              onPress={handleDemoOwner}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.demoButtonIcon}>🏪</ThemedText>
              <ThemedText style={styles.demoButtonText}>Business</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8E6C9', // Light green background matching welcome screen
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: Spacing.lg,
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
    fontSize: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    marginBottom: Spacing.xxl,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    color: '#424242',
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  signInButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: '#5B9BD5',
    borderRadius: 12,
    height: 54,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#BDBDBD',
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: '#757575',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  signUpText: {
    color: '#616161',
  },
  signUpLink: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  demoSection: {
    width: '100%',
    maxWidth: 380,
    marginTop: Spacing.xl,
  },
  demoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  demoDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  demoDividerText: {
    marginHorizontal: Spacing.md,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.8,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  demoButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  demoButtonIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
