import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function OtpVerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, signInWithOtp } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phone!, otpCode);
      // Navigation will be handled by auth state change
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      await signInWithOtp(phone!);
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('OTP Sent', 'New OTP has been sent to your phone');
    } catch (error: any) {
      Alert.alert('Failed to Resend', error.message || 'Failed to send OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold text-gray-800">
            Verify OTP
          </Text>
          <View className="w-10" />
        </View>

        {/* Content */}
        <View className="flex-1 justify-center">
          {/* Icon */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="chatbubble-ellipses" size={40} color="#0EA5E9" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Enter Verification Code
            </Text>
            <Text className="text-gray-600 text-base text-center">
              We've sent a 6-digit code to
            </Text>
            <Text className="text-primary-600 font-semibold text-base">
              {phone}
            </Text>
          </View>

          {/* OTP Input */}
          <View className="flex-row justify-center space-x-3 mb-8">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref!)}
                className="w-12 h-12 border-2 border-gray-300 rounded-xl text-center text-lg font-bold text-gray-800 bg-gray-50"
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                selectionColor="#0EA5E9"
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerifyOtp}
            disabled={loading || otp.join('').length !== 6}
            className={`py-4 rounded-xl mb-6 ${
              loading || otp.join('').length !== 6 
                ? 'bg-gray-400' 
                : 'bg-primary-500'
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>

          {/* Resend OTP */}
          <View className="items-center">
            <Text className="text-gray-600 mb-2">
              Didn't receive the code?
            </Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={countdown > 0 || resendLoading}
              activeOpacity={0.8}
            >
              {countdown > 0 ? (
                <Text className="text-gray-500">
                  Resend in {countdown}s
                </Text>
              ) : (
                <Text className={`font-semibold ${resendLoading ? 'text-gray-500' : 'text-primary-600'}`}>
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}