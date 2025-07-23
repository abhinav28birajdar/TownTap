import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { businessService } from '../../services/businessService';
import { useLocationStore } from '../../stores/locationStore';
import { Business, Category } from '../../types';

// Mock categories with correct interface
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Restaurants',
    icon: '🍽️',
    description: 'Food and dining',
    business_types: ['restaurant', 'cafe'],
    is_active: true,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Pharmacy',
    icon: '💊',
    description: 'Medicines and health products',
    business_types: ['pharmacy', 'medical_store'],
    is_active: true,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Electrician',
    icon: '⚡',
    description: 'Electrical repairs and services',
    business_types: ['electrician', 'repair_service'],
    is_active: true,
    sort_order: 3,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const NewHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get location from store
  const { latitude, longitude } = useLocationStore((state) => ({
    latitude: state.latitude,
    longitude: state.longitude,
  }));

  useEffect(() => {
    loadBusinesses();
  }, [latitude, longitude]);

  const loadBusinesses = async () => {
    try {
      setIsLoading(true);
      const data = await businessService.getNearbyBusinesses(
        { latitude: latitude || 0, longitude: longitude || 0 },
        10
      );
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      try {
        const results = await businessService.searchBusinesses(query, {
          location: latitude && longitude ? { latitude, longitude } : undefined,
        });
        setBusinesses(results.businesses);
      } catch (error) {
        console.error('Error searching businesses:', error);
      }
    }
  };

  const handleCategoryFilter = async (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    try {
      const filters = {
        location: latitude && longitude ? { latitude, longitude } : undefined,
      };
      const results = await businessService.searchBusinesses(searchQuery, filters);
      setBusinesses(results.businesses);
    } catch (error) {
      console.error('Error filtering by category:', error);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => handleCategoryFilter(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBusiness = ({ item }: { item: Business }) => (
    <TouchableOpacity style={styles.businessCard}>
      <Text style={styles.businessName}>{item.business_name}</Text>
      <Text style={styles.businessDescription}>{item.description}</Text>
      <Text style={styles.businessAddress}>
        {item.address_line1}, {item.city}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('home.welcome')}</Text>
        <Text style={styles.locationText}>
          Current Location
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('home.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.categories')}</Text>
        <FlatList
          data={mockCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

      {/* Businesses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.nearbyBusinesses')}</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <FlatList
            data={businesses}
            renderItem={renderBusiness}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginHorizontal: 20,
    color: '#1A1A1A',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#1A1A1A',
  },
  businessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  businessAddress: {
    fontSize: 12,
    color: '#999999',
  },
});

export default NewHomeScreen;
