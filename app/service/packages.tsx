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

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  services: string[];
  duration: string;
  validity: string;
  rating: number;
  reviewCount: number;
  bookedCount: number;
  isBestSeller?: boolean;
  isLimitedTime?: boolean;
  features: string[];
}

const mockPackages: ServicePackage[] = [
  {
    id: '1',
    name: 'Complete Home Care',
    description: 'All-in-one package for your home maintenance needs',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    price: 4999,
    originalPrice: 7999,
    discount: 37,
    services: ['Deep Cleaning', 'AC Service', 'Pest Control', 'Plumbing Check'],
    duration: '6-8 hours',
    validity: '30 days',
    rating: 4.8,
    reviewCount: 234,
    bookedCount: 1250,
    isBestSeller: true,
    features: ['Priority Support', 'Free Rescheduling', 'Quality Guarantee'],
  },
  {
    id: '2',
    name: 'Monthly Cleaning Plan',
    description: '4 deep cleaning sessions per month at discounted price',
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400',
    price: 5999,
    originalPrice: 7596,
    discount: 21,
    services: ['4x Deep Cleaning Sessions', 'Bathroom Cleaning', 'Kitchen Cleaning'],
    duration: '3-4 hours each',
    validity: '1 month',
    rating: 4.7,
    reviewCount: 189,
    bookedCount: 890,
    features: ['Flexible Scheduling', 'Same Professionals', 'Quality Assurance'],
  },
  {
    id: '3',
    name: 'Summer AC Bundle',
    description: 'Complete AC care for the summer season',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    price: 1499,
    originalPrice: 2199,
    discount: 32,
    services: ['AC Deep Service', 'Gas Refill Check', 'Filter Cleaning'],
    duration: '2-3 hours',
    validity: '15 days',
    rating: 4.9,
    reviewCount: 312,
    bookedCount: 2100,
    isLimitedTime: true,
    features: ['90 Day Warranty', 'Expert Technicians', 'Genuine Parts'],
  },
  {
    id: '4',
    name: 'Beauty Essentials',
    description: 'Complete salon experience at home',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    services: ['Hair Spa', 'Facial', 'Manicure', 'Pedicure'],
    duration: '3-4 hours',
    validity: '30 days',
    rating: 4.6,
    reviewCount: 156,
    bookedCount: 678,
    features: ['Premium Products', 'Expert Beauticians', 'Hygiene Kit'],
  },
];

export default function ServicePackagesScreen() {
  const colors = useColors();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Packages' },
    { id: 'bestseller', label: 'Best Sellers' },
    { id: 'limited', label: 'Limited Time' },
    { id: 'value', label: 'Best Value' },
  ];

  const filteredPackages = mockPackages.filter((pkg) => {
    if (selectedFilter === 'bestseller') return pkg.isBestSeller;
    if (selectedFilter === 'limited') return pkg.isLimitedTime;
    if (selectedFilter === 'value') return pkg.discount >= 30;
    return true;
  });

  const renderPackageCard = ({ item }: { item: ServicePackage }) => (
    <TouchableOpacity
      style={[styles.packageCard, { backgroundColor: colors.card }]}
      onPress={() =>
        router.push({
          pathname: '/service/package/[id]',
          params: { id: item.id },
        })
      }
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.badgeContainer}>
          <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
            <ThemedText style={styles.discountText}>{item.discount}% OFF</ThemedText>
          </View>
          {item.isBestSeller && (
            <View style={[styles.badge, { backgroundColor: '#FFC107' }]}>
              <Ionicons name="trophy" size={12} color="#fff" />
              <ThemedText style={styles.badgeText}>Best Seller</ThemedText>
            </View>
          )}
          {item.isLimitedTime && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Ionicons name="time" size={12} color="#fff" />
              <ThemedText style={styles.badgeText}>Limited Time</ThemedText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardContent}>
        <ThemedText style={styles.packageName}>{item.name}</ThemedText>
        <ThemedText style={[styles.packageDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </ThemedText>

        <View style={styles.servicesSection}>
          <ThemedText style={[styles.servicesLabel, { color: colors.textSecondary }]}>
            Includes:
          </ThemedText>
          <View style={styles.servicesList}>
            {item.services.slice(0, 3).map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <ThemedText style={styles.serviceText}>{service}</ThemedText>
              </View>
            ))}
            {item.services.length > 3 && (
              <ThemedText style={[styles.moreText, { color: colors.primary }]}>
                +{item.services.length - 3} more
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.duration}
            </ThemedText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
              Valid: {item.validity}
            </ThemedText>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
            <ThemedText style={[styles.reviewCount, { color: colors.textSecondary }]}>
              ({item.reviewCount})
            </ThemedText>
          </View>
          <ThemedText style={[styles.bookedCount, { color: colors.textSecondary }]}>
            {item.bookedCount.toLocaleString()} booked
          </ThemedText>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <ThemedText style={[styles.price, { color: colors.primary }]}>
              ₹{item.price}
            </ThemedText>
            <ThemedText style={[styles.originalPrice, { color: colors.textSecondary }]}>
              ₹{item.originalPrice}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.buyBtn, { backgroundColor: colors.primary }]}
            onPress={() =>
              router.push({
                pathname: '/booking/form',
                params: { packageId: item.id, price: item.price.toString() },
              })
            }
          >
            <ThemedText style={styles.buyBtnText}>Buy Now</ThemedText>
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
        <ThemedText style={styles.headerTitle}>Service Packages</ThemedText>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Hero Banner */}
      <View style={styles.bannerSection}>
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          style={styles.heroBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Ionicons name="gift" size={40} color="#fff" />
            <View style={styles.heroText}>
              <ThemedText style={styles.heroTitle}>Save More with Packages</ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Up to 40% off on bundled services
              </ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterList}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterPill,
              {
                backgroundColor:
                  selectedFilter === filter.id ? colors.primary : colors.card,
                borderColor:
                  selectedFilter === filter.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <ThemedText
              style={[
                styles.filterText,
                { color: selectedFilter === filter.id ? '#fff' : colors.text },
              ]}
            >
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <View style={styles.resultsHeader}>
        <ThemedText style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {filteredPackages.length} packages available
        </ThemedText>
      </View>

      {/* Packages List */}
      <FlatList
        data={filteredPackages}
        keyExtractor={(item) => item.id}
        renderItem={renderPackageCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No packages found</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Try changing your filter selection
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
  bannerSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heroBanner: {
    borderRadius: 16,
    padding: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  filterScroll: {
    maxHeight: 50,
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  packageCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 6,
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  servicesSection: {
    marginBottom: 12,
  },
  servicesLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  servicesList: {
    gap: 4,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceText: {
    fontSize: 13,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  bookedCount: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  buyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 15,
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
  },
});
