import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
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

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  type: 'discount' | 'freebie' | 'upgrade' | 'voucher' | 'experience';
  value?: string;
  image?: string;
  expiryDays: number;
  stock: number;
  featured: boolean;
  partnerName?: string;
}

interface RedemptionHistory {
  id: string;
  rewardName: string;
  points: number;
  date: string;
  status: 'active' | 'used' | 'expired';
  code?: string;
}

const mockRewards: Reward[] = [
  {
    id: '1',
    name: '₹200 Off Any Service',
    description: 'Get flat ₹200 discount on any service above ₹999',
    points: 500,
    category: 'Discount',
    type: 'discount',
    value: '₹200',
    expiryDays: 30,
    stock: 100,
    featured: true,
  },
  {
    id: '2',
    name: 'Free Sanitization',
    description: 'Complimentary home sanitization with any cleaning service',
    points: 750,
    category: 'Freebie',
    type: 'freebie',
    value: 'Worth ₹499',
    expiryDays: 45,
    stock: 50,
    featured: true,
  },
  {
    id: '3',
    name: 'Priority Booking',
    description: 'Skip the queue and get same-day booking for 3 services',
    points: 400,
    category: 'Upgrade',
    type: 'upgrade',
    expiryDays: 30,
    stock: 200,
    featured: false,
  },
  {
    id: '4',
    name: '25% Off Beauty Services',
    description: 'Valid on all beauty & wellness services',
    points: 600,
    category: 'Discount',
    type: 'discount',
    value: '25% Off',
    expiryDays: 21,
    stock: 75,
    featured: true,
  },
  {
    id: '5',
    name: 'Café Coffee Day Voucher',
    description: '₹150 voucher for any outlet',
    points: 350,
    category: 'Partner',
    type: 'voucher',
    value: '₹150',
    expiryDays: 60,
    stock: 150,
    featured: false,
    partnerName: 'CCD',
  },
  {
    id: '6',
    name: 'Premium Service Upgrade',
    description: 'Upgrade any standard service to premium at no extra cost',
    points: 800,
    category: 'Upgrade',
    type: 'upgrade',
    value: 'Worth ₹300',
    expiryDays: 30,
    stock: 40,
    featured: false,
  },
  {
    id: '7',
    name: 'Movie Ticket Voucher',
    description: 'Get one free movie ticket at PVR/INOX',
    points: 900,
    category: 'Partner',
    type: 'voucher',
    value: '1 Ticket',
    expiryDays: 45,
    stock: 60,
    featured: true,
    partnerName: 'PVR',
  },
  {
    id: '8',
    name: 'Spa Experience',
    description: '60-min spa session at partner wellness center',
    points: 1500,
    category: 'Experience',
    type: 'experience',
    value: 'Worth ₹1999',
    expiryDays: 60,
    stock: 20,
    featured: false,
    partnerName: 'Zen Spa',
  },
];

const mockHistory: RedemptionHistory[] = [
  {
    id: '1',
    rewardName: '₹100 Off Coupon',
    points: 300,
    date: '2024-01-15',
    status: 'used',
    code: 'REWA100',
  },
  {
    id: '2',
    rewardName: 'Free Car Wash',
    points: 450,
    date: '2024-01-20',
    status: 'active',
    code: 'FREEWASH',
  },
  {
    id: '3',
    rewardName: '₹50 Amazon Voucher',
    points: 200,
    date: '2023-12-10',
    status: 'expired',
  },
];

