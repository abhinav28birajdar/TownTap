import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../stores/authStore';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'customer' | 'business'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUp } = useAuthStore();

  const validateForm = () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !fullName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        user_type: userType,
      };

      await signUp(email.trim().toLowerCase(), password, userData);
      
      Alert.alert(
        'Success',
        'Account created successfully! Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Sign Up Failed',
        error instanceof Error ? error.message : 'An error occurred during sign up'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable style={styles.backButton} onPress={navigateBack}>
                <Text style={styles.backButtonText}>← Back</Text>
              </Pressable>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join TownTap community</Text>
            </View>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <Text style={styles.sectionLabel}>I am a:</Text>
              <View style={styles.userTypeButtons}>
                <Pressable
                  style={[
                    styles.userTypeButton,
                    userType === 'customer' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType('customer')}
                >
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      userType === 'customer' && styles.userTypeButtonTextActive,
                    ]}
                  >
                    Customer
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.userTypeButton,
                    userType === 'business' && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType('business')}
                >
                  <Text
                    style={[
                      styles.userTypeButtonText,
                      userType === 'business' && styles.userTypeButtonTextActive,
                    ]}
                  >
                    Business Owner
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[
                  styles.signUpButton,
                  isLoading && styles.signUpButtonDisabled,
                ]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#667eea" size="small" />
                ) : (
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                )}
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                style={styles.guestButton}
                onPress={() => router.replace('/(tabs)')}
              >
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </Pressable>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={navigateToLogin}>
                <Text style={styles.footerLink}>Sign In</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  userTypeContainer: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userTypeButtonActive: {
    backgroundColor: '#ffffff',
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  userTypeButtonTextActive: {
    color: '#667eea',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeButtonText: {
    fontSize: 18,
  },
  signUpButton: {
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 16,
  },
  guestButton: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footerLink: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});