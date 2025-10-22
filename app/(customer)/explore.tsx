import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase/client';

interface Business {
  id: string;
  business_profiles: {
    name: string;
    description: string;
    category: string;
    address: string;
    is_active: boolean;
  } | null;
}

export default function ExploreScreen() {
  const { search, category } = useLocalSearchParams<{ search?: string; category?: string }>();
  const [searchQuery, setSearchQuery] = useState(search || '');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'grocery', name: 'Grocery', icon: 'basket' },
    { id: 'restaurant', name: 'Food', icon: 'restaurant' },
    { id: 'pharmacy', name: 'Pharmacy', icon: 'medical' },
    { id: 'service', name: 'Services', icon: 'construct' },
    { id: 'salon', name: 'Beauty', icon: 'cut' },
    { id: 'rental', name: 'Rentals', icon: 'car' },
  ];

  useEffect(() => {
    loadBusinesses();
  }, [selectedCategory, searchQuery]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('businesses')
        .select(`
          id,
          business_profiles (
            name,
            description,
            category,
            address,
            is_active
          )
        `)
        .eq('business_profiles.is_active', true);

      // Filter by category
      if (selectedCategory !== 'all') {
        query = query.eq('business_profiles.category', selectedCategory);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        query = query.or(`business_profiles.name.ilike.%${searchQuery}%,business_profiles.description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error loading businesses:', error);
        Alert.alert('Error', 'Failed to load businesses');
      } else {
        setBusinesses(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBusinesses();
    setRefreshing(false);
  };

  const handleBusinessPress = (business: Business) => {
    router.push(`/(customer)/business-details?id=${business.id}` as any);
  };

  const handleSearch = () => {
    loadBusinesses();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Explore Businesses</Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-800"
            placeholder="Search businesses, services..."
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
          ) : null}
        </View>
      </View>

      {/* Categories */}
      <View className="px-6 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={`flex-row items-center px-4 py-2 rounded-full border ${
                  selectedCategory === cat.id
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={selectedCategory === cat.id ? 'white' : '#6B7280'}
                />
                <Text
                  className={`ml-2 font-medium ${
                    selectedCategory === cat.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View className="items-center py-8">
            <Text className="text-gray-500">Loading businesses...</Text>
          </View>
        ) : businesses.length > 0 ? (
          <View className="pb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} found
            </Text>
            
            {businesses.map((business) => (
              <TouchableOpacity
                key={business.id}
                className="flex-row bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm"
                activeOpacity={0.8}
                onPress={() => handleBusinessPress(business)}
              >
                <View className="w-16 h-16 bg-gray-100 rounded-xl items-center justify-center">
                  <Ionicons name="storefront" size={24} color="#6B7280" />
                </View>
                <View className="flex-1 ml-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-800 mb-1">
                        {business.business_profiles?.name || 'Business Name'}
                      </Text>
                      <Text className="text-sm text-primary-600 font-medium capitalize mb-2">
                        {business.business_profiles?.category || 'Category'}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 bg-success-500 rounded-full mr-2" />
                      <Text className="text-xs text-success-600 font-medium">
                        {business.business_profiles?.is_active ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  </View>
                  
                  {business.business_profiles?.description && (
                    <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                      {business.business_profiles.description}
                    </Text>
                  )}
                  
                  {business.business_profiles?.address && (
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-600 ml-1" numberOfLines={1}>
                        {business.business_profiles.address}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center py-12">
            <Ionicons name="search" size={64} color="#D1D5DB" />
            <Text className="text-xl font-semibold text-gray-800 mt-4">
              {searchQuery ? 'No results found' : 'No businesses available'}
            </Text>
            <Text className="text-gray-600 text-center mt-2 px-8">
              {searchQuery
                ? `Try different keywords or check the spelling`
                : 'There are no businesses in this category yet'}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-6 py-3 bg-primary-500 rounded-xl"
              >
                <Text className="text-white font-semibold">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}