/**
 * Loyalty Program Page - Phase 11
 * Customer loyalty points and rewards
 */

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LoyaltyData {
  points: number;
  tier: string;
  points_to_next_tier: number;
  total_spent: number;
  total_bookings: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  discount_percentage: number;
  is_redeemed: boolean;
}

export default function LoyaltyProgramPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoyaltyData();
    loadRewards();
    loadTransactions();
  }, []);

  const loadLoyaltyData = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_accounts')
        .select('*')
        .eq('user_id', user?.id || '')
        .single();

      if (error) throw error;
      if (data) setLoyaltyData(data);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .order('points_required', { ascending: true });

      if (error) throw error;
      if (data) setRewards(data);
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user?.id || '')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    try {
      const { error } = await ((supabase as any).rpc('redeem_loyalty_reward', {
        user_id_param: user?.id,
        reward_id_param: rewardId,
      }));

      if (error) throw error;
      
      alert('Reward redeemed successfully!');
      loadLoyaltyData();
      loadRewards();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward');
    }
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
    };
    return colors[tier.toLowerCase()] || colors.primary;
  };

  const renderRewardCard = ({ item }: { item: Reward }) => {
    const canRedeem = loyaltyData && loyaltyData.points >= item.points_required && !item.is_redeemed;

    return (
      <Card style={styles.rewardCard}>
        <View style={styles.rewardHeader}>
          <View style={styles.rewardIcon}>
            <Ionicons name="gift" size={24} color={colors.primary} />
          </View>
          <View style={styles.rewardInfo}>
            <Text style={[styles.rewardTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.rewardDesc, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
        </View>

        <View style={styles.rewardFooter}>
          <View>
            <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>
              Points Required
            </Text>
            <Text style={[styles.pointsValue, { color: colors.primary }]}>
              {item.points_required} pts
            </Text>
          </View>

          {item.is_redeemed ? (
            <Badge text="Redeemed" variant="success" />
          ) : (
            <Button
              title="Redeem"
              onPress={() => handleRedeemReward(item.id)}
              disabled={!canRedeem}
              style={([styles.redeemButton, !canRedeem && styles.redeemButtonDisabled] as any)}
            />
          )}
        </View>
      </Card>
    );
  };

  if (loading || !loyaltyData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  const tierProgress = loyaltyData.points_to_next_tier > 0
    ? (loyaltyData.points / (loyaltyData.points + loyaltyData.points_to_next_tier)) * 100
    : 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Loyalty Program</Text>
        </View>

        {/* Points Card */}
        <Card style={([styles.pointsCard, { backgroundColor: getTierColor(loyaltyData.tier) }] as any)}>
          <View style={styles.pointsHeader}>
            <Text style={styles.tierBadge}>{loyaltyData.tier.toUpperCase()} TIER</Text>
            <Text style={styles.headerPointsValue}>{loyaltyData.points}</Text>
            <Text style={styles.headerPointsLabel}>Available Points</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${tierProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {loyaltyData.points_to_next_tier} points to next tier
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{loyaltyData.total_spent}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{loyaltyData.total_bookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
          </View>
        </Card>

        {/* How it Works */}
        <Card style={styles.infoCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            How It Works
          </Text>
          <View style={styles.infoList}>
            <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
              • Earn 1 point for every ₹10 spent
            </Text>
            <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
              • Redeem points for discounts and rewards
            </Text>
            <Text style={[styles.infoItem, { color: colors.textSecondary }]}>
              • Unlock higher tiers for exclusive benefits
            </Text>
          </View>
        </Card>

        {/* Available Rewards */}
        <View style={styles.rewardsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Rewards
          </Text>
          <FlatList
            data={rewards}
            renderItem={renderRewardCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Recent Transactions */}
        <Card style={styles.transactionsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View>
                <Text style={[styles.transactionDesc, { color: colors.text }]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                  {new Date(transaction.created_at).toLocaleDateString('en-IN')}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionPoints,
                  {
                    color: transaction.points > 0 ? colors.primary : '#F44336',
                  },
                ]}
              >
                {transaction.points > 0 ? '+' : ''}{transaction.points}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // NOTE: Fixed duplicate pointsLabel/pointsValue properties
  
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: spacing.xl * 2,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  pointsCard: {
    margin: spacing.md,
    padding: spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  pointsHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  tierBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.md,
    marginBottom: spacing.md,
  },
  headerPointsValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerPointsLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  infoCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  rewardsSection: {
    padding: spacing.md,
    paddingTop: 0,
  },
  rewardCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rewardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  rewardDesc: {
    fontSize: 14,
    lineHeight: 18,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  pointsLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  redeemButton: {
    minWidth: 100,
  },
  redeemButtonDisabled: {
    opacity: 0.5,
  },
  transactionsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  transactionDesc: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionPoints: {
    fontSize: 18,
    fontWeight: '700',
  },
});
