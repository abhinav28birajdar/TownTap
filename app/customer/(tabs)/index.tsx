/**
 * TownTap - Customer Home (Tab Home)
 * Main home screen for customers
 */

import { useAuth } from '@/contexts/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const Colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  accent: '#F59E0B',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
};

const categories = [
  { id: '1', name: 'Beauty', icon: 'sparkles-outline' },
  { id: '2', name: 'Home', icon: 'home-outline' },
  { id: '3', name: 'Auto', icon: 'car-outline' },
  { id: '4', name: 'Health', icon: 'fitness-outline' },
  { id: '5', name: 'Pets', icon: 'paw-outline' },
  { id: '6', name: 'Events', icon: 'calendar-outline' },
  { id: '7', name: 'Tech', icon: 'laptop-outline' },
  { id: '8', name: 'More', icon: 'grid-outline' },
];

export default function CustomerHome() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBusinesses, setFeaturedBusinesses] = useState<any[]>([]);
  const [nearbyServices, setNearbyServices] = useState<any[]>([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      // TODO: Load featured businesses and services from Supabase
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const CategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => router.push(`/customer/categories/${item.id}`)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const BusinessCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => router.push(`/customer/business/${item.id}`)}
    >
      <View style={styles.businessImage}>
        <Ionicons name="storefront-outline" size={32} color={Colors.gray} />
      </View>
      <View style={styles.businessInfo}>
        <Text style={styles.businessName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.businessCategory}>{item.category}</Text>
        <View style={styles.businessRating}>
          <Ionicons name="star" size={14} color={Colors.accent} />
          <Text style={styles.ratingText}>{item.rating || '0.0'}</Text>
          <Text style={styles.reviewCount}>({item.review_count || 0})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{profile?.full_name || 'Guest'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/customer/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={Colors.grayDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Bar */}
        <TouchableOpacity 
          style={styles.locationBar}
          onPress={() => router.push('/customer/address/select')}
        >
          <Ionicons name="location-outline" size={20} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            Select your location
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.gray} />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={Colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services..."
              placeholderTextColor={Colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.gray} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.filterBtn}
            onPress={() => router.push('/customer/search/filters')}
          >
            <Ionicons name="options-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => router.push('/customer/categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <CategoryItem key={category.id} item={category} />
            ))}
          </View>
        </View>

        {/* Featured Businesses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <TouchableOpacity onPress={() => router.push('/customer/explore/featured')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {featuredBusinesses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={48} color={Colors.gray} />
              <Text style={styles.emptyStateText}>No featured businesses yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Check back soon for top-rated services
              </Text>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={featuredBusinesses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <BusinessCard item={item} />}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>

        {/* Nearby Services */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Services</Text>
            <TouchableOpacity onPress={() => router.push('/customer/explore/nearby')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {nearbyServices.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={Colors.gray} />
              <Text style={styles.emptyStateText}>No nearby services</Text>
              <Text style={styles.emptyStateSubtext}>
                Enable location to find services near you
              </Text>
              <TouchableOpacity
                style={styles.enableLocationBtn}
                onPress={() => router.push('/customer/address/select')}
              >
                <Text style={styles.enableLocationText}>Set Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={nearbyServices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <BusinessCard item={item} />}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 14,
    color: Colors.gray,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.grayDark,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.grayDark,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.grayDark,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: Colors.grayDark,
    fontWeight: '500',
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  businessCard: {
    width: 160,
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    overflow: 'hidden',
  },
  businessImage: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessInfo: {
    padding: 12,
  },
  businessName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  businessCategory: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  businessRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.gray,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 20,
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grayDark,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  enableLocationBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  enableLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});
