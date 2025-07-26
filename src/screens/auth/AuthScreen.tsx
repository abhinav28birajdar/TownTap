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

        if (error) throw error;

        if (data.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile && profile.user_type === userType) {
            const loginResult = await login(formData.email, formData.password);
            if (loginResult.success) {
              onClose();
            } else {
              Alert.alert('Error', loginResult.error || 'Login failed');
            }
          } else {
            Alert.alert('Error', `This account is not registered as a ${userType}`);
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
        });

        if (error) throw error;

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: formData.email,
                full_name: formData.fullName,
                phone_number: formData.phoneNumber,
                user_type: userType,
              },
            ]);

          if (profileError) throw profileError;

          Alert.alert(
            'Success',
            'Account created successfully! Please check your email for verification.',
            [{ text: 'OK', onPress: () => setIsLogin(true) }]
          );
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
      backgroundColor: theme.background,
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
      color: theme.text,
    },
    closeButton: {
      padding: 8,
      backgroundColor: theme.card,
      borderRadius: 20,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
    },
    form: {
      marginBottom: 24,
    },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      marginBottom: 16,
    },
    button: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonDisabled: {
      backgroundColor: theme.border,
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
      color: theme.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    userTypeCard: {
      backgroundColor: theme.card,
      borderWidth: 2,
      borderColor: theme.primary,
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
      color: theme.text,
      marginBottom: 8,
    },
    userTypeDescription: {
      fontSize: 14,
      color: theme.textSecondary,
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
            <Ionicons name="close" size={24} color={theme.text} />
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
                placeholderTextColor={theme.textSecondary}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={theme.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Phone Number (Optional)"
                placeholderTextColor={theme.textSecondary}
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
