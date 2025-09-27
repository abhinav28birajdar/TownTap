/**
 * FILE: src/screens/customer/LocalMartHomeScreen.tsx
 * PURPOSE: Enhanced LocalMart Home Screen with Type A, B, C business discovery
 * RESPONSIBILITIES: Location-aware business discovery, category navigation, search
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions,
  StyleSheet,
  FlatList,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { 
  BusinessBase,
  BusinessCategory,
  BusinessInteractionType,
  LocationData
} from '../../types/localMartTypes';
import { BusinessCategoryService } from '../../services/businessCategoryService';
import { useTheme } from '../../context/ModernThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface LocalMartHomeScreenProps {
  navigation?: any;
}

export default function LocalMartHomeScreen({ navigation }: LocalMartHomeScreenProps) {
  const router = useRouter();
  const { theme } = useTheme();
  
  // State management
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<BusinessInteractionType | 'all'>('all');
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<BusinessBase[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessBase[]>([]);
  const [recommendedBusinesses, setRecommendedBusinesses] = useState<BusinessBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      loadBusinessData();
    }
  }, [currentLocation, selectedFilter]);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Load categories
      const allCategories = BusinessCategoryService.getBusinessCategories();
      setCategories(allCategories);

      // Request location permission and get current location
      await requestLocationPermission();
      
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize the app. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationPermissionGranted(false);
        Alert.alert(
          'Location Permission Required',
          'LocalMart needs access to your location to show nearby businesses and services.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return;
      }

      setLocationPermissionGranted(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: 'Current Location'
      };

      setCurrentLocation(locationData);

    } catch (error) {
      console.error('Error getting location:', error);
      setLocationPermissionGranted(false);
      // Use default location (Mumbai) for demo
      setCurrentLocation({
        latitude: 19.0760,
        longitude: 72.8777,
        address: 'Mumbai, Maharashtra'
      });
    }
  };

  const loadBusinessData = async () => {
    if (!currentLocation) return;

    try {
      // Load nearby businesses based on filter
      const nearbyOptions = selectedFilter === 'all' ? {} : { interaction_type: selectedFilter };
      const nearbyResponse = await BusinessCategoryService.getNearbyBusinesses(
        currentLocation,
        { ...nearbyOptions, limit: 10 }
      );
      setNearbyBusinesses(nearbyResponse.data);

      // Load featured businesses
      const featured = await BusinessCategoryService.getFeaturedBusinesses(currentLocation, 5);
      setFeaturedBusinesses(featured);

      // Load recommended businesses (simulated user ID)
      const recommended = await BusinessCategoryService.getRecommendedBusinesses(
        'user_123',
        currentLocation,
        5
      );
      setRecommendedBusinesses(recommended);

    } catch (error) {
      console.error('Error loading business data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBusinessData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const searchResults = await BusinessCategoryService.searchBusinesses(
        searchQuery,
        currentLocation || undefined,
        { limit: 20 }
      );

      router.push({
        pathname: '/customer/search-results',
        params: {
          query: searchQuery,
          results: JSON.stringify(searchResults)
        }
      });
    } catch (error) {
      console.error('Error searching:', error);
      Alert.alert('Error', 'Failed to search businesses. Please try again.');
    }
  };

  const handleCategoryPress = (category: BusinessCategory) => {
    router.push({
      pathname: '/customer/business-list',
      params: {
        category: category.id,
        interaction_type: category.interaction_type,
        categoryName: category.name
      }
    });
  };

  const handleBusinessPress = (business: BusinessBase) => {
    router.push({
      pathname: '/customer/business-detail',
      params: {
        businessId: business.id,
        interaction_type: business.interaction_type
      }
    });
  };

  const handleFilterPress = (filter: BusinessInteractionType | 'all') => {
    setSelectedFilter(filter);
  };

  const handleLocationPress = () => {
    router.push('/customer/location-picker');
  };

  const handleMapViewPress = () => {
    router.push({
      pathname: '/customer/map-view',
      params: {
        businesses: JSON.stringify(nearbyBusinesses),
        center: JSON.stringify(currentLocation)
      }
    });
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <SafeAreaView edges={['top']}>
        <View style={styles.headerContent}>
          {/* Location */}
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={handleLocationPress}
          >
            <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
            <View style={styles.locationTextContainer}>
              <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                Deliver to
              </Text>
              <Text style={[styles.locationValue, { color: theme.colors.text }]} numberOfLines={1}>
                {currentLocation?.address || 'Select Location'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search for products, services, or businesses..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleMapViewPress}
            >
              <Ionicons name="map-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
              onPress={() => router.push('/customer/notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  const renderBusinessTypeFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: selectedFilter === 'all' ? theme.colors.primary : theme.colors.surface },
            { borderColor: theme.colors.border }
          ]}
          onPress={() => handleFilterPress('all')}
        >
          <Text style={[
            styles.filterText,
            { color: selectedFilter === 'all' ? 'white' : theme.colors.text }
          ]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: selectedFilter === 'type_a' ? theme.colors.primary : theme.colors.surface },
            { borderColor: theme.colors.border }
          ]}
          onPress={() => handleFilterPress('type_a')}
        >
          <Text style={[
            styles.filterText,
            { color: selectedFilter === 'type_a' ? 'white' : theme.colors.text }
          ]}>
            🛒 Order & Buy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: selectedFilter === 'type_b' ? theme.colors.primary : theme.colors.surface },
            { borderColor: theme.colors.border }
          ]}
          onPress={() => handleFilterPress('type_b')}
        >
          <Text style={[
            styles.filterText,
            { color: selectedFilter === 'type_b' ? 'white' : theme.colors.text }
          ]}>
            🔧 Book Service
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: selectedFilter === 'type_c' ? theme.colors.primary : theme.colors.surface },
            { borderColor: theme.colors.border }
          ]}
          onPress={() => handleFilterPress('type_c')}
        >
          <Text style={[
            styles.filterText,
            { color: selectedFilter === 'type_c' ? 'white' : theme.colors.text }
          ]}>
            💼 Consult
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderCategories = () => {
    const filteredCategories = selectedFilter === 'all' 
      ? categories 
      : categories.filter(cat => cat.interaction_type === selectedFilter);

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Browse Categories
        </Text>
        <FlatList
          data={filteredCategories}
          numColumns={3}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleCategoryPress(item)}
            >
              <Text style={styles.categoryIcon}>{item.icon_url}</Text>
              <Text style={[styles.categoryName, { color: theme.colors.text }]} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={[styles.interactionTypeBadge, { 
                backgroundColor: getInteractionTypeColor(item.interaction_type) 
              }]}>
                <Text style={styles.interactionTypeText}>
                  {getInteractionTypeLabel(item.interaction_type)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderBusinessSection = (
    title: string,
    businesses: BusinessBase[],
    horizontal: boolean = true
  ) => {
    if (businesses.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={businesses}
          horizontal={horizontal}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={horizontal ? styles.horizontalList : undefined}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                horizontal ? styles.businessCardHorizontal : styles.businessCardVertical,
                { backgroundColor: theme.colors.surface }
              ]}
              onPress={() => handleBusinessPress(item)}
            >
              <Image
                source={{ uri: item.logo_url || 'https://via.placeholder.com/100' }}
                style={styles.businessLogo}
                resizeMode="cover"
              />
              <View style={styles.businessInfo}>
                <Text style={[styles.businessName, { color: theme.colors.text }]} numberOfLines={1}>
                  {item.business_name}
                </Text>
                <Text style={[styles.businessCategory, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {item.category.name}
                </Text>
                <View style={styles.businessMeta}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: theme.colors.textSecondary }]}>
                      {item.avg_rating.toFixed(1)}
                    </Text>
                  </View>
                  <Text style={[styles.reviewCount, { color: theme.colors.textSecondary }]}>
                    ({item.total_reviews})
                  </Text>
                </View>
                <View style={[styles.interactionTypeBadge, { 
                  backgroundColor: getInteractionTypeColor(item.interaction_type) 
                }]}>
                  <Text style={styles.interactionTypeText}>
                    {getInteractionTypeLabel(item.interaction_type)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const getInteractionTypeColor = (type: BusinessInteractionType): string => {
    switch (type) {
      case 'type_a': return '#4CAF50'; // Green for Order & Buy
      case 'type_b': return '#2196F3'; // Blue for Book Service
      case 'type_c': return '#FF9800'; // Orange for Consult
      default: return '#9E9E9E';
    }
  };

  const getInteractionTypeLabel = (type: BusinessInteractionType): string => {
    switch (type) {
      case 'type_a': return 'Order';
      case 'type_b': return 'Book';
      case 'type_c': return 'Consult';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading LocalMart...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderBusinessTypeFilters()}
        {renderCategories()}
        {renderBusinessSection('Featured Businesses', featuredBusinesses)}
        {renderBusinessSection('Recommended for You', recommendedBusinesses)}
        {renderBusinessSection('Nearby Businesses', nearbyBusinesses, false)}
      </ScrollView>
    </View>
  );
}

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
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  locationText: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    paddingVertical: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
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
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryCard: {
    flex: 1,
    margin: 6,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 100,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  interactionTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'center',
  },
  interactionTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  businessCardHorizontal: {
    width: 280,
    marginRight: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
  },
  businessCardVertical: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
  },
  businessLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
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
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
  },
});

export default LocalMartHomeScreen;