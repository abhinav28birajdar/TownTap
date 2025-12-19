import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface FlashDeal {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  image?: string;
  category: string;
  provider: string;
  rating: number;
  reviews: number;
  duration: string;
  endsIn: number; // seconds
  totalSlots: number;
  bookedSlots: number;
  tags: string[];
}

const mockDeals: FlashDeal[] = [
  {
    id: '1',
    name: 'Deep Home Cleaning',
    description: 'Complete home cleaning with sanitization',
    originalPrice: 1999,
    discountPrice: 999,
    discount: 50,
    category: 'Cleaning',
    provider: 'CleanPro Services',
    rating: 4.8,
    reviews: 2456,
    duration: '3 hours',
    endsIn: 3600 * 2, // 2 hours
    totalSlots: 50,
    bookedSlots: 38,
    tags: ['Best Seller', 'Limited'],
  },
  {
    id: '2',
    name: 'AC Service & Gas Refill',
    description: 'Complete AC servicing with gas top-up',
    originalPrice: 1499,
    discountPrice: 799,
    discount: 47,
    category: 'AC Repair',
    provider: 'CoolTech Solutions',
    rating: 4.7,
    reviews: 1823,
    duration: '1.5 hours',
    endsIn: 3600 * 4, // 4 hours
    totalSlots: 30,
    bookedSlots: 22,
    tags: ['Popular'],
  },
  {
    id: '3',
    name: 'Full Body Spa',
    description: '90-min relaxing spa with aromatherapy',
    originalPrice: 2499,
    discountPrice: 1499,
    discount: 40,
    category: 'Wellness',
    provider: 'Zen Spa Studio',
    rating: 4.9,
    reviews: 987,
    duration: '90 mins',
    endsIn: 3600 * 1.5, // 1.5 hours
    totalSlots: 20,
    bookedSlots: 17,
    tags: ['Premium', 'Almost Full'],
  },
  {
    id: '4',
    name: "Women's Haircut & Styling",
    description: 'Expert haircut with blow dry',
    originalPrice: 999,
    discountPrice: 499,
    discount: 50,
    category: 'Beauty',
    provider: 'Style Studio',
    rating: 4.6,
    reviews: 1245,
    duration: '45 mins',
    endsIn: 3600 * 6, // 6 hours
    totalSlots: 40,
    bookedSlots: 28,
    tags: ['Trending'],
  },
  {
    id: '5',
    name: 'Plumbing Repair',
    description: 'Fix leaks, blockages & installations',
    originalPrice: 799,
    discountPrice: 399,
    discount: 50,
    category: 'Plumbing',
    provider: 'QuickFix Services',
    rating: 4.5,
    reviews: 856,
    duration: '1 hour',
    endsIn: 3600 * 8, // 8 hours
    totalSlots: 25,
    bookedSlots: 12,
    tags: ['Value Deal'],
  },
];

