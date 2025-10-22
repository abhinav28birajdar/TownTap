import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase/client';

interface BusinessData {
  id: string;
  business_profiles: {
    name: string;
    description: string;
    category: string;
    contact_phone: string;
    contact_email: string;
    address: string;
    website_url: string;
    is_active: boolean;
    opening_hours: any;
  };
  products?: any[];
  reviews?: any[];
}

export default function BusinessDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBusinessDetails();
    }
  }, [id]);

  const loadBusinessDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_profiles (*),
          products (
            id,
            name,
            description,
            price,
            category,
            is_available,
            image_urls
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading business:', error);
        Alert.alert('Error', 'Failed to load business details');
      } else {
        setBusiness(data);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (business?.business_profiles?.contact_phone) {
      Linking.openURL(`tel:${business.business_profiles.contact_phone}`);
    }
  };

  const handleEmail = () => {
    if (business?.business_profiles?.contact_email) {
      Linking.openURL(`mailto:${business.business_profiles.contact_email}`);
    }
  };

  const handleWebsite = () => {
    if (business?.business_profiles?.website_url) {
      Linking.openURL(business.business_profiles.website_url);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${business?.business_profiles?.name} on LocalMart!`,
        title: business?.business_profiles?.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleChat = () => {
    // Navigate to chat with business
    router.push(`/(customer)/chat?businessId=${id}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Loading business details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="business" size={64} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-gray-800 mt-4">Business not found</Text>
          <Text className="text-gray-600 text-center mt-2">
            The business you're looking for might have been removed or doesn't exist.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-6 py-3 bg-primary-500 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="h-64 bg-gray-300 relative">
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            className="absolute inset-0 z-10"
          />
          
          {/* Back Button */}
          <SafeAreaView className="absolute top-0 left-0 right-0 z-20">
            <View className="flex-row justify-between items-center px-4 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-black/20 rounded-full items-center justify-center"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                className="w-10 h-10 bg-black/20 rounded-full items-center justify-center"
              >
                <Ionicons name="share" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Placeholder for business image */}
          <View className="flex-1 items-center justify-center">
            <Ionicons name="storefront" size={64} color="#6B7280" />
          </View>
        </View>

        {/* Business Info */}
        <View className="px-6 py-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">
                {business.business_profiles.name}
              </Text>
              <Text className="text-primary-600 text-base font-medium capitalize mt-1">
                {business.business_profiles.category}
              </Text>
            </View>
            <View className="items-end">
              <View className={`flex-row items-center px-3 py-1 rounded-full ${
                business.business_profiles.is_active 
                  ? 'bg-success-100' 
                  : 'bg-gray-100'
              }`}>
                <View className={`w-2 h-2 rounded-full mr-2 ${
                  business.business_profiles.is_active 
                    ? 'bg-success-500' 
                    : 'bg-gray-400'
                }`} />
                <Text className={`text-sm font-medium ${
                  business.business_profiles.is_active 
                    ? 'text-success-700' 
                    : 'text-gray-600'
                }`}>
                  {business.business_profiles.is_active ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {business.business_profiles.description && (
            <Text className="text-gray-600 text-base mt-3 leading-6">
              {business.business_profiles.description}
            </Text>
          )}

          {/* Address */}
          {business.business_profiles.address && (
            <View className="flex-row items-start mt-4">
              <Ionicons name="location" size={20} color="#6B7280" className="mt-1" />
              <Text className="text-gray-600 text-base ml-3 flex-1">
                {business.business_profiles.address}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="px-6 py-4">
          <View className="flex-row space-x-3">
            {business.business_profiles.contact_phone && (
              <TouchableOpacity
                onPress={handleCall}
                className="flex-1 bg-primary-500 py-3 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="call" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Call</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={handleChat}
              className="flex-1 bg-success-500 py-3 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="chatbubble" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Chat</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row space-x-3 mt-3">
            {business.business_profiles.contact_email && (
              <TouchableOpacity
                onPress={handleEmail}
                className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="mail" size={20} color="#374151" />
                <Text className="text-gray-700 font-semibold ml-2">Email</Text>
              </TouchableOpacity>
            )}
            
            {business.business_profiles.website_url && (
              <TouchableOpacity
                onPress={handleWebsite}
                className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="globe" size={20} color="#374151" />
                <Text className="text-gray-700 font-semibold ml-2">Website</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Products/Services */}
        {business.products && business.products.length > 0 && (
          <View className="px-6 py-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Products & Services</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {business.products.map((product: any, index: number) => (
                <TouchableOpacity
                  key={product.id || index}
                  className="w-48 bg-gray-50 rounded-xl mr-4 overflow-hidden"
                >
                  <View className="h-32 bg-gray-300 items-center justify-center">
                    <Ionicons name="cube" size={32} color="#6B7280" />
                  </View>
                  <View className="p-4">
                    <Text className="text-base font-semibold text-gray-800 mb-1">
                      {product.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                      {product.description}
                    </Text>
                    <Text className="text-lg font-bold text-primary-600">
                      ₹{product.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Contact Info */}
        <View className="px-6 py-4 border-t border-gray-200">
          <Text className="text-lg font-bold text-gray-800 mb-4">Contact Information</Text>
          
          {business.business_profiles.contact_phone && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="call" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-3">
                {business.business_profiles.contact_phone}
              </Text>
            </View>
          )}
          
          {business.business_profiles.contact_email && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="mail" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-3">
                {business.business_profiles.contact_email}
              </Text>
            </View>
          )}
          
          {business.business_profiles.website_url && (
            <View className="flex-row items-center">
              <Ionicons name="globe" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-3">
                {business.business_profiles.website_url}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}