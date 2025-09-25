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
import { useAuth } from '../../context/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { signIn, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      const result = await signIn(formData.email.trim(), formData.password);
      
      if (result.error) {
        Alert.alert('Sign In Failed', result.error);
      }
      // Navigation will be handled by AuthContext state change
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
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Sign in to your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              error={errors.password}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleSignIn}
              variant="primary"
              size="large"
              loading={loading}
              disabled={loading}
              style={styles.signInButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.signUpLink, { color: theme.colors.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Options */}
          <View style={styles.demoSection}>
            <Text style={[styles.demoText, { color: theme.colors.textSecondary }]}>
              Or try a demo account
            </Text>
            <Button
              title="Demo Login"
              onPress={() => navigation.navigate('DemoLogin')}
              variant="ghost"
              size="medium"
              style={styles.demoButton}
            />
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
    marginBottom: 40,
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
  form: {
    marginBottom: 30,
  },
  input: {
    marginBottom: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  demoSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  demoText: {
    fontSize: 14,
    marginBottom: 12,
  },
  demoButton: {
    width: '60%',
  },
});

export default LoginScreen;