export default function FlashDealsScreen() {
  const colors = useColors();
  const [deals, setDeals] = useState<FlashDeal[]>(mockDeals);
  const [selectedDeal, setSelectedDeal] = useState<FlashDeal | null>(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  const categories = [...new Set(mockDeals.map((d) => d.category))];

  useEffect(() => {
    // Initialize timers
    const initial: Record<string, number> = {};
    deals.forEach((deal) => {
      initial[deal.id] = deal.endsIn;
    });
    setTimeLeft(initial);

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const updated: Record<string, number> = {};
        Object.keys(prev).forEach((id) => {
          updated[id] = Math.max(0, prev[id] - 1);
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredDeals = filter ? deals.filter((d) => d.category === filter) : deals;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getProgressColor = (booked: number, total: number) => {
    const percent = (booked / total) * 100;
    if (percent >= 80) return colors.error;
    if (percent >= 50) return '#FF9800';
    return colors.success;
  };

  const renderDeal = ({ item }: { item: FlashDeal }) => {
    const remaining = timeLeft[item.id] || 0;
    const progressPercent = (item.bookedSlots / item.totalSlots) * 100;

    return (
      <TouchableOpacity
        style={[styles.dealCard, { backgroundColor: colors.card }]}
        onPress={() => {
          setSelectedDeal(item);
          setShowDealModal(true);
        }}
      >
        {/* Timer Badge */}
        <View style={[styles.timerBadge, { backgroundColor: colors.error }]}>
          <Ionicons name="time" size={12} color="#fff" />
          <ThemedText style={styles.timerText}>{formatTime(remaining)}</ThemedText>
        </View>

        {/* Tags */}
        {item.tags.length > 0 && (
          <View style={styles.tagRow}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  { backgroundColor: tag === 'Almost Full' ? colors.error + '15' : colors.primary + '15' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.tagText,
                    { color: tag === 'Almost Full' ? colors.error : colors.primary },
                  ]}
                >
                  {tag}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        <View style={styles.dealContent}>
          <View style={[styles.dealIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="flash" size={28} color={colors.primary} />
          </View>

          <View style={styles.dealInfo}>
            <ThemedText style={styles.dealName} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <ThemedText style={[styles.dealDesc, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.description}
            </ThemedText>
            <View style={styles.dealMeta}>
              <View style={styles.providerRow}>
                <ThemedText style={[styles.providerText, { color: colors.textSecondary }]}>
                  {item.provider}
                </ThemedText>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <ThemedText style={[styles.ratingText, { color: colors.textSecondary }]}>
                  {item.rating}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.dealPricing}>
            <ThemedText style={[styles.dealPrice, { color: colors.primary }]}>
              ₹{item.discountPrice}
            </ThemedText>
            <ThemedText style={[styles.originalPrice, { color: colors.textSecondary }]}>
              ₹{item.originalPrice}
            </ThemedText>
            <View style={[styles.discountBadge, { backgroundColor: colors.success }]}>
              <ThemedText style={styles.discountText}>{item.discount}% OFF</ThemedText>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ThemedText style={[styles.slotsText, { color: colors.textSecondary }]}>
              {item.bookedSlots}/{item.totalSlots} booked
            </ThemedText>
            <ThemedText
              style={[
                styles.urgentText,
                { color: getProgressColor(item.bookedSlots, item.totalSlots) },
              ]}
            >
              {item.totalSlots - item.bookedSlots} left!
            </ThemedText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: getProgressColor(item.bookedSlots, item.totalSlots),
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.grabBtn, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push({
              pathname: '/booking/form',
              params: { serviceId: item.id },
            })
          }
        >
          <ThemedText style={styles.grabBtnText}>Grab Deal</ThemedText>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="flash" size={20} color="#FFB800" />
          <ThemedText style={styles.headerTitle}>Flash Deals</ThemedText>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <LinearGradient
        colors={[colors.primary, '#FF6B35']}
        style={styles.banner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.bannerContent}>
          <View>
            <ThemedText style={styles.bannerTitle}>⚡ Limited Time Offers</ThemedText>
            <ThemedText style={styles.bannerSubtitle}>
              Up to 50% off on selected services
            </ThemedText>
          </View>
          <View style={styles.bannerTimer}>
            <ThemedText style={styles.bannerTimerLabel}>Ends in</ThemedText>
            <View style={styles.bannerTimerBox}>
              <ThemedText style={styles.bannerTimerValue}>
                {formatTime(Math.max(...Object.values(timeLeft)))}
              </ThemedText>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !filter && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilter(null)}
        >
          <ThemedText style={[styles.filterChipText, !filter && { color: '#fff' }]}>
            All
          </ThemedText>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterChip,
              { backgroundColor: filter === cat ? colors.primary : colors.card },
            ]}
            onPress={() => setFilter(filter === cat ? null : cat)}
          >
            <ThemedText
              style={[styles.filterChipText, { color: filter === cat ? '#fff' : colors.text }]}
            >
              {cat}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Deals List */}
      <FlatList
        data={filteredDeals}
        keyExtractor={(item) => item.id}
        renderItem={renderDeal}
        contentContainerStyle={styles.dealsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="flash-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Deals Available</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Check back later for amazing offers
            </ThemedText>
          </View>
        }
      />

      {/* Deal Details Modal */}
      <Modal visible={showDealModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDealModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            {selectedDeal && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <LinearGradient
                    colors={[colors.primary, '#FF6B35']}
                    style={styles.modalIconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="flash" size={32} color="#fff" />
                  </LinearGradient>
                  <View style={[styles.modalTimer, { backgroundColor: colors.error }]}>
                    <Ionicons name="time" size={14} color="#fff" />
                    <ThemedText style={styles.modalTimerText}>
                      {formatTime(timeLeft[selectedDeal.id] || 0)}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText style={styles.modalTitle}>{selectedDeal.name}</ThemedText>
                <ThemedText style={[styles.modalDesc, { color: colors.textSecondary }]}>
                  {selectedDeal.description}
                </ThemedText>

                <View style={styles.modalPricing}>
                  <View style={styles.modalPriceRow}>
                    <ThemedText style={[styles.modalPrice, { color: colors.primary }]}>
                      ₹{selectedDeal.discountPrice}
                    </ThemedText>
                    <ThemedText style={[styles.modalOriginalPrice, { color: colors.textSecondary }]}>
                      ₹{selectedDeal.originalPrice}
                    </ThemedText>
                    <View style={[styles.modalDiscountBadge, { backgroundColor: colors.success }]}>
                      <ThemedText style={styles.modalDiscountText}>
                        {selectedDeal.discount}% OFF
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.savingsText, { color: colors.success }]}>
                    You save ₹{selectedDeal.originalPrice - selectedDeal.discountPrice}!
                  </ThemedText>
                </View>

                <View style={[styles.modalInfoSection, { backgroundColor: colors.background }]}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="business" size={18} color={colors.textSecondary} />
                    <ThemedText style={styles.modalInfoText}>{selectedDeal.provider}</ThemedText>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                    <ThemedText style={styles.modalInfoText}>{selectedDeal.duration}</ThemedText>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="star" size={18} color="#FFB800" />
                    <ThemedText style={styles.modalInfoText}>
                      {selectedDeal.rating} ({selectedDeal.reviews.toLocaleString()} reviews)
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.modalProgress}>
                  <View style={styles.modalProgressHeader}>
                    <ThemedText style={styles.modalProgressText}>
                      {selectedDeal.bookedSlots} of {selectedDeal.totalSlots} slots booked
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.modalUrgent,
                        {
                          color: getProgressColor(
                            selectedDeal.bookedSlots,
                            selectedDeal.totalSlots
                          ),
                        },
                      ]}
                    >
                      Only {selectedDeal.totalSlots - selectedDeal.bookedSlots} left!
                    </ThemedText>
                  </View>
                  <View style={[styles.modalProgressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.modalProgressFill,
                        {
                          width: `${(selectedDeal.bookedSlots / selectedDeal.totalSlots) * 100}%`,
                          backgroundColor: getProgressColor(
                            selectedDeal.bookedSlots,
                            selectedDeal.totalSlots
                          ),
                        },
                      ]}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalGrabBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setShowDealModal(false);
                    router.push({
                      pathname: '/booking/form',
                      params: { serviceId: selectedDeal.id },
                    });
                  }}
                >
                  <Ionicons name="flash" size={20} color="#fff" />
                  <ThemedText style={styles.modalGrabBtnText}>Grab This Deal Now</ThemedText>
                </TouchableOpacity>

                <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
                  * Offer valid for limited slots only. T&C apply.
                </ThemedText>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  banner: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  bannerTimer: {
    alignItems: 'center',
  },
  bannerTimerLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginBottom: 4,
  },
  bannerTimerBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerTimerValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dealsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  dealCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  timerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  timerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dealContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dealIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dealInfo: {
    flex: 1,
    marginRight: 12,
  },
  dealName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  dealDesc: {
    fontSize: 12,
    marginBottom: 6,
  },
  dealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  providerRow: {},
  providerText: {
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
  },
  dealPricing: {
    alignItems: 'flex-end',
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  slotsText: {
    fontSize: 11,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  grabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  grabBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    marginTop: 40,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalTimerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    marginBottom: 16,
  },
  modalPricing: {
    marginBottom: 16,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: '800',
  },
  modalOriginalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  modalDiscountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  modalDiscountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalInfoSection: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  modalInfoText: {
    fontSize: 14,
  },
  modalProgress: {
    marginBottom: 20,
  },
  modalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalProgressText: {
    fontSize: 13,
  },
  modalUrgent: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalGrabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalGrabBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
  },
});
