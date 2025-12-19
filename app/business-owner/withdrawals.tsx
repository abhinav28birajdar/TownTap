import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  isDefault: boolean;
}

interface Withdrawal {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount: string;
  transactionId: string;
  completedDate?: string;
}

const bankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'HDFC Bank',
    accountNumber: '****4523',
    ifscCode: 'HDFC0001234',
    accountHolderName: 'John Doe',
    isDefault: true,
  },
  {
    id: '2',
    bankName: 'ICICI Bank',
    accountNumber: '****7891',
    ifscCode: 'ICIC0005678',
    accountHolderName: 'John Doe',
    isDefault: false,
  },
];

const withdrawals: Withdrawal[] = [
  {
    id: '1',
    amount: 15000,
    date: 'Dec 23, 2024',
    status: 'processing',
    bankAccount: 'HDFC Bank ****4523',
    transactionId: 'WD-20241223-001',
  },
  {
    id: '2',
    amount: 20000,
    date: 'Dec 18, 2024',
    status: 'completed',
    bankAccount: 'HDFC Bank ****4523',
    transactionId: 'WD-20241218-002',
    completedDate: 'Dec 20, 2024',
  },
  {
    id: '3',
    amount: 10000,
    date: 'Dec 10, 2024',
    status: 'completed',
    bankAccount: 'ICICI Bank ****7891',
    transactionId: 'WD-20241210-003',
    completedDate: 'Dec 12, 2024',
  },
  {
    id: '4',
    amount: 5000,
    date: 'Dec 5, 2024',
    status: 'failed',
    bankAccount: 'ICICI Bank ****7891',
    transactionId: 'WD-20241205-004',
  },
];

