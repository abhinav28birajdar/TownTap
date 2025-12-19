import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  category: 'booking' | 'refund' | 'cashback' | 'topup' | 'withdrawal' | 'referral';
  amount: number;
  description: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  details?: {
    bookingId?: string;
    serviceName?: string;
    method?: string;
  };
}

const transactions: Transaction[] = [
  {
    id: '1',
    type: 'debit',
    category: 'booking',
    amount: 1907,
    description: 'Deep Home Cleaning',
    date: 'Dec 23, 2024',
    time: '10:30 AM',
    status: 'completed',
    reference: 'TXN-2024-001234',
    details: { bookingId: 'BK-2024-1234', serviceName: 'Deep Home Cleaning', method: 'Wallet' },
  },
  {
    id: '2',
    type: 'credit',
    category: 'cashback',
    amount: 100,
    description: 'Cashback on booking',
    date: 'Dec 23, 2024',
    time: '10:32 AM',
    status: 'completed',
    reference: 'TXN-2024-001235',
  },
  {
    id: '3',
    type: 'credit',
    category: 'topup',
    amount: 2000,
    description: 'Wallet Top-up via UPI',
    date: 'Dec 22, 2024',
    time: '3:45 PM',
    status: 'completed',
    reference: 'TXN-2024-001230',
    details: { method: 'Google Pay' },
  },
  {
    id: '4',
    type: 'credit',
    category: 'refund',
    amount: 500,
    description: 'Refund for cancelled booking',
    date: 'Dec 20, 2024',
    time: '11:00 AM',
    status: 'completed',
    reference: 'TXN-2024-001220',
    details: { bookingId: 'BK-2024-1200', serviceName: 'AC Service' },
  },
  {
    id: '5',
    type: 'debit',
    category: 'booking',
    amount: 799,
    description: 'Plumbing Service',
    date: 'Dec 18, 2024',
    time: '2:15 PM',
    status: 'completed',
    reference: 'TXN-2024-001180',
    details: { bookingId: 'BK-2024-1180', serviceName: 'Plumbing Service', method: 'Wallet + Card' },
  },
  {
    id: '6',
    type: 'credit',
    category: 'referral',
    amount: 200,
    description: 'Referral bonus earned',
    date: 'Dec 15, 2024',
    time: '9:00 AM',
    status: 'completed',
    reference: 'TXN-2024-001150',
  },
];

