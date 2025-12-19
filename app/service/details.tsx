import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ServiceVariant {
  id: string;
  name: string;
  price: number;
  duration: string;
  description?: string;
  popular?: boolean;
}

interface ServiceAddon {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

const mockServiceDetails = {
  id: '1',
  name: 'Deep Home Cleaning',
  category: 'Home Cleaning',
  images: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400',
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
  ],
  rating: 4.8,
  reviewCount: 245,
  bookedCount: 1520,
  description:
    'Professional deep cleaning service for your entire home. Our trained experts use eco-friendly products and advanced equipment to give your home a thorough clean.',
  variants: [
    { id: '1', name: '1 BHK', price: 1299, duration: '2-3 hours' },
    { id: '2', name: '2 BHK', price: 1899, duration: '3-4 hours', popular: true },
    { id: '3', name: '3 BHK', price: 2499, duration: '4-5 hours' },
    { id: '4', name: '4 BHK', price: 3299, duration: '5-6 hours' },
  ] as ServiceVariant[],
  addons: [
    { id: '1', name: 'Bathroom Deep Clean', price: 499, description: 'Extra focus on bathrooms' },
    { id: '2', name: 'Kitchen Deep Clean', price: 599, description: 'Chimney, stove, cabinets' },
    { id: '3', name: 'Balcony Cleaning', price: 299, description: 'All balconies cleaning' },
    { id: '4', name: 'Window Cleaning', price: 399, description: 'Interior & exterior windows' },
  ] as ServiceAddon[],
  includes: [
    'Dusting & sweeping all rooms',
    'Mopping with disinfectant',
    'Bathroom cleaning',
    'Kitchen platform cleaning',
    'Fan & light cleaning',
    'Wardrobe surface cleaning',
  ],
  excludes: [
    'Wall washing',
    'Ceiling cleaning',
    'Carpet shampooing',
    'Heavy furniture moving',
  ],
  reviews: [
    {
      id: '1',
      userName: 'Anita Sharma',
      rating: 5,
      comment: 'Excellent service! The team was very professional and thorough.',
      date: '2024-01-15',
      helpful: 12,
    },
    {
      id: '2',
      userName: 'Raj Kumar',
      rating: 4,
      comment: 'Good service overall. Completed on time.',
      date: '2024-01-10',
      helpful: 8,
    },
  ] as Review[],
  provider: {
    name: 'CleanPro Services',
    rating: 4.9,
    completedJobs: 3200,
    yearsInBusiness: 5,
  },
};

