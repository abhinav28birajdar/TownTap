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
    Share,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  serviceName: string;
  date: string;
  dueDate: string;
  amount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod?: string;
}

const invoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerName: 'Priya Sharma',
    serviceName: 'Deep Home Cleaning',
    date: 'Dec 23, 2024',
    dueDate: 'Dec 30, 2024',
    amount: 999,
    tax: 180,
    total: 1179,
    status: 'paid',
    paymentMethod: 'UPI',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerName: 'Rahul Kumar',
    serviceName: 'AC Servicing',
    date: 'Dec 22, 2024',
    dueDate: 'Dec 29, 2024',
    amount: 599,
    tax: 108,
    total: 707,
    status: 'pending',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    customerName: 'Anjali Patel',
    serviceName: 'Bathroom Cleaning',
    date: 'Dec 20, 2024',
    dueDate: 'Dec 27, 2024',
    amount: 499,
    tax: 90,
    total: 589,
    status: 'paid',
    paymentMethod: 'Card',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    customerName: 'Vikram Singh',
    serviceName: 'Plumbing Repair',
    date: 'Dec 15, 2024',
    dueDate: 'Dec 22, 2024',
    amount: 799,
    tax: 144,
    total: 943,
    status: 'overdue',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    customerName: 'Neha Gupta',
    serviceName: 'Electrical Work',
    date: 'Dec 10, 2024',
    dueDate: 'Dec 17, 2024',
    amount: 1299,
    tax: 234,
    total: 1533,
    status: 'cancelled',
  },
];

