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
import { AuthStackParamList } from '../../types';
import { useTheme } from '../../context/ModernThemeContext';
import { supabase } from '../../lib/supabase';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'towntap://reset-password',
      });

      if (error) {
        setError(error.message);
      } else {
        setEmailSent(true);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (emailSent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.successContainer}>
          <View style={styles.successContent}>
            <Text style={[styles.successIcon, { color: theme.colors.primary }]}>
              ✉️
            </Text>
            <Text style={[styles.successTitle, { color: theme.colors.text }]}>
              Check Your Email
            </Text>
            <Text style={[styles.successMessage, { color: theme.colors.textSecondary }]}>
              We've sent a password reset link to {email}
            </Text>
            <Text style={[styles.successSubmessage, { color: theme.colors.textSecondary }]}>
              Please check your email and follow the instructions to reset your password.
            </Text>
          </View>
          
          <Button
            title="Back to Sign In"
            onPress={handleBackToLogin}
            variant="primary"
            size="large"
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
              style={styles.input}
            />

            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              variant="primary"
              size="large"
              loading={loading}
              disabled={loading}
              style={styles.resetButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Remember your password?{' '}
            </Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={[styles.backLink, { color: theme.colors.primary }]}>
                Back to Sign In
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 40,
  },
  input: {
    marginBottom: 24,
  },
  resetButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
  },
  backLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
    marginBottom: 60,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  successSubmessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;