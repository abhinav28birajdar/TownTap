import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { router, useLocalSearchParams } from 'expo-router';
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

// Validation schemas
const customerSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').test('is-valid-email', 'Invalid email format', isValidEmail),
  phone: yup.string().required('Phone is required').test('is-valid-phone', 'Invalid phone number', isValidPhoneNumber),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string().required('Confirm password is required').oneOf([yup.ref('password')], 'Passwords must match'),
});

const businessSchema = yup.object({
  ownerName: yup.string().required('Owner name is required').min(2, 'Name must be at least 2 characters'),
  businessName: yup.string().required('Business name is required').min(2, 'Business name must be at least 2 characters'),
  email: yup.string().required('Email is required').test('is-valid-email', 'Invalid email format', isValidEmail),
  phone: yup.string().required('Phone is required').test('is-valid-phone', 'Invalid phone number', isValidPhoneNumber),
  businessPhone: yup.string().optional().test('is-valid-phone', 'Invalid business phone number', (value) => !value || isValidPhoneNumber(value)),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string().required('Confirm password is required').oneOf([yup.ref('password')], 'Passwords must match'),
});

type CustomerFormData = yup.InferType<typeof customerSchema>;
type BusinessFormData = yup.InferType<typeof businessSchema>;

export default function RegisterScreen() {
  const { type } = useLocalSearchParams<{ type: 'customer' | 'business' }>();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isCustomer = type === 'customer';
  const schema = isCustomer ? customerSchema : businessSchema;

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: CustomerFormData | BusinessFormData) => {
    setLoading(true);
    try {
      if (isCustomer) {
        const customerData = data as CustomerFormData;
        await signUp(customerData.email, customerData.password, {
          name: customerData.name,
          phone: customerData.phone,
          user_type: 'customer',
        });
        router.push('/(auth)/otp-verify?phone=' + customerData.phone);
      } else {
        const businessData = data as BusinessFormData;
        await signUp(businessData.email, businessData.password, {
          name: businessData.ownerName,
          phone: businessData.phone,
          user_type: 'business',
        });
        router.push('/(onboarding)/business-setup');
      }
    } catch (error: any) {
      Alert.alert('Registration Error', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ 
    name, 
    placeholder, 
    icon, 
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
  }: {
    name: string;
    placeholder: string;
    icon: string;
    secureTextEntry?: boolean;
    keyboardType?: any;
    autoCapitalize?: any;
  }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View className="mb-4">
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <Ionicons name={icon as any} size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoCorrect={false}
            />
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={(name === 'password' ? showPassword : showConfirmPassword) ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            )}
          </View>
          {errors[name] && (
            <Text className="text-error-500 text-sm mt-1 ml-1">
              {errors[name]?.message}
            </Text>
          )}
        </View>
      )}
    />
  );

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
                {isCustomer ? 'Customer Registration' : 'Business Registration'}
              </Text>
              <View className="w-10" />
            </View>

            {/* Welcome Message */}
            <View className="mb-8">
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to LocalMart!
              </Text>
              <Text className="text-gray-600 text-base">
                {isCustomer 
                  ? 'Create your account to discover amazing local businesses and services'
                  : 'Join our platform to grow your business and reach more customers'
                }
              </Text>
            </View>

            {/* Form */}
            <View>
              {isCustomer ? (
                <>
                  <InputField
                    name="name"
                    placeholder="Full Name"
                    icon="person"
                  />
                  <InputField
                    name="email"
                    placeholder="Email Address"
                    icon="mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <InputField
                    name="phone"
                    placeholder="Phone Number"
                    icon="call"
                    keyboardType="phone-pad"
                  />
                  <InputField
                    name="password"
                    placeholder="Password"
                    icon="lock-closed"
                    secureTextEntry={!showPassword}
                  />
                  <InputField
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    icon="lock-closed"
                    secureTextEntry={!showConfirmPassword}
                  />
                </>
              ) : (
                <>
                  <InputField
                    name="ownerName"
                    placeholder="Owner Full Name"
                    icon="person"
                  />
                  <InputField
                    name="businessName"
                    placeholder="Business Name"
                    icon="storefront"
                  />
                  <InputField
                    name="email"
                    placeholder="Email Address"
                    icon="mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <InputField
                    name="phone"
                    placeholder="Personal Phone Number"
                    icon="call"
                    keyboardType="phone-pad"
                  />
                  <InputField
                    name="businessPhone"
                    placeholder="Business Phone (Optional)"
                    icon="call-outline"
                    keyboardType="phone-pad"
                  />
                  <InputField
                    name="password"
                    placeholder="Password"
                    icon="lock-closed"
                    secureTextEntry={!showPassword}
                  />
                  <InputField
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    icon="lock-closed"
                    secureTextEntry={!showConfirmPassword}
                  />
                </>
              )}

              {/* Terms & Conditions */}
              <Text className="text-gray-600 text-sm text-center mb-6">
                By creating an account, you agree to our{' '}
                <Text className="text-primary-600 underline">Terms of Service</Text>{' '}
                and{' '}
                <Text className="text-primary-600 underline">Privacy Policy</Text>
              </Text>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : 'bg-primary-500'}`}
                activeOpacity={0.8}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              {/* Login Link */}
              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                className="mt-6"
                activeOpacity={0.8}
              >
                <Text className="text-center text-gray-600">
                  Already have an account?{' '}
                  <Text className="text-primary-600 font-semibold">Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}