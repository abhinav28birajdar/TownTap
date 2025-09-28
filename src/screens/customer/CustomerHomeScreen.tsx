import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface Business {
  id: string;
  business_name: string;
  description: string;
  category: string;
  avg_rating: number;
  total_reviews: number;
  logo_url?: string;
  is_featured: boolean;
}

export default function CustomerHomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, profile } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadFeaturedBusinesses(),
        loadNearbyBusinesses(),
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(5);

      if (error) throw error;
      setFeaturedBusinesses(data || []);
    } catch (error) {
      console.error('Error loading featured businesses:', error);
    }
  };

  const loadNearbyBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true)
        .limit(10);

      if (error) throw error;
      setNearbyBusinesses(data || []);
    } catch (error) {
      console.error('Error loading nearby businesses:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleBusinessPress = (business: Business) => {
    router.push({
      pathname: '/customer/unified-business-detail',
      params: { businessId: business.id }
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/explore',
        params: { query: searchQuery }
      });
    }
  };

  const renderBusinessCard = ({ item: business }: { item: Business }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => handleBusinessPress(business)}
    >
      {business.logo_url ? (
        <Image source={{ uri: business.logo_url }} style={styles.businessLogo} />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>{business.business_name.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.businessInfo}>
        <Text style={styles.businessName} numberOfLines={1}>
          {business.business_name}
        </Text>
        <Text style={styles.businessCategory} numberOfLines={1}>
          {business.category}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>
            {business.avg_rating.toFixed(1)} ({business.total_reviews})
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
            </Text>
            <Text style={styles.subtitle}>Find local services around you</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/(tabs)/../notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services, businesses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/explore')}
          >
            <Ionicons name="storefront-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/favorites')}
          >
            <Ionicons name="heart-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/../orders' as any)}
          >
            <Ionicons name="receipt-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-outline" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Businesses */}
        {featuredBusinesses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Businesses</Text>
              <TouchableOpacity onPress={() => router.push('/explore')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredBusinesses}
              renderItem={renderBusinessCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Nearby Businesses */}
        {nearbyBusinesses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Services</Text>
              <TouchableOpacity onPress={() => router.push('/explore')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={nearbyBusinesses}
              renderItem={renderBusinessCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Empty State */}
        {featuredBusinesses.length === 0 && nearbyBusinesses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No businesses found</Text>
            <Text style={styles.emptyStateText}>
              Check back later for local services in your area
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  notificationButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    minWidth: 70,
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 5,
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  horizontalList: {
    paddingHorizontal: 15,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 280,
  },
  businessLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});