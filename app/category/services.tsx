import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
  rating: number;
  reviewCount: number;
  includes: string[];
  image?: string;
  isPopular?: boolean;
  discount?: number;
}

const servicesData: Service[] = [
  {
    id: '1',
    name: 'Basic Plumbing Service',
    description: 'Minor plumbing repairs and maintenance',
    basePrice: 199,
    duration: '1-2 hours',
    rating: 4.6,
    reviewCount: 2340,
    includes: ['Tap repair', 'Minor leak fix', 'Inspection'],
    isPopular: true,
  },
  {
    id: '2',
    name: 'Pipe Installation',
    description: 'New pipe installation and replacement',
    basePrice: 499,
    duration: '2-3 hours',
    rating: 4.7,
    reviewCount: 1560,
    includes: ['New pipe installation', 'Old pipe removal', 'Testing'],
    discount: 15,
  },
  {
    id: '3',
    name: 'Drainage Cleaning',
    description: 'Complete drainage system cleaning',
    basePrice: 349,
    duration: '1-2 hours',
    rating: 4.5,
    reviewCount: 1890,
    includes: ['Chemical cleaning', 'Blockage removal', 'Flow testing'],
  },
  {
    id: '4',
    name: 'Toilet Repair',
    description: 'Toilet installation and repair services',
    basePrice: 299,
    duration: '1-2 hours',
    rating: 4.4,
    reviewCount: 2120,
    includes: ['Flush repair', 'Seat replacement', 'Leak fix'],
    isPopular: true,
  },
  {
    id: '5',
    name: 'Water Heater Service',
    description: 'Water heater installation and repair',
    basePrice: 599,
    duration: '2-3 hours',
    rating: 4.8,
    reviewCount: 980,
    includes: ['Installation', 'Repair', 'Annual maintenance'],
    discount: 10,
  },
  {
    id: '6',
    name: 'Complete Bathroom Plumbing',
    description: 'Full bathroom plumbing services',
    basePrice: 1499,
    duration: '4-6 hours',
    rating: 4.9,
    reviewCount: 560,
    includes: ['All fixtures', 'Pipe work', 'Testing & warranty'],
  },
];

export default function CategoryServicesScreen() {
  const colors = useColors();
  const { categoryId, subCategoryId } = useLocalSearchParams<{
    categoryId: string;
    subCategoryId: string;
  }>();
  
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance');
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([0, 5000]);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const sortOptions = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'price-low', label: 'Price: Low to High' },
    { key: 'price-high', label: 'Price: High to Low' },
    { key: 'rating', label: 'Highest Rated' },
  ];

  const getSortedServices = () => {
    let sorted = [...servicesData];
    
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Keep original order for relevance
        break;
    }
    
    return sorted;
  };

  const services = getSortedServices();

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={() => router.push({
        pathname: '/booking/form',
        params: { serviceId: item.id },
      })}
    >
      {/* Image/Icon Section */}
      <View style={[styles.serviceImage, { backgroundColor: colors.primary + '10' }]}>
        <Ionicons name="construct" size={36} color={colors.primary} />
        {item.isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: colors.warning }]}>
            <ThemedText style={styles.popularBadgeText}>Popular</ThemedText>
          </View>
        )}
        {item.discount && (
          <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
            <ThemedText style={styles.discountBadgeText}>{item.discount}% OFF</ThemedText>
          </View>
        )}
      </View>
      
      {/* Info Section */}
      <View style={styles.serviceInfo}>
        <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
        <ThemedText style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </ThemedText>
        
        {/* Rating & Duration */}
        <View style={styles.serviceStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <ThemedText style={styles.statText}>{item.rating}</ThemedText>
            <ThemedText style={[styles.statSubtext, { color: colors.textSecondary }]}>
              ({item.reviewCount.toLocaleString()})
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
              {item.duration}
            </ThemedText>
          </View>
        </View>
        
        {/* Includes */}
        <View style={styles.includesContainer}>
          {item.includes.slice(0, 3).map((include, index) => (
            <View key={index} style={styles.includeItem}>
              <Ionicons name="checkmark" size={12} color={colors.success} />
              <ThemedText style={[styles.includeText, { color: colors.textSecondary }]}>
                {include}
              </ThemedText>
            </View>
          ))}
        </View>
        
        {/* Price & Action */}
        <View style={styles.serviceFooter}>
          <View style={styles.priceContainer}>
            {item.discount && (
              <ThemedText style={[styles.originalPrice, { color: colors.textSecondary }]}>
                ₹{Math.round(item.basePrice / (1 - item.discount / 100))}
              </ThemedText>
            )}
            <ThemedText style={[styles.currentPrice, { color: colors.primary }]}>
              ₹{item.basePrice}
            </ThemedText>
          </View>
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push({
              pathname: '/booking/form',
              params: { serviceId: item.id },
            })}
          >
            <ThemedText style={styles.addButtonText}>Add</ThemedText>
            <Ionicons name="add" size={16} color="#FFF" />
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
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>Plumbing Services</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {services.length} services available
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.push('/search/index' as any)}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Sort & Filter Bar */}
      <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContainer}
        >
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortChip,
                {
                  backgroundColor: sortBy === option.key ? colors.primary + '15' : 'transparent',
                  borderColor: sortBy === option.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSortBy(option.key as any)}
            >
              <ThemedText
                style={[
                  styles.sortChipText,
                  { color: sortBy === option.key ? colors.primary : colors.textSecondary },
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.card }]}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={[styles.promoCard, { backgroundColor: colors.primary + '10' }]}>
            <Ionicons name="pricetag" size={24} color={colors.primary} />
            <View style={styles.promoContent}>
              <ThemedText style={[styles.promoTitle, { color: colors.primary }]}>
                Bundle & Save 20%
              </ThemedText>
              <ThemedText style={[styles.promoDescription, { color: colors.textSecondary }]}>
                Book 2 or more services together
              </ThemedText>
            </View>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No services found</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Try adjusting your filters or search criteria
            </ThemedText>
          </View>
        )}
      />

      {/* Cart Summary (if items selected) */}
      <View style={[styles.cartSummary, { backgroundColor: colors.card }]}>
        <View style={styles.cartInfo}>
          <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.cartBadgeText}>1</ThemedText>
          </View>
          <View>
            <ThemedText style={styles.cartTitle}>1 service selected</ThemedText>
            <ThemedText style={[styles.cartPrice, { color: colors.primary }]}>₹199</ThemedText>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.viewCartButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/booking/form')}
        >
          <ThemedText style={styles.viewCartButtonText}>View Cart</ThemedText>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sortContainer: {
    paddingHorizontal: 16,
    gap: 10,
    flex: 1,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterButton: {
    padding: 10,
    borderRadius: 12,
    marginRight: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  promoDescription: {
    fontSize: 12,
  },
  serviceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  serviceImage: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  serviceInfo: {
    padding: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  serviceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statSubtext: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 12,
  },
  includesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  includeText: {
    fontSize: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  cartSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cartTitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  cartPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  viewCartButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
