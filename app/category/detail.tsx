import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface SubCategory {
  id: string;
  name: string;
  image: string;
  servicesCount: number;
  popular?: boolean;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  duration: string;
  rating: number;
  reviews: number;
  provider: string;
  discount?: number;
}

const categoryData = {
  id: '1',
  name: 'Home Cleaning',
  icon: 'home-outline',
  color: '#4CAF50',
  description: 'Professional cleaning services for your home',
  totalServices: 45,
  avgRating: 4.7,
};

const subCategories: SubCategory[] = [
  { id: '1', name: 'Full Home Deep Clean', image: 'https://via.placeholder.com/100', servicesCount: 12, popular: true },
  { id: '2', name: 'Kitchen Cleaning', image: 'https://via.placeholder.com/100', servicesCount: 8 },
  { id: '3', name: 'Bathroom Cleaning', image: 'https://via.placeholder.com/100', servicesCount: 6 },
  { id: '4', name: 'Carpet & Sofa', image: 'https://via.placeholder.com/100', servicesCount: 5 },
  { id: '5', name: 'Move In/Out Clean', image: 'https://via.placeholder.com/100', servicesCount: 4 },
  { id: '6', name: 'Office Cleaning', image: 'https://via.placeholder.com/100', servicesCount: 10, popular: true },
];

const services: ServiceItem[] = [
  {
    id: '1',
    name: 'Deep Home Cleaning (3BHK)',
    description: 'Complete deep cleaning including all rooms, kitchen, bathrooms',
    image: 'https://via.placeholder.com/200',
    price: 1999,
    originalPrice: 2499,
    duration: '4-5 hours',
    rating: 4.8,
    reviews: 234,
    provider: 'CleanPro Services',
    discount: 20,
  },
  {
    id: '2',
    name: 'Kitchen Deep Clean',
    description: 'Thorough cleaning of kitchen including appliances and chimney',
    image: 'https://via.placeholder.com/200',
    price: 799,
    originalPrice: 999,
    duration: '2 hours',
    rating: 4.7,
    reviews: 156,
    provider: 'SparkClean',
    discount: 20,
  },
  {
    id: '3',
    name: 'Bathroom Sanitization',
    description: 'Complete bathroom cleaning with sanitization',
    image: 'https://via.placeholder.com/200',
    price: 499,
    originalPrice: 599,
    duration: '1 hour',
    rating: 4.6,
    reviews: 89,
    provider: 'HygieneFirst',
  },
  {
    id: '4',
    name: 'Carpet Shampooing',
    description: 'Professional carpet shampooing and stain removal',
    image: 'https://via.placeholder.com/200',
    price: 899,
    originalPrice: 1199,
    duration: '2-3 hours',
    rating: 4.9,
    reviews: 67,
    provider: 'CleanPro Services',
    discount: 25,
  },
  {
    id: '5',
    name: 'Sofa Cleaning',
    description: 'Deep cleaning for sofas including fabric protection',
    image: 'https://via.placeholder.com/200',
    price: 599,
    originalPrice: 799,
    duration: '1-2 hours',
    rating: 4.5,
    reviews: 112,
    provider: 'FreshFurniture',
  },
];

const sortOptions = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'duration', label: 'Quickest Service' },
];

