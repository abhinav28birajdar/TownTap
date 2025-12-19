import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Category {
  id: string;
  name: string;
  icon: string;
  serviceCount: number;
  gradient: string[];
}

interface SubCategory {
  id: string;
  name: string;
  icon: string;
  serviceCount: number;
  image?: string;
}

interface PopularService {
  id: string;
  name: string;
  basePrice: number;
  rating: number;
  bookings: number;
  image?: string;
}

const allCategories: Record<string, {
  name: string;
  icon: string;
  gradient: string[];
  description: string;
  subCategories: SubCategory[];
  popularServices: PopularService[];
}> = {
  'home-services': {
    name: 'Home Services',
    icon: 'home',
    gradient: ['#4CAF50', '#2E7D32'],
    description: 'Professional home maintenance and repair services',
    subCategories: [
      { id: 'plumbing', name: 'Plumbing', icon: 'water', serviceCount: 45 },
      { id: 'electrical', name: 'Electrical', icon: 'flash', serviceCount: 38 },
      { id: 'carpentry', name: 'Carpentry', icon: 'construct', serviceCount: 28 },
      { id: 'painting', name: 'Painting', icon: 'color-palette', serviceCount: 22 },
      { id: 'cleaning', name: 'Cleaning', icon: 'sparkles', serviceCount: 56 },
      { id: 'pest-control', name: 'Pest Control', icon: 'bug', serviceCount: 18 },
      { id: 'ac-repair', name: 'AC Repair', icon: 'snow', serviceCount: 32 },
      { id: 'appliance', name: 'Appliance Repair', icon: 'hardware-chip', serviceCount: 42 },
    ],
    popularServices: [
      { id: '1', name: 'Full Home Cleaning', basePrice: 999, rating: 4.8, bookings: 2340 },
      { id: '2', name: 'AC Service & Repair', basePrice: 499, rating: 4.7, bookings: 1890 },
      { id: '3', name: 'Plumber Visit', basePrice: 199, rating: 4.6, bookings: 3210 },
      { id: '4', name: 'Electrician Visit', basePrice: 199, rating: 4.5, bookings: 2890 },
    ],
  },
  'beauty-wellness': {
    name: 'Beauty & Wellness',
    icon: 'flower',
    gradient: ['#E91E63', '#C2185B'],
    description: 'Salon services at your doorstep',
    subCategories: [
      { id: 'haircut', name: 'Haircut & Styling', icon: 'cut', serviceCount: 34 },
      { id: 'facial', name: 'Facial & Cleanup', icon: 'happy', serviceCount: 28 },
      { id: 'manicure', name: 'Manicure & Pedicure', icon: 'hand-left', serviceCount: 22 },
      { id: 'massage', name: 'Massage & Spa', icon: 'fitness', serviceCount: 18 },
      { id: 'waxing', name: 'Waxing', icon: 'sparkles', serviceCount: 16 },
      { id: 'makeup', name: 'Makeup', icon: 'color-wand', serviceCount: 24 },
      { id: 'mehendi', name: 'Mehendi', icon: 'leaf', serviceCount: 12 },
      { id: 'threading', name: 'Threading', icon: 'remove', serviceCount: 8 },
    ],
    popularServices: [
      { id: '1', name: 'Bridal Makeup', basePrice: 4999, rating: 4.9, bookings: 890 },
      { id: '2', name: 'Full Body Massage', basePrice: 1499, rating: 4.8, bookings: 1560 },
      { id: '3', name: 'Hair Spa', basePrice: 999, rating: 4.7, bookings: 2340 },
      { id: '4', name: 'Classic Facial', basePrice: 699, rating: 4.6, bookings: 3120 },
    ],
  },
  'health': {
    name: 'Health & Medical',
    icon: 'medical',
    gradient: ['#2196F3', '#1565C0'],
    description: 'Healthcare services and consultations',
    subCategories: [
      { id: 'doctor', name: 'Doctor Consultation', icon: 'medkit', serviceCount: 56 },
      { id: 'nursing', name: 'Nursing Care', icon: 'bandage', serviceCount: 24 },
      { id: 'physiotherapy', name: 'Physiotherapy', icon: 'body', serviceCount: 18 },
      { id: 'lab-tests', name: 'Lab Tests', icon: 'flask', serviceCount: 42 },
      { id: 'dental', name: 'Dental Care', icon: 'happy', serviceCount: 28 },
      { id: 'eye-care', name: 'Eye Care', icon: 'eye', serviceCount: 16 },
    ],
    popularServices: [
      { id: '1', name: 'Full Body Checkup', basePrice: 1999, rating: 4.8, bookings: 1450 },
      { id: '2', name: 'Video Consultation', basePrice: 299, rating: 4.7, bookings: 5670 },
      { id: '3', name: 'Physiotherapy Session', basePrice: 599, rating: 4.6, bookings: 890 },
      { id: '4', name: 'Home Sample Collection', basePrice: 99, rating: 4.5, bookings: 4230 },
    ],
  },
  'automotive': {
    name: 'Automotive',
    icon: 'car',
    gradient: ['#FF9800', '#F57C00'],
    description: 'Vehicle maintenance and repair services',
    subCategories: [
      { id: 'car-wash', name: 'Car Wash', icon: 'water', serviceCount: 28 },
      { id: 'car-service', name: 'Car Service', icon: 'construct', serviceCount: 34 },
      { id: 'bike-service', name: 'Bike Service', icon: 'bicycle', serviceCount: 22 },
      { id: 'tyre', name: 'Tyre Services', icon: 'ellipse', serviceCount: 16 },
      { id: 'denting', name: 'Denting & Painting', icon: 'color-palette', serviceCount: 14 },
      { id: 'battery', name: 'Battery Services', icon: 'battery-charging', serviceCount: 12 },
    ],
    popularServices: [
      { id: '1', name: 'Full Car Wash', basePrice: 499, rating: 4.7, bookings: 3450 },
      { id: '2', name: 'Periodic Service', basePrice: 2999, rating: 4.6, bookings: 1230 },
      { id: '3', name: 'AC Service', basePrice: 1499, rating: 4.5, bookings: 890 },
      { id: '4', name: 'Interior Cleaning', basePrice: 799, rating: 4.4, bookings: 2340 },
    ],
  },
  'education': {
    name: 'Education',
    icon: 'school',
    gradient: ['#9C27B0', '#7B1FA2'],
    description: 'Tutoring and educational services',
    subCategories: [
      { id: 'academics', name: 'Academic Tutoring', icon: 'book', serviceCount: 68 },
      { id: 'music', name: 'Music Classes', icon: 'musical-notes', serviceCount: 24 },
      { id: 'dance', name: 'Dance Classes', icon: 'body', serviceCount: 18 },
      { id: 'art', name: 'Art Classes', icon: 'color-palette', serviceCount: 16 },
      { id: 'language', name: 'Language Classes', icon: 'language', serviceCount: 32 },
      { id: 'coding', name: 'Coding Classes', icon: 'code', serviceCount: 28 },
    ],
    popularServices: [
      { id: '1', name: 'Math Tutoring', basePrice: 500, rating: 4.8, bookings: 4560 },
      { id: '2', name: 'Guitar Classes', basePrice: 800, rating: 4.7, bookings: 1230 },
      { id: '3', name: 'English Speaking', basePrice: 600, rating: 4.6, bookings: 2890 },
      { id: '4', name: 'Python Programming', basePrice: 1000, rating: 4.5, bookings: 1780 },
    ],
  },
  'events': {
    name: 'Events & Occasions',
    icon: 'balloon',
    gradient: ['#FF5722', '#E64A19'],
    description: 'Event planning and celebration services',
    subCategories: [
      { id: 'photography', name: 'Photography', icon: 'camera', serviceCount: 34 },
      { id: 'catering', name: 'Catering', icon: 'restaurant', serviceCount: 28 },
      { id: 'decoration', name: 'Decoration', icon: 'sparkles', serviceCount: 22 },
      { id: 'dj', name: 'DJ & Music', icon: 'musical-notes', serviceCount: 18 },
      { id: 'anchor', name: 'Event Anchor', icon: 'mic', serviceCount: 12 },
      { id: 'venue', name: 'Venue Booking', icon: 'business', serviceCount: 24 },
    ],
    popularServices: [
      { id: '1', name: 'Birthday Photography', basePrice: 4999, rating: 4.8, bookings: 890 },
      { id: '2', name: 'Party Decoration', basePrice: 2999, rating: 4.7, bookings: 1560 },
      { id: '3', name: 'Wedding Catering', basePrice: 45000, rating: 4.9, bookings: 450 },
      { id: '4', name: 'DJ Services', basePrice: 8000, rating: 4.6, bookings: 670 },
    ],
  },
};