export default function RewardsStoreScreen() {
  const colors = useColors();
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [history, setHistory] = useState<RedemptionHistory[]>(mockHistory);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(2350);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const categories = ['All', 'Discount', 'Freebie', 'Upgrade', 'Partner', 'Experience'];

  const filteredRewards = selectedCategory && selectedCategory !== 'All'
    ? rewards.filter((r) => r.category === selectedCategory)
    : rewards;

  const featuredRewards = rewards.filter((r) => r.featured);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRedeem = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRewardModal(false);
    setShowConfirmModal(true);
  };

  const confirmRedeem = () => {
    if (!selectedReward) return;
    if (userPoints >= selectedReward.points) {
      setUserPoints((prev) => prev - selectedReward.points);
      setShowConfirmModal(false);
      
      // Animate
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 300);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return 'pricetag';
      case 'freebie':
        return 'gift';
      case 'upgrade':
        return 'arrow-up-circle';
      case 'voucher':
        return 'card';
      case 'experience':
        return 'sparkles';
      default:
        return 'star';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discount':
        return colors.success;
      case 'freebie':
        return '#FF6B35';
      case 'upgrade':
        return colors.primary;
      case 'voucher':
        return '#9C27B0';
      case 'experience':
        return '#FFB800';
      default:
        return colors.info;
    }
  };

  const renderFeaturedReward = ({ item }: { item: Reward }) => (
    <TouchableOpacity
      style={[styles.featuredCard, { backgroundColor: getTypeColor(item.type) + '15' }]}
      onPress={() => {
        setSelectedReward(item);
        setShowRewardModal(true);
      }}
    >
      <View style={[styles.featuredIcon, { backgroundColor: getTypeColor(item.type) }]}>
        <Ionicons name={getTypeIcon(item.type) as any} size={24} color="#fff" />
      </View>
      <ThemedText style={styles.featuredName} numberOfLines={2}>
        {item.name}
      </ThemedText>
      <View style={styles.featuredPoints}>
        <Ionicons name="diamond" size={14} color={colors.primary} />
        <ThemedText style={[styles.featuredPointsText, { color: colors.primary }]}>
          {item.points}
        </ThemedText>
      </View>
      {item.value && (
        <View style={[styles.valueBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <ThemedText style={styles.valueText}>{item.value}</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderReward = ({ item }: { item: Reward }) => {
    const canAfford = userPoints >= item.points;
    
    return (
      <TouchableOpacity
        style={[styles.rewardCard, { backgroundColor: colors.card }]}
        onPress={() => {
          setSelectedReward(item);
          setShowRewardModal(true);
        }}
      >
        <View style={[styles.rewardIcon, { backgroundColor: getTypeColor(item.type) + '15' }]}>
          <Ionicons name={getTypeIcon(item.type) as any} size={22} color={getTypeColor(item.type)} />
        </View>
        
        <View style={styles.rewardInfo}>
          <ThemedText style={styles.rewardName} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.rewardDesc, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.description}
          </ThemedText>
          <View style={styles.rewardMeta}>
            <View style={styles.rewardPoints}>
              <Ionicons name="diamond" size={12} color={colors.primary} />
              <ThemedText style={[styles.rewardPointsText, { color: colors.primary }]}>
                {item.points} pts
              </ThemedText>
            </View>
            <ThemedText style={[styles.stockText, { color: colors.textSecondary }]}>
              {item.stock} left
            </ThemedText>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.redeemBtn,
            { backgroundColor: canAfford ? colors.primary : colors.border },
          ]}
          disabled={!canAfford}
          onPress={() => handleRedeem(item)}
        >
          <ThemedText style={[styles.redeemBtnText, { color: canAfford ? '#fff' : colors.textSecondary }]}>
            {canAfford ? 'Redeem' : 'Need More'}
          </ThemedText>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = ({ item }: { item: RedemptionHistory }) => {
    const statusColor = item.status === 'active' ? colors.success : item.status === 'used' ? colors.info : colors.textSecondary;
    
    return (
      <View style={[styles.historyCard, { backgroundColor: colors.card }]}>
        <View style={[styles.historyIcon, { backgroundColor: statusColor + '15' }]}>
          <Ionicons
            name={item.status === 'active' ? 'gift' : item.status === 'used' ? 'checkmark-done' : 'time'}
            size={20}
            color={statusColor}
          />
        </View>
        <View style={styles.historyInfo}>
          <ThemedText style={styles.historyName}>{item.rewardName}</ThemedText>
          <ThemedText style={[styles.historyDate, { color: colors.textSecondary }]}>
            {new Date(item.date).toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={styles.historyRight}>
          <ThemedText style={[styles.historyPoints, { color: colors.textSecondary }]}>
            -{item.points} pts
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <ThemedText style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Rewards Store</ThemedText>
        <TouchableOpacity onPress={() => router.push('/customer/membership-points' as any)}>
          <Ionicons name="diamond-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Points Card */}
        <LinearGradient
          colors={[colors.primary, '#2D4A3E']}
          style={styles.pointsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.pointsContent}>
            <View>
              <ThemedText style={styles.pointsLabel}>Available Points</ThemedText>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <View style={styles.pointsRow}>
                  <Ionicons name="diamond" size={28} color="#FFB800" />
                  <ThemedText style={styles.pointsValue}>{userPoints.toLocaleString()}</ThemedText>
                </View>
              </Animated.View>
            </View>
            <TouchableOpacity
              style={styles.earnMoreBtn}
              onPress={() => router.push('/customer/membership-points' as any)}
            >
              <ThemedText style={styles.earnMoreText}>Earn More</ThemedText>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.pointsHint}>
            <Ionicons name="information-circle" size={14} color="rgba(255,255,255,0.7)" />
            <ThemedText style={styles.pointsHintText}>
              Points expire after 12 months of inactivity
            </ThemedText>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
          {(['rewards', 'history'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { backgroundColor: colors.primary + '15' }]}
              onPress={() => setActiveTab(tab)}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.primary : colors.textSecondary },
                ]}
              >
                {tab === 'rewards' ? 'Rewards' : 'History'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'rewards' ? (
          <>
            {/* Featured Rewards */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Featured Rewards</ThemedText>
              <FlatList
                data={featuredRewards}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={renderFeaturedReward}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.featuredList}
              />
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor:
                        (selectedCategory === cat || (!selectedCategory && cat === 'All'))
                          ? colors.primary
                          : colors.card,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat === 'All' ? null : cat)}
                >
                  <ThemedText
                    style={[
                      styles.categoryText,
                      {
                        color:
                          (selectedCategory === cat || (!selectedCategory && cat === 'All'))
                            ? '#fff'
                            : colors.text,
                      },
                    ]}
                  >
                    {cat}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* All Rewards */}
            <View style={styles.rewardsSection}>
              <ThemedText style={styles.sectionTitle}>All Rewards</ThemedText>
              {filteredRewards.map((reward) => (
                <View key={reward.id}>{renderReward({ item: reward })}</View>
              ))}
            </View>
          </>
        ) : (
          /* History Tab */
          <View style={styles.historySection}>
            <ThemedText style={styles.sectionTitle}>Redemption History</ThemedText>
            {history.length > 0 ? (
              history.map((item) => (
                <View key={item.id}>{renderHistoryItem({ item })}</View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                <Ionicons name="gift-outline" size={50} color={colors.textSecondary} />
                <ThemedText style={styles.emptyTitle}>No Redemptions Yet</ThemedText>
                <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  Start redeeming rewards with your points
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* How It Works */}
        <View style={styles.howSection}>
          <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
          <View style={[styles.howCard, { backgroundColor: colors.card }]}>
            {[
              { icon: 'wallet', title: 'Earn Points', desc: 'Get points on every booking' },
              { icon: 'storefront', title: 'Browse Store', desc: 'Find rewards you love' },
              { icon: 'gift', title: 'Redeem', desc: 'Use points to claim rewards' },
              { icon: 'happy', title: 'Enjoy', desc: 'Use your reward!' },
            ].map((step, index) => (
              <View key={index} style={styles.howStep}>
                <View style={[styles.howIconBg, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={step.icon as any} size={20} color={colors.primary} />
                </View>
                <ThemedText style={styles.howTitle}>{step.title}</ThemedText>
                <ThemedText style={[styles.howDesc, { color: colors.textSecondary }]}>
                  {step.desc}
                </ThemedText>
                {index < 3 && (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textSecondary}
                    style={styles.howArrow}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Reward Detail Modal */}
      <Modal visible={showRewardModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRewardModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            {selectedReward && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={[
                    styles.modalIconBg,
                    { backgroundColor: getTypeColor(selectedReward.type) + '15' },
                  ]}
                >
                  <Ionicons
                    name={getTypeIcon(selectedReward.type) as any}
                    size={40}
                    color={getTypeColor(selectedReward.type)}
                  />
                </View>

                <ThemedText style={styles.modalTitle}>{selectedReward.name}</ThemedText>
                <ThemedText style={[styles.modalDesc, { color: colors.textSecondary }]}>
                  {selectedReward.description}
                </ThemedText>

                <View style={styles.modalMeta}>
                  <View style={[styles.metaItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="diamond" size={18} color={colors.primary} />
                    <View>
                      <ThemedText style={[styles.metaLabel, { color: colors.textSecondary }]}>
                        Points Required
                      </ThemedText>
                      <ThemedText style={[styles.metaValue, { color: colors.primary }]}>
                        {selectedReward.points}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={[styles.metaItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="time" size={18} color={colors.info} />
                    <View>
                      <ThemedText style={[styles.metaLabel, { color: colors.textSecondary }]}>
                        Valid For
                      </ThemedText>
                      <ThemedText style={styles.metaValue}>
                        {selectedReward.expiryDays} days
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={[styles.stockSection, { backgroundColor: colors.background }]}>
                  <View style={styles.stockRow}>
                    <ThemedText style={[styles.stockLabel, { color: colors.textSecondary }]}>
                      Available Stock
                    </ThemedText>
                    <ThemedText style={styles.stockValue}>{selectedReward.stock} left</ThemedText>
                  </View>
                  <View style={[styles.stockBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.stockFill,
                        {
                          width: `${Math.min(100, selectedReward.stock)}%`,
                          backgroundColor: selectedReward.stock > 50 ? colors.success : colors.error,
                        },
                      ]}
                    />
                  </View>
                </View>

                {selectedReward.partnerName && (
                  <View style={[styles.partnerSection, { borderColor: colors.border }]}>
                    <Ionicons name="business" size={18} color={colors.textSecondary} />
                    <ThemedText style={[styles.partnerText, { color: colors.textSecondary }]}>
                      Partner: {selectedReward.partnerName}
                    </ThemedText>
                  </View>
                )}

                <View style={styles.modalFooter}>
                  <View>
                    <ThemedText style={[styles.balanceLabel, { color: colors.textSecondary }]}>
                      Your Balance
                    </ThemedText>
                    <ThemedText style={styles.balanceValue}>{userPoints} pts</ThemedText>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.modalRedeemBtn,
                      {
                        backgroundColor:
                          userPoints >= selectedReward.points ? colors.primary : colors.border,
                      },
                    ]}
                    disabled={userPoints < selectedReward.points}
                    onPress={() => handleRedeem(selectedReward)}
                  >
                    <ThemedText
                      style={[
                        styles.modalRedeemText,
                        {
                          color:
                            userPoints >= selectedReward.points ? '#fff' : colors.textSecondary,
                        },
                      ]}
                    >
                      {userPoints >= selectedReward.points
                        ? 'Redeem Now'
                        : `Need ${selectedReward.points - userPoints} more`}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Confirm Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmModal, { backgroundColor: colors.card }]}>
            <Ionicons name="help-circle" size={50} color={colors.primary} />
            <ThemedText style={styles.confirmTitle}>Confirm Redemption</ThemedText>
            <ThemedText style={[styles.confirmDesc, { color: colors.textSecondary }]}>
              Redeem "{selectedReward?.name}" for {selectedReward?.points} points?
            </ThemedText>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.background }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                onPress={confirmRedeem}
              >
                <ThemedText style={styles.confirmBtnPrimary}>Confirm</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={[styles.successModal, { backgroundColor: colors.card }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={60} color={colors.success} />
            </View>
            <ThemedText style={styles.successTitle}>Redemption Successful!</ThemedText>
            <ThemedText style={[styles.successDesc, { color: colors.textSecondary }]}>
              Your reward has been added to your account. Check your history for details.
            </ThemedText>
            <TouchableOpacity
              style={[styles.successBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowSuccessModal(false)}
            >
              <ThemedText style={styles.successBtnText}>Done</ThemedText>
            </TouchableOpacity>
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
  pointsCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  pointsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 6,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointsValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  earnMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  earnMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#415D43',
  },
  pointsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointsHintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featuredCard: {
    width: 140,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featuredName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  featuredPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredPointsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  valueBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  valueText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rewardsSection: {
    paddingHorizontal: 16,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  rewardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
    marginRight: 12,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  rewardDesc: {
    fontSize: 12,
    marginBottom: 6,
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardPointsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockText: {
    fontSize: 11,
  },
  redeemBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  redeemBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historySection: {
    paddingHorizontal: 16,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPoints: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  howSection: {
    paddingTop: 16,
  },
  howCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  howStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  howIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  howTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  howDesc: {
    fontSize: 9,
    textAlign: 'center',
  },
  howArrow: {
    position: 'absolute',
    right: -8,
    top: 12,
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
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  metaLabel: {
    fontSize: 11,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  stockSection: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 13,
  },
  stockValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  stockBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  stockFill: {
    height: '100%',
    borderRadius: 3,
  },
  partnerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  partnerText: {
    fontSize: 13,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 12,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalRedeemBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalRedeemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmModal: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnPrimary: {
    color: '#fff',
    fontWeight: '600',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModal: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  successBtn: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  successBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
