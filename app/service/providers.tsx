import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Provider {
  id: string;
  name: string;
  avatar: string | null;
  rating: number;
  reviewCount: number;
  experience: string;
  specialty: string;
  price: number;
  priceUnit: string;
  distance: string;
  isAvailable: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  completedJobs: number;
  responseTime: string;
  languages: string[];
  services: string[];
}

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    avatar: null,
    rating: 4.9,
    reviewCount: 234,
    experience: '10+ years',
    specialty: 'AC Repair & Installation',
    price: 299,
    priceUnit: 'Starting from',
    distance: '2.5 km',
    isAvailable: true,
    isVerified: true,
    isFeatured: true,
    completedJobs: 1250,
    responseTime: '< 30 mins',
    languages: ['Hindi', 'English'],
    services: ['AC Repair', 'AC Installation', 'AC Service'],
  },
  {
    id: '2',
    name: 'Priya Home Services',
    avatar: null,
    rating: 4.8,
    reviewCount: 189,
    experience: '5 years',
    specialty: 'Deep Cleaning Expert',
    price: 999,
    priceUnit: 'Flat rate',
    distance: '1.8 km',
    isAvailable: true,
    isVerified: true,
    isFeatured: false,
    completedJobs: 856,
    responseTime: '< 1 hour',
    languages: ['Hindi', 'English', 'Marathi'],
    services: ['Home Cleaning', 'Deep Cleaning', 'Office Cleaning'],
  },
  {
    id: '3',
    name: 'Amit Plumbing Works',
    avatar: null,
    rating: 4.7,
    reviewCount: 156,
    experience: '8 years',
    specialty: 'All Plumbing Solutions',
    price: 199,
    priceUnit: 'Starting from',
    distance: '3.2 km',
    isAvailable: false,
    isVerified: true,
    isFeatured: false,
    completedJobs: 745,
    responseTime: '< 45 mins',
    languages: ['Hindi'],
    services: ['Pipe Repair', 'Leakage Fix', 'Bathroom Fitting'],
  },
  {
    id: '4',
    name: 'Spark Electricals',
    avatar: null,
    rating: 4.6,
    reviewCount: 98,
    experience: '6 years',
    specialty: 'Electrical Repairs',
    price: 249,
    priceUnit: 'Per visit',
    distance: '4.1 km',
    isAvailable: true,
    isVerified: false,
    isFeatured: false,
    completedJobs: 432,
    responseTime: '< 2 hours',
    languages: ['Hindi', 'English'],
    services: ['Wiring', 'Switch Repair', 'Fan Installation'],
  },
  {
    id: '5',
    name: 'Green Pest Control',
    avatar: null,
    rating: 4.5,
    reviewCount: 76,
    experience: '4 years',
    specialty: 'Eco-friendly Pest Solutions',
    price: 799,
    priceUnit: 'Starting from',
    distance: '5.0 km',
    isAvailable: true,
    isVerified: true,
    isFeatured: true,
    completedJobs: 312,
    responseTime: '< 3 hours',
    languages: ['Hindi', 'English'],
    services: ['Pest Control', 'Termite Treatment', 'Cockroach Control'],
  },
];

const sortOptions = [
  { id: 'rating', label: 'Top Rated' },
  { id: 'distance', label: 'Nearest' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'reviews', label: 'Most Reviews' },
];