export default function TransactionHistoryScreen() {
  const colors = useColors();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter || t.category === filter;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.reference.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category: Transaction['category']) => {
    switch (category) {
      case 'booking': return 'calendar';
      case 'refund': return 'arrow-undo';
      case 'cashback': return 'gift';
      case 'topup': return 'wallet';
      case 'withdrawal': return 'arrow-down';
      case 'referral': return 'people';
      default: return 'card';
    }
  };

  const getCategoryLabel = (category: Transaction['category']) => {
    switch (category) {
      case 'booking': return 'Booking Payment';
      case 'refund': return 'Refund';
      case 'cashback': return 'Cashback';
      case 'topup': return 'Wallet Top-up';
      case 'withdrawal': return 'Withdrawal';
      case 'referral': return 'Referral Bonus';
      default: return 'Transaction';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[styles.transactionCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedTransaction(item);
        setShowDetailModal(true);
      }}
    >
      <View style={[
        styles.transactionIcon,
        { backgroundColor: item.type === 'credit' ? colors.success + '15' : colors.error + '15' }
      ]}>
        <Ionicons
          name={getCategoryIcon(item.category) as any}
          size={22}
          color={item.type === 'credit' ? colors.success : colors.error}
        />
      </View>
      <View style={styles.transactionInfo}>
        <ThemedText style={styles.transactionDescription}>{item.description}</ThemedText>
        <ThemedText style={[styles.transactionMeta, { color: colors.textSecondary }]}>
          {item.date} • {item.time}
        </ThemedText>
      </View>
      <View style={styles.transactionAmountContainer}>
        <ThemedText style={[
          styles.transactionAmount,
          { color: item.type === 'credit' ? colors.success : colors.text }
        ]}>
          {item.type === 'credit' ? '+' : '-'}₹{item.amount.toLocaleString()}
        </ThemedText>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'completed' ? colors.success + '15' : colors.warning + '15' }
        ]}>
          <ThemedText style={[
            styles.statusText,
            { color: item.status === 'completed' ? colors.success : colors.warning }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Transaction History</ThemedText>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <Ionicons name="filter-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="arrow-down" size={18} color="#FFF" />
            </View>
            <View>
              <ThemedText style={styles.summaryLabel}>Total Credits</ThemedText>
              <ThemedText style={styles.summaryValue}>₹{totalCredit.toLocaleString()}</ThemedText>
            </View>
          </View>
          <View style={[styles.summaryDivider]} />
          <View style={styles.summaryItem}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="arrow-up" size={18} color="#FFF" />
            </View>
            <View>
              <ThemedText style={styles.summaryLabel}>Total Debits</ThemedText>
              <ThemedText style={styles.summaryValue}>₹{totalDebit.toLocaleString()}</ThemedText>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { key: 'all', label: 'All' },
          { key: 'credit', label: 'Credits' },
          { key: 'debit', label: 'Debits' },
          { key: 'refund', label: 'Refunds' },
          { key: 'cashback', label: 'Cashback' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterTab,
              filter === item.key && { backgroundColor: colors.primary }
            ]}
            onPress={() => setFilter(item.key)}
          >
            <ThemedText style={[
              styles.filterText,
              { color: filter === item.key ? '#FFF' : colors.textSecondary }
            ]}>
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ThemedText style={[styles.listHeader, { color: colors.textSecondary }]}>
            {filteredTransactions.length} transactions
          </ThemedText>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Transactions</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Your transaction history will appear here
            </ThemedText>
          </View>
        }
      />

      {/* Transaction Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Transaction Details</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedTransaction && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Amount Card */}
                <View style={[styles.amountCard, { backgroundColor: colors.background }]}>
                  <View style={[
                    styles.amountIconLarge,
                    { backgroundColor: selectedTransaction.type === 'credit' ? colors.success + '15' : colors.error + '15' }
                  ]}>
                    <Ionicons
                      name={getCategoryIcon(selectedTransaction.category) as any}
                      size={32}
                      color={selectedTransaction.type === 'credit' ? colors.success : colors.error}
                    />
                  </View>
                  <ThemedText style={[
                    styles.amountLarge,
                    { color: selectedTransaction.type === 'credit' ? colors.success : colors.text }
                  ]}>
                    {selectedTransaction.type === 'credit' ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString()}
                  </ThemedText>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
                    <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
                      {getCategoryLabel(selectedTransaction.category)}
                    </ThemedText>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Description
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>{selectedTransaction.description}</ThemedText>
                  </View>
                  <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.detailRow}>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Transaction ID
                    </ThemedText>
                    <View style={styles.detailValueRow}>
                      <ThemedText style={styles.detailValue}>{selectedTransaction.reference}</ThemedText>
                      <TouchableOpacity>
                        <Ionicons name="copy-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.detailRow}>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Date & Time
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {selectedTransaction.date} at {selectedTransaction.time}
                    </ThemedText>
                  </View>
                  <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.detailRow}>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Status
                    </ThemedText>
                    <View style={[
                      styles.statusBadgeLarge,
                      { backgroundColor: colors.success + '15' }
                    ]}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <ThemedText style={[styles.statusTextLarge, { color: colors.success }]}>
                        {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                      </ThemedText>
                    </View>
                  </View>
                  {selectedTransaction.details?.bookingId && (
                    <>
                      <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                      <View style={styles.detailRow}>
                        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                          Booking ID
                        </ThemedText>
                        <TouchableOpacity>
                          <ThemedText style={[styles.detailValue, { color: colors.primary }]}>
                            {selectedTransaction.details.bookingId}
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                  {selectedTransaction.details?.method && (
                    <>
                      <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                      <View style={styles.detailRow}>
                        <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                          Payment Method
                        </ThemedText>
                        <ThemedText style={styles.detailValue}>{selectedTransaction.details.method}</ThemedText>
                      </View>
                    </>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]}>
                    <Ionicons name="download-outline" size={20} color={colors.primary} />
                    <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>
                      Download Receipt
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.background }]}>
                    <Ionicons name="share-outline" size={20} color={colors.primary} />
                    <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>
                      Share
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Need Help */}
                <TouchableOpacity style={[styles.helpCard, { backgroundColor: colors.info + '10' }]}>
                  <Ionicons name="help-circle" size={24} color={colors.info} />
                  <View style={styles.helpContent}>
                    <ThemedText style={styles.helpTitle}>Need Help?</ThemedText>
                    <ThemedText style={[styles.helpDescription, { color: colors.textSecondary }]}>
                      Report an issue with this transaction
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Filter Transactions</ThemedText>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Transaction Type */}
              <ThemedText style={styles.filterGroupTitle}>Transaction Type</ThemedText>
              <View style={styles.filterOptions}>
                {['All', 'Credits', 'Debits'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      { backgroundColor: colors.background },
                      filter === type.toLowerCase() && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                    ]}
                  >
                    <ThemedText style={[
                      styles.filterOptionText,
                      filter === type.toLowerCase() && { color: colors.primary }
                    ]}>
                      {type}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Category */}
              <ThemedText style={styles.filterGroupTitle}>Category</ThemedText>
              <View style={styles.filterOptions}>
                {['Booking', 'Refund', 'Cashback', 'Top-up', 'Referral'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterOption, { backgroundColor: colors.background }]}
                  >
                    <ThemedText style={styles.filterOptionText}>{cat}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Range */}
              <ThemedText style={styles.filterGroupTitle}>Date Range</ThemedText>
              <View style={styles.dateRangeRow}>
                <TouchableOpacity style={[styles.dateButton, { backgroundColor: colors.background }]}>
                  <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                  <ThemedText style={[styles.dateButtonText, { color: colors.textSecondary }]}>
                    Start Date
                  </ThemedText>
                </TouchableOpacity>
                <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
                <TouchableOpacity style={[styles.dateButton, { backgroundColor: colors.background }]}>
                  <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                  <ThemedText style={[styles.dateButtonText, { color: colors.textSecondary }]}>
                    End Date
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Apply Button */}
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowFilterModal(false)}
              >
                <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearButton}>
                <ThemedText style={[styles.clearButtonText, { color: colors.error }]}>
                  Clear All Filters
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
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
  summaryCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 2,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listHeader: {
    fontSize: 13,
    marginBottom: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 12,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
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
  amountCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  amountIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amountLarge: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailDivider: {
    height: 1,
  },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusTextLarge: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 20,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  helpDescription: {
    fontSize: 12,
  },
  filterGroupTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionText: {
    fontSize: 14,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
