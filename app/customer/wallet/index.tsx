import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'cashback' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  minAmount: number;
  validUntil: string;
  code: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'cashback', amount: 50, description: 'Cashback on AC Repair', date: 'Today, 2:30 PM', status: 'completed' },
  { id: '2', type: 'debit', amount: 599, description: 'Payment for cleaning service', date: 'Yesterday', status: 'completed' },
  { id: '3', type: 'refund', amount: 200, description: 'Refund for cancelled order', date: 'Dec 15, 2024', status: 'completed' },
  { id: '4', type: 'credit', amount: 500, description: 'Added to wallet', date: 'Dec 14, 2024', status: 'completed' },
  { id: '5', type: 'debit', amount: 349, description: 'Payment for plumbing', date: 'Dec 12, 2024', status: 'completed' },
];

const mockOffers: Offer[] = [
  { id: '1', title: '₹100 Cashback', description: 'On orders above ₹500', discount: '₹100', minAmount: 500, validUntil: 'Dec 31, 2024', code: 'WALLET100' },
  { id: '2', title: '10% Cashback', description: 'On first wallet top-up', discount: '10%', minAmount: 0, validUntil: 'Jan 15, 2025', code: 'FIRST10' },
];

const addAmounts = [100, 200, 500, 1000, 2000, 5000];

