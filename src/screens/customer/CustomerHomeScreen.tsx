import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { BusinessService } from '../../services/businessService';
import { BusinessProfile } from '../../types';
import { BUSINESS_CATEGORIES } from '../../config/config';

const { width } = Dimensions.get('window');

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessProfile[]>([]);
  const [recentBusinesses, setRecentBusinesses] = useState<BusinessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [featured, recent] = await Promise.all([
        BusinessService.getFeaturedBusinesses(5),
        BusinessService.getRecentBusinesses(10),
      ]);
      
      setFeaturedBusinesses(featured);
      setRecentBusinesses(recent);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/explore?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryPress = (categoryValue: string) => {
    router.push(`/explore?category=${categoryValue}`);
  };

  const handleBusinessPress = (business: BusinessProfile) => {
    router.push(`/business/${business.id}`);
  };

  const handleSeeAllFeatured = () => {
    router.push('/explore?featured=true');
  };

  const handleSeeAllRecent = () => {
    router.push('/explore');
  };

  const renderBusinessCard = (business: BusinessProfile, index: number) => (
    <TouchableOpacity
      key={business.id}
      style={[
        styles.businessCard,
        { backgroundColor: theme.colors.surface },
        index === 0 && { marginLeft: 16 },
      ]}
      onPress={() => handleBusinessPress(business)}
    >
      <View style={[styles.businessImage, { backgroundColor: theme.colors.border }]}>
        <Text style={styles.businessImagePlaceholder}>
          {BUSINESS_CATEGORIES.find(cat => cat.value === business.category)?.icon || '🏪'}
        </Text>
      </View>
      
      <View style={styles.businessInfo}>
        <Text style={[styles.businessName, { color: theme.colors.text }]} numberOfLines={1}>
          {business.business_name}
        </Text>
        <Text style={[styles.businessCategory, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {BUSINESS_CATEGORIES.find(cat => cat.value === business.category)?.label || business.category}
        </Text>
        <View style={styles.businessMeta}>
          <Text style={[styles.businessRating, { color: theme.colors.warning }]}>
            ★ 4.2
          </Text>
          <Text style={[styles.businessDistance, { color: theme.colors.textSecondary }]}>
            • 0.5 km
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              Good morning,
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {profile?.display_name || profile?.first_name || 'Welcome'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/profile')}
          >
            <Text style={[styles.profileButtonText, { color: theme.colors.primary }]}>
              {profile?.first_name?.charAt(0) || 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search businesses, services..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Browse Categories
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {BUSINESS_CATEGORIES.slice(0, 8).map((category, index) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryCard,
                  { backgroundColor: theme.colors.surface },
                  index === 0 && { marginLeft: 16 },
                ]}
                onPress={() => handleCategoryPress(category.value)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Businesses */}
        {featuredBusinesses.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Featured Businesses
              </Text>
              <TouchableOpacity onPress={handleSeeAllFeatured}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.businessesContainer}
            >
              {featuredBusinesses.map((business, index) => 
                renderBusinessCard(business, index)
              )}
            </ScrollView>
          </View>
        )}

        {/* Recent Businesses */}
        {recentBusinesses.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Recently Added
              </Text>
              <TouchableOpacity onPress={handleSeeAllRecent}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.businessesContainer}
            >
              {recentBusinesses.map((business, index) => 
                renderBusinessCard(business, index)
              )}
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push('/explore?category=restaurant')}
            >
              <Text style={styles.quickActionIcon}>🍽️</Text>
              <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>
                Restaurants
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push('/explore?category=retail')}
            >
              <Text style={styles.quickActionIcon}>🛍️</Text>
              <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>
                Shopping
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push('/explore?category=service')}
            >
              <Text style={styles.quickActionIcon}>🔧</Text>
              <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>
                Services
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push('/favorites')}
            >
              <Text style={styles.quickActionIcon}>❤️</Text>
              <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>
                Favorites
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '400',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  categoryCard: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginRight: 12,
    width: 80,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  featuredSection: {
    marginBottom: 32,
  },
  recentSection: {
    marginBottom: 32,
  },
  businessesContainer: {
    paddingRight: 16,
  },
  businessCard: {
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: width * 0.7,
  },
  businessImage: {
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessImagePlaceholder: {
    fontSize: 32,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessRating: {
    fontSize: 14,
    fontWeight: '500',
  },
  businessDistance: {
    fontSize: 14,
    fontWeight: '400',
  },
  quickActionsSection: {
    paddingHorizontal: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickActionCard: {
    width: '47%',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});