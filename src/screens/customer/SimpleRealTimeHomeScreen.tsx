// ================================================================
// 🚀 SIMPLE REAL-TIME HOME SCREEN
// ================================================================

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ModernThemeContext';
import RealTimeBusinessDiscovery, {
    BusinessDetails,
    Coordinates
} from '../../services/RealTimeBusinessDiscovery';
import { useAuthStore } from '../../stores/authStore';

const { width, height } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const SimpleRealTimeHomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuthStore();

  // State
  const [businesses, setBusinesses] = useState<BusinessDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [realTimeActive, setRealTimeActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [locationUpdateCount, setLocationUpdateCount] = useState(0);
  const [serviceRequestModal, setServiceRequestModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessDetails | null>(null);
  const [serviceDescription, setServiceDescription] = useState('');

  // Initialize app
  useEffect(() => {
    initializeApp();
    return () => {
      RealTimeBusinessDiscovery.stopRealTimeDiscovery();
    };
  }, [user?.id]);

  const initializeApp = async () => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to continue');
      return;
    }

    try {
      setLoading(true);

      // Load categories first
      await loadCategories();

      // Start real-time discovery
      await startRealTimeDiscovery();

      setLoading(false);
    } catch (error: any) {
      console.error('Error initializing app:', error);
      Alert.alert('Initialization Error', error.message || 'Failed to initialize app');
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await RealTimeBusinessDiscovery.getBusinessCategories();
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load business categories');
    }
  };

  const startRealTimeDiscovery = async () => {
    if (!user?.id) return;

    try {
      await RealTimeBusinessDiscovery.startRealTimeDiscovery(
        user.id,
        user.user_metadata?.full_name || 'Customer',
        user.user_metadata?.phone || '',
        {
          radius: 20,
          onBusinessesUpdate: (updatedBusinesses) => {
            console.log('📊 Businesses updated:', updatedBusinesses.length);
            setBusinesses(updatedBusinesses);
            setRealTimeActive(true);
          },
          onLocationUpdate: (location) => {
            console.log('📍 Location updated:', location);
            setCurrentLocation(location);
            setLocationUpdateCount(prev => prev + 1);
          },
          onError: (error) => {
            console.error('Real-time error:', error);
            Alert.alert('Real-time Error', error);
            setRealTimeActive(false);
          }
        }
      );
    } catch (error: any) {
      console.error('Error starting real-time discovery:', error);
      Alert.alert('Error', error.message || 'Failed to start real-time discovery');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !currentLocation) return;

    try {
      setLoading(true);
      const searchResults = await RealTimeBusinessDiscovery.searchBusinesses(
        currentLocation,
        searchQuery,
        20
      );
      setBusinesses(searchResults);
      setLoading(false);
    } catch (error: any) {
      console.error('Error searching businesses:', error);
      Alert.alert('Search Error', error.message || 'Failed to search businesses');
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId: string | null) => {
    if (!currentLocation) return;

    try {
      setSelectedCategory(categoryId);
      setLoading(true);

      const filteredBusinesses = await RealTimeBusinessDiscovery.getNearbyBusinesses(
        currentLocation,
        20,
        categoryId || undefined
      );
      setBusinesses(filteredBusinesses);
      setLoading(false);
    } catch (error: any) {
      console.error('Error filtering businesses:', error);
      Alert.alert('Filter Error', error.message || 'Failed to filter businesses');
      setLoading(false);
    }
  };

  const handleBusinessPress = (business: BusinessDetails) => {
    setSelectedBusiness(business);
    setServiceRequestModal(true);
  };

  const handleServiceRequest = async () => {
    if (!selectedBusiness || !user?.id || !currentLocation) return;

    try {
      setLoading(true);

      // Get customer info
      const customer = await RealTimeBusinessDiscovery.createOrUpdateCustomer(
        user.id,
        user.user_metadata?.full_name || 'Customer',
        user.user_metadata?.phone || '',
        currentLocation
      );

      // Create service request
      await RealTimeBusinessDiscovery.createServiceRequest(
        selectedBusiness.id,
        customer.id,
        selectedBusiness.category_name,
        serviceDescription || 'Service request',
        currentLocation,
        'Current location',
        'normal'
      );

      Alert.alert(
        'Request Sent!',
        `Your service request has been sent to ${selectedBusiness.name}. They will contact you soon.`
      );

      setServiceRequestModal(false);
      setServiceDescription('');
      setSelectedBusiness(null);
      setLoading(false);
    } catch (error: any) {
      console.error('Error creating service request:', error);
      Alert.alert('Request Error', error.message || 'Failed to send service request');
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeApp();
    setRefreshing(false);
  }, []);

  const renderBusinessItem = ({ item }: { item: BusinessDetails }) => (
    <TouchableOpacity
      style={[styles.businessCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleBusinessPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={[styles.businessName, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.businessCategory, { color: theme.colors.textSecondary }]}>
            {item.category_icon} {item.category_name}
          </Text>
          <Text style={[styles.businessAddress, { color: theme.colors.textSecondary }]}>
            📍 {item.address}
          </Text>
          <Text style={[styles.businessDistance, { color: theme.colors.primary }]}>
            {item.distance_km.toFixed(1)} km away
          </Text>
        </View>

        <View style={styles.businessStatus}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.is_currently_open ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.statusText}>
              {item.is_currently_open ? 'OPEN' : 'CLOSED'}
            </Text>
          </View>
          
          {item.current_customers > 0 && (
            <Text style={[styles.customerInfo, { color: theme.colors.textSecondary }]}>
              👥 {item.current_customers} customers
            </Text>
          )}
          
          <Text style={[styles.waitTime, { color: theme.colors.textSecondary }]}>
            ⏱️ ~{item.estimated_wait_time}min
          </Text>
        </View>
      </View>

      <View style={styles.businessFooter}>
        <View style={styles.ratingContainer}>
          <Text style={[styles.rating, { color: theme.colors.textSecondary }]}>
            ⭐ {item.rating.toFixed(1)} ({item.total_reviews} reviews)
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.priceRange, { color: theme.colors.textSecondary }]}>
            💰 {item.price_range}
          </Text>
        </View>

        {item.phone && (
          <TouchableOpacity 
            style={[styles.callButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => Alert.alert('Call', `Call ${item.phone}?`)}
          >
            <Text style={styles.callButtonText}>📞 Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { 
          backgroundColor: selectedCategory === item.id ? theme.colors.primary : theme.colors.surface,
          borderColor: theme.colors.border 
        }
      ]}
      onPress={() => handleCategoryFilter(selectedCategory === item.id ? null : item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryName,
        { color: selectedCategory === item.id ? '#FFFFFF' : theme.colors.text }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading && businesses.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            🚀 Starting real-time discovery...
          </Text>
          <Text style={[styles.loadingSubtext, { color: theme.colors.textSecondary }]}>
            Finding businesses within 20km radius
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            🏪 TownTap
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Real-time local services
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={[
            styles.liveIndicator,
            { backgroundColor: realTimeActive ? '#10B981' : '#EF4444' }
          ]} />
          <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
            {realTimeActive ? '🔴 LIVE' : '⚫ Offline'}
          </Text>
          <Text style={[styles.updateCount, { color: theme.colors.textSecondary }]}>
            {locationUpdateCount} updates
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search services (plumber, electrician, etc.)"
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="send" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          🔧 Service Categories
        </Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Businesses List */}
      <View style={styles.businessesSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          📍 Nearby Services ({businesses.length} found)
        </Text>
        <FlatList
          data={businesses}
          renderItem={renderBusinessItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.businessesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                🔍 No services found nearby
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Try expanding your search or check back later
              </Text>
            </View>
          )}
        />
      </View>

      {/* Service Request Modal */}
      <Modal
        visible={serviceRequestModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setServiceRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Request Service
              </Text>
              <TouchableOpacity onPress={() => setServiceRequestModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedBusiness && (
              <View style={styles.selectedBusinessInfo}>
                <Text style={[styles.selectedBusinessName, { color: theme.colors.text }]}>
                  {selectedBusiness.name}
                </Text>
                <Text style={[styles.selectedBusinessCategory, { color: theme.colors.textSecondary }]}>
                  {selectedBusiness.category_icon} {selectedBusiness.category_name}
                </Text>
                <Text style={[styles.selectedBusinessDistance, { color: theme.colors.primary }]}>
                  📍 {selectedBusiness.distance_km.toFixed(1)} km away
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Describe your service need:
              </Text>
              <TextInput
                style={[
                  styles.descriptionInput,
                  { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }
                ]}
                placeholder="Describe what you need..."
                placeholderTextColor={theme.colors.textSecondary}
                value={serviceDescription}
                onChangeText={setServiceDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => setServiceRequestModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.requestButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleServiceRequest}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.requestButtonText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  liveIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  updateCount: {
    fontSize: 10,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
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
  businessesSection: {
    flex: 1,
  },
  businessesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  businessCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
    marginRight: 12,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  businessAddress: {
    fontSize: 12,
    marginBottom: 4,
  },
  businessDistance: {
    fontSize: 14,
    fontWeight: '600',
  },
  businessStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customerInfo: {
    fontSize: 12,
    marginBottom: 2,
  },
  waitTime: {
    fontSize: 12,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flex: 1,
  },
  rating: {
    fontSize: 14,
  },
  priceContainer: {
    marginHorizontal: 12,
  },
  priceRange: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  callButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedBusinessInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  selectedBusinessName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedBusinessCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  selectedBusinessDistance: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  requestButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SimpleRealTimeHomeScreen;
