/**
 * FILE: src/screens/customer/LocalMartHomeScreen.tsx
 * PURPOSE: Enhanced LocalMart Home Screen with multi-modal business discovery
 * RESPONSIBILITIES: Location-aware business discovery, Type A/B/C filtering, search
 * MOVED FROM: LocalMartHomeScreen.tsx to match app routing structure
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import {
  BusinessBase,
  BusinessCategory,
  BusinessInteractionType,
  UserLocation
} from '../../types/localMartTypes';
import { BusinessCategoryService } from '../../services/businessCategoryService';
import { useTheme } from '../../context/ModernThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LocalMartHomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedInteractionType, setSelectedInteractionType] = useState<BusinessInteractionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<BusinessBase[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string>('unknown');

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadBusinessData();
    }
  }, [userLocation, selectedInteractionType, selectedCategory]);

  const initializeScreen = async () => {
    try {
      setIsLoading(true);
      
      // Request location permission and get user location
      await requestLocationPermission();
      
      // Load categories
      const allCategories = BusinessCategoryService.getBusinessCategories();
      setCategories(allCategories);
      
    } catch (error) {
      console.error('Error initializing screen:', error);
      Alert.alert('Error', 'Failed to initialize LocalMart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(status);
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined
        });
      } else {
        // Use default location (Mumbai) if permission denied
        setUserLocation({
          latitude: 19.0760,
          longitude: 72.8777
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to default location
      setUserLocation({
        latitude: 19.0760,
        longitude: 72.8777
      });
    }
  };

  const loadBusinessData = async () => {
    if (!userLocation) return;

    try {
      const nearbyBusinesses = await BusinessCategoryService.getNearbyBusinesses(
        userLocation,
        5, // 5km radius
        selectedInteractionType === 'all' ? undefined : selectedInteractionType,
        selectedCategory || undefined
      );
      
      setBusinesses(nearbyBusinesses);
    } catch (error) {
      console.error('Error loading business data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBusinessData();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const searchResults = await BusinessCategoryService.searchBusinesses({
        query: searchQuery,
        location: userLocation || undefined,
        interaction_type: selectedInteractionType === 'all' ? undefined : selectedInteractionType,
        category_id: selectedCategory || undefined,
        radius_km: 10
      });
      
      setBusinesses(searchResults);
    } catch (error) {
      console.error('Error searching businesses:', error);
      Alert.alert('Error', 'Failed to search businesses. Please try again.');
    }
  };

  const handleBusinessPress = (business: BusinessBase) => {
    router.push({
      pathname: '/customer/unified-business-detail',
      params: {
        businessId: business.id,
        interaction_type: business.interaction_type
      }
    });
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleInteractionTypePress = (type: BusinessInteractionType | 'all') => {
    setSelectedInteractionType(type);
  };

  const handleLocationPress = async () => {
    await requestLocationPermission();
  };

  const renderLocationHeader = () => {
    const locationText = userLocation 
      ? locationPermissionStatus === 'granted' 
        ? 'Current Location' 
        : 'Default Location (Mumbai)'
      : 'Getting location...';

    return (
      <TouchableOpacity 
        style={styles.locationHeader}
        onPress={handleLocationPress}
      >
        <View style={styles.locationInfo}>
          <Ionicons 
            name={locationPermissionStatus === 'granted' ? "location" : "location-outline"} 
            size={20} 
            color={theme.colors.primary} 
          />
          <View style={styles.locationTextContainer}>
            <Text style={[styles.locationLabel, { color: theme.colors.textSecondary }]}>
              Delivering to
            </Text>
            <Text style={[styles.locationText, { color: theme.colors.text }]}>
              {locationText}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchSection}>
      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search businesses, products, services..."
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
    </View>
  );

  const renderInteractionTypeTabs = () => {
    const tabs = [
      { key: 'all', label: 'All', icon: 'apps' },
      { key: 'type_a', label: 'Order & Buy', icon: 'bag', color: '#4CAF50' },
      { key: 'type_b', label: 'Book Service', icon: 'calendar', color: '#2196F3' },
      { key: 'type_c', label: 'Consult', icon: 'chatbubbles', color: '#FF9800' }
    ];

    return (
      <View style={styles.interactionTypeTabs}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => {
            const isSelected = selectedInteractionType === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.interactionTypeTab,
                  {
                    backgroundColor: isSelected 
                      ? (tab.color || theme.colors.primary) 
                      : theme.colors.surface
                  }
                ]}
                onPress={() => handleInteractionTypePress(tab.key as any)}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={20} 
                  color={isSelected ? 'white' : theme.colors.text} 
                />
                <Text style={[
                  styles.interactionTypeTabText,
                  { color: isSelected ? 'white' : theme.colors.text }
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderCategories = () => {
    const filteredCategories = selectedInteractionType === 'all' 
      ? categories 
      : categories.filter(cat => cat.interaction_type === selectedInteractionType);

    if (filteredCategories.length === 0) return null;

    return (
      <View style={styles.categoriesSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Categories
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {filteredCategories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border
                  }
                ]}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryName,
                  { color: isSelected ? 'white' : theme.colors.text }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderBusinessCard = ({ item }: { item: BusinessBase }) => {
    const distance = userLocation 
      ? BusinessCategoryService.calculateDistance(
          userLocation,
          { latitude: item.location.latitude, longitude: item.location.longitude }
        )
      : null;

    const isOpen = BusinessCategoryService.isBusinessOpenNow(item);
    
    return (
      <TouchableOpacity
        style={[styles.businessCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleBusinessPress(item)}
      >
        <Image
          source={{ uri: item.logo_url || 'https://via.placeholder.com/80' }}
          style={styles.businessLogo}
          resizeMode="cover"
        />
        
        <View style={styles.businessInfo}>
          <View style={styles.businessHeader}>
            <Text style={[styles.businessName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.business_name}
            </Text>
            <View style={[styles.interactionTypeBadge, {
              backgroundColor: getInteractionTypeColor(item.interaction_type)
            }]}>
              <Text style={styles.interactionTypeBadgeText}>
                {getInteractionTypeLabel(item.interaction_type)}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.businessCategory, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.category.name}
          </Text>
          
          <View style={styles.businessMeta}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                {item.avg_rating.toFixed(1)}
              </Text>
              <Text style={[styles.reviewCount, { color: theme.colors.textSecondary }]}>
                ({item.total_reviews})
              </Text>
            </View>
            
            {distance && (
              <Text style={[styles.distanceText, { color: theme.colors.textSecondary }]}>
                {distance.toFixed(1)} km
              </Text>
            )}
          </View>
          
          <View style={styles.businessStatus}>
            <View style={[styles.statusIndicator, {
              backgroundColor: isOpen ? '#4CAF50' : '#F44336'
            }]} />
            <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
              {isOpen ? 'Open now' : 'Closed'}
            </Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderBusinessList = () => {
    if (businesses.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
            No businesses found
          </Text>
          <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
            Try adjusting your filters or search in a different area
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.businessListSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {searchQuery ? 'Search Results' : 'Nearby Businesses'}
          </Text>
          <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>
            {businesses.length} found
          </Text>
        </View>
        
        <FlatList
          data={businesses}
          keyExtractor={(item) => item.id}
          renderItem={renderBusinessCard}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const getInteractionTypeColor = (type: BusinessInteractionType): string => {
    switch (type) {
      case 'type_a': return '#4CAF50';
      case 'type_b': return '#2196F3';
      case 'type_c': return '#FF9800';
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading LocalMart...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderLocationHeader()}
        {renderSearchBar()}
        {renderInteractionTypeTabs()}
        {renderCategories()}
        {renderBusinessList()}
      </ScrollView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: 8,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '400',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  interactionTypeTabs: {
    marginVertical: 16,
  },
  tabsContainer: {
    paddingHorizontal: 16,
  },
  interactionTypeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  interactionTypeTabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    minWidth: 100,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  businessListSection: {
    paddingHorizontal: 16,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  interactionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  interactionTypeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  businessCategory: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 6,
  },
  businessMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  businessStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
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

export default LocalMartHomeScreen;