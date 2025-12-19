import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface Bundle {
  id: string;
  name: string;
  description: string;
  services: {
    id: string;
    name: string;
    originalPrice: number;
    icon: string;
    duration: string;
  }[];
  originalTotal: number;
  bundlePrice: number;
  discount: number;
  category: string;
  rating: number;
  reviews: number;
  popularity: number;
  validity: string;
  highlights: string[];
  image?: string;
}

const mockBundles: Bundle[] = [
  {
    id: '1',
    name: 'Complete Home Care',
    description: 'All-in-one package for home maintenance',
    services: [
      { id: '1', name: 'Deep Cleaning', originalPrice: 1499, icon: 'sparkles', duration: '3 hrs' },
      { id: '2', name: 'AC Servicing', originalPrice: 799, icon: 'snow', duration: '1 hr' },
      { id: '3', name: 'Pest Control', originalPrice: 1199, icon: 'bug', duration: '2 hrs' },
      { id: '4', name: 'Plumbing Check', originalPrice: 499, icon: 'water', duration: '1 hr' },
    ],
    originalTotal: 3996,
    bundlePrice: 2499,
    discount: 37,
    category: 'Home',
    rating: 4.8,
    reviews: 3456,
    popularity: 98,
    validity: '3 months',
    highlights: ['Save ₹1,497', 'Priority Booking', 'Free Rescheduling'],
  },
  {
    id: '2',
    name: 'Beauty Bliss Package',
    description: 'Pamper yourself with premium services',
    services: [
      { id: '1', name: 'Facial Treatment', originalPrice: 1299, icon: 'happy', duration: '1 hr' },
      { id: '2', name: 'Hair Spa', originalPrice: 999, icon: 'cut', duration: '45 mins' },
      { id: '3', name: 'Manicure & Pedicure', originalPrice: 799, icon: 'hand-left', duration: '1 hr' },
      { id: '4', name: 'Head Massage', originalPrice: 499, icon: 'flower', duration: '30 mins' },
    ],
    originalTotal: 3596,
    bundlePrice: 2199,
    discount: 39,
    category: 'Beauty',
    rating: 4.9,
    reviews: 2134,
    popularity: 95,
    validity: '2 months',
    highlights: ['Save ₹1,397', 'Expert Beauticians', 'Premium Products'],
  },
  {
    id: '3',
    name: 'Vehicle Care Bundle',
    description: 'Complete car maintenance package',
    services: [
      { id: '1', name: 'Full Car Wash', originalPrice: 599, icon: 'car-sport', duration: '1 hr' },
      { id: '2', name: 'Interior Cleaning', originalPrice: 999, icon: 'car', duration: '2 hrs' },
      { id: '3', name: 'Tyre & Battery Check', originalPrice: 299, icon: 'build', duration: '30 mins' },
      { id: '4', name: 'AC Cleaning', originalPrice: 799, icon: 'snow', duration: '1 hr' },
    ],
    originalTotal: 2696,
    bundlePrice: 1699,
    discount: 37,
    category: 'Automotive',
    rating: 4.7,
    reviews: 1567,
    popularity: 89,
    validity: '2 months',
    highlights: ['Save ₹997', 'Doorstep Service', 'Quality Products'],
  },
  {
    id: '4',
    name: 'Wellness Retreat',
    description: 'Complete relaxation and rejuvenation',
    services: [
      { id: '1', name: 'Full Body Massage', originalPrice: 1999, icon: 'body', duration: '1.5 hrs' },
      { id: '2', name: 'Aromatherapy', originalPrice: 999, icon: 'leaf', duration: '45 mins' },
      { id: '3', name: 'Steam & Sauna', originalPrice: 599, icon: 'flame', duration: '30 mins' },
      { id: '4', name: 'Yoga Session', originalPrice: 799, icon: 'fitness', duration: '1 hr' },
    ],
    originalTotal: 4396,
    bundlePrice: 2999,
    discount: 32,
    category: 'Wellness',
    rating: 4.9,
    reviews: 987,
    popularity: 92,
    validity: '1 month',
    highlights: ['Save ₹1,397', 'Certified Therapists', 'Premium Ambiance'],
  },
];

