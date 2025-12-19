import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  benefits: string[];
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  icon: string;
  expiresIn?: string;
  isFeatured?: boolean;
}

const tiers: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 999,
    color: '#CD7F32',
    benefits: ['5% cashback on bookings', 'Priority support'],
  },
  {
    id: 'silver',
    name: 'Silver',
    minPoints: 1000,
    maxPoints: 4999,
    color: '#C0C0C0',
    benefits: ['10% cashback on bookings', 'Free cancellation', 'Exclusive deals'],
  },
  {
    id: 'gold',
    name: 'Gold',
    minPoints: 5000,
    maxPoints: 9999,
    color: '#FFD700',
    benefits: ['15% cashback', 'Free priority slots', 'Premium support', 'Birthday rewards'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minPoints: 10000,
    maxPoints: Infinity,
    color: '#E5E4E2',
    benefits: ['20% cashback', 'VIP perks', 'Concierge service', 'Exclusive events'],
  },
];

const mockRewards: Reward[] = [
  {
    id: '1',
    title: '₹100 Wallet Credit',
    description: 'Add ₹100 directly to your wallet',
    pointsCost: 500,
    category: 'Wallet',
    icon: 'wallet',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Free Deep Cleaning',
    description: 'Redeem for a free deep cleaning service',
    pointsCost: 2000,
    category: 'Services',
    icon: 'sparkles',
  },
  {
    id: '3',
    title: '20% Off Next Booking',
    description: 'Get 20% discount on your next service',
    pointsCost: 300,
    category: 'Discounts',
    icon: 'pricetag',
    expiresIn: '7 days',
  },
  {
    id: '4',
    title: 'Priority Booking',
    description: 'Get priority slot for next 3 bookings',
    pointsCost: 750,
    category: 'Perks',
    icon: 'flash',
  },
  {
    id: '5',
    title: 'Free AC Service',
    description: 'Redeem for a free AC servicing',
    pointsCost: 1500,
    category: 'Services',
    icon: 'snow',
    isFeatured: true,
  },
  {
    id: '6',
    title: '₹50 Off',
    description: 'Get flat ₹50 off on any service',
    pointsCost: 200,
    category: 'Discounts',
    icon: 'cash',
  },
];

