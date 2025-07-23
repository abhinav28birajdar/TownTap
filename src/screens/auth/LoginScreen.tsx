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

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { signIn, isLoading, error } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError(t('auth.emailRequired'));
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError(t('auth.emailInvalid'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError(t('auth.passwordRequired'));
      return false;
    }
    if (password.length < 6) {
      setPasswordError(t('auth.passwordMinLength'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      await signIn(email, password);
      // Navigation will be handled by the auth state change
    } catch (error) {
      Alert.alert(t('auth.loginFailed'), error instanceof Error ? error.message : t('auth.genericError'));
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Implement social login
    Alert.alert(t('auth.comingSoon'), `${provider} ${t('auth.loginComingSoon')}`);
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
              <Ionicons name="storefront" size={60} color="#667eea" />
            </View>
            <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
          </View>

          {/* Login Form */}
          <Card style={styles.formCard} padding="large">
            <View style={styles.form}>
              <Input
                label={t('auth.email')}
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                error={emailError}
                leftIcon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                required
              />

              <Input
                label={t('auth.password')}
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                error={passwordError}
                leftIcon="lock-closed"
                secureTextEntry
                required
              />

              <Button
                title={t('auth.login')}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
                style={styles.loginButton}
              />

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </View>
          </Card>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <Text style={styles.orText}>{t('auth.orContinueWith')}</Text>
            
            <View style={styles.socialButtons}>
              <Button
                title="Google"
                onPress={() => handleSocialLogin('Google')}
                variant="outline"
                icon={<Ionicons name="logo-google" size={20} color="#667eea" />}
                style={styles.socialButton}
              />
              
              <Button
                title="Facebook"
                onPress={() => handleSocialLogin('Facebook')}
                variant="outline"
                icon={<Ionicons name="logo-facebook" size={20} color="#667eea" />}
                style={styles.socialButton}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('auth.noAccount')}{' '}
              <Text style={styles.linkText} onPress={() => navigation.navigate('SignUp')}>
                {t('auth.signUp')}
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
  loginButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  socialContainer: {
    marginBottom: 32,
  },
  orText: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
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

export default LoginScreen;
