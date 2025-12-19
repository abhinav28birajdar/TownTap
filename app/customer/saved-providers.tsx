import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface SavedProvider {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  location: string;
  isVerified: boolean;
  isAvailable: boolean;
  savedAt: string;
  services: string[];
  startingPrice: number;
}

const mockSavedProviders: SavedProvider[] = [
  {
    id: '1',
    name: 'Rahul Kumar',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    category: 'Home Cleaning',
    rating: 4.9,
    reviewCount: 245,
    jobsCompleted: 580,
    location: 'Sector 15, Gurugram',
    isVerified: true,
    isAvailable: true,
    savedAt: '2 weeks ago',
    services: ['Deep Cleaning', 'Regular Cleaning', 'Office Cleaning'],
    startingPrice: 499,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    category: 'Beauty & Wellness',
    rating: 4.8,
    reviewCount: 189,
    jobsCompleted: 420,
    location: 'MG Road, Gurugram',
    isVerified: true,
    isAvailable: true,
    savedAt: '1 month ago',
    services: ['Facial', 'Spa', 'Hair Styling'],
    startingPrice: 599,
  },
  {
    id: '3',
    name: 'Amit Singh',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    category: 'Appliance Repair',
    rating: 4.7,
    reviewCount: 156,
    jobsCompleted: 380,
    location: 'DLF Phase 2, Gurugram',
    isVerified: true,
    isAvailable: false,
    savedAt: '2 months ago',
    services: ['AC Service', 'AC Repair', 'Installation'],
    startingPrice: 299,
  },
  {
    id: '4',
    name: 'Vikram Patel',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
    category: 'Electrician',
    rating: 4.6,
    reviewCount: 98,
    jobsCompleted: 290,
    location: 'Sector 22, Gurugram',
    isVerified: false,
    isAvailable: true,
    savedAt: '3 months ago',
    services: ['Wiring', 'Repairs', 'Installation'],
    startingPrice: 199,
  },
];

const sortOptions = [
  { id: 'recent', label: 'Recently Saved', icon: 'time-outline' },
  { id: 'rating', label: 'Highest Rated', icon: 'star-outline' },
  { id: 'jobs', label: 'Most Experience', icon: 'briefcase-outline' },
  { id: 'price', label: 'Lowest Price', icon: 'pricetag-outline' },
];

export default function SavedProvidersScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showSortModal, setShowSortModal] = useState(false);
  const [savedProviders, setSavedProviders] = useState(mockSavedProviders);

  const filteredProviders = savedProviders
    .filter((p) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'jobs':
          return b.jobsCompleted - a.jobsCompleted;
        case 'price':
          return a.startingPrice - b.startingPrice;
        default:
          return 0;
      }
    });

  const removeProvider = (id: string) => {
    setSavedProviders((prev) => prev.filter((p) => p.id !== id));
  };

  const getSortLabel = () => {
    const option = sortOptions.find((o) => o.id === sortBy);
    return option?.label || 'Recently Saved';
  };

  const renderProviderCard = ({ item }: { item: SavedProvider }) => (
    <View style={[styles.providerCard, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={() =>
          router.push({
            pathname: '/provider/[id]',
            params: { id: item.id },
          })
        }
      >
        <View style={styles.providerHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View
              style={[
                styles.availabilityDot,
                { backgroundColor: item.isAvailable ? colors.success : colors.textSecondary },
              ]}
            />
          </View>
          <View style={styles.providerInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.providerName}>{item.name}</ThemedText>
              {item.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              )}
            </View>
            <ThemedText style={[styles.category, { color: colors.textSecondary }]}>
              {item.category}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeProvider(item.id)}
          >
            <Ionicons name="heart" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <ThemedText style={styles.statValue}>{item.rating}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              ({item.reviewCount})
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="briefcase-outline" size={16} color={colors.primary} />
            <ThemedText style={styles.statValue}>{item.jobsCompleted}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              jobs
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <ThemedText style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.location.split(',')[0]}
            </ThemedText>
          </View>
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

        <View style={styles.cardFooter}>
          <View style={styles.priceSection}>
            <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>
              Starts at
            </ThemedText>
            <ThemedText style={[styles.price, { color: colors.primary }]}>
              ₹{item.startingPrice}
            </ThemedText>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.border }]}
              onPress={() =>
                router.push({
                  pathname: '/chat/[id]',
                  params: { id: item.id },
                })
              }
            >
              <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
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
              <ThemedText style={styles.bookBtnText}>Book</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {!item.isAvailable && (
        <View style={[styles.unavailableBanner, { backgroundColor: colors.error + '15' }]}>
          <Ionicons name="time-outline" size={14} color={colors.error} />
          <ThemedText style={[styles.unavailableText, { color: colors.error }]}>
            Currently unavailable
          </ThemedText>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Saved Providers</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search saved providers..."
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

      {/* Sort & Count */}
      <View style={styles.sortSection}>
        <ThemedText style={[styles.countText, { color: colors.textSecondary }]}>
          {filteredProviders.length} providers saved
        </ThemedText>
        <TouchableOpacity
          style={[styles.sortBtn, { backgroundColor: colors.card }]}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="funnel-outline" size={16} color={colors.text} />
          <ThemedText style={styles.sortBtnText}>{getSortLabel()}</ThemedText>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Provider List */}
      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item.id}
        renderItem={renderProviderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Saved Providers</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Save your favorite providers for quick access
            </ThemedText>
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/discover/explore' as any)}
            >
              <ThemedText style={styles.exploreBtnText}>Explore Providers</ThemedText>
            </TouchableOpacity>
          </View>
        }
      />

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

            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  sortBy === option.id && { backgroundColor: colors.primary + '10' },
                ]}
                onPress={() => {
                  setSortBy(option.id);
                  setShowSortModal(false);
                }}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={sortBy === option.id ? colors.primary : colors.text}
                />
                <ThemedText
                  style={[
                    styles.sortOptionText,
                    sortBy === option.id && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {option.label}
                </ThemedText>
                {sortBy === option.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
  sortSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  countText: {
    fontSize: 13,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  providerCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardMain: {
    padding: 14,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  availabilityDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  providerName: {
    fontSize: 17,
    fontWeight: '600',
  },
  category: {
    fontSize: 13,
  },
  removeBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 12,
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  unavailableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  unavailableText: {
    fontSize: 12,
    fontWeight: '500',
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
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: 15,
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
    paddingBottom: 40,
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
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  sortOptionText: {
    fontSize: 15,
    flex: 1,
  },
});
