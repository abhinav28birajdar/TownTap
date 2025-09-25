import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, UserType } from '../../types';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { signUp, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'customer' as UserType,
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        full_name: formData.fullName.trim(),
        user_type: formData.userType,
        phone_number: formData.phoneNumber.trim() || undefined,
        onboarding_completed: false,
      };

      const result = await signUp(formData.email.trim(), formData.password, userData);
      
      if (result.error) {
        Alert.alert('Sign Up Failed', result.error);
      } else {
        Alert.alert(
          'Account Created',
          'Your account has been created successfully. Please check your email for verification.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUserTypeSelect = (userType: UserType) => {
    setFormData(prev => ({ ...prev, userType }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Join TownTap and start exploring
            </Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              I am a...
            </Text>
            <View style={styles.userTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  { 
                    backgroundColor: formData.userType === 'customer' 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                    borderColor: formData.userType === 'customer' 
                      ? theme.colors.primary 
                      : theme.colors.border,
                  }
                ]}
                onPress={() => handleUserTypeSelect('customer')}
              >
                <Text style={[
                  styles.userTypeText,
                  { 
                    color: formData.userType === 'customer' 
                      ? '#FFFFFF' 
                      : theme.colors.text,
                  }
                ]}>
                  Customer
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  { 
                    backgroundColor: formData.userType === 'business_owner' 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                    borderColor: formData.userType === 'business_owner' 
                      ? theme.colors.primary 
                      : theme.colors.border,
                  }
                ]}
                onPress={() => handleUserTypeSelect('business_owner')}
              >
                <Text style={[
                  styles.userTypeText,
                  { 
                    color: formData.userType === 'business_owner' 
                      ? '#FFFFFF' 
                      : theme.colors.text,
                  }
                ]}>
                  Business Owner
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              error={errors.fullName}
              style={styles.input}
            />

            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              style={styles.input}
            />

            <Input
              label="Phone Number (Optional)"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              style={styles.input}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              error={errors.password}
              style={styles.input}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              error={errors.confirmPassword}
              style={styles.input}
            />

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={[
                styles.checkbox,
                { 
                  backgroundColor: acceptedTerms ? theme.colors.primary : 'transparent',
                  borderColor: acceptedTerms ? theme.colors.primary : theme.colors.border,
                }
              ]}>
                {acceptedTerms && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                  I agree to the{' '}
                  <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
            {errors.terms && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {errors.terms}
              </Text>
            )}

            <Button
              title="Create Account"
              onPress={handleSignUp}
              variant="primary"
              size="large"
              loading={loading}
              disabled={loading}
              style={styles.signUpButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.signInLink, { color: theme.colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  userTypeSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    marginBottom: 30,
  },
  input: {
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: -16,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  signUpButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignUpScreen;