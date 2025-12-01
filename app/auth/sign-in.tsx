import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';

// Import our modern UI components
import { Text } from '@/components/ui/Text';
import { Button, IconButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/loading-screen';

// Import form validation
import { useFormWithValidation } from '@/hooks/use-form-validation';
import { signInSchema, SignInFormData } from '@/lib/validation-schemas';

// Import theme and auth
import { useTheme, getThemeColors } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/auth-context';
import { Gradients } from '@/constants/colors';
import { BorderRadius, Shadows } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Enhanced form handling with validation
  const form = useFormWithValidation(signInSchema, {
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    successMessage: 'Welcome back! 🎉',
  });

  // Quick demo functions
  const handleDemoLogin = (type: 'customer' | 'business') => {
    const demoCredentials = {
      customer: { email: 'customer@demo.com', password: 'demo123' },
      business: { email: 'business@demo.com', password: 'demo123' },
    };
    
    const { email, password } = demoCredentials[type];
    form.setValue('email', email);
    form.setValue('password', password);
  };

  const handleSignIn = async (data: SignInFormData) => {
    try {
      await signIn(data.email, data.password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: 'Sign In',
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
          {/* Animated Logo Section */}
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: -50 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 200 }}
            style={styles.logoContainer}
          >
            <Text style={styles.logo}>🏘️</Text>
            <Text variant="display-small" style={styles.title}>
              Welcome Back
            </Text>
            <Text variant="body-large" style={styles.subtitle}>
              Sign in to continue to TownTap
            </Text>
          </MotiView>

          {/* Modern Form Card */}
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 400 }}
          >
            <Card variant="elevated" style={styles.formCard}>
              <View style={styles.form}>
                {/* Email Input */}
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
                  error={form.isFieldInvalid('email')}
                  helperText={form.getFieldError('email')}
                  style={styles.input}
                />

                {/* Password Input */}
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={form.watch('password')}
                  onChangeText={(text) => form.setValue('password', text)}
                  onBlur={() => form.trigger('password')}
                  secureTextEntry={!showPassword}
                  leftIcon="lock-closed"
                  rightIcon={showPassword ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  error={form.isFieldInvalid('password')}
                  helperText={form.getFieldError('password')}
                  style={styles.input}
                />

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity 
                    style={styles.rememberMeContainer}
                    onPress={() => {
                      setRememberMe(!rememberMe);
                      form.setValue('rememberMe', !rememberMe);
                    }}
                  >
                    <View style={[
                      styles.checkbox, 
                      rememberMe && styles.checkboxChecked
                    ]}>
                      {rememberMe && (
                        <Ionicons name="checkmark" size={12} color={colors.primaryForeground} />
                      )}
                    </View>
                    <Text variant="body-small" style={styles.rememberMeText}>
                      Remember me
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push('/auth/forgot-password')}
                  >
                    <Text variant="body-small" style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => form.submitWithToast(handleSignIn)}
                  disabled={form.isSubmitting}
                  style={styles.signInButton}
                >
                  {form.isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>

                {/* Demo Section */}
                <View style={styles.demoSection}>
                  <Text variant="label-medium" style={styles.demoTitle}>
                    Quick Demo Access:
                  </Text>
                  <View style={styles.demoButtons}>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleDemoLogin('customer')}
                      style={styles.demoButton}
                    >
                      👤 Customer Demo
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleDemoLogin('business')}
                      style={styles.demoButton}
                    >
                      🏢 Business Demo
                    </Button>
                  </View>
                </View>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text variant="body-medium" style={styles.signUpText}>
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/auth/role-selection')}>
                    <Text variant="body-medium" style={styles.signUpLink}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </MotiView>

          {/* Social Login Options (Optional) */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 600 }}
            style={styles.socialContainer}
          >
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text variant="body-small" style={styles.dividerText}>
                Or continue with
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.socialButtons}>
              <IconButton
                icon="logo-google"
                variant="outline"
                size="lg"
                style={styles.socialButton}
                onPress={() => {
                  // TODO: Implement Google Sign-In
                  Alert.alert('Coming Soon', 'Google Sign-In will be available soon!');
                }}
              />
              
              <IconButton
                icon="logo-apple"
                variant="outline"
                size="lg"
                style={styles.socialButton}
                onPress={() => {
                  // TODO: Implement Apple Sign-In
                  Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
                }}
              />
            </View>
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.md,
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
  input: {
    marginBottom: Spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  rememberMeText: {
    color: '#64748B',
  },
  forgotPasswordText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  signInButton: {
    marginBottom: Spacing.lg,
  },
  demoSection: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginBottom: Spacing.lg,
  },
  demoTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
    color: '#64748B',
  },
  demoButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  demoButton: {
    flex: 1,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#64748B',
  },
  signUpLink: {
    color: '#2563EB',
    fontWeight: '600',
  },
  socialContainer: {
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});