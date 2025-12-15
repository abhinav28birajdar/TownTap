/**
 * Wallet Page - Phase 11
 * Digital wallet for cashless transactions
 */

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
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
  status: string;
}

export default function WalletPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id || '')
        .single();

      if (walletError) throw walletError;
      if (walletData) setBalance((walletData as any).balance);

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user?.id || '')
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsError) throw transactionsError;
      if (transactionsData) setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const handleAddMoney = async () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const { error } = await ((supabase as any).rpc('add_money_to_wallet', {
        user_id_param: user?.id,
        amount_param: amountValue,
      }));

      if (error) throw error;
      
      alert('Money added successfully!');
      setShowAddMoney(false);
      setAmount('');
      loadWalletData();
    } catch (error) {
      console.error('Error adding money:', error);
      alert('Failed to add money');
    }
  };

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>My Wallet</Text>
        </View>

        {/* Balance Card */}
        <Card style={([styles.balanceCard, { backgroundColor: colors.primary }] as any)}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>₹{balance.toFixed(2)}</Text>
          <Button
            title="Add Money"
            onPress={() => setShowAddMoney(true)}
            style={styles.addButton}
          />
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="send" size={24} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="business" size={24} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Bank Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="stats-chart" size={24} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <Card style={styles.transactionsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Transactions
          </Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Text style={styles.transactionIconText}>
                  {transaction.type === 'credit' ? '↓' : '↑'}
                </Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={[styles.transactionDesc, { color: colors.text }]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                  {new Date(transaction.created_at).toLocaleDateString('en-IN')}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color: transaction.type === 'credit' ? colors.primary : '#F44336',
                  },
                ]}
              >
                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      {/* Add Money Modal */}
      <Modal
        visible={showAddMoney}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMoney(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Money to Wallet
            </Text>

            <TextInput
              style={[
                styles.amountInput,
                {
                  color: colors.text,
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter amount"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={styles.quickAmounts}>
              {quickAmounts.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(amt.toString())}
                >
                  <Text style={[styles.quickAmountText, { color: colors.primary }]}>₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowAddMoney(false)}
                style={([styles.modalButton, styles.cancelButton] as any)}
              />
              <Button
                title="Add Money"
                onPress={handleAddMoney}
                style={([styles.modalButton, styles.confirmButton, { backgroundColor: colors.primary }] as any)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  balanceCard: {
    margin: spacing.md,
    padding: spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xl,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: spacing.md,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: spacing.md,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  quickAmountButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    // color applied inline for theme support
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  confirmButton: {
    // backgroundColor applied inline for theme support
  },
});
