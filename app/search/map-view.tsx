import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: string;
  priceRange: string;
  isOpen: boolean;
  services: string[];
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

const sampleBusinesses: Business[] = [
  {
    id: '1',
    name: 'Quick Fix Plumbing',
    category: 'Plumbing',
    rating: 4.8,
    reviewCount: 234,
    distance: '0.5 km',
    priceRange: '$$',
    isOpen: true,
    services: ['Pipe repair', 'Drain cleaning', 'Water heater'],
    coordinate: { latitude: 28.6139, longitude: 77.209 },
  },
  {
    id: '2',
    name: 'Sparkle Cleaners',
    category: 'Cleaning',
    rating: 4.6,
    reviewCount: 189,
    distance: '0.8 km',
    priceRange: '$',
    isOpen: true,
    services: ['Home cleaning', 'Deep cleaning', 'Carpet cleaning'],
    coordinate: { latitude: 28.6159, longitude: 77.211 },
  },
  {
    id: '3',
    name: 'ElectroFix Services',
    category: 'Electrical',
    rating: 4.7,
    reviewCount: 312,
    distance: '1.2 km',
    priceRange: '$$',
    isOpen: false,
    services: ['Wiring', 'Repairs', 'Installation'],
    coordinate: { latitude: 28.6119, longitude: 77.207 },
  },
  {
    id: '4',
    name: 'Beauty Bliss Salon',
    category: 'Beauty',
    rating: 4.9,
    reviewCount: 567,
    distance: '1.5 km',
    priceRange: '$$$',
    isOpen: true,
    services: ['Haircut', 'Facial', 'Massage'],
    coordinate: { latitude: 28.6179, longitude: 77.213 },
  },
  {
    id: '5',
    name: 'AC Cool Services',
    category: 'AC Repair',
    rating: 4.5,
    reviewCount: 145,
    distance: '2.0 km',
    priceRange: '$$',
    isOpen: true,
    services: ['AC repair', 'Gas refill', 'Installation'],
    coordinate: { latitude: 28.6099, longitude: 77.205 },
  },
];

const categories = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'plumbing', name: 'Plumbing', icon: 'water' },
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles' },
  { id: 'electrical', name: 'Electrical', icon: 'flash' },
  { id: 'beauty', name: 'Beauty', icon: 'flower' },
  { id: 'ac-repair', name: 'AC Repair', icon: 'snow' },
];

