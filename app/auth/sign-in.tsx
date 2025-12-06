import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
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

// Import our modern UI components
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button, IconButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Import form validation
import { useFormWithValidation } from '@/hooks/use-form-validation';
import { SignInFormData, signInSchema } from '@/lib/validation-schemas';

// Import theme and auth
import { Gradients } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { getThemeColors, useTheme } from '@/hooks/use-theme';
import { performanceMonitor } from '@/lib/performance-monitor';
import { useBiometricAuth, useSecureStorage } from '@/lib/security-service';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastEmail, setLastEmail] = useState('');
  
  // Biometric authentication
  const { isAvailable: biometricAvailable, authenticate: authenticateBiometric, authTypes } = useBiometricAuth();
  const { retrieve: getStoredCredentials, store: storeCredentials } = useSecureStorage();
  
  // Check for stored credentials on mount
  React.useEffect(() => {
    loadStoredCredentials();
    performanceMonitor.trackNavigation('auth/sign-in');
  }, []);
  
  const loadStoredCredentials = async () => {
    try {
      const storedEmail = await getStoredCredentials('user_email');
      if (storedEmail) {
        setLastEmail(storedEmail);
        form.setValue('email', storedEmail);
      }
    } catch (error) {
      console.error('Failed to load stored credentials:', error);
    }
  };

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

  const handleBiometricSignIn = async () => {
    if (!biometricAvailable) {
      Alert.alert('Biometric Not Available', 'Biometric authentication is not available on this device.');
      return;
    }

    try {
      setIsLoading(true);
      performanceMonitor.trackUserInteraction('biometric_signin_attempt', 'sign_in_screen', true);

      const authResult = await authenticateBiometric({
        reason: 'Please authenticate to sign in to TownTap',
        fallbackLabel: 'Use password instead',
      });

      if (authResult.success) {
        // Get stored credentials after successful biometric auth
        const storedCredentials = await getStoredCredentials('user_credentials', {
          requireAuthentication: true,
          authenticationPrompt: 'Access your saved credentials',
        });

        if (storedCredentials) {
          const { email, password } = JSON.parse(storedCredentials);
          await signIn(email, password);
          performanceMonitor.trackUserInteraction('biometric_signin_success', 'sign_in_screen', true);
          router.replace('/(tabs)/home');
        } else {
          Alert.alert('No Saved Credentials', 'Please sign in with your email and password first.');
        }
      }
    } catch (error: any) {
      console.error('Biometric sign in error:', error);
      performanceMonitor.trackUserInteraction('biometric_signin_error', 'sign_in_screen', false);
      Alert.alert('Authentication Failed', error.message || 'Biometric authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: SignInFormData) => {
    const startTime = Date.now();
    setIsLoading(true);
    
    try {
      await signIn(data.email, data.password);
      
      // Store credentials securely if remember me is enabled
      if (data.rememberMe && biometricAvailable) {
        await storeCredentials('user_email', data.email);
        await storeCredentials('user_credentials', JSON.stringify({
          email: data.email,
          password: data.password,
        }), {
          requireAuthentication: true,
          authenticationPrompt: 'Save credentials for quick sign in',
        });
      }
      
      const duration = Date.now() - startTime;
      performanceMonitor.trackUserInteraction('email_signin_success', 'sign_in_screen', true, duration);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Sign in error:', error);
      performanceMonitor.trackUserInteraction('email_signin_error', 'sign_in_screen', false);
      throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

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
                  error={form.isFieldInvalid('email') ? form.getFieldError('email') || 'Invalid email' : undefined}
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
                  error={form.isFieldInvalid('password') ? form.getFieldError('password') || 'Invalid password' : undefined}
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
                  disabled={form.isSubmitting || isLoading}
                  style={styles.signInButton}
                >
                  {form.isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                {/* Biometric Authentication */}
                {biometricAvailable && lastEmail && (
                  <AnimatePresence>
                    <MotiView
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring' }}
                      style={styles.biometricContainer}
                    >
                      <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text variant="body-small" style={styles.dividerText}>
                          or
                        </Text>
                        <View style={styles.dividerLine} />
                      </View>
                      
                      <Button
                        variant="secondary"
                        size="lg"
                        onPress={handleBiometricSignIn}
                        disabled={isLoading}
                        style={styles.biometricButton}
                        leftIcon={
                          authTypes.includes(1) ? "finger-print" : 
                          authTypes.includes(2) ? "scan" : "shield-checkmark"
                        }
                      >
                        {authTypes.includes(1) ? 'Sign in with Touch ID' :
                         authTypes.includes(2) ? 'Sign in with Face ID' :
                         'Sign in with Biometrics'}
                      </Button>
                      
                      <Text variant="body-small" style={styles.biometricHint}>
                        Quick access as {lastEmail}
                      </Text>
                    </MotiView>
                  </AnimatePresence>
                )}

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
  biometricContainer: {
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: '#64748B',
    fontSize: 12,
  },
  biometricButton: {
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  biometricHint: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
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
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});