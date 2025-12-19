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
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'refund' | 'cashback' | 'withdraw';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  orderId?: string;
}

const mockTransactions: WalletTransaction[] = [
  {
    id: '1',
    type: 'credit',
    amount: 500,
    description: 'Added via UPI',
    date: new Date(Date.now() - 86400000),
    status: 'completed',
  },
  {
    id: '2',
    type: 'debit',
    amount: 299,
    description: 'AC Repair Service Payment',
    date: new Date(Date.now() - 86400000 * 2),
    status: 'completed',
    orderId: 'BK-2024-0042',
  },
  {
    id: '3',
    type: 'cashback',
    amount: 50,
    description: 'Cashback on first booking',
    date: new Date(Date.now() - 86400000 * 3),
    status: 'completed',
  },
  {
    id: '4',
    type: 'refund',
    amount: 150,
    description: 'Refund for cancelled booking',
    date: new Date(Date.now() - 86400000 * 5),
    status: 'completed',
    orderId: 'BK-2024-0038',
  },
  {
    id: '5',
    type: 'debit',
    amount: 999,
    description: 'Deep Cleaning Service Payment',
    date: new Date(Date.now() - 86400000 * 7),
    status: 'completed',
    orderId: 'BK-2024-0035',
  },
  {
    id: '6',
    type: 'credit',
    amount: 1000,
    description: 'Added via Debit Card',
    date: new Date(Date.now() - 86400000 * 10),
    status: 'completed',
  },
];

const quickAmounts = [100, 250, 500, 1000, 2000, 5000];

