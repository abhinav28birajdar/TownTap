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
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ModernThemeContext';
import { ALL_BUSINESS_CATEGORIES, BUSINESS_CATEGORIES } from '../../config/config';
import { supabase } from '../../lib/supabase';

interface BusinessProfile {
  id: string;
  business_name: string;
  specialized_categories: string[];
  avg_rating: number;
  total_reviews: number;
  delivery_radius_km: number;
}

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

export default function ExploreScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<CategoryTab['type']>('all');
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadBusinesses();
    loadFeaturedBusinesses();
  }, [selectedTab]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true);

      if (selectedTab !== 'all') {
        query = query.eq('business_type', selectedTab);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error loading businesses:', error);
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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadBusinesses();
      return;
    }

    try {
      setSearchLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .or(\`business_name.ilike.%\${query}%,specialized_categories.cs.{"\${query}"}\`)
        .eq('is_active', true)
        .limit(20);

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBusinessPress = (business: BusinessProfile) => {
    navigation.navigate('BusinessDetail' as never, { businessId: business.id } as never);
  };

  const handleCategoryPress = (category: any) => {
    handleSearch(category.name);
  };

  const renderBusinessCard = ({ item: business }: { item: BusinessProfile }) => (
    <TouchableOpacity
      style={[styles.businessCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleBusinessPress(business)}
    >
      <Image
        source={{ uri: 'https://via.placeholder.com/60' }}
        style={styles.businessLogo}
      />
      <View style={styles.businessInfo}>
        <Text style={[styles.businessName, { color: theme.colors.text }]} numberOfLines={1}>
          {business.business_name}
        </Text>
        <Text style={[styles.businessCategory, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {business.specialized_categories?.[0] || 'Local Business'}
        </Text>
        <View style={styles.businessMeta}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={[styles.rating, { color: theme.colors.textSecondary }]}>
              {business.avg_rating?.toFixed(1) || '0.0'} ({business.total_reviews || 0})
            </Text>
          </View>
          {business.delivery_radius_km && (
            <View style={[styles.deliveryBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.deliveryText}>Delivery</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryCard = ({ item: category }: { item: any }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleCategoryPress(category)}
    >
      <Icon name={category.icon || 'storefront-outline'} size={32} color={theme.colors.primary} />
      <Text style={[styles.categoryName, { color: theme.colors.text }]} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Explore</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Icon name="filter-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Icon name="search-outline" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search businesses, services..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
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
            {BUSINESS_CATEGORIES.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleCategoryPress(category)}
              >
                <Icon name={category.icon || 'storefront-outline'} size={32} color={theme.colors.primary} />
                <Text style={[styles.categoryName, { color: theme.colors.text }]} numberOfLines={2}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Businesses */}
        {featuredBusinesses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
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

        {/* All Businesses */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {selectedTab === 'all' ? 'All Businesses' : \`\${categoryTabs.find(tab => tab.type === selectedTab)?.name || ''} Businesses\`}
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : businesses.length > 0 ? (
            <FlatList
              data={businesses}
              renderItem={renderBusinessCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="search-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No businesses found</Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                Try adjusting your search or browse different categories
              </Text>
            </View>
          )}
        </View>
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
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  businessCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  businessLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
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