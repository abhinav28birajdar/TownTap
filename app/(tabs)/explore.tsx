import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { businessService } from '../../src/services/businessService';
import { useLocationStore } from '../../src/stores/locationStore';
import { Business, Category } from '../../src/types';

// Mock categories for exploration
const exploreCategories: Category[] = [
  {
    id: '1',
    name: 'Restaurants',
    icon: '🍽️',
    description: 'Food and dining experiences',
    business_types: ['restaurant', 'cafe', 'fast_food'],
    is_active: true,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Healthcare',
    icon: '🏥',
    description: 'Medical services and pharmacies',
    business_types: ['pharmacy', 'clinic', 'hospital'],
    is_active: true,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Services',
    icon: '🔧',
    description: 'Home and repair services',
    business_types: ['electrician', 'plumber', 'repair'],
    is_active: true,
    sort_order: 3,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Shopping',
    icon: '🛍️',
    description: 'Retail and grocery stores',
    business_types: ['grocery', 'retail', 'clothing'],
    is_active: true,
    sort_order: 4,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Beauty & Spa',
    icon: '💄',
    description: 'Beauty parlors and spa services',
    business_types: ['salon', 'spa', 'beauty'],
    is_active: true,
    sort_order: 5,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'Auto Services',
    icon: '🚗',
    description: 'Car repair and maintenance',
    business_types: ['auto_repair', 'car_wash', 'garage'],
    is_active: true,
    sort_order: 6,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    name: 'Education',
    icon: '📚',
    description: 'Schools and training centers',
    business_types: ['school', 'tuition', 'coaching'],
    is_active: true,
    sort_order: 7,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '8',
    name: 'Entertainment',
    icon: '🎮',
    description: 'Movies, games and fun activities',
    business_types: ['cinema', 'gaming', 'sports'],
    is_active: true,
    sort_order: 8,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '9',
    name: 'Fitness',
    icon: '💪',
    description: 'Gyms and fitness centers',
    business_types: ['gym', 'yoga', 'fitness'],
    is_active: true,
    sort_order: 9,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '10',
    name: 'Pet Services',
    icon: '🐕',
    description: 'Pet care and veterinary',
    business_types: ['vet', 'pet_shop', 'grooming'],
    is_active: true,
    sort_order: 10,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '11',
    name: 'Electronics',
    icon: '📱',
    description: 'Mobile and gadget stores',
    business_types: ['mobile_shop', 'electronics', 'repair'],
    is_active: true,
    sort_order: 11,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '12',
    name: 'Travel',
    icon: '✈️',
    description: 'Travel agencies and hotels',
    business_types: ['travel_agency', 'hotel', 'taxi'],
    is_active: true,
    sort_order: 12,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export default function ExploreTab() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRadius, setFilterRadius] = useState(5); // km

  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);

  useEffect(() => {
    if (selectedCategory) {
      loadBusinessesByCategory(selectedCategory);
    }
  }, [selectedCategory, latitude, longitude]);

  const loadBusinessesByCategory = async (categoryId: string) => {
    try {
      setIsLoading(true);
      // In a real app, you'd filter by category
      const data = await businessService.getNearbyBusinesses(
        { latitude: latitude || 0, longitude: longitude || 0 },
        filterRadius
      );
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses by category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = exploreCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderBusiness = ({ item }: { item: Business }) => (
    <TouchableOpacity style={styles.businessCard}>
      <View style={styles.businessHeader}>
        <Text style={styles.businessName}>{item.business_name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.avg_rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.businessDescription}>{item.description}</Text>
      <Text style={styles.businessAddress}>
        {item.address_line1}, {item.city}
      </Text>
      <View style={styles.businessFooter}>
        <Text style={styles.businessType}>{item.business_type}</Text>
        {item.delivery_available && (
          <Text style={styles.deliveryBadge}>🚚 Delivery</Text>
        )}
        <Text style={styles.distance}>
          {((Math.random() * 5) + 0.5).toFixed(1)} km
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapTitle}>Map View</Text>
        <Text style={styles.mapSubtitle}>
          Interactive map showing nearby businesses
        </Text>
        <View style={styles.mapButtons}>
          <TouchableOpacity style={styles.mapButton}>
            <Text style={styles.mapButtonText}>📍 Current Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapButton}>
            <Text style={styles.mapButtonText}>🔍 Search Area</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Mock map pins */}
      <View style={styles.mapPinsContainer}>
        <Text style={styles.mapPinsTitle}>Nearby Businesses</Text>
        {businesses.slice(0, 3).map((business, index) => (
          <TouchableOpacity key={business.id} style={styles.mapPin}>
            <Text style={styles.mapPinIcon}>📍</Text>
            <View style={styles.mapPinInfo}>
              <Text style={styles.mapPinName}>{business.business_name}</Text>
              <Text style={styles.mapPinDistance}>
                {((Math.random() * 5) + 0.5).toFixed(1)} km away
              </Text>
            </View>
            <Text style={styles.mapPinRating}>⭐ {business.avg_rating.toFixed(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore TownTap</Text>
        <Text style={styles.headerSubtitle}>
          Discover local businesses and services
        </Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories or businesses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* View Toggle & Filters */}
        <View style={styles.controlsContainer}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'grid' && styles.activeToggle]}
              onPress={() => setViewMode('grid')}
            >
              <Text style={[styles.toggleText, viewMode === 'grid' && styles.activeToggleText]}>
                Grid
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle]}
              onPress={() => setViewMode('map')}
            >
              <Text style={[styles.toggleText, viewMode === 'map' && styles.activeToggleText]}>
                Map
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>⚙️</Text>
            <Text style={styles.filterText}>{filterRadius}km</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {viewMode === 'map' ? (
          renderMapView()
        ) : (
          <>
            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse by Category</Text>
              <FlatList
                data={filteredCategories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.categoriesGrid}
              />
            </View>

            {/* Businesses Section */}
            {selectedCategory && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {exploreCategories.find(c => c.id === selectedCategory)?.name} Near You
                  </Text>
                  <TouchableOpacity 
                    style={styles.clearCategoryButton}
                    onPress={() => setSelectedCategory(null)}
                  >
                    <Text style={styles.clearCategoryText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>🔄 Loading businesses...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={businesses}
                    renderItem={renderBusiness}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            )}
          </>
        )}

        {/* Getting Started Section */}
        {!selectedCategory && viewMode === 'grid' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Getting Started</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Welcome to TownTap! 👋</Text>
              <Text style={styles.infoText}>
                Discover and connect with local businesses in your area. 
                Select a category above to start exploring!
              </Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Features</Text>
              <Text style={styles.infoText}>
                • Browse local businesses by category{'\n'}
                • Search for specific services{'\n'}
                • View ratings and reviews{'\n'}
                • Order products and services{'\n'}
                • Track your order history{'\n'}
                • Map view for visual exploration
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction}>
                  <Text style={styles.quickActionIcon}>🍕</Text>
                  <Text style={styles.quickActionText}>Order Food</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Text style={styles.quickActionIcon}>🏥</Text>
                  <Text style={styles.quickActionText}>Find Pharmacy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Text style={styles.quickActionIcon}>🔧</Text>
                  <Text style={styles.quickActionText}>Book Service</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  clearIcon: {
    fontSize: 16,
    color: '#666666',
    padding: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginHorizontal: 20,
    color: '#1A1A1A',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  clearCategoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  clearCategoryText: {
    fontSize: 14,
    color: '#666666',
  },
  categoriesGrid: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategory: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
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
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rating: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },
  businessDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  businessAddress: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 12,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  deliveryBadge: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: '500',
  },
  distance: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  mapContainer: {
    margin: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapPlaceholder: {
    padding: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  mapButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mapButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  mapPinsContainer: {
    padding: 20,
  },
  mapPinsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  mapPin: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  mapPinIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  mapPinInfo: {
    flex: 1,
  },
  mapPinName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  mapPinDistance: {
    fontSize: 12,
    color: '#666666',
  },
  mapPinRating: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});
