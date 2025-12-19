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
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolder: string;
  isDefault: boolean;
}

interface UPIAccount {
  id: string;
  upiId: string;
  isDefault: boolean;
}

const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'HDFC Bank',
    accountNumber: '****4567',
    ifscCode: 'HDFC0001234',
    accountHolder: 'HomeCare Pro Services',
    isDefault: true,
  },
  {
    id: '2',
    bankName: 'ICICI Bank',
    accountNumber: '****8901',
    ifscCode: 'ICIC0002345',
    accountHolder: 'HomeCare Pro Services',
    isDefault: false,
  },
];

const mockUPIAccounts: UPIAccount[] = [
  { id: '1', upiId: 'business@hdfcbank', isDefault: true },
  { id: '2', upiId: 'homecarepro@paytm', isDefault: false },
];

export default function PayoutSettingsScreen() {
  const colors = useColors();
  const [bankAccounts, setBankAccounts] = useState(mockBankAccounts);
  const [upiAccounts, setUPIAccounts] = useState(mockUPIAccounts);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showAddUPIModal, setShowAddUPIModal] = useState(false);
  const [payoutSchedule, setPayoutSchedule] = useState('weekly');
  const [minimumPayout, setMinimumPayout] = useState('500');
  const [instantPayout, setInstantPayout] = useState(false);

  // Form states
  const [newBank, setNewBank] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolder: '',
  });
  const [newUPI, setNewUPI] = useState('');

  const scheduleOptions = [
    { id: 'daily', label: 'Daily', desc: 'Receive payouts every day' },
    { id: 'weekly', label: 'Weekly', desc: 'Receive payouts every Monday' },
    { id: 'biweekly', label: 'Bi-weekly', desc: 'Receive payouts every 15 days' },
    { id: 'monthly', label: 'Monthly', desc: 'Receive payouts on 1st of month' },
  ];

  const setDefaultBank = (id: string) => {
    setBankAccounts((prev) =>
      prev.map((acc) => ({ ...acc, isDefault: acc.id === id }))
    );
  };

  const setDefaultUPI = (id: string) => {
    setUPIAccounts((prev) =>
      prev.map((acc) => ({ ...acc, isDefault: acc.id === id }))
    );
  };

  const deleteBank = (id: string) => {
    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to remove this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setBankAccounts((prev) => prev.filter((acc) => acc.id !== id)),
        },
      ]
    );
  };

  const deleteUPI = (id: string) => {
    Alert.alert(
      'Delete UPI ID',
      'Are you sure you want to remove this UPI ID?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setUPIAccounts((prev) => prev.filter((acc) => acc.id !== id)),
        },
      ]
    );
  };

  const handleAddBank = () => {
    if (newBank.bankName && newBank.accountNumber && newBank.ifscCode && newBank.accountHolder) {
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        ...newBank,
        accountNumber: '****' + newBank.accountNumber.slice(-4),
        isDefault: bankAccounts.length === 0,
      };
      setBankAccounts((prev) => [...prev, newAccount]);
      setNewBank({ bankName: '', accountNumber: '', ifscCode: '', accountHolder: '' });
      setShowAddBankModal(false);
    }
  };

  const handleAddUPI = () => {
    if (newUPI) {
      const newAccount: UPIAccount = {
        id: Date.now().toString(),
        upiId: newUPI,
        isDefault: upiAccounts.length === 0,
      };
      setUPIAccounts((prev) => [...prev, newAccount]);
      setNewUPI('');
      setShowAddUPIModal(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Payout Settings</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Earnings Summary */}
        <View style={styles.earningsCard}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'CC']}
            style={styles.earningsGradient}
          >
            <View style={styles.earningsHeader}>
              <View style={styles.earningsIconBg}>
                <Ionicons name="wallet" size={24} color={colors.primary} />
              </View>
              <View style={styles.earningsInfo}>
                <ThemedText style={styles.earningsLabel}>Available Balance</ThemedText>
                <ThemedText style={styles.earningsAmount}>₹24,850</ThemedText>
              </View>
            </View>
            <TouchableOpacity style={styles.withdrawButton}>
              <ThemedText style={styles.withdrawText}>Withdraw Now</ThemedText>
              <Ionicons name="arrow-forward" size={18} color={colors.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* Bank Accounts Section */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="business-outline" size={20} color={colors.primary} />
                <ThemedText style={styles.sectionTitle}>Bank Accounts</ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary + '15' }]}
                onPress={() => setShowAddBankModal(true)}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <ThemedText style={[styles.addButtonText, { color: colors.primary }]}>
                  Add
                </ThemedText>
              </TouchableOpacity>
            </View>

            {bankAccounts.map((account) => (
              <View key={account.id} style={[styles.accountCard, { backgroundColor: colors.background }]}>
                <View style={styles.accountHeader}>
                  <View style={[styles.bankIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="business" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.accountInfo}>
                    <ThemedText style={styles.bankName}>{account.bankName}</ThemedText>
                    <ThemedText style={[styles.accountNumber, { color: colors.textSecondary }]}>
                      A/C: {account.accountNumber}
                    </ThemedText>
                  </View>
                  {account.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.success + '15' }]}>
                      <ThemedText style={[styles.defaultText, { color: colors.success }]}>
                        Default
                      </ThemedText>
                    </View>
                  )}
                </View>
                <View style={styles.accountActions}>
                  {!account.isDefault && (
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.border }]}
                      onPress={() => setDefaultBank(account.id)}
                    >
                      <ThemedText style={[styles.actionText, { color: colors.primary }]}>
                        Set Default
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.error }]}
                    onPress={() => deleteBank(account.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {bankAccounts.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="business-outline" size={32} color={colors.border} />
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No bank accounts added
                </ThemedText>
              </View>
            )}
          </View>

          {/* UPI Section */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
                <ThemedText style={styles.sectionTitle}>UPI IDs</ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary + '15' }]}
                onPress={() => setShowAddUPIModal(true)}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <ThemedText style={[styles.addButtonText, { color: colors.primary }]}>
                  Add
                </ThemedText>
              </TouchableOpacity>
            </View>

            {upiAccounts.map((account) => (
              <View key={account.id} style={[styles.upiCard, { backgroundColor: colors.background }]}>
                <View style={styles.upiHeader}>
                  <View style={[styles.upiIcon, { backgroundColor: '#6739B7' + '15' }]}>
                    <ThemedText style={[styles.upiText, { color: '#6739B7' }]}>UPI</ThemedText>
                  </View>
                  <ThemedText style={styles.upiId}>{account.upiId}</ThemedText>
                  {account.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.success + '15' }]}>
                      <ThemedText style={[styles.defaultText, { color: colors.success }]}>
                        Default
                      </ThemedText>
                    </View>
                  )}
                </View>
                <View style={styles.accountActions}>
                  {!account.isDefault && (
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.border }]}
                      onPress={() => setDefaultUPI(account.id)}
                    >
                      <ThemedText style={[styles.actionText, { color: colors.primary }]}>
                        Set Default
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.error }]}
                    onPress={() => deleteUPI(account.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {upiAccounts.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="phone-portrait-outline" size={32} color={colors.border} />
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No UPI IDs added
                </ThemedText>
              </View>
            )}
          </View>

          {/* Payout Schedule */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <ThemedText style={styles.sectionTitle}>Payout Schedule</ThemedText>
              </View>
            </View>

            {scheduleOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.scheduleOption,
                  {
                    backgroundColor:
                      payoutSchedule === option.id ? colors.primary + '10' : 'transparent',
                    borderColor:
                      payoutSchedule === option.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setPayoutSchedule(option.id)}
              >
                <View style={styles.scheduleContent}>
                  <ThemedText style={styles.scheduleLabel}>{option.label}</ThemedText>
                  <ThemedText style={[styles.scheduleDesc, { color: colors.textSecondary }]}>
                    {option.desc}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: payoutSchedule === option.id ? colors.primary : colors.border },
                  ]}
                >
                  {payoutSchedule === option.id && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Minimum Payout */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="cash-outline" size={20} color={colors.primary} />
                <ThemedText style={styles.sectionTitle}>Minimum Payout Amount</ThemedText>
              </View>
            </View>

            <View style={styles.minimumPayoutRow}>
              <ThemedText style={{ color: colors.textSecondary }}>
                Set minimum amount for automatic payout
              </ThemedText>
              <View style={[styles.amountInput, { backgroundColor: colors.background }]}>
                <ThemedText style={{ color: colors.textSecondary }}>₹</ThemedText>
                <TextInput
                  style={[styles.amountTextInput, { color: colors.text }]}
                  value={minimumPayout}
                  onChangeText={setMinimumPayout}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>
          </View>

          {/* Instant Payout */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: '#FF9800' + '15' }]}>
                  <Ionicons name="flash" size={20} color="#FF9800" />
                </View>
                <View>
                  <ThemedText style={styles.settingTitle}>Instant Payout</ThemedText>
                  <ThemedText style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Get funds within 30 minutes (2% fee)
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={instantPayout}
                onValueChange={setInstantPayout}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={instantPayout ? colors.primary : '#ccc'}
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Add Bank Modal */}
      <Modal visible={showAddBankModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add Bank Account</ThemedText>
              <TouchableOpacity onPress={() => setShowAddBankModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Bank Name *</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  value={newBank.bankName}
                  onChangeText={(text) => setNewBank({ ...newBank, bankName: text })}
                  placeholder="e.g., HDFC Bank"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Account Holder Name *</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  value={newBank.accountHolder}
                  onChangeText={(text) => setNewBank({ ...newBank, accountHolder: text })}
                  placeholder="Name as per bank records"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Account Number *</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  value={newBank.accountNumber}
                  onChangeText={(text) => setNewBank({ ...newBank, accountNumber: text })}
                  placeholder="Enter account number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>IFSC Code *</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  value={newBank.ifscCode}
                  onChangeText={(text) => setNewBank({ ...newBank, ifscCode: text.toUpperCase() })}
                  placeholder="e.g., HDFC0001234"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor:
                    newBank.bankName && newBank.accountNumber && newBank.ifscCode && newBank.accountHolder
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={handleAddBank}
              disabled={!newBank.bankName || !newBank.accountNumber || !newBank.ifscCode || !newBank.accountHolder}
            >
              <ThemedText style={styles.submitText}>Add Bank Account</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add UPI Modal */}
      <Modal visible={showAddUPIModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add UPI ID</ThemedText>
              <TouchableOpacity onPress={() => setShowAddUPIModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>UPI ID *</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                value={newUPI}
                onChangeText={setNewUPI}
                placeholder="e.g., yourname@bankname"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="information-circle" size={18} color={colors.info} />
              <ThemedText style={[styles.infoBoxText, { color: colors.textSecondary }]}>
                Make sure the UPI ID is linked to your business account for faster payouts
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: newUPI ? colors.primary : colors.border },
              ]}
              onPress={handleAddUPI}
              disabled={!newUPI}
            >
              <ThemedText style={styles.submitText}>Add UPI ID</ThemedText>
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
  earningsCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  earningsGradient: {
    padding: 20,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  earningsIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsInfo: {
    flex: 1,
  },
  earningsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 2,
  },
  earningsAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  withdrawText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
  },
  section: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  accountCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 13,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
  },
  accountActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  upiCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  upiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  upiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upiText: {
    fontSize: 12,
    fontWeight: '700',
  },
  upiId: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  scheduleDesc: {
    fontSize: 13,
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
  minimumPayoutRow: {
    gap: 12,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 4,
    marginTop: 8,
    width: 120,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
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
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 16,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
