import { ThemedText } from '@/components/ui';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

type Transaction = {
  id: string;
  amount: number;
  type: 'earning' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  description: string;
};

export default function BusinessEarningsScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      // TODO: Implement actual earnings data fetch from Supabase
      // Mock data for demonstration
      setBalance(2450.50);
      setPendingAmount(180.00);
      setTotalEarnings(8920.75);
      
      // Mock transactions
      setTransactions([
        {
          id: '1',
          amount: 125.00,
          type: 'earning',
          status: 'completed',
          created_at: new Date().toISOString(),
          description: 'Service payment from John Doe',
        },
        {
          id: '2',
          amount: 500.00,
          type: 'withdrawal',
          status: 'completed',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          description: 'Withdrawal to bank account',
        },
        {
          id: '3',
          amount: 89.50,
          type: 'earning',
          status: 'pending',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          description: 'Service payment from Jane Smith',
        },
      ]);
    } catch (error) {
      console.error('Error loading earnings:', error);
      Alert.alert('Error', 'Failed to load earnings data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEarningsData();
  };

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw Funds',
      'Enter the amount you want to withdraw',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Withdraw All',
          onPress: () => processWithdrawal(balance),
        },
        {
          text: 'Custom Amount',
          onPress: () => {
            // TODO: Show input dialog for custom amount
            Alert.prompt(
              'Withdraw Amount',
              'Enter amount to withdraw',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Confirm',
                  onPress: (amount: string | undefined) => {
                    if (amount && typeof amount === 'string') {
                      processWithdrawal(amount);
                    }
                  },
                },
              ],
              'plain-text',
              '',
              'numeric'
            );
          },
        },
      ]
    );
  };

  const processWithdrawal = async (amount: string | number) => {
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > balance) {
      Alert.alert('Error', 'Invalid withdrawal amount');
      return;
    }

    try {
      // TODO: Implement actual withdrawal with Supabase
      Alert.alert('Success', `Withdrawal of $${amountNum.toFixed(2)} has been initiated`);
      loadEarningsData();
    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert('Error', 'Failed to process withdrawal');
    }
  };

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="h2" weight="bold">
          Earnings & Withdrawals
        </ThemedText>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => Alert.alert('Info', 'Transaction history coming soon')}
        >
          <Ionicons name="time-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.balanceCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.balanceHeader}>
          <View>
            <ThemedText style={[styles.balanceLabel, { color: '#fff' }]}>
              Available Balance
            </ThemedText>
            <ThemedText type="h1" weight="bold" style={[styles.balanceAmount, { color: '#fff' }]}>
              ${balance.toFixed(2)}
            </ThemedText>
          </View>
          <View style={[styles.walletIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="wallet-outline" size={32} color="#fff" />
          </View>
        </View>

        <View style={styles.balanceStats}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={20} color="#fff" />
            <View style={styles.statInfo}>
              <ThemedText style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                Pending
              </ThemedText>
              <ThemedText weight="bold" style={[styles.statValue, { color: '#fff' }]}>
                ${pendingAmount.toFixed(2)}
              </ThemedText>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Ionicons name="trending-up-outline" size={20} color="#fff" />
            <View style={styles.statInfo}>
              <ThemedText style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                Total Earned
              </ThemedText>
              <ThemedText weight="bold" style={[styles.statValue, { color: '#fff' }]}>
                ${totalEarnings.toFixed(2)}
              </ThemedText>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.withdrawButton, { backgroundColor: '#fff' }]}
          onPress={handleWithdraw}
        >
          <Ionicons name="arrow-down-outline" size={20} color={colors.primary} />
          <ThemedText weight="bold" style={[styles.withdrawButtonText, { color: colors.primary }]}>
            Withdraw Funds
          </ThemedText>
        </TouchableOpacity>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card }]}
          onPress={() => router.push('/business-owner/analytics')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="stats-chart" size={24} color={colors.success} />
          </View>
          <ThemedText weight="bold" style={styles.actionText}>
            Analytics
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card }]}
          onPress={() => router.push('/business-owner/revenue-reports')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="document-text" size={24} color={colors.warning} />
          </View>
          <ThemedText weight="bold" style={styles.actionText}>
            Reports
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('Info', 'Payment methods coming soon')}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="card" size={24} color={colors.primary} />
          </View>
          <ThemedText weight="bold" style={styles.actionText}>
            Payment
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Transactions Header */}
      <View style={styles.transactionsHeader}>
        <ThemedText type="h3" weight="bold">
          Recent Transactions
        </ThemedText>
        <TouchableOpacity>
          <ThemedText style={{ color: colors.primary }} weight="bold">
            See All
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isEarning = item.type === 'earning';
    const statusColor =
      item.status === 'completed'
        ? colors.success
        : item.status === 'pending'
        ? colors.warning
        : colors.error;

    return (
      <View style={[styles.transactionCard, { backgroundColor: colors.card }]}>
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor: isEarning ? colors.success + '20' : colors.error + '20',
            },
          ]}
        >
          <Ionicons
            name={isEarning ? 'arrow-down' : 'arrow-up'}
            size={24}
            color={isEarning ? colors.success : colors.error}
          />
        </View>

        <View style={styles.transactionInfo}>
          <ThemedText weight="bold">{item.description}</ThemedText>
          <View style={styles.transactionMeta}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <ThemedText style={[styles.statusText, { color: statusColor }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </ThemedText>
            </View>
            <ThemedText style={styles.transactionDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>

        <ThemedText
          type="subtitle"
          weight="bold"
          style={{ color: isEarning ? colors.success : colors.error }}
        >
          {isEarning ? '+' : '-'}${item.amount.toFixed(2)}
        </ThemedText>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Loading earnings...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  historyButton: {
    padding: Spacing.xs,
  },
  balanceCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 40,
  },
  walletIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: Spacing.md,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  withdrawButtonText: {
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: 12,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
  },
});
