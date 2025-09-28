import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ModernThemeContext';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase } from '../../src/lib/supabase';

interface BankAccount {
  id: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  account_holder_name: string;
  account_type: 'savings' | 'current';
  is_primary: boolean;
  is_verified: boolean;
}

interface PaymentMethod {
  id: string;
  method_name: string;
  method_type: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  is_enabled: boolean;
  display_name: string;
  icon: string;
  processing_fee_percentage: number;
}

interface PayoutHistory {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  initiated_at: string;
  completed_at: string | null;
  reference_id: string;
  bank_account_id: string;
}

export default function PaymentSettingsScreen() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  
  // Modal States
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  
  // Form States
  const [bankForm, setBankForm] = useState({
    account_number: '',
    confirm_account_number: '',
    ifsc_code: '',
    bank_name: '',
    account_holder_name: '',
    account_type: 'savings' as 'savings' | 'current',
  });

  // Auto-settlement settings
  const [autoSettlement, setAutoSettlement] = useState({
    enabled: false,
    threshold_amount: 1000,
    settlement_day: 'daily' as 'daily' | 'weekly' | 'monthly',
  });

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadBankAccounts(),
        loadPaymentMethods(),
        loadPayoutHistory(),
        loadBusinessBalance(),
        loadAutoSettlementSettings(),
      ]);
    } catch (error) {
      console.error('Error loading payment data:', error);
      Alert.alert('Error', 'Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const loadBankAccounts = async () => {
    const { data, error } = await supabase
      .from('business_bank_accounts')
      .select('*')
      .eq('business_id', user?.id)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    setBankAccounts(data || []);
  };

  const loadPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('business_payment_methods')
      .select('*')
      .eq('business_id', user?.id);

    if (error) throw error;
    setPaymentMethods(data || []);
  };

  const loadPayoutHistory = async () => {
    const { data, error } = await supabase
      .from('business_payouts')
      .select('*')
      .eq('business_id', user?.id)
      .order('initiated_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    setPayoutHistory(data || []);
  };

  const loadBusinessBalance = async () => {
    const { data, error } = await supabase
      .from('business_wallet')
      .select('available_balance, pending_amount')
      .eq('business_id', user?.id)
      .single();

    if (error) throw error;
    setCurrentBalance(data?.available_balance || 0);
    setPendingAmount(data?.pending_amount || 0);
  };

  const loadAutoSettlementSettings = async () => {
    const { data, error } = await supabase
      .from('business_settings')
      .select('auto_settlement_settings')
      .eq('business_id', user?.id)
      .single();

    if (error) return; // Settings might not exist yet
    if (data?.auto_settlement_settings) {
      setAutoSettlement(data.auto_settlement_settings);
    }
  };

  const handleAddBankAccount = async () => {
    if (bankForm.account_number !== bankForm.confirm_account_number) {
      Alert.alert('Error', 'Account numbers do not match');
      return;
    }

    if (!bankForm.account_number || !bankForm.ifsc_code || !bankForm.bank_name || !bankForm.account_holder_name) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('business_bank_accounts')
        .insert({
          business_id: user?.id,
          account_number: bankForm.account_number,
          ifsc_code: bankForm.ifsc_code.toUpperCase(),
          bank_name: bankForm.bank_name,
          account_holder_name: bankForm.account_holder_name,
          account_type: bankForm.account_type,
          is_primary: bankAccounts.length === 0, // First account is primary
        });

      if (error) throw error;

      Alert.alert('Success', 'Bank account added successfully. It will be verified within 24 hours.');
      setShowAddBankModal(false);
      setBankForm({
        account_number: '',
        confirm_account_number: '',
        ifsc_code: '',
        bank_name: '',
        account_holder_name: '',
        account_type: 'savings',
      });
      loadBankAccounts();
    } catch (error) {
      console.error('Error adding bank account:', error);
      Alert.alert('Error', 'Failed to add bank account');
    }
  };

  const togglePaymentMethod = async (methodId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('business_payment_methods')
        .update({ is_enabled: enabled })
        .eq('id', methodId);

      if (error) throw error;

      setPaymentMethods(prev =>
        prev.map(method =>
          method.id === methodId ? { ...method, is_enabled: enabled } : method
        )
      );
    } catch (error) {
      console.error('Error updating payment method:', error);
      Alert.alert('Error', 'Failed to update payment method');
    }
  };

  const requestPayout = async () => {
    if (currentBalance < 100) {
      Alert.alert('Minimum Payout', 'Minimum payout amount is ₹100');
      return;
    }

    const primaryAccount = bankAccounts.find(acc => acc.is_primary && acc.is_verified);
    if (!primaryAccount) {
      Alert.alert('Bank Account Required', 'Please add and verify a bank account first');
      return;
    }

    try {
      // Call Edge Function to initiate payout
      const { data, error } = await supabase.functions.invoke('initiate-payout', {
        body: {
          business_id: user?.id,
          amount: currentBalance,
          bank_account_id: primaryAccount.id,
        },
      });

      if (error) throw error;

      Alert.alert('Payout Requested', 'Your payout request has been submitted. You will receive the money within 1-2 business days.');
      setShowPayoutModal(false);
      loadPayoutHistory();
      loadBusinessBalance();
    } catch (error) {
      console.error('Error requesting payout:', error);
      Alert.alert('Error', 'Failed to request payout');
    }
  };

  const updateAutoSettlement = async (settings: typeof autoSettlement) => {
    try {
      const { error } = await supabase
        .from('business_settings')
        .upsert({
          business_id: user?.id,
          auto_settlement_settings: settings,
        });

      if (error) throw error;
      setAutoSettlement(settings);
    } catch (error) {
      console.error('Error updating auto settlement:', error);
      Alert.alert('Error', 'Failed to update auto settlement settings');
    }
  };

  const renderBankAccountCard = (account: BankAccount) => (
    <View key={account.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardHeader}>
        <View style={styles.bankInfo}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {account.bank_name}
          </Text>
          <Text style={[styles.accountNumber, { color: theme.colors.textSecondary }]}>
            ****{account.account_number.slice(-4)}
          </Text>
        </View>
        <View style={styles.badgeContainer}>
          {account.is_primary && (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>Primary</Text>
            </View>
          )}
          {account.is_verified ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: theme.colors.warning }]}>
              <Text style={styles.badgeText}>Pending</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={[styles.accountHolder, { color: theme.colors.textSecondary }]}>
        {account.account_holder_name}
      </Text>
      <Text style={[styles.ifscCode, { color: theme.colors.textSecondary }]}>
        IFSC: {account.ifsc_code}
      </Text>
    </View>
  );

  const renderPaymentMethodCard = (method: PaymentMethod) => (
    <View key={method.id} style={[styles.paymentMethodCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.paymentMethodInfo}>
        <Ionicons name={method.icon as any} size={24} color={theme.colors.primary} />
        <View style={styles.methodDetails}>
          <Text style={[styles.methodName, { color: theme.colors.text }]}>
            {method.display_name}
          </Text>
          <Text style={[styles.processingFee, { color: theme.colors.textSecondary }]}>
            Processing fee: {method.processing_fee_percentage}%
          </Text>
        </View>
      </View>
      <Switch
        value={method.is_enabled}
        onValueChange={(enabled) => togglePaymentMethod(method.id, enabled)}
        trackColor={{ false: '#767577', true: theme.colors.primary }}
        thumbColor={method.is_enabled ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  const renderPayoutHistoryItem = (payout: PayoutHistory) => (
    <View key={payout.id} style={[styles.payoutItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.payoutInfo}>
        <Text style={[styles.payoutAmount, { color: theme.colors.text }]}>
          ₹{payout.amount.toLocaleString()}
        </Text>
        <Text style={[styles.payoutDate, { color: theme.colors.textSecondary }]}>
          {new Date(payout.initiated_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={[styles.statusBadge, { 
        backgroundColor: payout.status === 'completed' ? theme.colors.success : 
                        payout.status === 'failed' ? theme.colors.error : theme.colors.warning 
      }]}>
        <Text style={styles.statusText}>{payout.status.toUpperCase()}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading payment settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadPaymentData} />
        }
      >
        {/* Balance Overview */}
        <View style={[styles.balanceCard, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{currentBalance.toLocaleString()}</Text>
          <Text style={styles.pendingAmount}>
            Pending: ₹{pendingAmount.toLocaleString()}
          </Text>
          <TouchableOpacity 
            style={styles.payoutButton}
            onPress={() => setShowPayoutModal(true)}
            disabled={currentBalance < 100}
          >
            <Text style={styles.payoutButtonText}>Request Payout</Text>
          </TouchableOpacity>
        </View>

        {/* Auto Settlement Settings */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Auto Settlement
          </Text>
          <View style={styles.autoSettlementCard}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Enable Auto Settlement
              </Text>
              <Switch
                value={autoSettlement.enabled}
                onValueChange={(enabled) => 
                  updateAutoSettlement({ ...autoSettlement, enabled })
                }
              />
            </View>
            {autoSettlement.enabled && (
              <>
                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                    Minimum Amount
                  </Text>
                  <TextInput
                    style={[styles.amountInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={autoSettlement.threshold_amount.toString()}
                    onChangeText={(text) => 
                      updateAutoSettlement({ 
                        ...autoSettlement, 
                        threshold_amount: parseInt(text) || 0 
                      })
                    }
                    keyboardType="numeric"
                    placeholder="1000"
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Bank Accounts */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Bank Accounts
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddBankModal(true)}
            >
              <Ionicons name="add" size={20} color={theme.colors.primary} />
              <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
                Add Account
              </Text>
            </TouchableOpacity>
          </View>
          {bankAccounts.length > 0 ? (
            bankAccounts.map(renderBankAccountCard)
          ) : (
            <Text style={[styles.emptyState, { color: theme.colors.textSecondary }]}>
              No bank accounts added yet
            </Text>
          )}
        </View>

        {/* Payment Methods */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Accepted Payment Methods
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Choose which payment methods your customers can use
          </Text>
          {paymentMethods.map(renderPaymentMethodCard)}
        </View>

        {/* Payout History */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Payout History
          </Text>
          {payoutHistory.length > 0 ? (
            payoutHistory.map(renderPayoutHistoryItem)
          ) : (
            <Text style={[styles.emptyState, { color: theme.colors.textSecondary }]}>
              No payouts yet
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Add Bank Account Modal */}
      <Modal
        visible={showAddBankModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddBankModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Add Bank Account
            </Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Account Holder Name
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                value={bankForm.account_holder_name}
                onChangeText={(text) => setBankForm({ ...bankForm, account_holder_name: text })}
                placeholder="Enter account holder name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Bank Name
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                value={bankForm.bank_name}
                onChangeText={(text) => setBankForm({ ...bankForm, bank_name: text })}
                placeholder="Enter bank name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Account Number
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                value={bankForm.account_number}
                onChangeText={(text) => setBankForm({ ...bankForm, account_number: text })}
                placeholder="Enter account number"
                keyboardType="numeric"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Confirm Account Number
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                value={bankForm.confirm_account_number}
                onChangeText={(text) => setBankForm({ ...bankForm, confirm_account_number: text })}
                placeholder="Re-enter account number"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                IFSC Code
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                value={bankForm.ifsc_code}
                onChangeText={(text) => setBankForm({ ...bankForm, ifsc_code: text.toUpperCase() })}
                placeholder="Enter IFSC code"
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddBankAccount}
            >
              <Text style={styles.submitButtonText}>Add Bank Account</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Payout Request Modal */}
      <Modal
        visible={showPayoutModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.payoutModal, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Request Payout
            </Text>
            <Text style={[styles.payoutModalText, { color: theme.colors.textSecondary }]}>
              Available balance: ₹{currentBalance.toLocaleString()}
            </Text>
            <Text style={[styles.payoutModalNote, { color: theme.colors.textSecondary }]}>
              Amount will be transferred to your primary verified bank account within 1-2 business days.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPayoutModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                onPress={requestPayout}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Request Payout
                </Text>
              </TouchableOpacity>
            </View>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  balanceCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  pendingAmount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 16,
  },
  payoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  payoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bankInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountNumber: {
    fontSize: 14,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  accountHolder: {
    fontSize: 14,
    marginBottom: 4,
  },
  ifscCode: {
    fontSize: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  processingFee: {
    fontSize: 12,
    marginTop: 2,
  },
  autoSettlementCard: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    textAlign: 'right',
  },
  payoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  payoutInfo: {
    flex: 1,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  payoutDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutModal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    minWidth: 300,
  },
  payoutModalText: {
    fontSize: 16,
    marginVertical: 8,
    textAlign: 'center',
  },
  payoutModalNote: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  confirmButton: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});