export default function CategoryDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  
  const category = allCategories[id || 'home-services'];
  
  if (!category) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Category not found</ThemedText>
      </SafeAreaView>
    );
  }

  const renderSubCategory = ({ item }: { item: SubCategory }) => (
    <TouchableOpacity
      style={[styles.subCategoryCard, { backgroundColor: colors.card }]}
      onPress={() => router.push({
        pathname: '/category/services',
        params: { categoryId: id, subCategoryId: item.id },
      })}
    >
      <View style={[styles.subCategoryIcon, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={item.icon as any} size={24} color={colors.primary} />
      </View>
      <ThemedText style={styles.subCategoryName} numberOfLines={1}>
        {item.name}
      </ThemedText>
      <ThemedText style={[styles.subCategoryCount, { color: colors.textSecondary }]}>
        {item.serviceCount} services
      </ThemedText>
    </TouchableOpacity>
  );

  const renderPopularService = ({ item }: { item: PopularService }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={() => router.push({
        pathname: '/booking/form',
        params: { serviceId: item.id },
      })}
    >
      <View style={[styles.serviceImage, { backgroundColor: colors.primary + '10' }]}>
        <Ionicons name="cube" size={40} color={colors.primary} />
      </View>
      
      <View style={styles.serviceInfo}>
        <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
        
        <View style={styles.serviceStats}>
          <View style={styles.serviceStat}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <ThemedText style={styles.serviceStatText}>{item.rating}</ThemedText>
          </View>
          <View style={styles.serviceStat}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.serviceStatText, { color: colors.textSecondary }]}>
              {item.bookings.toLocaleString()} bookings
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.serviceFooter}>
          <View>
            <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>
              Starting from
            </ThemedText>
            <ThemedText style={[styles.servicePrice, { color: colors.primary }]}>
              ₹{item.basePrice}
            </ThemedText>
          </View>
          
          <TouchableOpacity 
            style={[styles.bookButton, { backgroundColor: colors.primary }]}
          >
            <ThemedText style={styles.bookButtonText}>Book Now</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={category.gradient as [string, string, ...string[]]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerAction}
              onPress={() => router.push('/search/index' as any)}
            >
              <Ionicons name="search" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="filter" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.categoryHeader}>
          <View style={styles.categoryIcon}>
            <Ionicons name={category.icon as any} size={40} color="#FFF" />
          </View>
          <ThemedText style={styles.categoryTitle}>{category.name}</ThemedText>
          <ThemedText style={styles.categoryDescription}>{category.description}</ThemedText>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sub Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Browse Categories</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.seeAll, { color: colors.primary }]}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={category.subCategories}
            renderItem={renderSubCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subCategoryList}
          />
        </View>

        {/* Sort Options */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortScroll}
          contentContainerStyle={styles.sortContainer}
        >
          {[
            { key: 'popular', label: 'Popular' },
            { key: 'rating', label: 'Top Rated' },
            { key: 'price-low', label: 'Price: Low to High' },
            { key: 'price-high', label: 'Price: High to Low' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortChip,
                {
                  backgroundColor: sortBy === option.key ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setSortBy(option.key as any)}
            >
              <ThemedText
                style={[
                  styles.sortChipText,
                  { color: sortBy === option.key ? '#FFF' : colors.textSecondary },
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Popular Services</ThemedText>
            <View style={styles.serviceCount}>
              <ThemedText style={[styles.serviceCountText, { color: colors.textSecondary }]}>
                {category.popularServices.length} services
              </ThemedText>
            </View>
          </View>
          
          {category.popularServices.map((service) => (
            <View key={service.id}>
              {renderPopularService({ item: service })}
            </View>
          ))}
        </View>

        {/* Offers Section */}
        <View style={[styles.offerBanner, { backgroundColor: colors.primary + '10' }]}>
          <View style={styles.offerContent}>
            <ThemedText style={[styles.offerTitle, { color: colors.primary }]}>
              🎉 First Time Offer
            </ThemedText>
            <ThemedText style={[styles.offerDescription, { color: colors.textSecondary }]}>
              Get 20% off on your first {category.name.toLowerCase()} booking
            </ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.offerButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/customer/offers')}
          >
            <ThemedText style={styles.offerButtonText}>View Offers</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Why Choose Us */}
        <View style={[styles.whySection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.whySectionTitle}>Why Choose Us</ThemedText>
          
          <View style={styles.whyGrid}>
            <View style={styles.whyItem}>
              <View style={[styles.whyIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              </View>
              <ThemedText style={styles.whyItemTitle}>Verified Professionals</ThemedText>
              <ThemedText style={[styles.whyItemDescription, { color: colors.textSecondary }]}>
                Background verified experts
              </ThemedText>
            </View>
            
            <View style={styles.whyItem}>
              <View style={[styles.whyIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="cash" size={24} color={colors.primary} />
              </View>
              <ThemedText style={styles.whyItemTitle}>Best Prices</ThemedText>
              <ThemedText style={[styles.whyItemDescription, { color: colors.textSecondary }]}>
                Transparent pricing
              </ThemedText>
            </View>
            
            <View style={styles.whyItem}>
              <View style={[styles.whyIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="star" size={24} color={colors.warning} />
              </View>
              <ThemedText style={styles.whyItemTitle}>Quality Service</ThemedText>
              <ThemedText style={[styles.whyItemDescription, { color: colors.textSecondary }]}>
                Rated 4.5+ on average
              </ThemedText>
            </View>
            
            <View style={styles.whyItem}>
              <View style={[styles.whyIcon, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="headset" size={24} color={colors.info} />
              </View>
              <ThemedText style={styles.whyItemTitle}>24/7 Support</ThemedText>
              <ThemedText style={[styles.whyItemDescription, { color: colors.textSecondary }]}>
                Always here to help
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 24,
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerAction: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  categoryHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  categoryIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryDescription: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  subCategoryList: {
    gap: 12,
  },
  subCategoryCard: {
    width: 110,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  subCategoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  subCategoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  subCategoryCount: {
    fontSize: 11,
  },
  sortScroll: {
    paddingLeft: 16,
  },
  sortContainer: {
    gap: 10,
    paddingRight: 16,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  serviceCount: {},
  serviceCountText: {
    fontSize: 13,
  },
  serviceCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  serviceImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  serviceStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  serviceStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceStatText: {
    fontSize: 13,
    fontWeight: '500',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  bookButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 12,
  },
  offerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  offerButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  whySection: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  whySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  whyItem: {
    width: '46%',
    alignItems: 'center',
  },
  whyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  whyItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  whyItemDescription: {
    fontSize: 11,
    textAlign: 'center',
  },
});
