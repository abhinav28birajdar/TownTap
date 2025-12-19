import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface RecommendedService {
  id: string;
  name: string;
  provider: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  matchScore: number;
  reason: string;
  category: string;
  duration: string;
  isNew?: boolean;
  isTrending?: boolean;
}

const mockRecommendations: RecommendedService[] = [
  {
    id: '1',
    name: 'Deep Home Cleaning',
    provider: 'CleanPro Services',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    price: 1899,
    originalPrice: 2499,
    rating: 4.8,
    reviewCount: 245,
    matchScore: 98,
    reason: 'Based on your recent bookings',
    category: 'Cleaning',
    duration: '3-4 hours',
  },
  {
    id: '2',
    name: 'AC Service & Repair',
    provider: 'CoolCare',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    price: 499,
    rating: 4.7,
    reviewCount: 312,
    matchScore: 95,
    reason: 'Popular in your area',
    category: 'Appliances',
    duration: '1-2 hours',
    isTrending: true,
  },
  {
    id: '3',
    name: 'Pest Control',
    provider: 'SafeHome Solutions',
    image: 'https://images.unsplash.com/photo-1632935191446-6794f4e7c5e7?w=400',
    price: 999,
    originalPrice: 1299,
    rating: 4.9,
    reviewCount: 178,
    matchScore: 92,
    reason: 'Seasonal recommendation',
    category: 'Home Care',
    duration: '2-3 hours',
  },
  {
    id: '4',
    name: 'Salon at Home',
    provider: 'GlamUp',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    price: 799,
    rating: 4.6,
    reviewCount: 420,
    matchScore: 88,
    reason: 'Based on your preferences',
    category: 'Beauty',
    duration: '1-2 hours',
    isNew: true,
  },
];

const categories = ['All', 'Cleaning', 'Appliances', 'Home Care', 'Beauty', 'Repairs'];

export default function RecommendationsScreen() {
  const colors = useColors();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredServices = mockRecommendations.filter(
    (s) => activeCategory === 'All' || s.category === activeCategory
  );

  const renderServiceCard = ({ item }: { item: RecommendedService }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={() =>
        router.push({
          pathname: '/service/[id]',
          params: { id: item.id },
        })
      }
    >
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        {item.isNew && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.badgeText}>NEW</ThemedText>
          </View>
        )}
        {item.isTrending && (
          <View style={[styles.badge, { backgroundColor: '#FF5722' }]}>
            <Ionicons name="trending-up" size={12} color="#fff" />
            <ThemedText style={styles.badgeText}>Trending</ThemedText>
          </View>
        )}
        <View style={[styles.matchBadge, { backgroundColor: colors.success }]}>
          <ThemedText style={styles.matchText}>{item.matchScore}% Match</ThemedText>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.categoryTag}>
          <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
            {item.category}
          </ThemedText>
        </View>
        <ThemedText style={styles.serviceName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={[styles.providerName, { color: colors.textSecondary }]}>
          by {item.provider}
        </ThemedText>

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

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
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
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
            onPress={() =>
              router.push({
                pathname: '/service/[id]',
                params: { id: item.id },
              })
            }
          >
            <ThemedText style={styles.bookBtnText}>Book</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={[styles.reasonBadge, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="bulb-outline" size={14} color={colors.primary} />
          <ThemedText style={[styles.reasonText, { color: colors.primary }]}>
            {item.reason}
          </ThemedText>
        </View>
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
        <ThemedText style={styles.headerTitle}>Recommended for You</ThemedText>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* AI Recommendation Banner */}
      <View style={styles.bannerSection}>
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerIcon}>
            <Ionicons name="sparkles" size={28} color="#fff" />
          </View>
          <View style={styles.bannerContent}>
            <ThemedText style={styles.bannerTitle}>Personalized for You</ThemedText>
            <ThemedText style={styles.bannerSubtitle}>
              Services curated based on your preferences, location & booking history
            </ThemedText>
          </View>
        </LinearGradient>
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
                styles.categoryPillText,
                { color: activeCategory === cat ? '#fff' : colors.text },
              ]}
            >
              {cat}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <ThemedText style={styles.resultsCount}>
          {filteredServices.length} services recommended
        </ThemedText>
        <TouchableOpacity onPress={() => router.push('/service/compare')}>
          <ThemedText style={[styles.compareLink, { color: colors.primary }]}>
            Compare
          </ThemedText>
        </TouchableOpacity>
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
            <Ionicons name="search-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No recommendations</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              We'll update recommendations as you use the app more
            </ThemedText>
          </View>
        }
      />

      {/* Floating Action */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/search/index' as any)}
      >
        <Ionicons name="search" size={24} color="#fff" />
      </TouchableOpacity>
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
  bannerSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  bannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
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
  categoryPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  compareLink: {
    fontSize: 14,
    fontWeight: '500',
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
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  matchBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    padding: 14,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  providerName: {
    fontSize: 13,
    marginBottom: 10,
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
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
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reasonText: {
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
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
