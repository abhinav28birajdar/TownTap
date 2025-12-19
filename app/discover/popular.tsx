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

interface PopularService {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  bookings: number;
  price: number;
  originalPrice?: number;
  provider: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  trending?: boolean;
  trendDirection?: 'up' | 'down';
  rank: number;
}

interface TrendingCategory {
  id: string;
  name: string;
  icon: string;
  growth: number;
  color: string;
}

const mockTrendingCategories: TrendingCategory[] = [
  { id: '1', name: 'Home Cleaning', icon: 'home-outline', growth: 45, color: '#4CAF50' },
  { id: '2', name: 'AC Services', icon: 'snow-outline', growth: 38, color: '#2196F3' },
  { id: '3', name: 'Beauty & Spa', icon: 'flower-outline', growth: 32, color: '#E91E63' },
  { id: '4', name: 'Electrician', icon: 'flash-outline', growth: 28, color: '#FF9800' },
  { id: '5', name: 'Plumbing', icon: 'water-outline', growth: 22, color: '#00BCD4' },
];

const mockPopularServices: PopularService[] = [
  {
    id: '1',
    name: 'Complete Home Deep Cleaning',
    category: 'Home Cleaning',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    rating: 4.9,
    reviewCount: 1245,
    bookings: 5632,
    price: 1999,
    originalPrice: 2499,
    provider: {
      name: 'CleanPro Services',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      verified: true,
    },
    trending: true,
    trendDirection: 'up',
    rank: 1,
  },
  {
    id: '2',
    name: 'AC Service & Gas Refill',
    category: 'Appliance Repair',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    rating: 4.8,
    reviewCount: 987,
    bookings: 4521,
    price: 599,
    provider: {
      name: 'CoolCare Services',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      verified: true,
    },
    trending: true,
    trendDirection: 'up',
    rank: 2,
  },
  {
    id: '3',
    name: 'Luxury Spa at Home',
    category: 'Beauty & Wellness',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    rating: 4.7,
    reviewCount: 756,
    bookings: 3890,
    price: 2499,
    originalPrice: 3499,
    provider: {
      name: 'GlamUp Salon',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      verified: true,
    },
    rank: 3,
  },
  {
    id: '4',
    name: 'Full Electrical Inspection',
    category: 'Electrician',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    rating: 4.8,
    reviewCount: 543,
    bookings: 2987,
    price: 299,
    provider: {
      name: 'PowerFix Electric',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      verified: true,
    },
    trending: true,
    trendDirection: 'up',
    rank: 4,
  },
  {
    id: '5',
    name: 'Pest Control Treatment',
    category: 'Home Care',
    image: 'https://images.unsplash.com/photo-1632935191446-6794f4e7c5e7?w=400',
    rating: 4.6,
    reviewCount: 432,
    bookings: 2456,
    price: 899,
    originalPrice: 1199,
    provider: {
      name: 'SafeHome Pest',
      avatar: 'https://randomuser.me/api/portraits/men/89.jpg',
      verified: false,
    },
    rank: 5,
  },
];

const timeFilters = ['This Week', 'This Month', 'All Time'];

