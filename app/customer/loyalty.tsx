import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Tier {
  id: string;
  name: string;
  icon: string;
  color: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  image?: string;
  category: string;
  expiresIn?: string;
}

interface Activity {
  id: string;
  type: 'earned' | 'redeemed' | 'expired';
  title: string;
  points: number;
  date: string;
}

const tiers: Tier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    icon: 'medal-outline',
    color: '#CD7F32',
    minPoints: 0,
    maxPoints: 999,
    benefits: ['5% off on services', 'Birthday bonus 50 points'],
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: 'medal',
    color: '#C0C0C0',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: ['10% off on services', 'Priority support', 'Birthday bonus 100 points'],
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: 'trophy',
    color: '#FFD700',
    minPoints: 5000,
    maxPoints: 9999,
    benefits: ['15% off on services', 'Free cancellation', 'Priority support', 'Birthday bonus 200 points'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: 'diamond',
    color: '#E5E4E2',
    minPoints: 10000,
    maxPoints: Infinity,
    benefits: ['20% off on services', 'Free cancellation', 'Dedicated manager', 'Exclusive offers', 'Birthday bonus 500 points'],
  },
];

const rewards: Reward[] = [
  {
    id: '1',
    name: '₹100 Discount',
    description: 'Get ₹100 off on your next booking',
    points: 500,
    category: 'discount',
    expiresIn: '30 days',
  },
  {
    id: '2',
    name: 'Free Service Upgrade',
    description: 'Get premium service at no extra cost',
    points: 1000,
    category: 'upgrade',
    expiresIn: '60 days',
  },
  {
    id: '3',
    name: '₹250 Cashback',
    description: 'Instant cashback to your wallet',
    points: 1200,
    category: 'cashback',
  },
  {
    id: '4',
    name: 'Priority Booking',
    description: 'Skip the queue for 5 bookings',
    points: 800,
    category: 'priority',
    expiresIn: '90 days',
  },
  {
    id: '5',
    name: '₹500 Gift Card',
    description: 'Redeemable across all services',
    points: 2500,
    category: 'gift',
  },
];

const recentActivity: Activity[] = [
  { id: '1', type: 'earned', title: 'Completed Booking #1234', points: 50, date: 'Today' },
  { id: '2', type: 'redeemed', title: '₹100 Discount', points: -500, date: 'Yesterday' },
  { id: '3', type: 'earned', title: 'Review Bonus', points: 20, date: '2 days ago' },
  { id: '4', type: 'earned', title: 'Referral Bonus', points: 100, date: '5 days ago' },
  { id: '5', type: 'expired', title: 'Free Upgrade', points: -1000, date: '1 week ago' },
];

