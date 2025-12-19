import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: number;
  price: string;
  isAvailable: boolean;
  image: string;
  description: string;
}

type SortOption = 'relevance' | 'rating' | 'distance' | 'price_low' | 'price_high';

const filterOptions = [
  { id: 'rating', label: 'Rating 4+', icon: 'star' },
  { id: 'available', label: 'Available Now', icon: 'checkmark-circle' },
  { id: 'verified', label: 'Verified', icon: 'shield-checkmark' },
  { id: 'nearby', label: 'Nearby', icon: 'location' },
];

export default function SearchResultsScreen() {
  const params = useLocalSearchParams<{ q: string }>();
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState(params.q || '');
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showSortModal, setShowSortModal] = useState(false);
  const fadeAnim = new Animated.Value(0);

  // Mock data - replace with actual API call
  const mockResults: Business[] = [
    {
      id: '1',
      name: 'QuickFix Plumbing',
      category: 'Plumber',
      rating: 4.8,
      reviewCount: 156,
      distance: 1.2,
      price: '₹299',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      description: 'Expert plumbing services with 10+ years of experience',
    },
    {
      id: '2',
      name: 'Pro Electric Solutions',
      category: 'Electrician',
      rating: 4.6,
      reviewCount: 89,
      distance: 2.5,
      price: '₹349',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
      description: 'Certified electricians for all your electrical needs',
    },
    {
      id: '3',
      name: 'Cool Tech AC Services',
      category: 'AC Repair',
      rating: 4.9,
      reviewCount: 234,
      distance: 0.8,
      price: '₹499',
      isAvailable: false,
      image: 'https://images.unsplash.com/photo-1631545806609-1d242e217cb5?w=400',
      description: 'AC installation, repair and maintenance specialists',
    },
    {
      id: '4',
      name: 'Sparkle Clean Services',
      category: 'Cleaning',
      rating: 4.7,
      reviewCount: 312,
      distance: 3.1,
      price: '₹599',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      description: 'Professional home and office cleaning services',
    },
    {
      id: '5',
      name: 'Master Carpenter Works',
      category: 'Carpenter',
      rating: 4.5,
      reviewCount: 78,
      distance: 4.2,
      price: '₹449',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
      description: 'Custom furniture and carpentry solutions',
    },
  ];

  useEffect(() => {
    fetchResults();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [searchQuery, activeFilters, sortBy]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filtered = [...mockResults];
      
      // Apply filters
      if (activeFilters.includes('rating')) {
        filtered = filtered.filter(b => b.rating >= 4);
      }
      if (activeFilters.includes('available')) {
        filtered = filtered.filter(b => b.isAvailable);
      }
      if (activeFilters.includes('nearby')) {
        filtered = filtered.filter(b => b.distance <= 2);
      }
      
      // Apply sort
      switch (sortBy) {
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'distance':
          filtered.sort((a, b) => a.distance - b.distance);
          break;
        case 'price_low':
          filtered.sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
          break;
        case 'price_high':
          filtered.sort((a, b) => parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')));
          break;
      }
      
      setResults(filtered);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleBusinessPress = (business: Business) => {
    router.push(`/business/${business.id}`);
  };

  const renderBusinessCard = ({ item, index }: { item: Business; index: number }) => (
    <Animated.View
      style={[
        styles.businessCard,
        { 
          backgroundColor: colors.card,
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleBusinessPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.businessImage}
          defaultSource={require('@/assets/images/icon.png')}
        />
        
        {item.isAvailable && (
          <View style={[styles.availableBadge, { backgroundColor: colors.success }]}>
            <ThemedText style={styles.availableText}>Available Now</ThemedText>
          </View>
        )}
        
        <View style={styles.businessInfo}>
          <View style={styles.businessHeader}>
            <ThemedText style={styles.businessName} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <ThemedText style={styles.rating}>{item.rating}</ThemedText>
              <ThemedText style={[styles.reviewCount, { color: colors.textSecondary }]}>
                ({item.reviewCount})
              </ThemedText>
            </View>
          </View>
          
          <ThemedText style={[styles.category, { color: colors.primary }]}>
            {item.category}
          </ThemedText>
          
          <ThemedText style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>
          
          <View style={styles.businessFooter}>
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <ThemedText style={[styles.distance, { color: colors.textSecondary }]}>
                {item.distance} km away
              </ThemedText>
            </View>
            <ThemedText style={[styles.price, { color: colors.primary }]}>
              From {item.price}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const SortModal = () => (
    <View style={[styles.sortModal, { backgroundColor: colors.card }]}>
      <View style={styles.sortModalHeader}>
        <ThemedText style={styles.sortModalTitle}>Sort By</ThemedText>
        <TouchableOpacity onPress={() => setShowSortModal(false)}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {[
        { id: 'relevance', label: 'Relevance' },
        { id: 'rating', label: 'Rating (High to Low)' },
        { id: 'distance', label: 'Distance (Near to Far)' },
        { id: 'price_low', label: 'Price (Low to High)' },
        { id: 'price_high', label: 'Price (High to Low)' },
      ].map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.sortOption,
            sortBy === option.id && { backgroundColor: colors.primary + '15' },
          ]}
          onPress={() => {
            setSortBy(option.id as SortOption);
            setShowSortModal(false);
          }}
        >
          <ThemedText style={[
            styles.sortOptionText,
            sortBy === option.id && { color: colors.primary, fontWeight: '600' },
          ]}>
            {option.label}
          </ThemedText>
          {sortBy === option.id && (
            <Ionicons name="checkmark" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.card }]}
          onPress={() => router.push('/search/index' as any)}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <ThemedText style={[styles.searchText, { color: colors.text }]} numberOfLines={1}>
            {searchQuery || 'Search for services...'}
          </ThemedText>
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: colors.card }]}
          onPress={() => router.push('/customer/map-view')}
        >
          <Ionicons name="map-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={18} color={colors.text} />
            <ThemedText style={styles.sortButtonText}>Sort</ThemedText>
          </TouchableOpacity>
          
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilters.includes(filter.id)
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => toggleFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={activeFilters.includes(filter.id) ? '#FFF' : colors.text}
              />
              <ThemedText
                style={[
                  styles.filterChipText,
                  activeFilters.includes(filter.id) && { color: '#FFF' },
                ]}
              >
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <ThemedText style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {loading ? 'Searching...' : `${results.length} services found`}
        </ThemedText>
        {activeFilters.length > 0 && (
          <TouchableOpacity onPress={() => setActiveFilters([])}>
            <ThemedText style={[styles.clearFilters, { color: colors.primary }]}>
              Clear Filters
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Results List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding best services for you...
          </ThemedText>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderBusinessCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
          <ThemedText style={styles.emptyTitle}>No Results Found</ThemedText>
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            Try adjusting your search or filters to find what you're looking for
          </ThemedText>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <ThemedText style={styles.browseButtonText}>Browse Categories</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <SortModal />
        </TouchableOpacity>
      )}
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
    padding: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    paddingBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  filterChipText: {
    fontSize: 14,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
  },
  clearFilters: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  businessCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  businessImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E0E0E0',
  },
  availableBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  businessInfo: {
    padding: 16,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 12,
  },
  category: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 13,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  sortOptionText: {
    fontSize: 16,
  },
});
