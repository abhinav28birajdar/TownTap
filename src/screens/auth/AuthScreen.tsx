import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface AuthScreenProps {
  userType: 'customer' | 'business_owner';
  onClose: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ userType, onClose }) => {
  const { theme } = useTheme();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            Alert.alert(
              'Email Not Confirmed',
              'Please check your email and click the confirmation link before logging in. If you haven\'t received the email, please sign up again.',
              [
                { text: 'Sign Up Again', onPress: () => setIsLogin(false) },
                { text: 'OK', style: 'cancel' }
              ]
            );
            setLoading(false);
            return;
          }
          throw error;
        }

        if (data.user) {
          // Get user profile with retry logic
          let profile = null;
          let retryCount = 0;
          const maxRetries = 3;

          while (!profile && retryCount < maxRetries) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            profile = profileData;
            if (!profile) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            }
          }

          if (profile) {
            // Check if user type matches or allow any type if profile exists
            if (profile.user_type === userType || !userType) {
              const loginResult = await login(formData.email, formData.password);
              if (loginResult.success) {
                onClose();
              } else {
                Alert.alert('Error', loginResult.error || 'Login failed');
              }
            } else {
              Alert.alert(
                'User Type Mismatch', 
                `This account is registered as a ${profile.user_type.replace('_', ' ')}, but you're trying to login as a ${userType.replace('_', ' ')}. Please select the correct user type.`
              );
            }
          } else {
            Alert.alert('Error', 'Profile not found. Please contact support.');
          }
        }
      } else {
        // Sign up
        if (!formData.fullName) {
          Alert.alert('Error', 'Please enter your full name');
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone_number: formData.phoneNumber,
              user_type: userType,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          if (!data.user.email_confirmed_at && process.env.EXPO_PUBLIC_ENVIRONMENT === 'production') {
            Alert.alert(
              'Success',
              'Account created successfully! Please check your email for verification before logging in.',
              [{ text: 'OK', onPress: () => setIsLogin(true) }]
            );
          } else {
            // In development or if email is confirmed, try to log in directly
            Alert.alert(
              'Success',
              'Account created successfully!',
              [{ 
                text: 'OK', 
                onPress: async () => {
                  setIsLogin(true);
                  // Auto login in development
                  if (process.env.EXPO_PUBLIC_ENVIRONMENT === 'development') {
                    setTimeout(() => {
                      handleAuth();
                    }, 1000);
                  }
                }
              }]
            );
          }
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingTop: 10,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      padding: 8,
      backgroundColor: theme.colors.card,
      borderRadius: 20,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
    },
    form: {
      marginBottom: 24,
    },
    input: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 16,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.border,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    toggleButton: {
      alignItems: 'center',
      marginBottom: 24,
    },
    toggleText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    userTypeCard: {
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      alignItems: 'center',
    },
    userTypeIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    userTypeTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    userTypeDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.userTypeCard}>
            <Text style={styles.userTypeIcon}>
              {userType === 'customer' ? '👤' : '🏢'}
            </Text>
            <Text style={styles.userTypeTitle}>
              {userType === 'customer' ? 'Customer Account' : 'Business Account'}
            </Text>
            <Text style={styles.userTypeDescription}>
              {userType === 'customer'
                ? 'Order products, book services, and get consultations from local businesses'
                : 'Manage your business, handle orders, and connect with customers'}
            </Text>
          </View>

          <Text style={styles.title}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? 'Enter your credentials to access your account'
              : `Create your ${userType} account to get started`}
          </Text>

          <View style={styles.form}>
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Phone Number (Optional)"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                keyboardType="phone-pad"
              />
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.toggleButton} onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.toggleText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;
