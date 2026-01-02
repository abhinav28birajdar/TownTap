/**
 * TownTap - Customer Explore Tab
 * Explore and discover services
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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

const allCategories = [
  { id: '1', name: 'Beauty & Wellness', icon: 'sparkles-outline', count: 0 },
  { id: '2', name: 'Home Services', icon: 'home-outline', count: 0 },
  { id: '3', name: 'Auto Services', icon: 'car-outline', count: 0 },
  { id: '4', name: 'Health & Fitness', icon: 'fitness-outline', count: 0 },
  { id: '5', name: 'Pet Services', icon: 'paw-outline', count: 0 },
  { id: '6', name: 'Events & Entertainment', icon: 'calendar-outline', count: 0 },
  { id: '7', name: 'Tech Support', icon: 'laptop-outline', count: 0 },
  { id: '8', name: 'Education', icon: 'school-outline', count: 0 },
  { id: '9', name: 'Food & Dining', icon: 'restaurant-outline', count: 0 },
  { id: '10', name: 'Professional Services', icon: 'briefcase-outline', count: 0 },
  { id: '11', name: 'Cleaning Services', icon: 'sparkles-outline', count: 0 },
  { id: '12', name: 'Moving & Storage', icon: 'cube-outline', count: 0 },
];

export default function CustomerExplore() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState<any[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Load businesses from Supabase
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const CategoryCard = ({ item }: { item: typeof allCategories[0] }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/customer/categories/${item.id}`)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={item.icon as any} size={28} color={Colors.primary} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>{item.count} providers</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => router.push('/customer/map-view')}
        >
          <Ionicons name="map-outline" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, businesses..."
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
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFilters}>
        <TouchableOpacity style={[styles.filterChip, styles.activeFilterChip]}>
          <Text style={[styles.filterChipText, styles.activeFilterChipText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Top Rated</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Nearby</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Open Now</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <FlatList
        data={allCategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CategoryCard item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>All Categories</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyStateTitle}>No categories found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grayDark,
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
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
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.grayLight,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray,
  },
  activeFilterChipText: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grayDark,
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  categoryCount: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.grayDark,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