export default function ServiceDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [selectedVariant, setSelectedVariant] = useState<string>(
    mockServiceDetails.variants.find((v) => v.popular)?.id || mockServiceDetails.variants[0].id
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const currentVariant = mockServiceDetails.variants.find((v) => v.id === selectedVariant);
  const totalPrice =
    (currentVariant?.price || 0) +
    mockServiceDetails.addons
      .filter((a) => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleBook = () => {
    router.push({
      pathname: '/booking/schedule',
      params: {
        serviceId: id,
        variantId: selectedVariant,
        addons: selectedAddons.join(','),
        price: totalPrice.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerButton, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.error : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
            <Ionicons name="share-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {mockServiceDetails.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.serviceImage} />
          ))}
        </ScrollView>
        <View style={styles.imageIndicators}>
          {mockServiceDetails.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    index === activeImageIndex ? colors.primary : colors.border,
                  width: index === activeImageIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Service Info */}
        <View style={styles.content}>
          <ThemedText style={[styles.category, { color: colors.primary }]}>
            {mockServiceDetails.category}
          </ThemedText>
          <ThemedText style={styles.serviceName}>{mockServiceDetails.name}</ThemedText>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <ThemedText style={styles.statText}>{mockServiceDetails.rating}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                ({mockServiceDetails.reviewCount} reviews)
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <ThemedText style={styles.statText}>
                {mockServiceDetails.bookedCount.toLocaleString()}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                booked
              </ThemedText>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>About this service</ThemedText>
            <ThemedText
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {mockServiceDetails.description}
            </ThemedText>
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <ThemedText style={[styles.readMore, { color: colors.primary }]}>
                {showFullDescription ? 'Show less' : 'Read more'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Select Size/Variant */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Select Home Size</ThemedText>
            <View style={styles.variantGrid}>
              {mockServiceDetails.variants.map((variant) => (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.variantCard,
                    {
                      backgroundColor: colors.card,
                      borderColor:
                        selectedVariant === variant.id ? colors.primary : colors.border,
                      borderWidth: selectedVariant === variant.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedVariant(variant.id)}
                >
                  {variant.popular && (
                    <View style={[styles.popularTag, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.popularText}>Popular</ThemedText>
                    </View>
                  )}
                  <ThemedText style={styles.variantName}>{variant.name}</ThemedText>
                  <ThemedText style={[styles.variantPrice, { color: colors.primary }]}>
                    ₹{variant.price}
                  </ThemedText>
                  <ThemedText style={[styles.variantDuration, { color: colors.textSecondary }]}>
                    {variant.duration}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add-ons */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Add Extra Services</ThemedText>
            {mockServiceDetails.addons.map((addon) => (
              <TouchableOpacity
                key={addon.id}
                style={[
                  styles.addonCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: selectedAddons.includes(addon.id)
                      ? colors.primary
                      : colors.border,
                    borderWidth: selectedAddons.includes(addon.id) ? 2 : 1,
                  },
                ]}
                onPress={() => toggleAddon(addon.id)}
              >
                <View style={styles.addonInfo}>
                  <ThemedText style={styles.addonName}>{addon.name}</ThemedText>
                  {addon.description && (
                    <ThemedText style={[styles.addonDesc, { color: colors.textSecondary }]}>
                      {addon.description}
                    </ThemedText>
                  )}
                </View>
                <View style={styles.addonRight}>
                  <ThemedText style={[styles.addonPrice, { color: colors.primary }]}>
                    +₹{addon.price}
                  </ThemedText>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: selectedAddons.includes(addon.id)
                          ? colors.primary
                          : 'transparent',
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    {selectedAddons.includes(addon.id) && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Includes / Excludes */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>What's Included</ThemedText>
            <View style={[styles.listCard, { backgroundColor: colors.card }]}>
              {mockServiceDetails.includes.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <ThemedText style={styles.listText}>{item}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>What's Not Included</ThemedText>
            <View style={[styles.listCard, { backgroundColor: colors.card }]}>
              {mockServiceDetails.excludes.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="close-circle" size={18} color={colors.error} />
                  <ThemedText style={styles.listText}>{item}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Provider Info */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Service Provider</ThemedText>
            <TouchableOpacity
              style={[styles.providerCard, { backgroundColor: colors.card }]}
              onPress={() =>
                router.push({
                  pathname: '/provider/[id]',
                  params: { id: mockServiceDetails.provider.name },
                })
              }
            >
              <View style={styles.providerAvatar}>
                <Ionicons name="business" size={24} color={colors.primary} />
              </View>
              <View style={styles.providerInfo}>
                <ThemedText style={styles.providerName}>
                  {mockServiceDetails.provider.name}
                </ThemedText>
                <View style={styles.providerStats}>
                  <View style={styles.providerStat}>
                    <Ionicons name="star" size={14} color="#FFC107" />
                    <ThemedText style={styles.providerStatText}>
                      {mockServiceDetails.provider.rating}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.providerStatText, { color: colors.textSecondary }]}>
                    • {mockServiceDetails.provider.completedJobs.toLocaleString()} jobs
                  </ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <ThemedText style={styles.sectionTitle}>Customer Reviews</ThemedText>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/business-reviews/[id]',
                    params: { id: id as string },
                  })
                }
              >
                <ThemedText style={[styles.viewAll, { color: colors.primary }]}>
                  View All
                </ThemedText>
              </TouchableOpacity>
            </View>
            {mockServiceDetails.reviews.slice(0, 2).map((review) => (
              <View
                key={review.id}
                style={[styles.reviewCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.reviewTop}>
                  <View style={styles.reviewUser}>
                    <View style={styles.reviewAvatar}>
                      <ThemedText style={styles.avatarText}>
                        {review.userName.charAt(0)}
                      </ThemedText>
                    </View>
                    <View>
                      <ThemedText style={styles.reviewUserName}>{review.userName}</ThemedText>
                      <ThemedText style={[styles.reviewDate, { color: colors.textSecondary }]}>
                        {new Date(review.date).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={14}
                        color={i < review.rating ? '#FFC107' : colors.border}
                      />
                    ))}
                  </View>
                </View>
                <ThemedText style={[styles.reviewComment, { color: colors.textSecondary }]}>
                  {review.comment}
                </ThemedText>
                <TouchableOpacity style={styles.helpfulButton}>
                  <Ionicons name="thumbs-up-outline" size={14} color={colors.textSecondary} />
                  <ThemedText style={[styles.helpfulText, { color: colors.textSecondary }]}>
                    Helpful ({review.helpful})
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.priceSection}>
          <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>
            Total Price
          </ThemedText>
          <ThemedText style={styles.totalPrice}>₹{totalPrice}</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={handleBook}
        >
          <ThemedText style={styles.bookText}>Book Now</ThemedText>
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
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  serviceImage: {
    width: width,
    height: 280,
    resizeMode: 'cover',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: -30,
    marginBottom: 16,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 16,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  variantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variantCard: {
    width: (width - 42) / 2,
    padding: 14,
    borderRadius: 12,
    position: 'relative',
  },
  popularTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  variantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  variantPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  variantDuration: {
    fontSize: 12,
  },
  addonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  addonInfo: {
    flex: 1,
  },
  addonName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  addonDesc: {
    fontSize: 12,
  },
  addonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addonPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: {
    padding: 14,
    borderRadius: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  listText: {
    fontSize: 14,
    flex: 1,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(65, 93, 67, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  providerStatText: {
    fontSize: 13,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpfulText: {
    fontSize: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  priceSection: {},
  priceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  bookButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