export default function WithdrawalsScreen() {
  const colors = useColors();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(bankAccounts.find(b => b.isDefault) || null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const availableBalance = 24850;

  const filteredWithdrawals = withdrawals.filter(w => {
    if (filterStatus === 'all') return true;
    return w.status === filterStatus;
  });

  const getStatusColor = (status: Withdrawal['status']) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'processing': return colors.info;
      case 'completed': return colors.success;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to withdraw.');
      return;
    }
    if (amount > availableBalance) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than your available balance.');
      return;
    }
    if (!selectedBank) {
      Alert.alert('Select Bank', 'Please select a bank account for withdrawal.');
      return;
    }
    
    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw ₹${amount.toLocaleString()} to ${selectedBank.bankName} ${selectedBank.accountNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            Alert.alert('Success', 'Withdrawal request submitted successfully!');
          }
        },
      ]
    );
  };

  const renderWithdrawal = ({ item }: { item: Withdrawal }) => (
    <View style={[styles.withdrawalCard, { backgroundColor: colors.card }]}>
      <View style={styles.withdrawalHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
        <ThemedText style={styles.withdrawalAmount}>₹{item.amount.toLocaleString()}</ThemedText>
      </View>

      <View style={[styles.withdrawalDivider, { backgroundColor: colors.border }]} />

      <View style={styles.withdrawalDetails}>
        <View style={styles.detailRow}>
          <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Bank Account
          </ThemedText>
          <ThemedText style={styles.detailValue}>{item.bankAccount}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Request Date
          </ThemedText>
          <ThemedText style={styles.detailValue}>{item.date}</ThemedText>
        </View>
        {item.completedDate && (
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Completed On
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: colors.success }]}>
              {item.completedDate}
            </ThemedText>
          </View>
        )}
        <View style={styles.detailRow}>
          <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Transaction ID
          </ThemedText>
          <ThemedText style={[styles.detailValue, { color: colors.primary }]}>
            {item.transactionId}
          </ThemedText>
        </View>
      </View>

      {item.status === 'failed' && (
        <TouchableOpacity style={[styles.retryButton, { borderColor: colors.error }]}>
          <Ionicons name="refresh" size={16} color={colors.error} />
          <ThemedText style={[styles.retryText, { color: colors.error }]}>Retry Withdrawal</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Withdrawals</ThemedText>
        <TouchableOpacity onPress={() => setShowAddBankModal(true)}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <LinearGradient
          colors={[colors.primary, '#2D4A3E']}
          style={styles.balanceCard}
        >
          <ThemedText style={styles.balanceLabel}>Available Balance</ThemedText>
          <ThemedText style={styles.balanceValue}>₹{availableBalance.toLocaleString()}</ThemedText>
          <TouchableOpacity
            style={styles.withdrawMainButton}
            onPress={() => setShowWithdrawModal(true)}
          >
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <ThemedText style={[styles.withdrawMainText, { color: colors.primary }]}>
              Withdraw Funds
            </ThemedText>
          </TouchableOpacity>
        </LinearGradient>

        {/* Bank Accounts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Bank Accounts</ThemedText>
            <TouchableOpacity onPress={() => setShowAddBankModal(true)}>
              <ThemedText style={[styles.addText, { color: colors.primary }]}>+ Add New</ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {bankAccounts.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[
                  styles.bankCard,
                  { 
                    backgroundColor: colors.card,
                    borderColor: bank.isDefault ? colors.primary : 'transparent',
                    borderWidth: bank.isDefault ? 2 : 0,
                  }
                ]}
              >
                <View style={styles.bankCardHeader}>
                  <View style={[styles.bankIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="business" size={20} color={colors.primary} />
                  </View>
                  {bank.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.defaultText}>Default</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={styles.bankName}>{bank.bankName}</ThemedText>
                <ThemedText style={[styles.accountNumber, { color: colors.textSecondary }]}>
                  {bank.accountNumber}
                </ThemedText>
                <ThemedText style={[styles.holderName, { color: colors.textSecondary }]}>
                  {bank.accountHolderName}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'pending', 'processing', 'completed', 'failed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterTab,
                  filterStatus === status && { backgroundColor: colors.primary }
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <ThemedText style={[
                  styles.filterText,
                  { color: filterStatus === status ? '#FFF' : colors.textSecondary }
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Withdrawals List */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Withdrawal History</ThemedText>
          {filteredWithdrawals.length > 0 ? (
            filteredWithdrawals.map((withdrawal) => (
              <View key={withdrawal.id}>
                {renderWithdrawal({ item: withdrawal })}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Withdrawals</ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                You haven't made any withdrawals yet
              </ThemedText>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Withdraw Funds</ThemedText>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountSection}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Enter Amount
              </ThemedText>
              <View style={[styles.amountInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                <TextInput
                  style={[styles.amountField, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  keyboardType="numeric"
                />
              </View>
              <ThemedText style={[styles.availableText, { color: colors.textSecondary }]}>
                Available: ₹{availableBalance.toLocaleString()}
              </ThemedText>
            </View>

            {/* Quick Amounts */}
            <View style={styles.quickAmounts}>
              {[5000, 10000, 15000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.quickAmount, { borderColor: colors.border }]}
                  onPress={() => setWithdrawAmount(amount.toString())}
                >
                  <ThemedText style={styles.quickAmountText}>₹{amount.toLocaleString()}</ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickAmount, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                onPress={() => setWithdrawAmount(availableBalance.toString())}
              >
                <ThemedText style={[styles.quickAmountText, { color: colors.primary }]}>Max</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Bank Selection */}
            <View style={styles.bankSelection}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Select Bank Account
              </ThemedText>
              {bankAccounts.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankOption,
                    { 
                      backgroundColor: colors.background,
                      borderColor: selectedBank?.id === bank.id ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setSelectedBank(bank)}
                >
                  <View style={styles.bankOptionInfo}>
                    <Ionicons name="business" size={20} color={colors.primary} />
                    <View>
                      <ThemedText style={styles.bankOptionName}>{bank.bankName}</ThemedText>
                      <ThemedText style={[styles.bankOptionNumber, { color: colors.textSecondary }]}>
                        {bank.accountNumber}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={[
                    styles.radioButton,
                    { borderColor: selectedBank?.id === bank.id ? colors.primary : colors.border }
                  ]}>
                    {selectedBank?.id === bank.id && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={handleWithdraw}
            >
              <ThemedText style={styles.confirmText}>Confirm Withdrawal</ThemedText>
            </TouchableOpacity>

            <ThemedText style={[styles.noteText, { color: colors.textSecondary }]}>
              Withdrawals are processed within 1-2 business days
            </ThemedText>
          </View>
        </View>
      </Modal>

      {/* Add Bank Modal */}
      <Modal
        visible={showAddBankModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add Bank Account</ThemedText>
              <TouchableOpacity onPress={() => setShowAddBankModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Account Holder Name
              </ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter full name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Account Number
              </ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter account number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Confirm Account Number
              </ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Re-enter account number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                IFSC Code
              </ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Enter IFSC code"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowAddBankModal(false);
                Alert.alert('Success', 'Bank account added successfully!');
              }}
            >
              <ThemedText style={styles.confirmText}>Add Bank Account</ThemedText>
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
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 16,
  },
  withdrawMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  withdrawMainText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
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
    marginBottom: 12,
  },
  addText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bankCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
  },
  bankCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 13,
    marginBottom: 4,
  },
  holderName: {
    fontSize: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  withdrawalCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  withdrawalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  withdrawalDivider: {
    height: 1,
    marginBottom: 12,
  },
  withdrawalDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    marginTop: 12,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 8,
  },
  amountField: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    padding: 0,
  },
  availableText: {
    fontSize: 12,
    marginTop: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickAmount: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bankSelection: {
    marginBottom: 20,
  },
  bankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  bankOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankOptionName: {
    fontSize: 15,
    fontWeight: '500',
  },
  bankOptionNumber: {
    fontSize: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  confirmButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  confirmText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  textInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
});
