import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';

const { width } = Dimensions.get('window');

interface SignUpScreenProps {
  navigation: any;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { signUp, isLoading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'customer' as UserRole,
    businessName: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  });

  const [showBusinessFields, setShowBusinessFields] = useState(false);

  const validateForm = (): boolean => {
    const newErrors = { ...errors };
    let isValid = true;

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('auth.fullNameRequired');
      isValid = false;
    } else {
      newErrors.fullName = '';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid');
      isValid = false;
    } else {
      newErrors.email = '';
    }

    // Phone validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    if (!formData.phone) {
      newErrors.phone = t('auth.phoneRequired');
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = t('auth.phoneInvalid');
      isValid = false;
    } else {
      newErrors.phone = '';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength');
      isValid = false;
    } else {
      newErrors.password = '';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch');
      isValid = false;
    } else {
      newErrors.confirmPassword = '';
    }

    // Business name validation for business users
    if (showBusinessFields && !formData.businessName.trim()) {
      newErrors.businessName = t('auth.businessNameRequired');
      isValid = false;
    } else {
      newErrors.businessName = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        full_name: formData.fullName,
        phone_number: formData.phone,
        user_type: formData.userType,
        business_name: showBusinessFields ? formData.businessName : undefined,
      };

      await signUp(formData.email, formData.password, userData);
      // Navigation will be handled by the auth state change
    } catch (error) {
      Alert.alert(t('auth.signUpFailed'), error instanceof Error ? error.message : t('auth.genericError'));
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleUserTypeChange = (userType: UserRole) => {
    setFormData(prev => ({ ...prev, userType }));
    setShowBusinessFields(userType === 'business');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="person-add" size={60} color="#667eea" />
            </View>
            <Text style={styles.title}>{t('auth.createAccount')}</Text>
            <Text style={styles.subtitle}>{t('auth.signUpSubtitle')}</Text>
          </View>

          {/* Sign Up Form */}
          <Card style={styles.formCard} padding="large">
            <View style={styles.form}>
              {/* User Type Selection */}
              <View style={styles.userTypeContainer}>
                <Text style={styles.userTypeLabel}>{t('auth.accountType')}</Text>
                <View style={styles.userTypeButtons}>
                  <Button
                    title={t('auth.customer')}
                    onPress={() => handleUserTypeChange('customer')}
                    variant={formData.userType === 'customer' ? 'primary' : 'outline'}
                    style={styles.userTypeButton}
                    size="small"
                  />
                  <Button
                    title={t('auth.business')}
                    onPress={() => handleUserTypeChange('business')}
                    variant={formData.userType === 'business' ? 'primary' : 'outline'}
                    style={styles.userTypeButton}
                    size="small"
                  />
                </View>
              </View>

              <Input
                label={t('auth.fullName')}
                placeholder={t('auth.fullNamePlaceholder')}
                value={formData.fullName}
                onChangeText={(value) => updateFormData('fullName', value)}
                error={errors.fullName}
                leftIcon="person"
                required
              />

              <Input
                label={t('auth.email')}
                placeholder={t('auth.emailPlaceholder')}
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                error={errors.email}
                leftIcon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                required
              />

              <Input
                label={t('auth.phone')}
                placeholder={t('auth.phonePlaceholder')}
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                error={errors.phone}
                leftIcon="call"
                keyboardType="phone-pad"
                required
              />

              {showBusinessFields && (
                <Input
                  label={t('auth.businessName')}
                  placeholder={t('auth.businessNamePlaceholder')}
                  value={formData.businessName}
                  onChangeText={(value) => updateFormData('businessName', value)}
                  error={errors.businessName}
                  leftIcon="storefront"
                  required
                />
              )}

              <Input
                label={t('auth.password')}
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                error={errors.password}
                leftIcon="lock-closed"
                secureTextEntry
                required
              />

              <Input
                label={t('auth.confirmPassword')}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                error={errors.confirmPassword}
                leftIcon="lock-closed"
                secureTextEntry
                required
              />

              <Button
                title={t('auth.signUp')}
                onPress={handleSignUp}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
                style={styles.signUpButton}
              />

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </View>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('auth.haveAccount')}{' '}
              <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
                {t('auth.login')}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  userTypeContainer: {
    marginBottom: 8,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
  },
  signUpButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  linkText: {
    color: '#667eea',
    fontWeight: '600',
  },
});

export default SignUpScreen;
