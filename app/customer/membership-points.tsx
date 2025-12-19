import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface MembershipTier {
  id: string;
  name: string;
  icon: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  color: string;
}

interface PointsHistory {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired';
  date: string;
  icon: string;
}

const tiers: MembershipTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    icon: 'medal-outline',
    minPoints: 0,
    maxPoints: 999,
    benefits: ['1 point per ₹100 spent', '5% off on select services'],
    color: '#CD7F32',
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: 'medal',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: ['1.5 points per ₹100 spent', '10% off on all services', 'Priority booking'],
    color: '#C0C0C0',
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: 'ribbon',
    minPoints: 5000,
    maxPoints: 14999,
    benefits: [
      '2 points per ₹100 spent',
      '15% off on all services',
      'Priority booking',
      'Free rescheduling',
    ],
    color: '#FFD700',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: 'trophy',
    minPoints: 15000,
    maxPoints: Infinity,
    benefits: [
      '3 points per ₹100 spent',
      '20% off on all services',
      'Priority booking',
      'Free rescheduling',
      'Exclusive member events',
      'Dedicated support',
    ],
    color: '#E5E4E2',
  },
];

const mockHistory: PointsHistory[] = [
  {
    id: '1',
    title: 'Deep Home Cleaning',
    description: 'Service booking reward',
    points: 150,
    type: 'earned',
    date: 'Dec 28, 2024',
    icon: 'sparkles',
  },
  {
    id: '2',
    title: 'Coupon Redemption',
    description: 'Redeemed for 10% discount',
    points: -500,
    type: 'redeemed',
    date: 'Dec 25, 2024',
    icon: 'pricetag',
  },
  {
    id: '3',
    title: 'AC Repair Service',
    description: 'Service booking reward',
    points: 90,
    type: 'earned',
    date: 'Dec 20, 2024',
    icon: 'snow',
  },
  {
    id: '4',
    title: 'Referral Bonus',
    description: 'Friend joined using your code',
    points: 200,
    type: 'earned',
    date: 'Dec 15, 2024',
    icon: 'gift',
  },
  {
    id: '5',
    title: 'Points Expired',
    description: 'Unused points from Oct booking',
    points: -50,
    type: 'expired',
    date: 'Dec 1, 2024',
    icon: 'time',
  },
  {
    id: '6',
    title: 'Salon Service',
    description: 'Service booking reward',
    points: 80,
    type: 'earned',
    date: 'Nov 28, 2024',
    icon: 'cut',
  },
];

const rewardItems = [
  { id: '1', name: '₹100 Off', points: 500, icon: 'pricetag', type: 'discount' },
  { id: '2', name: '₹250 Off', points: 1000, icon: 'pricetag', type: 'discount' },
  { id: '3', name: '₹500 Off', points: 1800, icon: 'pricetag', type: 'discount' },
  { id: '4', name: 'Free Service', points: 3000, icon: 'gift', type: 'service' },
  { id: '5', name: '1 Month Pro', points: 5000, icon: 'star', type: 'subscription' },
];

