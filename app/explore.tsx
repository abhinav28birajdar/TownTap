import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../src/context/ModernThemeContext';
import { ALL_BUSINESS_CATEGORIES, BUSINESS_CATEGORIES } from '../src/config/config';
import { firestoreService } from '../firebase/firestore';
import { BusinessProfile } from '../src/types';

interface CategoryTab {
  id: string;
  name: string;
  type: 'all' | 'type_a' | 'type_b' | 'type_c';
}

const categoryTabs: CategoryTab[] = [
  { id: 'all', name: 'All', type: 'all' },
  { id: 'type_a', name: 'Order & Buy', type: 'type_a' },
  { id: 'type_b', name: 'Book Service', type: 'type_b' },
  { id: 'type_c', name: 'Consult', type: 'type_c' },
];

export default function Explore() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<CategoryTab['type']>('all');
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadFeaturedBusinesses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchBusinesses();
    } else {
      setBusinesses([]);
    }
  }, [searchQuery]);

  const loadFeaturedBusinesses = async () => {
    try {
      setLoading(true);
      const featured = await firestoreService.getFeaturedBusinesses(10);
      setFeaturedBusinesses(featured);
    } catch (error) {
      console.error('Error loading featured businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchBusinesses = async () => {
    try {
      setSearchLoading(true);
      const results = await firestoreService.searchBusinesses(searchQuery);
      setBusinesses(results);
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const getCategoriesByType = (type: CategoryTab['type']) => {
    switch (type) {
      case 'type_a':
        return BUSINESS_CATEGORIES.TYPE_A;
      case 'type_b':
        return BUSINESS_CATEGORIES.TYPE_B;
      case 'type_c':
        return BUSINESS_CATEGORIES.TYPE_C;
      default:
        return ALL_BUSINESS_CATEGORIES;
    }
  };

  const handleCategoryPress = async (categoryValue: string) => {
    try {
      setLoading(true);
      const categoryBusinesses = await firestoreService.getBusinessesByCategory(categoryValue, 20);
      setBusinesses(categoryBusinesses);
      setSearchQuery(''); // Clear search when selecting category
    } catch (error) {
      console.error('Error loading category businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessPress = (business: BusinessProfile) => {
    router.push({
      pathname: '/customer/unified-business-detail',
      params: { businessId: business.id }
    });
  };

  const renderBusinessCard = ({ item: business }: { item: BusinessProfile }) => (
    <TouchableOpacity
      style={[styles.businessCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleBusinessPress(business)}
    >
      <Image
        source={{ uri: business.image_url || business.logo_url || 'https://via.placeholder.com/60' }}
        style={styles.businessLogo}
      />
      <View style={styles.businessInfo}>
        <Text style={[styles.businessName, { color: theme.colors.text }]} numberOfLines={1}>
          {business.business_name || business.name}
        </Text>
        <Text style={[styles.businessCategory, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {business.category || 'Local Business'}
        </Text>
        <View style={styles.businessMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.rating, { color: theme.colors.textSecondary }]}>
              {(business.rating || 0).toFixed(1)} ({business.total_reviews || 0})
            </Text>
          </View>
          {business.delivery_available && (
            <View style={[styles.deliveryBadge, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.deliveryText}>Delivery</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderCategoryCard = (category: any) => (
    <TouchableOpacity
      key={category.value}
      style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleCategoryPress(category.value)}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={[styles.categoryLabel, { color: theme.colors.text }]} numberOfLines={2}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Discover LocalMart
        </Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search businesses, products, services..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchLoading && (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.searchLoader} />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
            {categoryTabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  { backgroundColor: selectedTab === tab.type ? theme.colors.primary : theme.colors.surface },
                ]}
                onPress={() => setSelectedTab(tab.type)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: selectedTab === tab.type ? 'white' : theme.colors.text },
                  ]}
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Browse by Category
          </Text>
          <View style={styles.categoriesGrid}>
            {getCategoriesByType(selectedTab).map(renderCategoryCard)}
          </View>
        </View>

        {/* Search Results or Featured Businesses */}
        {searchQuery.trim() ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Search Results ({businesses.length})
            </Text>
            {businesses.length === 0 && !searchLoading ? (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                  No results found
                </Text>
                <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                  Try different keywords or browse categories
                </Text>
              </View>
            ) : (
              <FlatList
                data={businesses}
                renderItem={renderBusinessCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        ) : (
          <>
            {/* Featured Businesses */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Featured Businesses
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={featuredBusinesses}
                  renderItem={renderBusinessCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>

            {/* Recently Viewed - Placeholder for now */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Recently Viewed
              </Text>
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                  No recent activity
                </Text>
                <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                  Businesses you visit will appear here
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerAction: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchLoader: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabs: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
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
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  businessLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
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
    marginBottom: 8,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  deliveryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});