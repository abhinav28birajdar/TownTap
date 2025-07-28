import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStoreNew';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Business {
  id: string;
  business_name: string;
  category: string;
  rating: number;
  distance: string;
  image?: string;
  isOpen: boolean;
}

const ModernHomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { businessCategories, nearbyBusinesses, getBusinessCategories, getNearbyBusinesses } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: Category[] = [
    { id: 'all', name: 'All', icon: 'apps', color: COLORS.primary },
    { id: 'grocery', name: 'Grocery', icon: 'basket', color: COLORS.success },
    { id: 'restaurant', name: 'Food', icon: 'restaurant', color: COLORS.warning },
    { id: 'pharmacy', name: 'Medical', icon: 'medical', color: COLORS.error },
    { id: 'electronics', name: 'Electronics', icon: 'phone-portrait', color: COLORS.info },
    { id: 'stationary', name: 'Stationery', icon: 'pencil', color: COLORS.purple },
  ];

  const mockBusinesses: Business[] = [
    {
      id: '1',
      business_name: 'Fresh Mart Grocery',
      category: 'Grocery',
      rating: 4.5,
      distance: '0.5 km',
      isOpen: true,
    },
    {
      id: '2',
      business_name: 'Pizza Corner',
      category: 'Restaurant',
      rating: 4.2,
      distance: '1.2 km',
      isOpen: true,
    },
    {
      id: '3',
      business_name: 'Tech Store',
      category: 'Electronics',
      rating: 4.7,
      distance: '2.1 km',
      isOpen: false,
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await getBusinessCategories();
      await getNearbyBusinesses();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredBusinesses = mockBusinesses.filter(business => {
    const matchesSearch = business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           business.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const CategoryCard = ({ category }: { category: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { backgroundColor: selectedCategory === category.id ? category.color : theme.card },
      ]}
      onPress={() => setSelectedCategory(category.id)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={category.icon as any}
        size={24}
        color={selectedCategory === category.id ? COLORS.white : category.color}
      />
      <Text
        style={[
          styles.categoryText,
          {
            color: selectedCategory === category.id ? COLORS.white : theme.text,
          },
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const BusinessCard = ({ business }: { business: Business }) => (
    <TouchableOpacity style={[styles.businessCard, { backgroundColor: theme.card }]} activeOpacity={0.7}>
      <View style={styles.businessImage}>
        <Ionicons name="storefront" size={40} color={COLORS.primary} />
      </View>
      <View style={styles.businessInfo}>
        <View style={styles.businessHeader}>
          <Text style={[styles.businessName, { color: theme.text }]} numberOfLines={1}>
            {business.business_name}
          </Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: business.isOpen ? COLORS.success : COLORS.error }]} />
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {business.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
        <Text style={[styles.businessCategory, { color: theme.textSecondary }]}>{business.category}</Text>
        <View style={styles.businessMeta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={COLORS.warning} />
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>{business.rating}</Text>
          </View>
          <Text style={[styles.distance, { color: theme.textSecondary }]}>{business.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Good morning</Text>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.profile?.full_name || 'User'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.locationButton, { backgroundColor: theme.card }]}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={[styles.locationText, { color: theme.text }]}>Current Location</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search businesses, products..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CategoryCard category={item} />}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Nearby Businesses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Nearby Businesses</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: COLORS.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryCard: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 80,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  businessCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  businessInfo: {
    flex: 1,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  businessMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  distance: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ModernHomeScreen;
