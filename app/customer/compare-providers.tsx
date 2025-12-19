import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Provider {
  id: string;
  name: string;
  businessName: string;
  avatar?: string;
  rating: number;
  reviews: number;
  services: string[];
  distance: string;
  price: string;
  experience: string;
  verified: boolean;
  availability: string;
  responseTime: string;
  completedJobs: number;
  highlights: string[];
  badges: string[];
}

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    businessName: 'CleanPro Services',
    rating: 4.9,
    reviews: 2456,
    services: ['Deep Cleaning', 'Regular Cleaning', 'Move-out Cleaning'],
    distance: '1.2 km',
    price: '₹999/session',
    experience: '5 years',
    verified: true,
    availability: 'Available Today',
    responseTime: '< 30 mins',
    completedJobs: 3400,
    highlights: ['Eco-friendly products', 'Same day service', 'Trained staff'],
    badges: ['Top Rated', 'Fast Responder'],
  },
  {
    id: '2',
    name: 'Amit Sharma',
    businessName: 'SparkleClean',
    rating: 4.8,
    reviews: 1823,
    services: ['Home Cleaning', 'Office Cleaning', 'Sanitization'],
    distance: '2.5 km',
    price: '₹799/session',
    experience: '3 years',
    verified: true,
    availability: 'Available Tomorrow',
    responseTime: '< 1 hour',
    completedJobs: 2100,
    highlights: ['Budget friendly', 'Flexible timing', 'Insured'],
    badges: ['Value Pick'],
  },
  {
    id: '3',
    name: 'Priya Patel',
    businessName: 'CleanStar',
    rating: 4.7,
    reviews: 987,
    services: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Cleaning'],
    distance: '3.1 km',
    price: '₹899/session',
    experience: '4 years',
    verified: true,
    availability: 'Available Today',
    responseTime: '< 45 mins',
    completedJobs: 1500,
    highlights: ['Women-led team', 'Premium products', 'Satisfaction guaranteed'],
    badges: ['Recommended'],
  },
  {
    id: '4',
    name: 'Mohammed Ali',
    businessName: 'Fresh Home Services',
    rating: 4.6,
    reviews: 654,
    services: ['Regular Cleaning', 'Sofa Cleaning', 'Carpet Cleaning'],
    distance: '4.2 km',
    price: '₹699/session',
    experience: '2 years',
    verified: false,
    availability: 'Next Available: Wed',
    responseTime: '< 2 hours',
    completedJobs: 800,
    highlights: ['Affordable rates', 'Well equipped', 'Punctual'],
    badges: [],
  },
];

type SortOption = 'relevance' | 'rating' | 'price_low' | 'price_high' | 'distance' | 'reviews';