export default function MembershipPointsScreen() {
  const colors = useColors();
  const [history] = useState<PointsHistory[]>(mockHistory);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<(typeof rewardItems)[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'rewards'>('history');

  const currentPoints = 2350;
  const currentTier = tiers.find(
    (t) => currentPoints >= t.minPoints && currentPoints <= t.maxPoints
  )!;
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progressToNext = nextTier
    ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) *
      100
    : 100;

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressToNext,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progressToNext]);

  const handleRedeem = (reward: (typeof rewardItems)[0]) => {
    if (currentPoints >= reward.points) {
      setSelectedReward(reward);
      setShowRedeemModal(true);
    }
  };

  const getHistoryColor = (type: string) => {
    switch (type) {
      case 'earned':
        return colors.success;
      case 'redeemed':
        return colors.primary;
      case 'expired':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderHistoryItem = ({ item }: { item: PointsHistory }) => (
    <View style={[styles.historyItem, { backgroundColor: colors.card }]}>
      <View
        style={[styles.historyIcon, { backgroundColor: getHistoryColor(item.type) + '15' }]}
      >
        <Ionicons name={item.icon as any} size={18} color={getHistoryColor(item.type)} />
      </View>
      <View style={styles.historyInfo}>
        <ThemedText style={styles.historyTitle}>{item.title}</ThemedText>
        <ThemedText style={[styles.historyDesc, { color: colors.textSecondary }]}>
          {item.description}
        </ThemedText>
      </View>
      <View style={styles.historyRight}>
        <ThemedText
          style={[
            styles.historyPoints,
            { color: item.points > 0 ? colors.success : colors.error },
          ]}
        >
          {item.points > 0 ? '+' : ''}
          {item.points}
        </ThemedText>
        <ThemedText style={[styles.historyDate, { color: colors.textSecondary }]}>
          {item.date}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Membership Points</ThemedText>
        <TouchableOpacity onPress={() => setShowTierModal(true)}>
          <Ionicons name="information-circle" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Points Card */}
        <LinearGradient
          colors={[currentTier.color, currentTier.color + '99']}
          style={styles.pointsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.tierBadge}>
            <Ionicons name={currentTier.icon as any} size={24} color="#fff" />
            <ThemedText style={styles.tierName}>{currentTier.name} Member</ThemedText>
          </View>

          <View style={styles.pointsCenter}>
            <ThemedText style={styles.pointsValue}>{currentPoints.toLocaleString()}</ThemedText>
            <ThemedText style={styles.pointsLabel}>Available Points</ThemedText>
          </View>

          {nextTier && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <ThemedText style={styles.progressText}>
                  {nextTier.minPoints - currentPoints} points to {nextTier.name}
                </ThemedText>
              </View>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <ThemedText style={styles.progressLabel}>
                  {currentTier.minPoints.toLocaleString()}
                </ThemedText>
                <ThemedText style={styles.progressLabel}>
                  {nextTier.minPoints.toLocaleString()}
                </ThemedText>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.tierInfoBtn} onPress={() => setShowTierModal(true)}>
            <ThemedText style={styles.tierInfoText}>View All Tiers</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => router.push('/customer/refer-earn')}
          >
            <View style={[styles.quickIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="gift" size={20} color={colors.success} />
            </View>
            <ThemedText style={styles.quickLabel}>Refer & Earn</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => setActiveTab('rewards')}
          >
            <View style={[styles.quickIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="pricetag" size={20} color={colors.primary} />
            </View>
            <ThemedText style={styles.quickLabel}>Redeem</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/home')}
          >
            <View style={[styles.quickIcon, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="add-circle" size={20} color={colors.info} />
            </View>
            <ThemedText style={styles.quickLabel}>Earn More</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === 'history' ? colors.primary : colors.textSecondary },
              ]}
            >
              History
            </ThemedText>
            {activeTab === 'history' && (
              <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rewards' && styles.activeTab]}
            onPress={() => setActiveTab('rewards')}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === 'rewards' ? colors.primary : colors.textSecondary },
              ]}
            >
              Rewards
            </ThemedText>
            {activeTab === 'rewards' && (
              <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'history' ? (
          <View style={styles.historySection}>
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={renderHistoryItem}
              scrollEnabled={false}
              contentContainerStyle={styles.historyList}
              ListEmptyComponent={
                <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                  <Ionicons name="time-outline" size={50} color={colors.textSecondary} />
                  <ThemedText style={styles.emptyTitle}>No History</ThemedText>
                  <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                    Your points activity will appear here
                  </ThemedText>
                </View>
              }
            />
          </View>
        ) : (
          <View style={styles.rewardsSection}>
            <ThemedText style={styles.rewardsSubtitle}>
              Redeem your points for exclusive rewards
            </ThemedText>
            <View style={styles.rewardsGrid}>
              {rewardItems.map((reward) => (
                <TouchableOpacity
                  key={reward.id}
                  style={[
                    styles.rewardCard,
                    { backgroundColor: colors.card },
                    currentPoints < reward.points && { opacity: 0.6 },
                  ]}
                  onPress={() => handleRedeem(reward)}
                >
                  <View
                    style={[
                      styles.rewardIconContainer,
                      {
                        backgroundColor:
                          currentPoints >= reward.points
                            ? colors.primary + '15'
                            : colors.textSecondary + '15',
                      },
                    ]}
                  >
                    <Ionicons
                      name={reward.icon as any}
                      size={24}
                      color={currentPoints >= reward.points ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <ThemedText style={styles.rewardName}>{reward.name}</ThemedText>
                  <View style={styles.rewardPoints}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <ThemedText style={styles.rewardPointsText}>
                      {reward.points.toLocaleString()}
                    </ThemedText>
                  </View>
                  {currentPoints >= reward.points ? (
                    <View style={[styles.redeemBtn, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.redeemBtnText}>Redeem</ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={[styles.needMore, { color: colors.textSecondary }]}>
                      Need {reward.points - currentPoints} more
                    </ThemedText>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Benefits Card */}
        <View style={[styles.benefitsCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.benefitsTitle}>Your {currentTier.name} Benefits</ThemedText>
          {currentTier.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
            </View>
          ))}
        </View>

        {/* How to Earn */}
        <View style={[styles.howToEarn, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.howToEarnTitle}>How to Earn Points</ThemedText>
          <View style={styles.earnMethod}>
            <View style={[styles.earnIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="calendar" size={18} color={colors.primary} />
            </View>
            <View style={styles.earnInfo}>
              <ThemedText style={styles.earnLabel}>Book Services</ThemedText>
              <ThemedText style={[styles.earnDesc, { color: colors.textSecondary }]}>
                Earn {currentTier.name === 'Bronze' ? '1' : currentTier.name === 'Silver' ? '1.5' : currentTier.name === 'Gold' ? '2' : '3'} point per ₹100 spent
              </ThemedText>
            </View>
          </View>
          <View style={styles.earnMethod}>
            <View style={[styles.earnIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="person-add" size={18} color={colors.success} />
            </View>
            <View style={styles.earnInfo}>
              <ThemedText style={styles.earnLabel}>Refer Friends</ThemedText>
              <ThemedText style={[styles.earnDesc, { color: colors.textSecondary }]}>
                Earn 200 points per successful referral
              </ThemedText>
            </View>
          </View>
          <View style={styles.earnMethod}>
            <View style={[styles.earnIcon, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="star" size={18} color={colors.info} />
            </View>
            <View style={styles.earnInfo}>
              <ThemedText style={styles.earnLabel}>Write Reviews</ThemedText>
              <ThemedText style={[styles.earnDesc, { color: colors.textSecondary }]}>
                Earn 20 points for each verified review
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Tier Modal */}
      <Modal visible={showTierModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTierModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Membership Tiers</ThemedText>

            <ScrollView showsVerticalScrollIndicator={false}>
              {tiers.map((tier, index) => (
                <View
                  key={tier.id}
                  style={[
                    styles.tierCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: tier.id === currentTier.id ? tier.color : 'transparent',
                      borderWidth: tier.id === currentTier.id ? 2 : 0,
                    },
                  ]}
                >
                  <View style={styles.tierHeader}>
                    <View style={[styles.tierIconContainer, { backgroundColor: tier.color + '20' }]}>
                      <Ionicons name={tier.icon as any} size={24} color={tier.color} />
                    </View>
                    <View style={styles.tierHeaderInfo}>
                      <ThemedText style={styles.tierCardName}>{tier.name}</ThemedText>
                      <ThemedText style={[styles.tierRange, { color: colors.textSecondary }]}>
                        {tier.maxPoints === Infinity
                          ? `${tier.minPoints.toLocaleString()}+ points`
                          : `${tier.minPoints.toLocaleString()} - ${tier.maxPoints.toLocaleString()} points`}
                      </ThemedText>
                    </View>
                    {tier.id === currentTier.id && (
                      <View style={[styles.currentBadge, { backgroundColor: tier.color }]}>
                        <ThemedText style={styles.currentBadgeText}>Current</ThemedText>
                      </View>
                    )}
                  </View>
                  <View style={styles.tierBenefits}>
                    {tier.benefits.map((benefit, idx) => (
                      <View key={idx} style={styles.tierBenefitRow}>
                        <Ionicons name="checkmark" size={14} color={tier.color} />
                        <ThemedText style={[styles.tierBenefitText, { color: colors.textSecondary }]}>
                          {benefit}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Redeem Modal */}
      <Modal visible={showRedeemModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRedeemModal(false)}
        >
          <View style={[styles.redeemModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            {selectedReward && (
              <>
                <View style={[styles.redeemIconLarge, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={selectedReward.icon as any} size={40} color={colors.primary} />
                </View>
                <ThemedText style={styles.redeemModalTitle}>{selectedReward.name}</ThemedText>
                <View style={styles.redeemPointsDisplay}>
                  <Ionicons name="star" size={18} color="#FFD700" />
                  <ThemedText style={styles.redeemPointsValue}>
                    {selectedReward.points.toLocaleString()} points
                  </ThemedText>
                </View>
                <ThemedText style={[styles.redeemModalDesc, { color: colors.textSecondary }]}>
                  Are you sure you want to redeem this reward? This action cannot be undone.
                </ThemedText>
                <View style={styles.redeemModalActions}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: colors.border }]}
                    onPress={() => setShowRedeemModal(false)}
                  >
                    <ThemedText style={styles.cancelBtnText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setShowRedeemModal(false);
                      // Handle redemption
                    }}
                  >
                    <ThemedText style={styles.confirmBtnText}>Confirm</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
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
  pointsCard: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  tierName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pointsCenter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    marginBottom: 8,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    textAlign: 'center',
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
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  tierInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  tierInfoText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '50%',
    borderRadius: 2,
  },
  historySection: {
    paddingHorizontal: 16,
  },
  historyList: {
    gap: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  historyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyDesc: {
    fontSize: 12,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPoints: {
    fontSize: 15,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
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
  rewardsSection: {
    paddingHorizontal: 16,
  },
  rewardsSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    opacity: 0.7,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rewardCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  rewardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  rewardPointsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  redeemBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 16,
  },
  redeemBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  needMore: {
    fontSize: 11,
    textAlign: 'center',
  },
  benefitsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
  },
  howToEarn: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  howToEarnTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  earnMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  earnIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  earnInfo: {
    flex: 1,
  },
  earnLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  earnDesc: {
    fontSize: 12,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  tierCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tierHeaderInfo: {
    flex: 1,
  },
  tierCardName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  tierRange: {
    fontSize: 12,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  tierBenefits: {
    marginLeft: 60,
  },
  tierBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tierBenefitText: {
    fontSize: 13,
  },
  redeemModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  redeemIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  redeemModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  redeemPointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  redeemPointsValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  redeemModalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  redeemModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
