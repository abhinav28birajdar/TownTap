import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { businessService } from '../../src/services/businessService';
import { useLocationStore } from '../../src/stores/locationStore';
import { Business, Category } from '../../src/types';

// Mock categories
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
    name: 'Grocery',
    icon: '🛒',
    description: 'Daily essentials and groceries',
    business_types: ['grocery', 'supermarket'],
    is_active: true,
    sort_order: 3,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Services',
    icon: '🔧',
    description: 'Local services',
    business_types: ['repair', 'maintenance'],
    is_active: true,
    sort_order: 4,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const { latitude, longitude } = useLocationStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadNearbyBusinesses();
  }, [latitude, longitude]);

  const loadNearbyBusinesses = async () => {
    if (!latitude || !longitude) return;
    
    try {
      setLoading(true);
      const data = await businessService.getNearbyBusinesses(
        { latitude, longitude },
        10
      );
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const results = await businessService.searchBusinesses(searchQuery, {
        location: latitude && longitude ? { latitude, longitude } : undefined,
      });
      setBusinesses(results.businesses);
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBusiness = ({ item }: { item: Business }) => (
    <TouchableOpacity style={styles.businessCard}>
      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{item.business_name}</Text>
        <Text style={styles.businessDescription}>{item.description}</Text>
        <Text style={styles.businessAddress}>
          {item.address_line1}, {item.city}
        </Text>
        <View style={styles.businessMeta}>
          <Text style={styles.rating}>⭐ {item.avg_rating}</Text>
          <Text style={styles.delivery}>
            {item.delivery_available ? '🚚 Delivery' : '🏪 Pickup'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TownTap</Text>
        <TouchableOpacity style={styles.locationButton}>
          <IconSymbol name="location.fill" size={20} color="#007AFF" />
          <Text style={styles.locationText}>
            {latitude && longitude ? 'Current Location' : 'Set Location'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <IconSymbol name="magnifyingglass" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={mockCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Businesses</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : (
            <FlatList
              data={businesses}
              renderItem={renderBusiness}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.businessList}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#007AFF',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#007AFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  businessList: {
    paddingHorizontal: 16,
  },
  businessCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  businessDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  businessAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  businessMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#333',
  },
  delivery: {
    fontSize: 12,
    color: '#007AFF',
  },
  loader: {
    marginTop: 32,
  },
});