export default function LoyaltyRewardsScreen() {
  const colors = useColors();
  const [currentPoints] = useState(2850);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const currentTier = tiers.find(
    (t) => currentPoints >= t.minPoints && currentPoints <= t.maxPoints
  ) || tiers[0];

  const nextTier = tiers.find((t) => t.minPoints > currentPoints);
  const pointsToNextTier = nextTier ? nextTier.minPoints - currentPoints : 0;

  const progressPercentage =
    ((currentPoints - currentTier.minPoints) /
      (currentTier.maxPoints - currentTier.minPoints)) *
    100;

  const categories = ['all', 'Discounts', 'Services', 'Wallet', 'Perks'];

  const filteredRewards = mockRewards.filter(
    (r) => activeCategory === 'all' || r.category === activeCategory
  );

  const handleRedeem = () => {
    if (selectedReward && currentPoints >= selectedReward.pointsCost) {
      // Redeem logic
      setShowRedeemModal(false);
      setSelectedReward(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Loyalty & Rewards</ThemedText>
        <TouchableOpacity>
          <Ionicons name="time-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tier Card */}
        <View style={styles.tierCard}>
          <LinearGradient
            colors={[currentTier.color, currentTier.color + 'AA']}
            style={styles.tierGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.tierHeader}>
              <View>
                <ThemedText style={styles.tierLabel}>Your Tier</ThemedText>
                <ThemedText style={styles.tierName}>{currentTier.name}</ThemedText>
              </View>
              <View style={styles.pointsBadge}>
                <Ionicons name="diamond" size={20} color="#fff" />
                <ThemedText style={styles.pointsText}>{currentPoints.toLocaleString()}</ThemedText>
              </View>
            </View>

            {nextTier && (
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <ThemedText style={styles.progressText}>
                    {pointsToNextTier.toLocaleString()} points to {nextTier.name}
                  </ThemedText>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${Math.min(progressPercentage, 100)}%` }]}
                  />
                </View>
              </View>
            )}

            <View style={styles.tierBenefits}>
              <ThemedText style={styles.benefitsTitle}>Your Benefits:</ThemedText>
              {currentTier.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="trending-up" size={20} color={colors.primary} />
            </View>
            <ThemedText style={styles.statValue}>1,250</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Earned this month
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="gift" size={20} color={colors.success} />
            </View>
            <ThemedText style={styles.statValue}>850</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Redeemed
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FF9800' + '15' }]}>
              <Ionicons name="flame" size={20} color="#FF9800" />
            </View>
            <ThemedText style={styles.statValue}>15</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Day Streak
            </ThemedText>
          </View>
        </View>

        {/* Rewards Section */}
        <View style={styles.rewardsSection}>
          <ThemedText style={styles.sectionTitle}>Available Rewards</ThemedText>

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
                    backgroundColor:
                      activeCategory === cat ? colors.primary : colors.card,
                    borderColor:
                      activeCategory === cat ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <ThemedText
                  style={[
                    styles.categoryText,
                    { color: activeCategory === cat ? '#fff' : colors.text },
                  ]}
                >
                  {cat === 'all' ? 'All Rewards' : cat}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Rewards Grid */}
          <View style={styles.rewardsGrid}>
            {filteredRewards.map((reward) => (
              <TouchableOpacity
                key={reward.id}
                style={[styles.rewardCard, { backgroundColor: colors.card }]}
                onPress={() => {
                  setSelectedReward(reward);
                  setShowRedeemModal(true);
                }}
              >
                {reward.isFeatured && (
                  <View style={[styles.featuredTag, { backgroundColor: '#FFC107' }]}>
                    <ThemedText style={styles.featuredText}>Featured</ThemedText>
                  </View>
                )}
                <View
                  style={[styles.rewardIcon, { backgroundColor: colors.primary + '15' }]}
                >
                  <Ionicons name={reward.icon as any} size={28} color={colors.primary} />
                </View>
                <ThemedText style={styles.rewardTitle}>{reward.title}</ThemedText>
                <ThemedText
                  style={[styles.rewardDescription, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {reward.description}
                </ThemedText>
                <View style={styles.rewardFooter}>
                  <View style={styles.pointsCost}>
                    <Ionicons name="diamond" size={14} color={colors.primary} />
                    <ThemedText style={[styles.pointsCostText, { color: colors.primary }]}>
                      {reward.pointsCost}
                    </ThemedText>
                  </View>
                  {reward.expiresIn && (
                    <ThemedText style={[styles.expiryText, { color: colors.error }]}>
                      Expires in {reward.expiresIn}
                    </ThemedText>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ways to Earn */}
        <View style={styles.earnSection}>
          <ThemedText style={styles.sectionTitle}>Ways to Earn Points</ThemedText>
          <View style={[styles.earnCard, { backgroundColor: colors.card }]}>
            <View style={styles.earnItem}>
              <View style={[styles.earnIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="calendar-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.earnInfo}>
                <ThemedText style={styles.earnTitle}>Complete Booking</ThemedText>
                <ThemedText style={[styles.earnDesc, { color: colors.textSecondary }]}>
                  Earn 10 points per ₹100 spent
                </ThemedText>
              </View>
              <View style={[styles.earnBadge, { backgroundColor: colors.primary + '15' }]}>
                <ThemedText style={[styles.earnBadgeText, { color: colors.primary }]}>
                  +10pts/₹100
                </ThemedText>
              </View>
            </View>
            <View style={styles.earnItem}>
              <View style={[styles.earnIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="star-outline" size={22} color={colors.success} />
              </View>
              <View style={styles.earnInfo}>
                <ThemedText style={styles.earnTitle}>Leave a Review</ThemedText>
                <ThemedText style={[styles.earnDesc, { color: colors.textSecondary }]}>
                  Rate your service experience
                </ThemedText>
              </View>
              <View style={[styles.earnBadge, { backgroundColor: colors.success + '15' }]}>
                <ThemedText style={[styles.earnBadgeText, { color: colors.success }]}>
                  +25pts
                </ThemedText>
              </View>
            </View>
            <View style={[styles.earnItem, { borderBottomWidth: 0 }]}>
              <View style={[styles.earnIcon, { backgroundColor: '#FF9800' + '15' }]}>
                <Ionicons name="people-outline" size={22} color="#FF9800" />
              </View>
              <View style={styles.earnInfo}>
                <ThemedText style={styles.earnTitle}>Refer a Friend</ThemedText>
                <ThemedText style={[styles.earnDesc, { color: colors.textSecondary }]}>
                  When they complete first booking
                </ThemedText>
              </View>
              <View style={[styles.earnBadge, { backgroundColor: '#FF9800' + '15' }]}>
                <ThemedText style={[styles.earnBadgeText, { color: '#FF9800' }]}>
                  +200pts
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Redeem Modal */}
      <Modal visible={showRedeemModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            {selectedReward && (
              <>
                <View
                  style={[styles.modalIcon, { backgroundColor: colors.primary + '15' }]}
                >
                  <Ionicons name={selectedReward.icon as any} size={40} color={colors.primary} />
                </View>
                <ThemedText style={styles.modalTitle}>{selectedReward.title}</ThemedText>
                <ThemedText style={[styles.modalDesc, { color: colors.textSecondary }]}>
                  {selectedReward.description}
                </ThemedText>

                <View style={[styles.costBox, { backgroundColor: colors.background }]}>
                  <ThemedText style={[styles.costLabel, { color: colors.textSecondary }]}>
                    Points Required
                  </ThemedText>
                  <View style={styles.costValue}>
                    <Ionicons name="diamond" size={18} color={colors.primary} />
                    <ThemedText style={[styles.costText, { color: colors.primary }]}>
                      {selectedReward.pointsCost}
                    </ThemedText>
                  </View>
                </View>

                <View style={[styles.balanceInfo, { backgroundColor: colors.success + '10' }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <ThemedText style={[styles.balanceText, { color: colors.success }]}>
                    You have {currentPoints.toLocaleString()} points available
                  </ThemedText>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.border }]}
                    onPress={() => setShowRedeemModal(false)}
                  >
                    <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.redeemButton,
                      {
                        backgroundColor:
                          currentPoints >= selectedReward.pointsCost
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                    onPress={handleRedeem}
                    disabled={currentPoints < selectedReward.pointsCost}
                  >
                    <ThemedText
                      style={[
                        styles.redeemText,
                        {
                          color:
                            currentPoints >= selectedReward.pointsCost
                              ? '#fff'
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      Redeem Now
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
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
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tierCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tierGradient: {
    padding: 20,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tierLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 2,
  },
  tierName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  pointsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    marginBottom: 8,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  tierBenefits: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  benefitsTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  benefitText: {
    color: '#fff',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  rewardsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryList: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardCard: {
    width: (width - 44) / 2,
    padding: 14,
    borderRadius: 14,
    position: 'relative',
  },
  featuredTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featuredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  rewardFooter: {
    marginTop: 'auto',
  },
  pointsCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsCostText: {
    fontSize: 14,
    fontWeight: '600',
  },
  expiryText: {
    fontSize: 10,
    marginTop: 4,
  },
  earnSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  earnCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  earnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnInfo: {
    flex: 1,
    marginLeft: 12,
  },
  earnTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  earnDesc: {
    fontSize: 12,
  },
  earnBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  earnBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  costBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 14,
  },
  costValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  costText: {
    fontSize: 20,
    fontWeight: '700',
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  redeemButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  redeemText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
