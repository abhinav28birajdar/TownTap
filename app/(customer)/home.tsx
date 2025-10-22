import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/lib/stores';
import { supabase } from '@/lib/supabase/client';

const { width } = Dimensions.get('window');

export default function CustomerHomeScreen() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyBusinesses, setNearbyBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { name: 'Grocery', icon: 'basket', color: '#22C55E', type: 'grocery' },
    { name: 'Restaurants', icon: 'restaurant', color: '#F59E0B', type: 'restaurant' },
    { name: 'Pharmacy', icon: 'medical', color: '#EF4444', type: 'pharmacy' },
    { name: 'Services', icon: 'construct', color: '#8B5CF6', type: 'service' },
    { name: 'Salon', icon: 'cut', color: '#EC4899', type: 'salon' },
    { name: 'Rentals', icon: 'car', color: '#06B6D4', type: 'rental' },
  ];

  useEffect(() => {
    loadNearbyBusinesses();
  }, []);

  const loadNearbyBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_profiles (
            name,
            description,
            category,
            contact_phone,
            address,
            is_active
          )
        `)
        .eq('business_profiles.is_active', true)
        .limit(10);

      if (error) {
        console.error('Error loading businesses:', error);
      } else {
        setNearbyBusinesses(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNearbyBusinesses();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search', 'Please enter a search term');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('search-businesses', {
        body: {
          query: searchQuery,
          // You can add location data here
          location: { lat: 0, lng: 0 },
          filters: {}
        }
      });

      if (error) {
        console.error('Search error:', error);
        Alert.alert('Search Error', 'Failed to search businesses');
      } else {
        // Navigate to search results or update state
        router.push('/(customer)/explore' as any);
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Something went wrong while searching');
    }
  };

  const handleCategoryPress = (category: any) => {
    router.push('/(customer)/explore' as any);
  };

  const handleBusinessPress = (business: any) => {
    router.push(`/(customer)/business-details?id=${business.id}` as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 py-4 bg-primary-500">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-base">Welcome back,</Text>
              <Text className="text-white text-xl font-bold">{user?.name}</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <Ionicons name="notifications" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-6 py-4 bg-primary-500">
          <View className="bg-white rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800"
              placeholder="Search for businesses, services..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSearch}>
                <Ionicons name="mic" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Categories</Text>
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                className="w-16 items-center mb-4"
                activeOpacity={0.7}
                onPress={() => handleCategoryPress(category)}
              >
                <View
                  className="w-16 h-16 rounded-xl items-center justify-center mb-2"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={category.color}
                  />
                </View>
                <Text className="text-xs text-gray-600 text-center">
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Recommended for You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map((item, index) => (
              <TouchableOpacity
                key={index}
                className="w-64 bg-gray-50 rounded-xl mr-4 overflow-hidden"
                activeOpacity={0.8}
              >
                <View className="h-32 bg-gray-300" />
                <View className="p-4">
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    Sample Business {item}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    Category • 2.5 km away
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-sm text-gray-600 ml-1">4.5 (120)</Text>
                    <View className="flex-1" />
                    <View className="w-2 h-2 bg-success-500 rounded-full" />
                    <Text className="text-xs text-success-600 ml-1">Open</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nearby Businesses */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Nearby Businesses</Text>
          {loading ? (
            <View className="items-center py-8">
              <Text className="text-gray-500">Loading businesses...</Text>
            </View>
          ) : nearbyBusinesses.length > 0 ? (
            nearbyBusinesses.map((business, index) => (
              <TouchableOpacity
                key={business.id || index}
                className="flex-row bg-gray-50 rounded-xl p-4 mb-3"
                activeOpacity={0.8}
                onPress={() => handleBusinessPress(business)}
              >
                <View className="w-16 h-16 bg-gray-300 rounded-xl items-center justify-center">
                  <Ionicons name="storefront" size={24} color="#6B7280" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    {business.business_profiles?.name || 'Business Name'}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    {business.business_profiles?.description || 'No description available'}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-1">
                      {business.business_profiles?.address || 'Address not available'}
                    </Text>
                    <View className="flex-1" />
                    <View className="w-2 h-2 bg-success-500 rounded-full" />
                    <Text className="text-xs text-success-600 ml-1">
                      {business.business_profiles?.is_active ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-8">
              <Ionicons name="business" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2">No businesses found nearby</Text>
              <TouchableOpacity 
                onPress={loadNearbyBusinesses}
                className="mt-2 px-4 py-2 bg-primary-500 rounded-lg"
              >
                <Text className="text-white text-sm font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}