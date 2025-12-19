import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface NearbyBusiness {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: string;
  address: string;
  isOpen: boolean;
  closingTime?: string;
  priceRange: string;
  services: string[];
  featured?: boolean;
  isNew?: boolean;
}

const mockNearbyBusinesses: NearbyBusiness[] = [
  {
    id: '1',
    name: 'CleanPro Services',
    category: 'Home Cleaning',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    rating: 4.8,
    reviewCount: 245,
    distance: '0.5 km',
    address: '123 Market Street, Sector 15',
    isOpen: true,
    closingTime: '9:00 PM',
    priceRange: '₹₹',
    services: ['Deep Cleaning', 'Regular Cleaning', 'Office Cleaning'],
    featured: true,
  },
  {
    id: '2',
    name: 'CoolCare AC Services',
    category: 'Appliance Repair',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    rating: 4.7,
    reviewCount: 189,
    distance: '0.8 km',
    address: '45 Tech Park, DLF Phase 2',
    isOpen: true,
    closingTime: '8:00 PM',
    priceRange: '₹₹',
    services: ['AC Service', 'AC Repair', 'Installation'],
    isNew: true,
  },
  {
    id: '3',
    name: 'GlamUp Salon',
    category: 'Beauty & Wellness',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    rating: 4.6,
    reviewCount: 312,
    distance: '1.2 km',
    address: '78 Fashion Street, MG Road',
    isOpen: true,
    closingTime: '10:00 PM',
    priceRange: '₹₹₹',
    services: ['Hair Styling', 'Facial', 'Spa'],
  },
  {
    id: '4',
    name: 'QuickFix Plumbing',
    category: 'Plumbing',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    rating: 4.5,
    reviewCount: 156,
    distance: '1.5 km',
    address: '22 Service Lane, Industrial Area',
    isOpen: false,
    priceRange: '₹',
    services: ['Leak Repair', 'Pipe Fitting', 'Drainage'],
  },
  {
    id: '5',
    name: 'SafeHome Pest Control',
    category: 'Home Care',
    image: 'https://images.unsplash.com/photo-1632935191446-6794f4e7c5e7?w=400',
    rating: 4.9,
    reviewCount: 98,
    distance: '2.0 km',
    address: '99 Green Valley, Sector 22',
    isOpen: true,
    closingTime: '7:00 PM',
    priceRange: '₹₹',
    services: ['General Pest', 'Termite Control', 'Sanitization'],
  },
];

const categories = ['All', 'Cleaning', 'Repairs', 'Beauty', 'Home Care', 'Electrician'];

export default function NearbyScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'reviews'>('distance');

  const filteredBusinesses = mockNearbyBusinesses
    .filter((b) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

  const renderBusinessCard = ({ item }: { item: NearbyBusiness }) => (
    <TouchableOpacity
      style={[styles.businessCard, { backgroundColor: colors.card }]}
      onPress={() =>
        router.push({
          pathname: '/business/[id]',
          params: { id: item.id },
        })
      }
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        {item.featured && (
          <View style={[styles.featuredBadge, { backgroundColor: '#FFC107' }]}>
            <Ionicons name="star" size={12} color="#fff" />
            <ThemedText style={styles.featuredText}>Featured</ThemedText>
          </View>
        )}
        {item.isNew && (
          <View style={[styles.newBadge, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.newText}>NEW</ThemedText>
          </View>
        )}
        <View style={[styles.distanceBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <Ionicons name="location" size={12} color="#fff" />
          <ThemedText style={styles.distanceText}>{item.distance}</ThemedText>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View>
            <ThemedText style={styles.businessName}>{item.name}</ThemedText>
            <ThemedText style={[styles.businessCategory, { color: colors.textSecondary }]}>
              {item.category}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.isOpen ? colors.success + '15' : colors.error + '15' },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isOpen ? colors.success : colors.error },
              ]}
            />
            <ThemedText
              style={[
                styles.statusText,
                { color: item.isOpen ? colors.success : colors.error },
              ]}
            >
              {item.isOpen ? 'Open' : 'Closed'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.ratingRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
            <ThemedText style={[styles.reviewCount, { color: colors.textSecondary }]}>
              ({item.reviewCount})
            </ThemedText>
          </View>
          <ThemedText style={[styles.priceRange, { color: colors.primary }]}>
            {item.priceRange}
          </ThemedText>
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <ThemedText
            style={[styles.addressText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.address}
          </ThemedText>
        </View>

        <View style={styles.servicesRow}>
          {item.services.slice(0, 3).map((service, index) => (
            <View
              key={index}
              style={[styles.servicePill, { backgroundColor: colors.primary + '10' }]}
            >
              <ThemedText style={[styles.servicePillText, { color: colors.primary }]}>
                {service}
              </ThemedText>
            </View>
          ))}
        </View>

        {item.isOpen && item.closingTime && (
          <View style={styles.closingRow}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.closingText, { color: colors.textSecondary }]}>
              Closes at {item.closingTime}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Nearby Services</ThemedText>
        <TouchableOpacity onPress={() => router.push('/search/map-view')}>
          <Ionicons name="map-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Location Bar */}
      <TouchableOpacity style={[styles.locationBar, { backgroundColor: colors.card }]}>
        <Ionicons name="location" size={18} color={colors.primary} />
        <View style={styles.locationInfo}>
          <ThemedText style={styles.locationLabel}>Current Location</ThemedText>
          <ThemedText style={[styles.locationAddress, { color: colors.textSecondary }]}>
            Sector 15, Gurugram
          </ThemedText>
        </View>
        <TouchableOpacity>
          <ThemedText style={[styles.changeText, { color: colors.primary }]}>Change</ThemedText>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search nearby services..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryList}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryPill,
              {
                backgroundColor: activeCategory === cat ? colors.primary : colors.card,
                borderColor: activeCategory === cat ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <ThemedText
              style={[
                styles.categoryText,
                { color: activeCategory === cat ? '#fff' : colors.text },
              ]}
            >
              {cat}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortSection}>
        <ThemedText style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {filteredBusinesses.length} services nearby
        </ThemedText>
        <View style={styles.sortOptions}>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortBy === 'distance' && { backgroundColor: colors.primary + '15' },
            ]}
            onPress={() => setSortBy('distance')}
          >
            <ThemedText
              style={[
                styles.sortText,
                { color: sortBy === 'distance' ? colors.primary : colors.textSecondary },
              ]}
            >
              Nearest
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortBy === 'rating' && { backgroundColor: colors.primary + '15' },
            ]}
            onPress={() => setSortBy('rating')}
          >
            <ThemedText
              style={[
                styles.sortText,
                { color: sortBy === 'rating' ? colors.primary : colors.textSecondary },
              ]}
            >
              Top Rated
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortBy === 'reviews' && { backgroundColor: colors.primary + '15' },
            ]}
            onPress={() => setSortBy('reviews')}
          >
            <ThemedText
              style={[
                styles.sortText,
                { color: sortBy === 'reviews' ? colors.primary : colors.textSecondary },
              ]}
            >
              Most Reviewed
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Business List */}
      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item.id}
        renderItem={renderBusinessCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No services nearby</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Try changing your location or search query
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 10,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 13,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 12,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 13,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  businessCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featuredText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  newText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  businessCategory: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 12,
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 12,
    flex: 1,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  servicePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  servicePillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  closingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  closingText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
  },
});