export default function CompareProvidersScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(100)).current;

  const serviceName = (params.service as string) || 'Home Cleaning';

  useEffect(() => {
    if (selectedProviders.length > 0) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedProviders.length]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleProviderSelection = (id: string) => {
    setSelectedProviders((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 providers
      }
      return [...prev, id];
    });
  };

  const sortedProviders = [...providers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price_low':
        return parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''));
      case 'price_high':
        return parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, ''));
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  const filteredProviders = searchQuery
    ? sortedProviders.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedProviders;

  const selectedProviderData = providers.filter((p) => selectedProviders.includes(p.id));

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'relevance':
        return 'Relevance';
      case 'rating':
        return 'Highest Rated';
      case 'price_low':
        return 'Price: Low to High';
      case 'price_high':
        return 'Price: High to Low';
      case 'distance':
        return 'Nearest First';
      case 'reviews':
        return 'Most Reviews';
    }
  };

  const renderProvider = ({ item }: { item: Provider }) => {
    const isSelected = selectedProviders.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.providerCard,
          { backgroundColor: colors.card },
          isSelected && { borderColor: colors.primary, borderWidth: 2 },
        ]}
        onPress={() => router.push({ pathname: '/provider/[id]', params: { id: item.id } })}
        activeOpacity={0.7}
      >
        {/* Selection Checkbox */}
        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: isSelected ? colors.primary : colors.border },
            isSelected && { backgroundColor: colors.primary },
          ]}
          onPress={() => toggleProviderSelection(item.id)}
        >
          {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </TouchableOpacity>

        {/* Provider Header */}
        <View style={styles.providerHeader}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '15' }]}>
            <ThemedText style={[styles.avatarText, { color: colors.primary }]}>
              {item.name.split(' ').map((n) => n[0]).join('')}
            </ThemedText>
          </View>
          <View style={styles.providerInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.providerName}>{item.name}</ThemedText>
              {item.verified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              )}
            </View>
            <ThemedText style={[styles.businessName, { color: colors.textSecondary }]}>
              {item.businessName}
            </ThemedText>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
              <ThemedText style={[styles.reviewsText, { color: colors.textSecondary }]}>
                ({item.reviews} reviews)
              </ThemedText>
            </View>
          </View>
          <View style={styles.priceSection}>
            <ThemedText style={[styles.priceText, { color: colors.primary }]}>
              {item.price}
            </ThemedText>
            <ThemedText style={[styles.distanceText, { color: colors.textSecondary }]}>
              {item.distance}
            </ThemedText>
          </View>
        </View>

        {/* Badges */}
        {item.badges.length > 0 && (
          <View style={styles.badgesRow}>
            {item.badges.map((badge, index) => (
              <View
                key={index}
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      badge === 'Top Rated'
                        ? '#FFB800' + '20'
                        : badge === 'Fast Responder'
                        ? colors.success + '20'
                        : colors.primary + '15',
                  },
                ]}
              >
                <Ionicons
                  name={
                    badge === 'Top Rated'
                      ? 'star'
                      : badge === 'Fast Responder'
                      ? 'flash'
                      : 'ribbon'
                  }
                  size={12}
                  color={
                    badge === 'Top Rated'
                      ? '#FFB800'
                      : badge === 'Fast Responder'
                      ? colors.success
                      : colors.primary
                  }
                />
                <ThemedText
                  style={[
                    styles.badgeText,
                    {
                      color:
                        badge === 'Top Rated'
                          ? '#FFB800'
                          : badge === 'Fast Responder'
                          ? colors.success
                          : colors.primary,
                    },
                  ]}
                >
                  {badge}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Ionicons name="briefcase-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
              {item.completedJobs}+ jobs
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
              {item.responseTime}
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.success} />
            <ThemedText style={[styles.statText, { color: colors.success }]}>
              {item.availability}
            </ThemedText>
          </View>
        </View>

        {/* Services Preview */}
        <View style={styles.servicesRow}>
          {item.services.slice(0, 3).map((service, index) => (
            <View key={index} style={[styles.servicePill, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.servicePillText, { color: colors.textSecondary }]}>
                {service}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.viewBtn, { borderColor: colors.primary }]}
            onPress={() => router.push({ pathname: '/provider/[id]', params: { id: item.id } })}
          >
            <ThemedText style={[styles.viewBtnText, { color: colors.primary }]}>
              View Profile
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
            onPress={() =>
              router.push({
                pathname: '/booking/form',
                params: { providerId: item.id },
              })
            }
          >
            <ThemedText style={styles.bookBtnText}>Book Now</ThemedText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>{serviceName}</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {filteredProviders.length} providers available
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.push('/search/filters')}>
          <Ionicons name="options-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search & Sort */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search providers..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.sortBtn, { backgroundColor: colors.card }]}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Active Sort Indicator */}
      {sortBy !== 'relevance' && (
        <View style={styles.sortIndicator}>
          <ThemedText style={[styles.sortIndicatorText, { color: colors.textSecondary }]}>
            Sorted by: {getSortLabel(sortBy)}
          </ThemedText>
          <TouchableOpacity onPress={() => setSortBy('relevance')}>
            <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Compare Selection Hint */}
      <View style={[styles.hintBar, { backgroundColor: colors.info + '10' }]}>
        <Ionicons name="information-circle" size={16} color={colors.info} />
        <ThemedText style={[styles.hintText, { color: colors.info }]}>
          Select up to 3 providers to compare
        </ThemedText>
        {selectedProviders.length > 0 && (
          <ThemedText style={[styles.selectedCount, { color: colors.primary }]}>
            {selectedProviders.length}/3 selected
          </ThemedText>
        )}
      </View>

      {/* Providers List */}
      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item.id}
        renderItem={renderProvider}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="search-outline" size={50} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Providers Found</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Try adjusting your search or filters
            </ThemedText>
          </View>
        }
      />

      {/* Compare Button */}
      <Animated.View
        style={[
          styles.compareBar,
          {
            backgroundColor: colors.card,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.compareInfo}>
          <ThemedText style={styles.compareTitle}>
            {selectedProviders.length} provider{selectedProviders.length !== 1 ? 's' : ''} selected
          </ThemedText>
          <TouchableOpacity onPress={() => setSelectedProviders([])}>
            <ThemedText style={[styles.clearText, { color: colors.textSecondary }]}>
              Clear
            </ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.compareBtn,
            { backgroundColor: selectedProviders.length >= 2 ? colors.primary : colors.border },
          ]}
          disabled={selectedProviders.length < 2}
          onPress={() => setShowCompareModal(true)}
        >
          <Ionicons name="git-compare" size={18} color="#fff" />
          <ThemedText style={styles.compareBtnText}>Compare</ThemedText>
        </TouchableOpacity>
      </Animated.View>

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.sortModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Sort By</ThemedText>
            {(
              [
                'relevance',
                'rating',
                'price_low',
                'price_high',
                'distance',
                'reviews',
              ] as SortOption[]
            ).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  sortBy === option && { backgroundColor: colors.primary + '15' },
                ]}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
              >
                <ThemedText
                  style={[styles.sortOptionText, sortBy === option && { color: colors.primary }]}
                >
                  {getSortLabel(option)}
                </ThemedText>
                {sortBy === option && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Compare Modal */}
      <Modal visible={showCompareModal} transparent animationType="slide">
        <View style={[styles.compareModal, { backgroundColor: colors.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Modal Header */}
            <View style={[styles.compareHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowCompareModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <ThemedText style={styles.compareHeaderTitle}>Compare Providers</ThemedText>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.compareContent}
            >
              {selectedProviderData.map((provider) => (
                <View
                  key={provider.id}
                  style={[styles.compareColumn, { backgroundColor: colors.card }]}
                >
                  {/* Provider Info */}
                  <View style={styles.compareProviderHeader}>
                    <View
                      style={[styles.compareAvatar, { backgroundColor: colors.primary + '15' }]}
                    >
                      <ThemedText style={[styles.compareAvatarText, { color: colors.primary }]}>
                        {provider.name.split(' ').map((n) => n[0]).join('')}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.compareProviderName}>{provider.name}</ThemedText>
                    <ThemedText style={[styles.compareBusiness, { color: colors.textSecondary }]}>
                      {provider.businessName}
                    </ThemedText>
                  </View>

                  {/* Comparison Rows */}
                  <View style={[styles.compareRow, { borderTopColor: colors.border }]}>
                    <ThemedText style={[styles.compareLabel, { color: colors.textSecondary }]}>
                      Rating
                    </ThemedText>
                    <View style={styles.compareValueRow}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <ThemedText style={styles.compareValue}>{provider.rating}</ThemedText>
                    </View>
                  </View>

                  <View style={[styles.compareRow, { borderTopColor: colors.border }]}>
                    <ThemedText style={[styles.compareLabel, { color: colors.textSecondary }]}>
                      Reviews
                    </ThemedText>
                    <ThemedText style={styles.compareValue}>
                      {provider.reviews.toLocaleString()}
                    </ThemedText>
                  </View>

                  <View style={[styles.compareRow, { borderTopColor: colors.border }]}>
                    <ThemedText style={[styles.compareLabel, { color: colors.textSecondary }]}>
                      Price
                    </ThemedText>
                    <ThemedText style={[styles.compareValue, { color: colors.primary }]}>
                      {provider.price}
                    </ThemedText>
                  </View>

                  <View style={[styles.compareRow, { borderTopColor: colors.border }]}>
                    <ThemedText style={[styles.compareLabel, { color: colors.textSecondary }]}>
                      Distance
                    </ThemedText>
                    <ThemedText style={styles.compareValue}>{provider.distance}</ThemedText>
                  </View>

                  <View style={[styles.compareRow, { borderTopColor: colors.border }]}>
                    <ThemedText style={[styles.compareLabel, { color: colors.textSecondary }]}>
                      Experience
                    </ThemedText>
                    <ThemedText style={styles.compareValue}>{provider.experience}</ThemedText>
                  </View>

                  <View style={[styles.compareRow, { borderTopColor: colors.border }]}>
                    <ThemedText style={[styles.compareLabel, { color: colors.textSecondary }]}>
                      Completed Jobs
                    </ThemedText>
                    <ThemedText style={styles.compareValue}>
                      {provider.completedJobs.toLocaleString()}
                    </ThemedText>
                  </View>

                  <View style={[styles.compareRow, { borderTopColor: colors.border }]}>
                    <ThemedText style={[styles.compareLabel, { color: colors.textSecondary }]}>
                      Response Time
                    </ThemedText>
                    <ThemedText style={styles.compareValue}>{provider.responseTime}</ThemedText>
                  </View>

                  <View style={[styles.compareRow, { borderTopColor: colors.border }]}>
                    <ThemedText style={[styles.compareLabel, { color: colors.textSecondary }]}>
                      Verified
                    </ThemedText>
                    <Ionicons
                      name={provider.verified ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={provider.verified ? colors.success : colors.error}
                    />
                  </View>

                  {/* Book Button */}
                  <TouchableOpacity
                    style={[styles.compareBookBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setShowCompareModal(false);
                      router.push({
                        pathname: '/booking/form',
                        params: { providerId: provider.id },
                      });
                    }}
                  >
                    <ThemedText style={styles.compareBookText}>Book</ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
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
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
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
  sortBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sortIndicatorText: {
    fontSize: 12,
  },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
  },
  selectedCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  providerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  checkbox: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  providerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  businessName: {
    fontSize: 13,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 12,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  servicePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  servicePillText: {
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bookBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  compareBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  compareInfo: {
    flex: 1,
  },
  compareTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  clearText: {
    fontSize: 12,
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  compareBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  sortOptionText: {
    fontSize: 15,
  },
  compareModal: {
    flex: 1,
  },
  compareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  compareHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  compareContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  compareColumn: {
    width: width * 0.7,
    borderRadius: 16,
    padding: 16,
  },
  compareProviderHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  compareAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  compareAvatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  compareProviderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  compareBusiness: {
    fontSize: 13,
  },
  compareRow: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  compareLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  compareValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compareValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  compareBookBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  compareBookText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
