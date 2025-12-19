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
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface FeaturedProvider {
  id: string;
  name: string;
  avatar: string;
  category: string;
  rating: number;
  jobs: number;
}

interface Service {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  duration: string;
  rating: number;
  bookings: number;
  provider: string;
}

interface Offer {
  id: string;
  title: string;
  discount: string;
  code: string;
  validTill: string;
  category: string;
  image: string;
}

const featuredProviders: FeaturedProvider[] = [
  { id: '1', name: 'Rajesh K.', avatar: 'https://via.placeholder.com/80', category: 'Cleaning', rating: 4.9, jobs: 432 },
  { id: '2', name: 'Priya S.', avatar: 'https://via.placeholder.com/80', category: 'Beauty', rating: 4.8, jobs: 287 },
  { id: '3', name: 'Amit P.', avatar: 'https://via.placeholder.com/80', category: 'Plumbing', rating: 4.7, jobs: 156 },
  { id: '4', name: 'Neha G.', avatar: 'https://via.placeholder.com/80', category: 'Salon', rating: 4.9, jobs: 523 },
];

const trendingServices: Service[] = [
  { id: '1', name: 'Deep Home Cleaning', image: 'https://via.placeholder.com/150', price: 1499, originalPrice: 1999, duration: '3-4 hrs', rating: 4.8, bookings: 1234, provider: 'CleanPro' },
  { id: '2', name: 'AC Service & Repair', image: 'https://via.placeholder.com/150', price: 399, originalPrice: 599, duration: '1 hr', rating: 4.7, bookings: 876, provider: 'CoolCare' },
  { id: '3', name: 'Women\'s Haircut', image: 'https://via.placeholder.com/150', price: 299, originalPrice: 449, duration: '45 min', rating: 4.9, bookings: 2341, provider: 'StyleHub' },
  { id: '4', name: 'Electrician Visit', image: 'https://via.placeholder.com/150', price: 199, originalPrice: 299, duration: '30 min', rating: 4.6, bookings: 654, provider: 'PowerFix' },
];

const offers: Offer[] = [
  { id: '1', title: 'First Booking Discount', discount: '30% OFF', code: 'FIRST30', validTill: 'Dec 31', category: 'All Services', image: 'https://via.placeholder.com/300x150' },
  { id: '2', title: 'Cleaning Special', discount: '₹200 OFF', code: 'CLEAN200', validTill: 'Dec 25', category: 'Cleaning', image: 'https://via.placeholder.com/300x150' },
  { id: '3', title: 'Weekend Offer', discount: '20% OFF', code: 'WEEKEND20', validTill: 'Every Weekend', category: 'Beauty & Spa', image: 'https://via.placeholder.com/300x150' },
];

const categories = [
  { id: '1', name: 'Cleaning', icon: 'home-outline', color: '#4CAF50' },
  { id: '2', name: 'Repair', icon: 'construct-outline', color: '#FF9800' },
  { id: '3', name: 'Beauty', icon: 'flower-outline', color: '#E91E63' },
  { id: '4', name: 'Plumbing', icon: 'water-outline', color: '#2196F3' },
  { id: '5', name: 'Electrical', icon: 'flash-outline', color: '#FFC107' },
  { id: '6', name: 'Moving', icon: 'car-outline', color: '#9C27B0' },
  { id: '7', name: 'Painting', icon: 'color-palette-outline', color: '#00BCD4' },
  { id: '8', name: 'More', icon: 'grid-outline', color: '#607D8B' },
];