export default function CategoryDetailScreen() {
  const colors = useColors();
  const { categoryId } = useLocalSearchParams();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);

  const renderSubCategory = ({ item }: { item: SubCategory }) => (
    <TouchableOpacity
      style={[
        styles.subCategoryCard,
        { backgroundColor: colors.card },
        selectedSubCategory === item.id && { borderColor: colors.primary, borderWidth: 2 }
      ]}
      onPress={() => setSelectedSubCategory(selectedSubCategory === item.id ? null : item.id)}
    >
      {item.popular && (
        <View style={[styles.popularTag, { backgroundColor: colors.primary }]}>
          <ThemedText style={styles.popularText}>Popular</ThemedText>
        </View>
      )}
      <Image source={{ uri: item.image }} style={styles.subCategoryImage} />
      <ThemedText style={styles.subCategoryName} numberOfLines={2}>
        {item.name}
      </ThemedText>
      <ThemedText style={[styles.servicesCount, { color: colors.textSecondary }]}>
        {item.servicesCount} services
      </ThemedText>
    </TouchableOpacity>
  );

  const renderService = ({ item }: { item: ServiceItem }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/service/${item.id}` as any)}
    >
      <View style={styles.serviceImageContainer}>
        <Image source={{ uri: item.image }} style={styles.serviceImage} />
        {item.discount && (
          <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
            <ThemedText style={styles.discountText}>{item.discount}% OFF</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.serviceInfo}>
        <ThemedText style={styles.serviceName} numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText style={[styles.serviceDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </ThemedText>
        <View style={styles.providerRow}>
          <Ionicons name="business-outline" size={12} color={colors.textSecondary} />
          <ThemedText style={[styles.providerName, { color: colors.textSecondary }]}>
            {item.provider}
          </ThemedText>
        </View>
        <View style={styles.serviceFooter}>
          <View style={styles.priceContainer}>
            <ThemedText style={[styles.currentPrice, { color: colors.primary }]}>
              ₹{item.price}
            </ThemedText>
            <ThemedText style={[styles.originalPrice, { color: colors.textSecondary }]}>
              ₹{item.originalPrice}
            </ThemedText>
          </View>
          <View style={styles.metaContainer}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <ThemedText style={styles.rating}>{item.rating}</ThemedText>
              <ThemedText style={[styles.reviews, { color: colors.textSecondary }]}>
                ({item.reviews})
              </ThemedText>
            </View>
            <View style={[styles.durationBadge, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="time-outline" size={12} color={colors.primary} />
              <ThemedText style={[styles.duration, { color: colors.primary }]}>
                {item.duration}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[categoryData.color, categoryData.color + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name={categoryData.icon as any} size={28} color={categoryData.color} />
          </View>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.headerTitle}>{categoryData.name}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {categoryData.totalServices} services • {categoryData.avgRating} ⭐ avg
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="heart-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search cleaning services..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.card }]}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={18} color={colors.text} />
            <ThemedText style={styles.filterButtonText}>Sort</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.card }]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={18} color={colors.text} />
            <ThemedText style={styles.filterButtonText}>Filter</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub Categories */}
      <View style={styles.subCategoriesSection}>
        <ThemedText style={styles.sectionTitle}>Browse by Type</ThemedText>
        <FlatList
          data={subCategories}
          renderItem={renderSubCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subCategoriesList}
        />
      </View>

      {/* Services List */}
      <View style={styles.servicesSection}>
        <View style={styles.servicesHeader}>
          <ThemedText style={styles.sectionTitle}>All Services</ThemedText>
          <ThemedText style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {services.length} results
          </ThemedText>
        </View>
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.servicesList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Sort By</ThemedText>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  selectedSort === option.id && { backgroundColor: colors.primary + '15' }
                ]}
                onPress={() => {
                  setSelectedSort(option.id);
                  setShowSortModal(false);
                }}
              >
                <ThemedText style={[
                  styles.sortOptionText,
                  selectedSort === option.id && { color: colors.primary }
                ]}>
                  {option.label}
                </ThemedText>
                {selectedSort === option.id && (
                  <Ionicons name="checkmark" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.filterModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Filters</ThemedText>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Price Range */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Price Range</ThemedText>
                <View style={styles.priceRangeRow}>
                  <View style={[styles.priceInput, { backgroundColor: colors.background }]}>
                    <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>Min</ThemedText>
                    <ThemedText style={{ color: colors.text }}>₹{priceRange[0]}</ThemedText>
                  </View>
                  <View style={styles.priceRangeDivider}>
                    <ThemedText style={{ color: colors.textSecondary }}>to</ThemedText>
                  </View>
                  <View style={[styles.priceInput, { backgroundColor: colors.background }]}>
                    <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>Max</ThemedText>
                    <ThemedText style={{ color: colors.text }}>₹{priceRange[1]}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Rating */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Rating</ThemedText>
                <View style={styles.ratingOptions}>
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[styles.ratingOption, { backgroundColor: colors.background }]}
                    >
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <ThemedText style={{ color: colors.text }}>{rating}+ & above</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Service Duration</ThemedText>
                <View style={styles.durationOptions}>
                  {['< 1 hour', '1-2 hours', '2-4 hours', '4+ hours'].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[styles.durationOption, { backgroundColor: colors.background }]}
                    >
                      <ThemedText style={{ color: colors.text }}>{duration}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Providers */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Service Providers</ThemedText>
                {['CleanPro Services', 'SparkClean', 'HygieneFirst', 'FreshFurniture'].map((provider) => (
                  <TouchableOpacity
                    key={provider}
                    style={styles.providerOption}
                  >
                    <View style={[styles.checkbox, { borderColor: colors.border }]} />
                    <ThemedText style={{ color: colors.text }}>{provider}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity style={[styles.clearButton, { borderColor: colors.border }]}>
                <ThemedText style={{ color: colors.text }}>Clear All</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowFilterModal(false)}
              >
                <ThemedText style={{ color: '#FFF', fontWeight: '600' }}>Apply Filters</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingVertical: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 6,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  headerAction: {
    padding: 6,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  subCategoriesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  subCategoriesList: {
    paddingHorizontal: 16,
  },
  subCategoryCard: {
    width: 100,
    padding: 10,
    borderRadius: 14,
    marginRight: 10,
    alignItems: 'center',
    position: 'relative',
  },
  popularTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  popularText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '600',
  },
  subCategoryImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 8,
  },
  subCategoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  servicesCount: {
    fontSize: 10,
  },
  servicesSection: {
    flex: 1,
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 13,
  },
  servicesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  serviceCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  serviceImageContainer: {
    position: 'relative',
  },
  serviceImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  providerName: {
    fontSize: 11,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  metaContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviews: {
    fontSize: 11,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  duration: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  filterModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
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
    fontSize: 15,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  priceRangeDivider: {
    paddingHorizontal: 16,
  },
  ratingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