export default function ServiceProvidersScreen() {
  const colors = useColors();
  const { service, category } = useLocalSearchParams();
  const [providers] = useState(mockProviders);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('rating');

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'available', label: 'Available Now' },
    { id: 'verified', label: 'Verified' },
    { id: 'featured', label: 'Featured' },
  ];

  const filteredProviders = providers.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'available'
        ? p.isAvailable
        : activeFilter === 'verified'
        ? p.isVerified
        : activeFilter === 'featured'
        ? p.isFeatured
        : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleArea}>
          <ThemedText style={styles.headerTitle}>Service Providers</ThemedText>
          {service && (
            <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {service}
            </ThemedText>
          )}
        </View>
        <TouchableOpacity>
          <Ionicons name="map-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search providers..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters & Sort */}
      <View style={styles.filterSortRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    activeFilter === filter.id ? colors.primary : colors.card,
                  borderColor:
                    activeFilter === filter.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  { color: activeFilter === filter.id ? '#fff' : colors.text },
                ]}
              >
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortSection}
        contentContainerStyle={styles.sortList}
      >
        <ThemedText style={[styles.sortLabel, { color: colors.textSecondary }]}>
          Sort by:
        </ThemedText>
        {sortOptions.map((sort) => (
          <TouchableOpacity
            key={sort.id}
            style={[
              styles.sortOption,
              activeSort === sort.id && { borderBottomColor: colors.primary },
            ]}
            onPress={() => setActiveSort(sort.id)}
          >
            <ThemedText
              style={[
                styles.sortText,
                { color: activeSort === sort.id ? colors.primary : colors.textSecondary },
              ]}
            >
              {sort.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <ThemedText style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {filteredProviders.length} providers found
        </ThemedText>
      </View>

      {/* Providers List */}
      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.border} />
            <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No providers found
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Try adjusting your filters
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.providerCard, { backgroundColor: colors.card }]}
            onPress={() => router.push(`/provider/${item.id}` as any)}
          >
            {item.isFeatured && (
              <View style={[styles.featuredBadge, { backgroundColor: '#FFC107' }]}>
                <Ionicons name="star" size={10} color="#fff" />
                <ThemedText style={styles.featuredText}>Featured</ThemedText>
              </View>
            )}

            <View style={styles.providerHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <ThemedText style={[styles.avatarText, { color: colors.primary }]}>
                  {item.name.charAt(0)}
                </ThemedText>
              </View>
              <View style={styles.providerInfo}>
                <View style={styles.nameRow}>
                  <ThemedText style={styles.providerName}>{item.name}</ThemedText>
                  {item.isVerified && (
                    <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                  )}
                </View>
                <ThemedText style={[styles.specialty, { color: colors.textSecondary }]}>
                  {item.specialty}
                </ThemedText>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <ThemedText style={styles.rating}>{item.rating}</ThemedText>
                  <ThemedText style={[styles.reviewCount, { color: colors.textSecondary }]}>
                    ({item.reviewCount} reviews)
                  </ThemedText>
                </View>
              </View>
              <View style={styles.priceSection}>
                <ThemedText style={[styles.priceUnit, { color: colors.textSecondary }]}>
                  {item.priceUnit}
                </ThemedText>
                <ThemedText style={[styles.price, { color: colors.primary }]}>
                  ₹{item.price}
                </ThemedText>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="briefcase-outline" size={14} color={colors.textSecondary} />
                <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
                  {item.experience}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-done" size={14} color={colors.textSecondary} />
                <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
                  {item.completedJobs} jobs
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
                  {item.distance}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
                  {item.responseTime}
                </ThemedText>
              </View>
            </View>

            <View style={styles.servicesRow}>
              {item.services.slice(0, 3).map((service, index) => (
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
              <View
                style={[
                  styles.availabilityBadge,
                  { backgroundColor: item.isAvailable ? colors.success + '15' : colors.border + '50' },
                ]}
              >
                <View
                  style={[
                    styles.availabilityDot,
                    { backgroundColor: item.isAvailable ? colors.success : colors.textSecondary },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.availabilityText,
                    { color: item.isAvailable ? colors.success : colors.textSecondary },
                  ]}
                >
                  {item.isAvailable ? 'Available Now' : 'Unavailable'}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  { backgroundColor: item.isAvailable ? colors.primary : colors.border },
                ]}
                disabled={!item.isAvailable}
                onPress={() => router.push(`/booking/form?provider=${item.id}`)}
              >
                <ThemedText
                  style={[
                    styles.bookButtonText,
                    { color: item.isAvailable ? '#fff' : colors.textSecondary },
                  ]}
                >
                  Book Now
                </ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitleArea: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 13,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterSortRow: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortSection: {
    marginBottom: 12,
  },
  sortList: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 16,
  },
  sortLabel: {
    fontSize: 13,
    marginRight: 4,
  },
  sortOption: {
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  providerCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  featuredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  specialty: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 4,
  },
  ratingRow: {
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
  priceSection: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  priceUnit: {
    fontSize: 11,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  serviceTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  serviceTagText: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
