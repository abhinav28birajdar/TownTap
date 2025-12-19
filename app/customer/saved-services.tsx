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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface SavedService {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  duration: string;
  provider: {
    id: string;
    name: string;
    image: string;
    isVerified: boolean;
  };
  savedAt: string;
  isAvailable: boolean;
  discount?: number;
}

const mockSavedServices: SavedService[] = [
  {
    id: '1',
    name: 'Complete Home Deep Cleaning',
    category: 'Home Cleaning',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    rating: 4.9,
    reviewCount: 245,
    price: 1999,
    originalPrice: 2499,
    duration: '3-4 hours',
    provider: {
      id: 'p1',
      name: 'CleanPro Services',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      isVerified: true,
    },
    savedAt: '1 week ago',
    isAvailable: true,
    discount: 20,
  },
  {
    id: '2',
    name: 'AC Service & Gas Refill',
    category: 'Appliance Repair',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    rating: 4.8,
    reviewCount: 189,
    price: 699,
    duration: '1-2 hours',
    provider: {
      id: 'p2',
      name: 'CoolCare Services',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      isVerified: true,
    },
    savedAt: '2 weeks ago',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Bridal Makeup Package',
    category: 'Beauty & Wellness',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    rating: 4.9,
    reviewCount: 312,
    price: 4999,
    originalPrice: 5999,
    duration: '4-5 hours',
    provider: {
      id: 'p3',
      name: 'GlamUp Salon',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      isVerified: true,
    },
    savedAt: '1 month ago',
    isAvailable: true,
    discount: 15,
  },
  {
    id: '4',
    name: 'Full House Electrical Inspection',
    category: 'Electrician',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    rating: 4.7,
    reviewCount: 98,
    price: 299,
    duration: '1 hour',
    provider: {
      id: 'p4',
      name: 'PowerFix Electric',
      image: 'https://randomuser.me/api/portraits/men/67.jpg',
      isVerified: false,
    },
    savedAt: '2 months ago',
    isAvailable: false,
  },
];

const categories = ['All', 'Cleaning', 'Repair', 'Beauty', 'Electrician'];

export default function SavedServicesScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedServices, setSavedServices] = useState(mockSavedServices);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const filteredServices = savedServices.filter((s) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const removeService = (id: string) => {
    setSavedServices((prev) => prev.filter((s) => s.id !== id));
    setSelectedForCompare((prev) => prev.filter((sid) => sid !== id));
  };

  const toggleCompareSelection = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare((prev) => prev.filter((sid) => sid !== id));
    } else if (selectedForCompare.length < 3) {
      setSelectedForCompare((prev) => [...prev, id]);
    }
  };

  const renderServiceCard = ({ item }: { item: SavedService }) => (
    <View style={[styles.serviceCard, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={() =>
          router.push({
            pathname: '/service/[id]',
            params: { id: item.id },
          })
        }
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.serviceImage} />
          {item.discount && (
            <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
              <ThemedText style={styles.discountText}>{item.discount}% OFF</ThemedText>
            </View>
          )}
          <TouchableOpacity
            style={[styles.heartBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={() => removeService(item.id)}
          >
            <Ionicons name="heart" size={20} color={colors.error} />
          </TouchableOpacity>
          {selectedForCompare.length > 0 && (
            <TouchableOpacity
              style={[
                styles.compareCheckbox,
                {
                  backgroundColor: selectedForCompare.includes(item.id)
                    ? colors.primary
                    : 'rgba(255,255,255,0.9)',
                  borderColor: selectedForCompare.includes(item.id)
                    ? colors.primary
                    : colors.border,
                },
              ]}
              onPress={() => toggleCompareSelection(item.id)}
            >
              {selectedForCompare.includes(item.id) && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.categoryBadge}>
            <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
              {item.category}
            </ThemedText>
          </View>

          <ThemedText style={styles.serviceName} numberOfLines={2}>
            {item.name}
          </ThemedText>

          <View style={styles.providerRow}>
            <Image source={{ uri: item.provider.image }} style={styles.providerAvatar} />
            <ThemedText style={[styles.providerName, { color: colors.textSecondary }]}>
              {item.provider.name}
            </ThemedText>
            {item.provider.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
              <ThemedText style={[styles.reviewCount, { color: colors.textSecondary }]}>
                ({item.reviewCount})
              </ThemedText>
            </View>
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <ThemedText style={[styles.durationText, { color: colors.textSecondary }]}>
                {item.duration}
              </ThemedText>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.priceSection}>
              <ThemedText style={[styles.price, { color: colors.primary }]}>
                ₹{item.price}
              </ThemedText>
              {item.originalPrice && (
                <ThemedText style={[styles.originalPrice, { color: colors.textSecondary }]}>
                  ₹{item.originalPrice}
                </ThemedText>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.bookBtn,
                { backgroundColor: item.isAvailable ? colors.primary : colors.textSecondary },
              ]}
              disabled={!item.isAvailable}
              onPress={() =>
                router.push({
                  pathname: '/booking/form',
                  params: { serviceId: item.id },
                })
              }
            >
              <ThemedText style={styles.bookBtnText}>
                {item.isAvailable ? 'Book Now' : 'Unavailable'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Saved Services</ThemedText>
        <TouchableOpacity
          onPress={() => {
            if (selectedForCompare.length > 0) {
              setSelectedForCompare([]);
            } else if (savedServices.length >= 2) {
              setSelectedForCompare([savedServices[0].id]);
            }
          }}
        >
          <Ionicons
            name={selectedForCompare.length > 0 ? 'close' : 'git-compare-outline'}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Compare Mode Banner */}
      {selectedForCompare.length > 0 && (
        <View style={[styles.compareBanner, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="git-compare-outline" size={20} color={colors.primary} />
          <ThemedText style={[styles.compareBannerText, { color: colors.primary }]}>
            Select up to 3 services to compare ({selectedForCompare.length}/3)
          </ThemedText>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search saved services..."
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

      {/* Category Filter */}
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
                styles.categoryFilterText,
                { color: activeCategory === cat ? '#fff' : colors.text },
              ]}
            >
              {cat}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <View style={styles.countSection}>
        <ThemedText style={[styles.countText, { color: colors.textSecondary }]}>
          {filteredServices.length} services saved
        </ThemedText>
      </View>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Saved Services</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Browse and save services you want to book later
            </ThemedText>
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/discover/explore' as any)}
            >
              <ThemedText style={styles.exploreBtnText}>Explore Services</ThemedText>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Compare FAB */}
      {selectedForCompare.length >= 2 && (
        <TouchableOpacity
          style={[styles.compareFab, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push({
              pathname: '/service/compare',
              params: { ids: selectedForCompare.join(',') },
            })
          }
        >
          <Ionicons name="git-compare-outline" size={20} color="#fff" />
          <ThemedText style={styles.compareFabText}>
            Compare ({selectedForCompare.length})
          </ThemedText>
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
  compareBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
  },
  compareBannerText: {
    fontSize: 13,
    fontWeight: '500',
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
  categoryFilterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  countSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  countText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  serviceCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardMain: {},
  imageContainer: {
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareCheckbox: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 14,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  providerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  providerName: {
    fontSize: 13,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
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
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
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
    gap: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  bookBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookBtnText: {
    color: '#fff',
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
  compareFab: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  compareFabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