export default function MapViewScreen() {
  const colors = useColors();
  const mapRef = useRef<MapView>(null);
  const cardScrollRef = useRef<ScrollView>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      Animated.spring(bottomSheetAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(bottomSheetAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedBusiness]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (error) {
      console.log('Error getting location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  const handleMarkerPress = (business: Business) => {
    setSelectedBusiness(business);
    mapRef.current?.animateToRegion({
      ...business.coordinate,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const filteredBusinesses = selectedCategory === 'all'
    ? sampleBusinesses
    : sampleBusinesses.filter(b => b.category.toLowerCase().includes(selectedCategory));

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'plumbing': return '#2196F3';
      case 'cleaning': return '#4CAF50';
      case 'electrical': return '#FF9800';
      case 'beauty': return '#E91E63';
      case 'ac repair': return '#00BCD4';
      default: return colors.primary;
    }
  };

  const bottomSheetTranslate = bottomSheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Loading map...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelectedBusiness(null)}
      >
        {filteredBusinesses.map((business) => (
          <Marker
            key={business.id}
            coordinate={business.coordinate}
            onPress={() => handleMarkerPress(business)}
          >
            <View style={[
              styles.marker,
              {
                backgroundColor: selectedBusiness?.id === business.id 
                  ? getCategoryColor(business.category) 
                  : colors.card,
                borderColor: getCategoryColor(business.category),
              },
            ]}>
              <Ionicons
                name="storefront"
                size={18}
                color={selectedBusiness?.id === business.id ? '#FFF' : getCategoryColor(business.category)}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.searchBar, { backgroundColor: colors.background }]}
            onPress={() => router.push('/search/index' as any)}
          >
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <ThemedText style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Search services nearby
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === cat.id ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={selectedCategory === cat.id ? '#FFF' : colors.textSecondary}
              />
              <ThemedText
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === cat.id ? '#FFF' : colors.text },
                ]}
              >
                {cat.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[styles.mapControlButton, { backgroundColor: colors.card }]}
          onPress={centerOnUser}
        >
          <Ionicons name="locate" size={22} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.mapControlButton, { backgroundColor: colors.card }]}
          onPress={() => {/* Toggle layers */}}
        >
          <Ionicons name="layers-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Bottom Business Cards */}
      <View style={styles.bottomCardsContainer}>
        <ScrollView
          ref={cardScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={width - 48}
          decelerationRate="fast"
          contentContainerStyle={styles.cardsScrollContent}
        >
          {filteredBusinesses.map((business) => (
            <TouchableOpacity
              key={business.id}
              style={[
                styles.businessCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedBusiness?.id === business.id ? colors.primary : 'transparent',
                  borderWidth: selectedBusiness?.id === business.id ? 2 : 0,
                },
              ]}
              onPress={() => {
                setSelectedBusiness(business);
                mapRef.current?.animateToRegion({
                  ...business.coordinate,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              }}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(business.category) + '20' }]}>
                  <ThemedText style={[styles.categoryBadgeText, { color: getCategoryColor(business.category) }]}>
                    {business.category}
                  </ThemedText>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: business.isOpen ? colors.success + '20' : colors.error + '20' }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: business.isOpen ? colors.success : colors.error }
                  ]} />
                  <ThemedText style={[
                    styles.statusText,
                    { color: business.isOpen ? colors.success : colors.error }
                  ]}>
                    {business.isOpen ? 'Open' : 'Closed'}
                  </ThemedText>
                </View>
              </View>
              
              <ThemedText style={styles.businessName}>{business.name}</ThemedText>
              
              <View style={styles.businessStats}>
                <View style={styles.businessStat}>
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <ThemedText style={styles.businessStatText}>
                    {business.rating} ({business.reviewCount})
                  </ThemedText>
                </View>
                <View style={styles.businessStat}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <ThemedText style={[styles.businessStatText, { color: colors.textSecondary }]}>
                    {business.distance}
                  </ThemedText>
                </View>
                <View style={styles.businessStat}>
                  <ThemedText style={[styles.businessStatText, { color: colors.primary }]}>
                    {business.priceRange}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.servicesPreview}>
                {business.services.slice(0, 3).map((service, index) => (
                  <View 
                    key={index} 
                    style={[styles.serviceTag, { backgroundColor: colors.background }]}
                  >
                    <ThemedText style={[styles.serviceTagText, { color: colors.textSecondary }]}>
                      {service}
                    </ThemedText>
                  </View>
                ))}
              </View>
              
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.viewButton, { borderColor: colors.primary }]}
                  onPress={() => router.push(`/business/${business.id}`)}
                >
                  <ThemedText style={[styles.viewButtonText, { color: colors.primary }]}>
                    View Details
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.bookButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push({
                    pathname: '/booking/form',
                    params: { businessId: business.id },
                  })}
                >
                  <ThemedText style={styles.bookButtonText}>Book Now</ThemedText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List View Toggle */}
      <TouchableOpacity
        style={[styles.listViewButton, { backgroundColor: colors.card }]}
        onPress={() => router.push('/search/results')}
      >
        <Ionicons name="list" size={22} color={colors.text} />
        <ThemedText style={styles.listViewText}>List View</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 8,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
  },
  filterButton: {
    padding: 8,
  },
  categoryScroll: {
    marginTop: 12,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: '40%',
    gap: 10,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomCardsContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
  cardsScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  businessCard: {
    width: width - 48,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  businessStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  businessStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  businessStatText: {
    fontSize: 13,
    fontWeight: '500',
  },
  servicesPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  serviceTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceTagText: {
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bookButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  listViewButton: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listViewText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