export default function PopularScreen() {
  const colors = useColors();
  const [activeTimeFilter, setActiveTimeFilter] = useState('This Week');

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return colors.primary;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderTrendingCategory = ({ item }: { item: TrendingCategory }) => (
    <TouchableOpacity
      style={[styles.trendingCard, { backgroundColor: colors.card }]}
      onPress={() =>
        router.push({
          pathname: '/category/[name]',
          params: { name: item.name },
        })
      }
    >
      <View style={[styles.trendingIconWrapper, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <ThemedText style={styles.trendingCatName} numberOfLines={1}>
        {item.name}
      </ThemedText>
      <View style={styles.growthBadge}>
        <Ionicons name="trending-up" size={12} color={colors.success} />
        <ThemedText style={[styles.growthText, { color: colors.success }]}>
          {item.growth}%
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderServiceCard = ({ item }: { item: PopularService }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={() =>
        router.push({
          pathname: '/service/[id]',
          params: { id: item.id },
        })
      }
    >
      <View style={styles.rankBadgeWrapper}>
        <View style={[styles.rankBadge, { backgroundColor: getRankBadgeColor(item.rank) }]}>
          <ThemedText style={styles.rankText}>#{item.rank}</ThemedText>
        </View>
      </View>

      <Image source={{ uri: item.image }} style={styles.serviceImage} />

      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.serviceName} numberOfLines={2}>
              {item.name}
            </ThemedText>
            <ThemedText style={[styles.serviceCategory, { color: colors.textSecondary }]}>
              {item.category}
            </ThemedText>
          </View>
          {item.trending && (
            <View style={[styles.trendingBadge, { backgroundColor: colors.success + '15' }]}>
              <Ionicons
                name={item.trendDirection === 'up' ? 'trending-up' : 'trending-down'}
                size={14}
                color={colors.success}
              />
              <ThemedText style={[styles.trendingText, { color: colors.success }]}>
                Trending
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <ThemedText style={styles.statValue}>{item.rating}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              ({formatNumber(item.reviewCount)})
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
            <ThemedText style={styles.statValue}>{formatNumber(item.bookings)}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              booked
            </ThemedText>
          </View>
        </View>

        <View style={styles.providerRow}>
          <Image source={{ uri: item.provider.avatar }} style={styles.providerAvatar} />
          <ThemedText style={[styles.providerName, { color: colors.textSecondary }]}>
            {item.provider.name}
          </ThemedText>
          {item.provider.verified && (
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          )}
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
            {item.originalPrice && (
              <View style={[styles.discountBadge, { backgroundColor: colors.error + '15' }]}>
                <ThemedText style={[styles.discountText, { color: colors.error }]}>
                  {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                </ThemedText>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, { backgroundColor: colors.primary }]}
            onPress={() =>
              router.push({
                pathname: '/booking/form',
                params: { serviceId: item.id },
              })
            }
          >
            <ThemedText style={styles.bookBtnText}>Book</ThemedText>
          </TouchableOpacity>
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
        <ThemedText style={styles.headerTitle}>Popular Services</ThemedText>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'CC']}
            style={styles.heroGradient}
          >
            <Ionicons name="trending-up" size={32} color="#fff" />
            <ThemedText style={styles.heroTitle}>Trending This Week</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Most booked services by your neighbors
            </ThemedText>
          </LinearGradient>
        </View>

        {/* Trending Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Trending Categories</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockTrendingCategories}
            keyExtractor={(item) => item.id}
            renderItem={renderTrendingCategory}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingList}
          />
        </View>

        {/* Time Filter */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {timeFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: activeTimeFilter === filter ? colors.primary : colors.card,
                    borderColor: activeTimeFilter === filter ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveTimeFilter(filter)}
              >
                <ThemedText
                  style={[
                    styles.filterText,
                    { color: activeTimeFilter === filter ? '#fff' : colors.text },
                  ]}
                >
                  {filter}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Services List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Top Ranked Services</ThemedText>
            <View style={styles.sortBadge}>
              <Ionicons name="trophy" size={14} color="#FFC107" />
              <ThemedText style={[styles.sortText, { color: colors.textSecondary }]}>
                By bookings
              </ThemedText>
            </View>
          </View>

          {mockPopularServices.map((item) => (
            <View key={item.id}>{renderServiceCard({ item })}</View>
          ))}
        </View>

        {/* Stats Banner */}
        <View style={[styles.statsBanner, { backgroundColor: colors.card }]}>
          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <ThemedText style={[styles.statsValue, { color: colors.primary }]}>25K+</ThemedText>
              <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Bookings this week
              </ThemedText>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <ThemedText style={[styles.statsValue, { color: colors.primary }]}>4.7</ThemedText>
              <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Average rating
              </ThemedText>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <ThemedText style={[styles.statsValue, { color: colors.primary }]}>98%</ThemedText>
              <ThemedText style={[styles.statsLabel, { color: colors.textSecondary }]}>
                Happy customers
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  heroBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  trendingList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  trendingCard: {
    width: 100,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  trendingIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingCatName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  growthText: {
    fontSize: 11,
    fontWeight: '600',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 12,
  },
  serviceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  rankBadgeWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  serviceImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  serviceContent: {
    padding: 14,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceCategory: {
    fontSize: 12,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  trendingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    height: 14,
    backgroundColor: '#ddd',
    marginHorizontal: 12,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  providerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  providerName: {
    fontSize: 12,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
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
  statsBanner: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statsItem: {
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ddd',
  },
});