export default function InvoicesScreen() {
  const colors = useColors();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus === 'all') return true;
    return invoice.status === filterStatus;
  });

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'pending': return colors.warning;
      case 'overdue': return colors.error;
      case 'cancelled': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + i.total, 0);
  
  const totalPending = invoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((acc, i) => acc + i.total, 0);

  const handleShareInvoice = async (invoice: Invoice) => {
    try {
      await Share.share({
        message: `Invoice: ${invoice.invoiceNumber}\nCustomer: ${invoice.customerName}\nService: ${invoice.serviceName}\nAmount: ₹${invoice.total}`,
        title: `Invoice ${invoice.invoiceNumber}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      style={[styles.invoiceCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedInvoice(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.invoiceHeader}>
        <View>
          <ThemedText style={[styles.invoiceNumber, { color: colors.primary }]}>
            {item.invoiceNumber}
          </ThemedText>
          <ThemedText style={styles.customerName}>{item.customerName}</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.invoiceDivider, { backgroundColor: colors.border }]} />

      <View style={styles.invoiceDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="construct-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.serviceName}
            </ThemedText>
          </View>
          <ThemedText style={styles.invoiceAmount}>₹{item.total.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.date}
            </ThemedText>
          </View>
          {item.status === 'pending' || item.status === 'overdue' ? (
            <ThemedText style={[styles.dueText, { color: item.status === 'overdue' ? colors.error : colors.warning }]}>
              Due: {item.dueDate}
            </ThemedText>
          ) : item.paymentMethod ? (
            <View style={styles.paymentMethod}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <ThemedText style={[styles.paymentText, { color: colors.success }]}>
                Paid via {item.paymentMethod}
              </ThemedText>
            </View>
          ) : null}
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
        <ThemedText style={styles.headerTitle}>Invoices</ThemedText>
        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={[colors.success, '#27ae60']}
            style={styles.statCard}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            <ThemedText style={styles.statLabel}>Paid</ThemedText>
            <ThemedText style={styles.statValue}>₹{totalPaid.toLocaleString()}</ThemedText>
            <ThemedText style={styles.statCount}>
              {invoices.filter(i => i.status === 'paid').length} invoices
            </ThemedText>
          </LinearGradient>
          <LinearGradient
            colors={[colors.warning, '#d68910']}
            style={styles.statCard}
          >
            <Ionicons name="time" size={24} color="#FFF" />
            <ThemedText style={styles.statLabel}>Outstanding</ThemedText>
            <ThemedText style={styles.statValue}>₹{totalPending.toLocaleString()}</ThemedText>
            <ThemedText style={styles.statCount}>
              {invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length} invoices
            </ThemedText>
          </LinearGradient>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'paid', 'pending', 'overdue', 'cancelled'].map((status) => (
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

        {/* Invoices List */}
        <View style={styles.section}>
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <View key={invoice.id}>
                {renderInvoice({ item: invoice })}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Invoices</ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                No invoices found for this filter
              </ThemedText>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Invoice Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Invoice Details</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedInvoice && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Invoice Header */}
                <View style={[styles.invoiceDetailHeader, { backgroundColor: colors.background }]}>
                  <View style={styles.invoiceDetailHeaderTop}>
                    <ThemedText style={[styles.invoiceDetailNumber, { color: colors.primary }]}>
                      {selectedInvoice.invoiceNumber}
                    </ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedInvoice.status) + '15' }]}>
                      <ThemedText style={[styles.statusText, { color: getStatusColor(selectedInvoice.status) }]}>
                        {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.invoiceDetailDate, { color: colors.textSecondary }]}>
                    Issued: {selectedInvoice.date}
                  </ThemedText>
                  <ThemedText style={[styles.invoiceDetailDate, { color: colors.textSecondary }]}>
                    Due: {selectedInvoice.dueDate}
                  </ThemedText>
                </View>

                {/* Customer Info */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    BILL TO
                  </ThemedText>
                  <ThemedText style={styles.customerDetailName}>{selectedInvoice.customerName}</ThemedText>
                </View>

                {/* Service Details */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    SERVICE DETAILS
                  </ThemedText>
                  <View style={[styles.serviceDetailCard, { backgroundColor: colors.background }]}>
                    <View style={styles.serviceDetailRow}>
                      <ThemedText style={styles.serviceDetailName}>{selectedInvoice.serviceName}</ThemedText>
                      <ThemedText style={styles.serviceDetailAmount}>
                        ₹{selectedInvoice.amount.toLocaleString()}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Summary */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    SUMMARY
                  </ThemedText>
                  <View style={[styles.summaryCard, { backgroundColor: colors.background }]}>
                    <View style={styles.summaryRow}>
                      <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                        Subtotal
                      </ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        ₹{selectedInvoice.amount.toLocaleString()}
                      </ThemedText>
                    </View>
                    <View style={styles.summaryRow}>
                      <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                        Tax (18% GST)
                      </ThemedText>
                      <ThemedText style={styles.summaryValue}>
                        ₹{selectedInvoice.tax.toLocaleString()}
                      </ThemedText>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryRow}>
                      <ThemedText style={styles.summaryTotalLabel}>Total</ThemedText>
                      <ThemedText style={[styles.summaryTotalValue, { color: colors.primary }]}>
                        ₹{selectedInvoice.total.toLocaleString()}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Payment Status */}
                {selectedInvoice.paymentMethod && (
                  <View style={styles.modalSection}>
                    <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                      PAYMENT
                    </ThemedText>
                    <View style={[styles.paymentCard, { backgroundColor: colors.success + '10' }]}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                      <ThemedText style={[styles.paymentStatus, { color: colors.success }]}>
                        Paid via {selectedInvoice.paymentMethod}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleShareInvoice(selectedInvoice)}
                  >
                    <Ionicons name="share-outline" size={18} color="#FFF" />
                    <ThemedText style={styles.modalActionText}>Share</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: colors.info }]}
                  >
                    <Ionicons name="download-outline" size={18} color="#FFF" />
                    <ThemedText style={styles.modalActionText}>Download PDF</ThemedText>
                  </TouchableOpacity>
                </View>

                {(selectedInvoice.status === 'pending' || selectedInvoice.status === 'overdue') && (
                  <TouchableOpacity
                    style={[styles.sendReminderButton, { borderColor: colors.warning }]}
                  >
                    <Ionicons name="notifications-outline" size={18} color={colors.warning} />
                    <ThemedText style={[styles.sendReminderText, { color: colors.warning }]}>
                      Send Payment Reminder
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 4,
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
  section: {
    paddingHorizontal: 16,
  },
  invoiceCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceDivider: {
    height: 1,
    marginBottom: 12,
  },
  invoiceDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  dueText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '500',
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
  invoiceDetailHeader: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  invoiceDetailHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceDetailNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  invoiceDetailDate: {
    fontSize: 13,
    marginBottom: 2,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  customerDetailName: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDetailCard: {
    padding: 14,
    borderRadius: 12,
  },
  serviceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceDetailName: {
    fontSize: 15,
    fontWeight: '500',
  },
  serviceDetailAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryCard: {
    padding: 14,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    marginBottom: 10,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sendReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  sendReminderText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
