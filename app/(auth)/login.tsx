import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

import { useAuth } from '@/lib/contexts/AuthContext';
import { isValidEmail, isValidPhoneNumber } from '@/lib/utils';

const schema = yup.object({
  identifier: yup.string().required('Email or phone is required'),
  password: yup.string().required('Password is required'),
});

type FormData = yup.InferType<typeof schema>;

export default function LoginScreen() {
  const { signIn, signInWithOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const identifier = watch('identifier');

  React.useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(isAvailable && isEnrolled);
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Use biometric to sign in',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        // Here you would typically retrieve stored credentials
        // For demo purposes, we'll just show a success message
        Alert.alert('Success', 'Biometric authentication successful');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const isPhone = isValidPhoneNumber(data.identifier);
      
      if (isOtpMode && isPhone) {
        // Send OTP for phone login
        await signInWithOtp(data.identifier);
        router.push(`/(auth)/otp-verify?phone=${data.identifier}`);
      } else if (isValidEmail(data.identifier)) {
        // Email/password login
        await signIn(data.identifier, data.password);
        // Navigation will be handled by auth state change
      } else {
        Alert.alert('Invalid Input', 'Please enter a valid email or phone number');
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpToggle = () => {
    const isPhone = isValidPhoneNumber(identifier);
    if (isPhone) {
      setIsOtpMode(!isOtpMode);
    } else {
      Alert.alert('Phone Required', 'Enter a valid phone number to use OTP login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-8">
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text className="flex-1 text-center text-xl font-bold text-gray-800">
                Sign In
              </Text>
              <View className="w-10" />
            </View>

            {/* Welcome Message */}
            <View className="mb-8 items-center">
              <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="storefront" size={32} color="#0EA5E9" />
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                Welcome Back!
              </Text>
              <Text className="text-gray-600 text-base text-center">
                Sign in to your LocalMart account
              </Text>
            </View>

            {/* Biometric Login */}
            {biometricAvailable && (
              <TouchableOpacity
                onPress={handleBiometricAuth}
                className="bg-gray-100 py-4 rounded-xl mb-6 flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name="finger-print" size={24} color="#374151" />
                <Text className="text-gray-800 text-base font-medium ml-2">
                  Use Biometric
                </Text>
              </TouchableOpacity>
            )}

            {/* Divider */}
            {biometricAvailable && (
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500">or</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>
            )}

            {/* Form */}
            <View>
              <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="mb-4">
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                      <Ionicons name="mail" size={20} color="#6B7280" />
                      <TextInput
                        className="flex-1 ml-3 text-gray-800 text-base"
                        placeholder="Email or Phone Number"
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.identifier && (
                      <Text className="text-error-500 text-sm mt-1 ml-1">
                        {errors.identifier.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {!isOtpMode && (
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="mb-4">
                      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        <Ionicons name="lock-closed" size={20} color="#6B7280" />
                        <TextInput
                          className="flex-1 ml-3 text-gray-800 text-base"
                          placeholder="Password"
                          placeholderTextColor="#9CA3AF"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry={!showPassword}
                          autoCorrect={false}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Ionicons 
                            name={showPassword ? 'eye-off' : 'eye'} 
                            size={20} 
                            color="#6B7280" 
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.password && (
                        <Text className="text-error-500 text-sm mt-1 ml-1">
                          {errors.password.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              )}

              {/* OTP Toggle */}
              <TouchableOpacity
                onPress={handleOtpToggle}
                className="mb-4"
                activeOpacity={0.8}
              >
                <Text className="text-primary-600 text-center font-medium">
                  {isOtpMode ? 'Use Password Instead' : 'Login with OTP'}
                </Text>
              </TouchableOpacity>

              {/* Forgot Password */}
              {!isOtpMode && (
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  className="mb-6"
                  activeOpacity={0.8}
                >
                  <Text className="text-primary-600 text-center">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-primary-500'}`}
                activeOpacity={0.8}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {loading ? 'Signing In...' : isOtpMode ? 'Send OTP' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* Social Login */}
              <View className="mt-6">
                <Text className="text-gray-500 text-center mb-4">Or continue with</Text>
                <View className="flex-row justify-center space-x-4">
                  <TouchableOpacity
                    className="flex-1 bg-gray-50 py-3 rounded-xl flex-row items-center justify-center mr-2"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-google" size={20} color="#EA4335" />
                    <Text className="text-gray-700 ml-2 font-medium">Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-50 py-3 rounded-xl flex-row items-center justify-center ml-2"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                    <Text className="text-gray-700 ml-2 font-medium">Facebook</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Link */}
              <TouchableOpacity
                onPress={() => router.push('/welcome')}
                className="mt-6"
                activeOpacity={0.8}
              >
                <Text className="text-center text-gray-600">
                  Don't have an account?{' '}
                  <Text className="text-primary-600 font-semibold">Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}