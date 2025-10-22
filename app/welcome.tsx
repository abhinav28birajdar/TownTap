import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ImageBackground,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/lib/stores';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { user, loading } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Redirect if user is already authenticated
    if (!loading && user) {
      if (user.user_type === 'customer') {
        router.replace('/(customer)/home');
      } else if (user.user_type === 'business') {
        router.replace('/(business)/dashboard');
      }
      return;
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [user, loading]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-500">
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text className="text-white text-2xl font-bold">LocalMart</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/images/react-logo.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
      imageStyle={{ opacity: 0.3 }}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 justify-between px-6 py-8">
            {/* Header */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="items-center mt-16"
            >
              <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4">
                <Ionicons name="storefront" size={40} color="white" />
              </View>
              <Text className="text-white text-4xl font-bold text-center">
                LocalMart
              </Text>
              <Text className="text-white/90 text-lg text-center mt-2">
                Your Local Business Hub
              </Text>
            </Animated.View>

            {/* Features */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="space-y-4"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center mr-4">
                  <Ionicons name="location" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-semibold">
                    Discover Local Businesses
                  </Text>
                  <Text className="text-white/80">
                    Find nearby shops, services, and more
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-secondary-500 rounded-full items-center justify-center mr-4">
                  <Ionicons name="chatbubbles" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-semibold">
                    Real-time Communication
                  </Text>
                  <Text className="text-white/80">
                    Chat directly with business owners
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-success-500 rounded-full items-center justify-center mr-4">
                  <Ionicons name="card" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-semibold">
                    Secure Payments
                  </Text>
                  <Text className="text-white/80">
                    Multiple payment options including UPI
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="space-y-4"
            >
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register?type=customer')}
                className="bg-primary-500 py-4 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Join as Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/register?type=business')}
                className="bg-white py-4 rounded-xl border border-white/20"
                activeOpacity={0.8}
              >
                <Text className="text-gray-800 text-center text-lg font-semibold">
                  Join as Business
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.8}
              >
                <Text className="text-white text-center text-base">
                  Already have an account?{' '}
                  <Text className="font-semibold underline">Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}