export default function DiscoverScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const renderFeaturedProvider = ({ item }: { item: FeaturedProvider }) => (
    <TouchableOpacity
      style={[styles.providerCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/provider/${item.id}` as any)}
    >
      <Image source={{ uri: item.avatar }} style={styles.providerAvatar} />
      <ThemedText style={styles.providerName}>{item.name}</ThemedText>
      <ThemedText style={[styles.providerCategory, { color: colors.textSecondary }]}>
        {item.category}
      </ThemedText>
      <View style={styles.providerStats}>
        <Ionicons name="star" size={12} color="#FFB800" />
        <ThemedText style={styles.providerRating}>{item.rating}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/service/${item.id}` as any)}
    >
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.discountBadge}>
        <ThemedText style={styles.discountText}>
          {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
        </ThemedText>
      </View>
      <View style={styles.serviceInfo}>
        <ThemedText style={styles.serviceName} numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText style={[styles.serviceProvider, { color: colors.textSecondary }]}>
          by {item.provider}
        </ThemedText>
        <View style={styles.serviceFooter}>
          <View style={styles.priceContainer}>
            <ThemedText style={[styles.servicePrice, { color: colors.primary }]}>
              ₹{item.price}
            </ThemedText>
            <ThemedText style={[styles.originalPrice, { color: colors.textSecondary }]}>
              ₹{item.originalPrice}
            </ThemedText>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <ThemedText style={styles.serviceRating}>{item.rating}</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOffer = ({ item }: { item: Offer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => {
        setSelectedOffer(item);
        setShowOfferModal(true);
      }}
    >
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.offerGradient}
      >
        <View style={styles.offerContent}>
          <View style={styles.offerBadge}>
            <ThemedText style={styles.offerDiscount}>{item.discount}</ThemedText>
          </View>
          <ThemedText style={styles.offerTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.offerCode}>Use code: {item.code}</ThemedText>
          <ThemedText style={styles.offerCategory}>{item.category}</ThemedText>
        </View>
        <View style={styles.offerDeco} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>Discover</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Find the best services near you
            </ThemedText>
          </View>
          <TouchableOpacity style={[styles.notifButton, { backgroundColor: colors.card }]}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={[styles.notifBadge, { backgroundColor: colors.error }]}>
              <ThemedText style={styles.notifBadgeText}>3</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity
          style={[styles.searchContainer, { backgroundColor: colors.card }]}
          onPress={() => router.push('/search/index' as any)}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <ThemedText style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
            Search for services, providers...
          </ThemedText>
          <View style={[styles.searchVoice, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="mic" size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryItem, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/category/${category.id}`)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '15' }]}>
                <Ionicons name={category.icon as any} size={24} color={category.color} />
              </View>
              <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Offers Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Special Offers</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>View All</ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={offers}
            renderItem={renderOffer}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersScroll}
          />
        </View>

        {/* Featured Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Top Rated Providers</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>View All</ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProviders}
            renderItem={renderFeaturedProvider}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.providersScroll}
          />
        </View>

        {/* Trending Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Trending Services</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>View All</ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={trendingServices}
            renderItem={renderService}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesScroll}
          />
        </View>

        {/* Popular Near You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Popular Near You</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>View All</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.popularGrid}>
            {trendingServices.slice(0, 4).map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.popularCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/service/${service.id}` as any)}
              >
                <Image source={{ uri: service.image }} style={styles.popularImage} />
                <View style={styles.popularInfo}>
                  <ThemedText style={styles.popularName} numberOfLines={1}>{service.name}</ThemedText>
                  <View style={styles.popularFooter}>
                    <ThemedText style={[styles.popularPrice, { color: colors.primary }]}>
                      ₹{service.price}
                    </ThemedText>
                    <View style={styles.popularRating}>
                      <Ionicons name="star" size={10} color="#FFB800" />
                      <ThemedText style={styles.popularRatingText}>{service.rating}</ThemedText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Offer Modal */}
      <Modal
        visible={showOfferModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOfferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Offer Details</ThemedText>
              <TouchableOpacity onPress={() => setShowOfferModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedOffer && (
              <View style={styles.offerDetails}>
                <LinearGradient
                  colors={[colors.primary, colors.primary + 'DD']}
                  style={styles.offerDetailBanner}
                >
                  <ThemedText style={styles.offerDetailDiscount}>{selectedOffer.discount}</ThemedText>
                  <ThemedText style={styles.offerDetailTitle}>{selectedOffer.title}</ThemedText>
                </LinearGradient>

                <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
                  <ThemedText style={styles.codeLabel}>Promo Code</ThemedText>
                  <View style={styles.codeRow}>
                    <ThemedText style={[styles.codeText, { color: colors.primary }]}>
                      {selectedOffer.code}
                    </ThemedText>
                    <TouchableOpacity style={[styles.copyButton, { backgroundColor: colors.primary }]}>
                      <Ionicons name="copy-outline" size={16} color="#FFF" />
                      <ThemedText style={styles.copyText}>Copy</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.offerMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="pricetag-outline" size={18} color={colors.textSecondary} />
                    <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                      Applicable on: {selectedOffer.category}
                    </ThemedText>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                    <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                      Valid till: {selectedOffer.validTill}
                    </ThemedText>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.browseButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setShowOfferModal(false);
                    router.push('/search/index' as any);
                  }}
                >
                  <ThemedText style={styles.browseButtonText}>Browse Services</ThemedText>
                </TouchableOpacity>
              </View>
            )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  notifButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
  },
  searchVoice: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 10,
  },
  categoryItem: {
    width: (width - 48) / 4,
    alignItems: 'center',
    paddingVertical: 14,
    margin: 4,
    borderRadius: 14,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  offersScroll: {
    paddingHorizontal: 16,
  },
  offerCard: {
    width: width - 64,
    height: 140,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  offerGradient: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  offerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  offerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  offerDiscount: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  offerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  offerCode: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginBottom: 4,
  },
  offerCategory: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  offerDeco: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  providersScroll: {
    paddingHorizontal: 16,
  },
  providerCard: {
    width: 100,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginRight: 12,
    borderRadius: 16,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  providerCategory: {
    fontSize: 11,
    marginBottom: 6,
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerRating: {
    fontSize: 12,
    fontWeight: '500',
  },
  servicesScroll: {
    paddingHorizontal: 16,
  },
  serviceCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: 100,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  serviceInfo: {
    padding: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceProvider: {
    fontSize: 11,
    marginBottom: 8,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  serviceRating: {
    fontSize: 12,
    fontWeight: '500',
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  popularCard: {
    width: (width - 44) / 2,
    margin: 5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  popularImage: {
    width: '100%',
    height: 90,
  },
  popularInfo: {
    padding: 10,
  },
  popularName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  popularFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  popularRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  popularRatingText: {
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
  offerDetails: {},
  offerDetailBanner: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  offerDetailDiscount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  offerDetailTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  codeContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  copyText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  offerMeta: {
    gap: 12,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaText: {
    fontSize: 14,
  },
  browseButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