export default function WalletScreen() {
  const colors = useColors();
  const [balance] = useState(1250);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'offers'>('history');
  const scaleAnim = new Animated.Value(1);

  const handleAddMoney = () => {
    setShowAddMoney(true);
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  };

  const handleQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    setAddAmount(amount.toString());
  };

  const handleProceed = () => {
    if (!addAmount || parseInt(addAmount) < 10) return;
    // Navigate to payment
    setShowAddMoney(false);
    router.push('/customer/payment-method');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit': return 'add-circle';
      case 'debit': return 'remove-circle';
      case 'cashback': return 'gift';
      case 'refund': return 'refresh-circle';
      default: return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit': return colors.success;
      case 'debit': return colors.error;
      case 'cashback': return '#8B5CF6';
      case 'refund': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={[styles.transactionCard, { backgroundColor: colors.card }]}>
      <View style={[
        styles.transactionIcon,
        { backgroundColor: getTransactionColor(item.type) + '15' }
      ]}>
        <Ionicons
          name={getTransactionIcon(item.type) as any}
          size={24}
          color={getTransactionColor(item.type)}
        />
      </View>
      
      <View style={styles.transactionInfo}>
        <ThemedText style={styles.transactionDescription}>{item.description}</ThemedText>
        <ThemedText style={[styles.transactionDate, { color: colors.textSecondary }]}>
          {item.date}
        </ThemedText>
      </View>
      
      <ThemedText style={[
        styles.transactionAmount,
        { color: item.type === 'debit' ? colors.error : colors.success }
      ]}>
        {item.type === 'debit' ? '-' : '+'}₹{item.amount}
      </ThemedText>
    </View>
  );

  const renderOffer = ({ item }: { item: Offer }) => (
    <View style={[styles.offerCard, { backgroundColor: colors.card }]}>
      <View style={styles.offerBadge}>
        <ThemedText style={styles.offerDiscount}>{item.discount}</ThemedText>
      </View>
      
      <View style={styles.offerContent}>
        <ThemedText style={styles.offerTitle}>{item.title}</ThemedText>
        <ThemedText style={[styles.offerDescription, { color: colors.textSecondary }]}>
          {item.description}
        </ThemedText>
        <ThemedText style={[styles.offerValidity, { color: colors.textSecondary }]}>
          Valid until {item.validUntil}
        </ThemedText>
      </View>
      
      <TouchableOpacity style={[styles.copyButton, { backgroundColor: colors.primary + '15' }]}>
        <ThemedText style={[styles.copyButtonText, { color: colors.primary }]}>
          {item.code}
        </ThemedText>
        <Ionicons name="copy-outline" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Wallet</ThemedText>
        <TouchableOpacity onPress={() => router.push('/customer/wallet/transactions' as any)}>
          <Ionicons name="receipt-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark || '#2D4F2F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <ThemedText style={styles.balanceLabel}>Available Balance</ThemedText>
            <Ionicons name="wallet" size={28} color="rgba(255,255,255,0.8)" />
          </View>
          
          <ThemedText style={styles.balanceAmount}>₹{balance.toLocaleString()}</ThemedText>
          
          <TouchableOpacity
            style={styles.addMoneyButton}
            onPress={handleAddMoney}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
            <ThemedText style={[styles.addMoneyText, { color: colors.primary }]}>
              Add Money
            </ThemedText>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => router.push('/customer/payment-methods')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="card-outline" size={22} color={colors.primary} />
            </View>
            <ThemedText style={styles.quickActionLabel}>Payment Methods</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => router.push('/customer/referral-program')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
              <Ionicons name="gift-outline" size={22} color="#8B5CF6" />
            </View>
            <ThemedText style={styles.quickActionLabel}>Refer & Earn</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => router.push('/customer/help-support')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="help-circle-outline" size={22} color={colors.success} />
            </View>
            <ThemedText style={styles.quickActionLabel}>Help</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('history')}
          >
            <ThemedText style={[
              styles.tabText,
              activeTab === 'history' && styles.activeTabText
            ]}>
              Transaction History
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'offers' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('offers')}
          >
            <ThemedText style={[
              styles.tabText,
              activeTab === 'offers' && styles.activeTabText
            ]}>
              Offers & Cashback
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.listContainer}>
          {activeTab === 'history' ? (
            <FlatList
              data={mockTransactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                  <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No transactions yet
                  </ThemedText>
                </View>
              }
            />
          ) : (
            <FlatList
              data={mockOffers}
              renderItem={renderOffer}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="gift-outline" size={48} color={colors.textSecondary} />
                  <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No offers available
                  </ThemedText>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Add Money Modal */}
      <Modal
        visible={showAddMoney}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddMoney(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add Money to Wallet</ThemedText>
              <TouchableOpacity onPress={() => setShowAddMoney(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.amountInput, { borderColor: colors.border }]}>
              <ThemedText style={styles.currencySymbol}>₹</ThemedText>
              <TextInput
                style={[styles.amountTextInput, { color: colors.text }]}
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={addAmount}
                onChangeText={(text) => {
                  setAddAmount(text);
                  setSelectedAmount(null);
                }}
              />
            </View>

            <ThemedText style={[styles.quickAmountLabel, { color: colors.textSecondary }]}>
              Quick Add
            </ThemedText>
            
            <View style={styles.quickAmounts}>
              {addAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmountChip,
                    {
                      backgroundColor: selectedAmount === amount ? colors.primary : colors.background,
                      borderColor: selectedAmount === amount ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleQuickAmount(amount)}
                >
                  <ThemedText style={[
                    styles.quickAmountText,
                    selectedAmount === amount && { color: '#FFF' }
                  ]}>
                    ₹{amount}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.proceedButton,
                { backgroundColor: addAmount && parseInt(addAmount) >= 10 ? colors.primary : colors.border },
              ]}
              onPress={handleProceed}
              disabled={!addAmount || parseInt(addAmount) < 10}
            >
              <ThemedText style={styles.proceedButtonText}>
                Proceed to Pay
              </ThemedText>
            </TouchableOpacity>
            
            <ThemedText style={[styles.minAmountText, { color: colors.textSecondary }]}>
              Minimum amount: ₹10
            </ThemedText>
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
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 20,
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  addMoneyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
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
  quickActionLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  offerBadge: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  offerDiscount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  offerDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  offerValidity: {
    fontSize: 11,
    marginTop: 4,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '600',
  },
  amountTextInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    paddingVertical: 16,
    marginLeft: 8,
  },
  quickAmountLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  quickAmountChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  proceedButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  minAmountText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