export default function LoyaltyRewardsScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'rewards' | 'activity' | 'tiers'>('rewards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // User's current points and tier
  const currentPoints = 2350;
  const currentTier = tiers.find(t => currentPoints >= t.minPoints && currentPoints <= t.maxPoints) || tiers[0];
  const nextTier = tiers.find(t => t.minPoints > currentPoints);
  const pointsToNextTier = nextTier ? nextTier.minPoints - currentPoints : 0;
  const tierProgress = nextTier 
    ? (currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints) 
    : 1;

  const categories = ['all', 'discount', 'upgrade', 'cashback', 'priority', 'gift'];
  
  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'earned': return 'add-circle';
      case 'redeemed': return 'gift';
      case 'expired': return 'time';
      default: return 'ellipse';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'earned': return colors.success;
      case 'redeemed': return colors.primary;
      case 'expired': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Loyalty Rewards</ThemedText>
        <TouchableOpacity onPress={() => router.push('/customer/help-support')}>
          <Ionicons name="gift-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Points Card */}
        <LinearGradient
          colors={[currentTier.color, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pointsCard}
        >
          <View style={styles.tierBadge}>
            <Ionicons name={currentTier.icon as any} size={24} color="#FFF" />
            <ThemedText style={styles.tierName}>{currentTier.name} Member</ThemedText>
          </View>
          
          <View style={styles.pointsDisplay}>
            <ThemedText style={styles.pointsValue}>{currentPoints.toLocaleString()}</ThemedText>
            <ThemedText style={styles.pointsLabel}>Available Points</ThemedText>
          </View>
          
          {nextTier && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <ThemedText style={styles.progressLabel}>
                  {pointsToNextTier} points to {nextTier.name}
                </ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${tierProgress * 100}%` }]} />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => setActiveTab('rewards')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="gift" size={22} color={colors.primary} />
            </View>
            <ThemedText style={styles.quickActionText}>Redeem</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => setActiveTab('activity')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="time" size={22} color={colors.success} />
            </View>
            <ThemedText style={styles.quickActionText}>History</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => setActiveTab('tiers')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="trophy" size={22} color={colors.warning} />
            </View>
            <ThemedText style={styles.quickActionText}>Tiers</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => router.push('/customer/referral')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="people" size={22} color={colors.info} />
            </View>
            <ThemedText style={styles.quickActionText}>Refer</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Selection */}
        <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rewards' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('rewards')}
          >
            <ThemedText style={[styles.tabText, { color: activeTab === 'rewards' ? '#FFF' : colors.textSecondary }]}>
              Rewards
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'activity' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('activity')}
          >
            <ThemedText style={[styles.tabText, { color: activeTab === 'activity' ? '#FFF' : colors.textSecondary }]}>
              Activity
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tiers' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('tiers')}
          >
            <ThemedText style={[styles.tabText, { color: activeTab === 'tiers' ? '#FFF' : colors.textSecondary }]}>
              Tiers
            </ThemedText>
          </TouchableOpacity>
        </View>

        {activeTab === 'rewards' && (
          <>
            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategory === cat ? colors.primary : colors.card,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <ThemedText
                    style={[
                      styles.categoryChipText,
                      { color: selectedCategory === cat ? '#FFF' : colors.textSecondary },
                    ]}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Rewards List */}
            <View style={styles.rewardsSection}>
              {filteredRewards.map((reward) => (
                <View
                  key={reward.id}
                  style={[styles.rewardCard, { backgroundColor: colors.card }]}
                >
                  <View style={[styles.rewardIcon, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name="gift" size={28} color={colors.primary} />
                  </View>
                  
                  <View style={styles.rewardInfo}>
                    <ThemedText style={styles.rewardName}>{reward.name}</ThemedText>
                    <ThemedText style={[styles.rewardDescription, { color: colors.textSecondary }]}>
                      {reward.description}
                    </ThemedText>
                    {reward.expiresIn && (
                      <ThemedText style={[styles.rewardExpiry, { color: colors.warning }]}>
                        Valid for {reward.expiresIn}
                      </ThemedText>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.redeemButton,
                      {
                        backgroundColor: currentPoints >= reward.points 
                          ? colors.primary 
                          : colors.border,
                      },
                    ]}
                    disabled={currentPoints < reward.points}
                  >
                    <ThemedText style={[
                      styles.redeemButtonText,
                      { color: currentPoints >= reward.points ? '#FFF' : colors.textSecondary }
                    ]}>
                      {reward.points.toLocaleString()}
                    </ThemedText>
                    <Ionicons 
                      name="star" 
                      size={12} 
                      color={currentPoints >= reward.points ? '#FFF' : colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'activity' && (
          <View style={styles.activitySection}>
            {recentActivity.map((activity) => (
              <View
                key={activity.id}
                style={[styles.activityCard, { backgroundColor: colors.card }]}
              >
                <View style={[
                  styles.activityIcon,
                  { backgroundColor: getActivityColor(activity.type) + '15' }
                ]}>
                  <Ionicons
                    name={getActivityIcon(activity.type) as any}
                    size={20}
                    color={getActivityColor(activity.type)}
                  />
                </View>
                
                <View style={styles.activityInfo}>
                  <ThemedText style={styles.activityTitle}>{activity.title}</ThemedText>
                  <ThemedText style={[styles.activityDate, { color: colors.textSecondary }]}>
                    {activity.date}
                  </ThemedText>
                </View>
                
                <ThemedText style={[
                  styles.activityPoints,
                  { color: activity.points > 0 ? colors.success : colors.error }
                ]}>
                  {activity.points > 0 ? '+' : ''}{activity.points}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'tiers' && (
          <View style={styles.tiersSection}>
            {tiers.map((tier, index) => {
              const isCurrentTier = tier.id === currentTier.id;
              const isUnlocked = currentPoints >= tier.minPoints;
              
              return (
                <View
                  key={tier.id}
                  style={[
                    styles.tierCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isCurrentTier ? tier.color : colors.border,
                      borderWidth: isCurrentTier ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.tierHeader}>
                    <View style={[styles.tierIconContainer, { backgroundColor: tier.color + '20' }]}>
                      <Ionicons name={tier.icon as any} size={28} color={tier.color} />
                    </View>
                    <View style={styles.tierHeaderInfo}>
                      <ThemedText style={styles.tierCardName}>{tier.name}</ThemedText>
                      <ThemedText style={[styles.tierPoints, { color: colors.textSecondary }]}>
                        {tier.maxPoints === Infinity 
                          ? `${tier.minPoints.toLocaleString()}+ points`
                          : `${tier.minPoints.toLocaleString()} - ${tier.maxPoints.toLocaleString()} points`}
                      </ThemedText>
                    </View>
                    {isCurrentTier && (
                      <View style={[styles.currentBadge, { backgroundColor: tier.color }]}>
                        <ThemedText style={styles.currentBadgeText}>Current</ThemedText>
                      </View>
                    )}
                    {!isUnlocked && (
                      <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                    )}
                  </View>
                  
                  <View style={styles.benefitsList}>
                    {tier.benefits.map((benefit, i) => (
                      <View key={i} style={styles.benefitItem}>
                        <Ionicons 
                          name="checkmark-circle" 
                          size={16} 
                          color={isUnlocked ? colors.success : colors.textSecondary} 
                        />
                        <ThemedText style={[
                          styles.benefitText,
                          { color: isUnlocked ? colors.text : colors.textSecondary }
                        ]}>
                          {benefit}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* How to Earn */}
        <View style={[styles.earnSection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.earnTitle}>How to Earn Points</ThemedText>
          
          <View style={styles.earnGrid}>
            <View style={styles.earnItem}>
              <View style={[styles.earnIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="cart" size={20} color={colors.primary} />
              </View>
              <ThemedText style={styles.earnItemTitle}>Book Services</ThemedText>
              <ThemedText style={[styles.earnItemPoints, { color: colors.success }]}>
                ₹100 = 10 pts
              </ThemedText>
            </View>
            
            <View style={styles.earnItem}>
              <View style={[styles.earnIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="star" size={20} color={colors.warning} />
              </View>
              <ThemedText style={styles.earnItemTitle}>Write Reviews</ThemedText>
              <ThemedText style={[styles.earnItemPoints, { color: colors.success }]}>
                20 pts each
              </ThemedText>
            </View>
            
            <View style={styles.earnItem}>
              <View style={[styles.earnIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="people" size={20} color={colors.success} />
              </View>
              <ThemedText style={styles.earnItemTitle}>Refer Friends</ThemedText>
              <ThemedText style={[styles.earnItemPoints, { color: colors.success }]}>
                100 pts each
              </ThemedText>
            </View>
            
            <View style={styles.earnItem}>
              <View style={[styles.earnIcon, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="calendar" size={20} color={colors.info} />
              </View>
              <ThemedText style={styles.earnItemTitle}>Daily Check-in</ThemedText>
              <ThemedText style={[styles.earnItemPoints, { color: colors.success }]}>
                5 pts daily
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
    padding: 24,
    borderRadius: 20,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tierName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pointsDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsValue: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: '700',
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  progressSection: {},
  progressHeader: {
    marginBottom: 8,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
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
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '500',
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
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rewardsSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  rewardIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rewardName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  rewardExpiry: {
    fontSize: 11,
    marginTop: 4,
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  redeemButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activitySection: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
  },
  activityPoints: {
    fontSize: 16,
    fontWeight: '700',
  },
  tiersSection: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  tierCard: {
    padding: 16,
    borderRadius: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tierCardName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  tierPoints: {
    fontSize: 12,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 13,
  },
  earnSection: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  earnTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  earnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  earnItem: {
    width: '47%',
    alignItems: 'center',
    padding: 12,
  },
  earnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  earnItemTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  earnItemPoints: {
    fontSize: 11,
    fontWeight: '600',
  },
});