export default function ServiceBundlesScreen() {
  const colors = useColors();
  const [bundles, setBundles] = useState<Bundle[]>(mockBundles);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const categories = [...new Set(mockBundles.map((b) => b.category))];

  const filteredBundles = selectedCategory
    ? bundles.filter((b) => b.category === selectedCategory)
    : bundles;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderFeaturedBundle = ({ item, index }: { item: Bundle; index: number }) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.featuredCard, { transform: [{ scale }] }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setSelectedBundle(item);
            setShowBundleModal(true);
          }}
        >
          <LinearGradient
            colors={[colors.primary, '#2D4A3E']}
            style={styles.featuredGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.featuredHeader}>
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <ThemedText style={styles.featuredBadgeText}>Top Rated</ThemedText>
              </View>
              <View style={styles.discountCircle}>
                <ThemedText style={styles.discountValue}>{item.discount}%</ThemedText>
                <ThemedText style={styles.discountLabel}>OFF</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.featuredTitle}>{item.name}</ThemedText>
            <ThemedText style={styles.featuredDesc}>{item.description}</ThemedText>

            <View style={styles.featuredServices}>
              {item.services.slice(0, 4).map((service, idx) => (
                <View key={idx} style={styles.featuredServicePill}>
                  <Ionicons name={service.icon as any} size={12} color="#fff" />
                  <ThemedText style={styles.featuredServiceText} numberOfLines={1}>
                    {service.name}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.featuredFooter}>
              <View>
                <ThemedText style={styles.featuredPriceLabel}>Bundle Price</ThemedText>
                <View style={styles.featuredPriceRow}>
                  <ThemedText style={styles.featuredPrice}>₹{item.bundlePrice}</ThemedText>
                  <ThemedText style={styles.featuredOriginal}>₹{item.originalTotal}</ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.featuredBtn}
                onPress={() =>
                  router.push({
                    pathname: '/booking/form',
                    params: { bundleId: item.id },
                  })
                }
              >
                <ThemedText style={styles.featuredBtnText}>Get Bundle</ThemedText>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderBundle = ({ item }: { item: Bundle }) => (
    <TouchableOpacity
      style={[styles.bundleCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedBundle(item);
        setShowBundleModal(true);
      }}
    >
      <View style={styles.bundleHeader}>
        <View style={[styles.bundleIconBg, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="layers" size={24} color={colors.primary} />
        </View>
        <View style={styles.bundleHeaderRight}>
          <View style={[styles.categoryTag, { backgroundColor: colors.info + '15' }]}>
            <ThemedText style={[styles.categoryTagText, { color: colors.info }]}>
              {item.category}
            </ThemedText>
          </View>
          <View style={[styles.discountTag, { backgroundColor: colors.success }]}>
            <ThemedText style={styles.discountTagText}>{item.discount}% OFF</ThemedText>
          </View>
        </View>
      </View>

      <ThemedText style={styles.bundleName}>{item.name}</ThemedText>
      <ThemedText style={[styles.bundleDesc, { color: colors.textSecondary }]} numberOfLines={1}>
        {item.services.length} services included
      </ThemedText>

      <View style={styles.bundleServices}>
        {item.services.map((service, idx) => (
          <View key={idx} style={[styles.serviceItem, { borderColor: colors.border }]}>
            <View style={[styles.serviceIconSmall, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name={service.icon as any} size={14} color={colors.primary} />
            </View>
            <View style={styles.serviceInfo}>
              <ThemedText style={styles.serviceName} numberOfLines={1}>
                {service.name}
              </ThemedText>
              <ThemedText style={[styles.serviceDuration, { color: colors.textSecondary }]}>
                {service.duration}
              </ThemedText>
            </View>
            <ThemedText style={[styles.servicePrice, { color: colors.textSecondary }]}>
              ₹{service.originalPrice}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.bundleDivider, { borderColor: colors.border }]} />

      <View style={styles.bundleFooter}>
        <View>
          <View style={styles.bundlePriceRow}>
            <ThemedText style={[styles.bundlePrice, { color: colors.primary }]}>
              ₹{item.bundlePrice}
            </ThemedText>
            <ThemedText style={[styles.bundleOriginal, { color: colors.textSecondary }]}>
              ₹{item.originalTotal}
            </ThemedText>
          </View>
          <ThemedText style={[styles.savingsLabel, { color: colors.success }]}>
            Save ₹{item.originalTotal - item.bundlePrice}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push({
              pathname: '/booking/form',
              params: { bundleId: item.id },
            })
          }
        >
          <ThemedText style={styles.bookBtnText}>Book</ThemedText>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
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
        <ThemedText style={styles.headerTitle}>Service Bundles</ThemedText>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Featured Bundles Carousel */}
        <View style={styles.featuredSection}>
          <ThemedText style={styles.sectionTitle}>Featured Bundles</ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Exclusive curated packages at best prices
          </ThemedText>

          <Animated.FlatList
            data={bundles.slice(0, 3)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={renderFeaturedBundle}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.featuredList}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
          />

          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {bundles.slice(0, 3).map((_, index) => {
              const inputRange = [
                (index - 1) * CARD_WIDTH,
                index * CARD_WIDTH,
                (index + 1) * CARD_WIDTH,
              ];
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [1, 1.4, 1],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: colors.primary, opacity, transform: [{ scale }] },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: !selectedCategory ? colors.primary : colors.card },
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <ThemedText
                style={[styles.categoryChipText, { color: !selectedCategory ? '#fff' : colors.text }]}
              >
                All
              </ThemedText>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === cat ? colors.primary : colors.card,
                  },
                ]}
                onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                <ThemedText
                  style={[
                    styles.categoryChipText,
                    { color: selectedCategory === cat ? '#fff' : colors.text },
                  ]}
                >
                  {cat}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* All Bundles */}
        <View style={styles.bundlesSection}>
          <ThemedText style={styles.sectionTitle}>All Bundles</ThemedText>
          {filteredBundles.map((bundle) => (
            <View key={bundle.id}>{renderBundle({ item: bundle })}</View>
          ))}
        </View>

        {/* Why Bundles */}
        <View style={styles.whySection}>
          <ThemedText style={styles.sectionTitle}>Why Choose Bundles?</ThemedText>
          <View style={styles.whyGrid}>
            {[
              { icon: 'pricetag', title: 'Save More', desc: 'Up to 40% off on packages' },
              { icon: 'time', title: 'Flexible', desc: 'Use anytime during validity' },
              { icon: 'shield-checkmark', title: 'Quality', desc: 'Verified professionals' },
              { icon: 'refresh', title: 'Free Reschedule', desc: 'Change dates easily' },
            ].map((item, index) => (
              <View key={index} style={[styles.whyCard, { backgroundColor: colors.card }]}>
                <View style={[styles.whyIconBg, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={item.icon as any} size={22} color={colors.primary} />
                </View>
                <ThemedText style={styles.whyTitle}>{item.title}</ThemedText>
                <ThemedText style={[styles.whyDesc, { color: colors.textSecondary }]}>
                  {item.desc}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Bundle Details Modal */}
      <Modal visible={showBundleModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBundleModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            {selectedBundle && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <LinearGradient
                    colors={[colors.primary, '#2D4A3E']}
                    style={styles.modalBanner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.modalDiscountBadge}>
                      <ThemedText style={styles.modalDiscountText}>
                        {selectedBundle.discount}% OFF
                      </ThemedText>
                    </View>
                    <Ionicons name="layers" size={40} color="rgba(255,255,255,0.2)" />
                  </LinearGradient>
                </View>

                <ThemedText style={styles.modalTitle}>{selectedBundle.name}</ThemedText>
                <ThemedText style={[styles.modalDesc, { color: colors.textSecondary }]}>
                  {selectedBundle.description}
                </ThemedText>

                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Ionicons name="star" size={16} color="#FFB800" />
                    <ThemedText style={styles.modalStatValue}>{selectedBundle.rating}</ThemedText>
                    <ThemedText style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                      ({selectedBundle.reviews})
                    </ThemedText>
                  </View>
                  <View style={[styles.modalStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.modalStat}>
                    <Ionicons name="calendar" size={16} color={colors.primary} />
                    <ThemedText style={styles.modalStatValue}>Valid</ThemedText>
                    <ThemedText style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                      {selectedBundle.validity}
                    </ThemedText>
                  </View>
                  <View style={[styles.modalStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.modalStat}>
                    <Ionicons name="trending-up" size={16} color={colors.success} />
                    <ThemedText style={styles.modalStatValue}>{selectedBundle.popularity}%</ThemedText>
                    <ThemedText style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                      Popular
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.modalHighlights}>
                  {selectedBundle.highlights.map((highlight, idx) => (
                    <View key={idx} style={[styles.highlightChip, { backgroundColor: colors.success + '15' }]}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                      <ThemedText style={[styles.highlightText, { color: colors.success }]}>
                        {highlight}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                <ThemedText style={styles.modalServicesTitle}>Services Included</ThemedText>
                {selectedBundle.services.map((service, idx) => (
                  <View
                    key={idx}
                    style={[styles.modalServiceItem, { borderBottomColor: colors.border }]}
                  >
                    <View style={[styles.modalServiceIcon, { backgroundColor: colors.primary + '10' }]}>
                      <Ionicons name={service.icon as any} size={18} color={colors.primary} />
                    </View>
                    <View style={styles.modalServiceInfo}>
                      <ThemedText style={styles.modalServiceName}>{service.name}</ThemedText>
                      <ThemedText style={[styles.modalServiceDuration, { color: colors.textSecondary }]}>
                        {service.duration}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.modalServicePrice, { color: colors.textSecondary }]}>
                      ₹{service.originalPrice}
                    </ThemedText>
                  </View>
                ))}

                <View style={[styles.modalPricing, { backgroundColor: colors.background }]}>
                  <View style={styles.modalPriceRow}>
                    <ThemedText style={[styles.modalPriceLabel, { color: colors.textSecondary }]}>
                      Total Value
                    </ThemedText>
                    <ThemedText style={[styles.modalOriginalTotal, { color: colors.textSecondary }]}>
                      ₹{selectedBundle.originalTotal}
                    </ThemedText>
                  </View>
                  <View style={styles.modalPriceRow}>
                    <ThemedText style={[styles.modalPriceLabel, { color: colors.textSecondary }]}>
                      Bundle Discount
                    </ThemedText>
                    <ThemedText style={[styles.modalDiscount, { color: colors.success }]}>
                      -₹{selectedBundle.originalTotal - selectedBundle.bundlePrice}
                    </ThemedText>
                  </View>
                  <View style={[styles.modalPriceDivider, { borderColor: colors.border }]} />
                  <View style={styles.modalPriceRow}>
                    <ThemedText style={styles.modalFinalLabel}>You Pay</ThemedText>
                    <ThemedText style={[styles.modalFinalPrice, { color: colors.primary }]}>
                      ₹{selectedBundle.bundlePrice}
                    </ThemedText>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalBookBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setShowBundleModal(false);
                    router.push({
                      pathname: '/booking/form',
                      params: { bundleId: selectedBundle.id },
                    });
                  }}
                >
                  <Ionicons name="cart" size={20} color="#fff" />
                  <ThemedText style={styles.modalBookBtnText}>Get This Bundle</ThemedText>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  featuredSection: {
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  featuredList: {
    paddingHorizontal: 16,
  },
  featuredCard: {
    width: CARD_WIDTH,
    marginRight: 16,
  },
  featuredGradient: {
    borderRadius: 20,
    padding: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  discountCircle: {
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF6B35',
  },
  discountLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FF6B35',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  featuredDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 16,
  },
  featuredServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  featuredServicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featuredServiceText: {
    color: '#fff',
    fontSize: 11,
    maxWidth: 100,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPriceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginBottom: 4,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredPrice: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  featuredOriginal: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  featuredBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  featuredBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#415D43',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categorySection: {
    marginTop: 20,
    marginBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bundlesSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bundleCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
  },
  bundleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bundleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bundleHeaderRight: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  discountTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  bundleName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  bundleDesc: {
    fontSize: 13,
    marginBottom: 14,
  },
  bundleServices: {
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  serviceIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '500',
  },
  serviceDuration: {
    fontSize: 11,
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: '500',
  },
  bundleDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  bundleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bundlePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bundlePrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  bundleOriginal: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  savingsLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  whySection: {
    paddingTop: 24,
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  whyCard: {
    width: (width - 48) / 2,
    margin: 4,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  whyIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  whyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  whyDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalBanner: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDiscountBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  modalDiscountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#415D43',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 14,
    marginBottom: 14,
  },
  modalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalStatValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalStatLabel: {
    fontSize: 12,
  },
  modalStatDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 14,
  },
  modalHighlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalServicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalServiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalServiceInfo: {
    flex: 1,
  },
  modalServiceName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  modalServiceDuration: {
    fontSize: 12,
  },
  modalServicePrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalPricing: {
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalPriceLabel: {
    fontSize: 13,
  },
  modalOriginalTotal: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  modalDiscount: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalPriceDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  modalFinalLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalFinalPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  modalBookBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
