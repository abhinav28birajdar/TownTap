// ================================================================
// 🏠 SIMPLE REAL-TIME HOME SCREEN
// ================================================================

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ModernThemeContext';
import RealTimeBusinessDiscovery, { BusinessDetails, Coordinates } from '../services/RealTimeBusinessDiscovery';
import { useAuth } from '../stores/authStore';

const { width } = Dimensions.get('window');

// ================================================================
// INTERFACES
// ================================================================

interface CategoryFilter {
  id: string;
  name: string;
  icon: string;
}

// ================================================================
// MAIN COMPONENT
// ================================================================

const SimpleRealTimeHomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // ================================================================
  // STATE MANAGEMENT
  // ================================================================
  
  const [businesses, setBusinesses] = useState<BusinessDetails[]>([]);
  const [categories, setCategories] = useState<CategoryFilter[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);

  // ================================================================
  // REAL-TIME DISCOVERY
  // ================================================================

  const startRealTimeDiscovery = useCallback(async () => {
    if (!user?.id || !currentLocation) return;

    try {
      setIsRealTimeActive(true);
      
      await RealTimeBusinessDiscovery.startRealTimeDiscovery({
        userId: user.id,
        location: currentLocation,
        radius: 5,
        onBusinessesUpdate: (updatedBusinesses) => {
          setBusinesses(updatedBusinesses);
          setIsLoading(false);
        },
        onLocationUpdate: (newLocation) => {
          setCurrentLocation(newLocation);
        },
        onError: (error) => {
          console.error('Real-time discovery error:', error);
          Alert.alert('Error', 'Failed to update business data');
        },
      });
    } catch (error) {
      console.error('Error starting real-time discovery:', error);
      setIsRealTimeActive(false);
    }
  }, [user?.id, currentLocation]);

  const stopRealTimeDiscovery = useCallback(async () => {
    if (!user?.id) return;

    try {
      await RealTimeBusinessDiscovery.stopRealTimeDiscovery(user.id);
      setIsRealTimeActive(false);
    } catch (error) {
      console.error('Error stopping real-time discovery:', error);
    }
  }, [user?.id]);

  // ================================================================
  // INITIALIZATION
  // ================================================================

  useEffect(() => {
    initializeScreen();
    return () => {
      if (user?.id) {
        RealTimeBusinessDiscovery.stopRealTimeDiscovery(user.id);
      }
    };
  }, []);

  useEffect(() => {
    if (currentLocation && user?.id && !isRealTimeActive) {
      startRealTimeDiscovery();
    }
  }, [currentLocation, user?.id, startRealTimeDiscovery, isRealTimeActive]);

  const initializeScreen = async () => {
    try {
      setIsLoading(true);

      // Get current location
      const location = await RealTimeBusinessDiscovery.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
      } else {
        Alert.alert('Location Required', 'Please enable location services to find nearby businesses');
      }

      // Load categories
      const categoryData = await RealTimeBusinessDiscovery.getBusinessCategories();
      setCategories(categoryData);

    } catch (error) {
      console.error('Error initializing screen:', error);
      Alert.alert('Error', 'Failed to initialize the home screen');
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================================
  // EVENT HANDLERS
  // ================================================================

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (currentLocation && user?.id) {
        const updatedBusinesses = await RealTimeBusinessDiscovery.getNearbyBusinesses(
          currentLocation,
          5,
          user.id
        );
        setBusinesses(updatedBusinesses);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentLocation, user?.id]);

  const handleSearch = useCallback(async (query: string) => {
    if (!currentLocation || !query.trim()) {
      if (currentLocation && user?.id) {
        const allBusinesses = await RealTimeBusinessDiscovery.getNearbyBusinesses(
          currentLocation,
          5,
          user.id
        );
        setBusinesses(allBusinesses);
      }
      return;
    }

    try {
      const searchResults = await RealTimeBusinessDiscovery.searchBusinesses(
        currentLocation,
        query,
        {
          radius: 5,
          category: selectedCategory || undefined,
          onlyOpen: true,
        }
      );
      setBusinesses(searchResults);
    } catch (error) {
      console.error('Error searching businesses:', error);
    }
  }, [currentLocation, selectedCategory, user?.id]);

  const handleCategorySelect = useCallback(async (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    
    if (!currentLocation) return;

    try {
      let filteredBusinesses: BusinessDetails[];
      
      if (categoryId) {
        filteredBusinesses = await RealTimeBusinessDiscovery.getBusinessesByCategory(
          currentLocation,
          categoryId,
          5
        );
      } else {
        filteredBusinesses = await RealTimeBusinessDiscovery.getNearbyBusinesses(
          currentLocation,
          5,
          user?.id
        );
      }
      
      setBusinesses(filteredBusinesses);
    } catch (error) {
      console.error('Error filtering by category:', error);
    }
  }, [currentLocation, user?.id]);

  const handleBusinessPress = useCallback((business: BusinessDetails) => {
    Alert.alert(
      business.name,
      `Distance: ${business.distance.toFixed(1)}km\nEstimated wait: ${business.estimatedWaitTime || 'N/A'} mins\nRating: ${business.rating}/5`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to business details') },
      ]
    );
  }, []);

  // ================================================================
  // RENDER HELPERS
  // ================================================================

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      <TouchableOpacity
        style={[
          styles.categoryChip,
          !selectedCategory && { backgroundColor: theme.colors.primary },
        ]}
        onPress={() => handleCategorySelect(null)}
      >
        <Text
          style={[
            styles.categoryText,
            { color: !selectedCategory ? theme.colors.background : theme.colors.text },
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleCategorySelect(category.id)}
        >
          <Text
            style={[
              styles.categoryText,
              { color: selectedCategory === category.id ? theme.colors.background : theme.colors.text },
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBusinessCard = (business: BusinessDetails) => (
    <TouchableOpacity
      key={business.id}
      style={[styles.businessCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleBusinessPress(business)}
    >
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={[styles.businessName, { color: theme.colors.text }]}>
            {business.name}
          </Text>
          <Text style={[styles.businessCategory, { color: theme.colors.text + '80' }]}>
            {business.category_name || 'General'}
          </Text>
        </View>
        <View style={styles.businessStats}>
          <Text style={[styles.distance, { color: theme.colors.primary }]}>
            {business.distance.toFixed(1)}km
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.rating, { color: theme.colors.text }]}>
              {business.rating}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={[styles.businessDescription, { color: theme.colors.text + '80' }]}>
        {business.description}
      </Text>
      
      <View style={styles.businessFooter}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: business.is_open ? '#4CAF50' : '#F44336' },
            ]}
          />
          <Text style={[styles.statusText, { color: theme.colors.text + '80' }]}>
            {business.is_open ? 'Open' : 'Closed'}
          </Text>
        </View>
        
        {business.estimatedWaitTime && (
          <Text style={[styles.waitTime, { color: theme.colors.text + '80' }]}>
            ~{business.estimatedWaitTime} mins
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // ================================================================
  // MAIN RENDER
  // ================================================================

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Finding nearby businesses...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Discover Local Businesses
        </Text>
        <View style={styles.realTimeIndicator}>
          <View
            style={[
              styles.realTimeDot,
              { backgroundColor: isRealTimeActive ? '#4CAF50' : '#F44336' },
            ]}
          />
          <Text style={[styles.realTimeText, { color: theme.colors.text + '80' }]}>
            {isRealTimeActive ? 'Live' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="search" size={20} color={theme.colors.text + '60'} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search businesses..."
          placeholderTextColor={theme.colors.text + '60'}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearch(text);
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            handleSearch('');
          }}>
            <Ionicons name="close" size={20} color={theme.colors.text + '60'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Business List */}
      <ScrollView
        style={styles.businessList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {businesses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color={theme.colors.text + '40'} />
            <Text style={[styles.emptyText, { color: theme.colors.text + '60' }]}>
              No businesses found nearby
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.text + '40' }]}>
              Try adjusting your search or location
            </Text>
          </View>
        ) : (
          businesses.map(renderBusinessCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  realTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  realTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  realTimeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  businessList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  businessCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
  },
  businessStats: {
    alignItems: 'flex-end',
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
  },
  businessDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  waitTime: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SimpleRealTimeHomeScreen;