export default function WalletScreen() {
  const colors = useColors();
  const [transactions] = useState(mockTransactions);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  const walletBalance = 1402;

  const paymentMethods = [
    { id: 'upi', label: 'UPI', icon: 'phone-portrait-outline' },
    { id: 'card', label: 'Debit/Credit Card', icon: 'card-outline' },
    { id: 'netbanking', label: 'Net Banking', icon: 'business-outline' },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return 'arrow-down-circle';
      case 'debit':
        return 'arrow-up-circle';
      case 'refund':
        return 'refresh-circle';
      case 'cashback':
        return 'gift';
      case 'withdraw':
        return 'wallet';
      default:
        return 'ellipse';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'refund':
      case 'cashback':
        return colors.success;
      case 'debit':
      case 'withdraw':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const handleAddMoney = () => {
    if (addAmount && parseInt(addAmount) > 0) {
      // Add money logic
      setAddAmount('');
      setShowAddMoneyModal(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Wallet</ThemedText>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'CC']}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <View style={styles.balanceIconBg}>
                <Ionicons name="wallet" size={28} color={colors.primary} />
              </View>
              <View>
                <ThemedText style={styles.balanceLabel}>Total Balance</ThemedText>
                <ThemedText style={styles.balanceAmount}>₹{walletBalance.toLocaleString()}</ThemedText>
              </View>
            </View>

            <View style={styles.balanceActions}>
              <TouchableOpacity
                style={styles.balanceAction}
                onPress={() => setShowAddMoneyModal(true)}
              >
                <View style={styles.balanceActionIcon}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                </View>
                <ThemedText style={styles.balanceActionText}>Add Money</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.balanceAction}>
                <View style={styles.balanceActionIcon}>
                  <Ionicons name="send" size={18} color={colors.primary} />
                </View>
                <ThemedText style={styles.balanceActionText}>Transfer</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.balanceAction}>
                <View style={styles.balanceActionIcon}>
                  <Ionicons name="receipt" size={18} color={colors.primary} />
                </View>
                <ThemedText style={styles.balanceActionText}>History</ThemedText>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Offers Card */}
        <View style={[styles.offersCard, { backgroundColor: colors.success + '15' }]}>
          <View style={styles.offersContent}>
            <Ionicons name="gift" size={24} color={colors.success} />
            <View style={styles.offersText}>
              <ThemedText style={[styles.offersTitle, { color: colors.success }]}>
                Get ₹100 Cashback
              </ThemedText>
              <ThemedText style={[styles.offersDesc, { color: colors.textSecondary }]}>
                Add ₹500 or more to your wallet
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.offersButton, { borderColor: colors.success }]}
            onPress={() => {
              setAddAmount('500');
              setShowAddMoneyModal(true);
            }}
          >
            <ThemedText style={[styles.offersButtonText, { color: colors.success }]}>
              Add ₹500
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Transactions</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </ThemedText>
            </TouchableOpacity>
          </View>

          {transactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={[styles.transactionCard, { backgroundColor: colors.card }]}
              onPress={() => {
                if (transaction.orderId) {
                  router.push(`/orders/${transaction.orderId}` as any);
                }
              }}
            >
              <View
                style={[
                  styles.transactionIcon,
                  { backgroundColor: getTransactionColor(transaction.type) + '15' },
                ]}
              >
                <Ionicons
                  name={getTransactionIcon(transaction.type) as any}
                  size={22}
                  color={getTransactionColor(transaction.type)}
                />
              </View>
              <View style={styles.transactionInfo}>
                <ThemedText style={styles.transactionDesc}>
                  {transaction.description}
                </ThemedText>
                <ThemedText style={[styles.transactionDate, { color: colors.textSecondary }]}>
                  {formatDate(transaction.date)}
                </ThemedText>
              </View>
              <View style={styles.transactionAmount}>
                <ThemedText
                  style={[
                    styles.transactionValue,
                    { color: getTransactionColor(transaction.type) },
                  ]}
                >
                  {transaction.type === 'debit' || transaction.type === 'withdraw' ? '-' : '+'}₹
                  {transaction.amount}
                </ThemedText>
                {transaction.orderId && (
                  <ThemedText style={[styles.orderId, { color: colors.textSecondary }]}>
                    {transaction.orderId}
                  </ThemedText>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>Secure Transactions</ThemedText>
              <ThemedText style={[styles.infoDesc, { color: colors.textSecondary }]}>
                All wallet transactions are encrypted and secure
              </ThemedText>
            </View>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <Ionicons name="flash" size={22} color="#FF9800" />
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>Instant Payments</ThemedText>
              <ThemedText style={[styles.infoDesc, { color: colors.textSecondary }]}>
                Pay for services instantly using your wallet balance
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Money Modal */}
      <Modal visible={showAddMoneyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add Money to Wallet</ThemedText>
              <TouchableOpacity onPress={() => setShowAddMoneyModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountSection}>
              <ThemedText style={styles.amountLabel}>Enter Amount</ThemedText>
              <View style={[styles.amountInputWrapper, { backgroundColor: colors.background }]}>
                <ThemedText style={[styles.currencySymbol, { color: colors.textSecondary }]}>
                  ₹
                </ThemedText>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  value={addAmount}
                  onChangeText={setAddAmount}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            {/* Quick Amounts */}
            <View style={styles.quickAmounts}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmount,
                    {
                      backgroundColor:
                        addAmount === amount.toString()
                          ? colors.primary + '15'
                          : colors.background,
                      borderColor:
                        addAmount === amount.toString() ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setAddAmount(amount.toString())}
                >
                  <ThemedText
                    style={[
                      styles.quickAmountText,
                      { color: addAmount === amount.toString() ? colors.primary : colors.text },
                    ]}
                  >
                    ₹{amount}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment Methods */}
            <ThemedText style={styles.paymentMethodLabel}>Payment Method</ThemedText>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  {
                    backgroundColor:
                      selectedPaymentMethod === method.id ? colors.primary + '10' : colors.background,
                    borderColor:
                      selectedPaymentMethod === method.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <Ionicons name={method.icon as any} size={22} color={colors.primary} />
                <ThemedText style={styles.paymentMethodText}>{method.label}</ThemedText>
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: selectedPaymentMethod === method.id ? colors.primary : colors.border },
                  ]}
                >
                  {selectedPaymentMethod === method.id && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Add Button */}
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor:
                    addAmount && parseInt(addAmount) > 0 ? colors.primary : colors.border,
                },
              ]}
              onPress={handleAddMoney}
              disabled={!addAmount || parseInt(addAmount) <= 0}
            >
              <ThemedText
                style={[
                  styles.addButtonText,
                  {
                    color: addAmount && parseInt(addAmount) > 0 ? '#fff' : colors.textSecondary,
                  },
                ]}
              >
                Add ₹{addAmount || '0'} to Wallet
              </ThemedText>
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
  balanceCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  balanceIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 2,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceAction: {
    alignItems: 'center',
  },
  balanceActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  balanceActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  offersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 14,
    borderRadius: 12,
  },
  offersContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  offersText: {
    flex: 1,
  },
  offersTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  offersDesc: {
    fontSize: 12,
  },
  offersButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  offersButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  transactionsSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
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
  transactionDesc: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 11,
    marginTop: 2,
  },
  infoSection: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoDesc: {
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  amountSection: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 4,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  quickAmount: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMethodLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 15,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
