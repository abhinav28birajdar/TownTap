import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface InvoiceItem {
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod?: string;
  paidDate?: string;
  notes?: string;
}

const mockInvoice: Invoice = {
  id: '1',
  invoiceNumber: 'INV-2024-0042',
  date: '2024-02-10',
  dueDate: '2024-02-20',
  status: 'paid',
  customer: {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    address: '402, Green Valley Apartments, Sector 45, Mumbai - 400001',
  },
  items: [
    { name: 'Deep Home Cleaning', quantity: 1, rate: 2500, amount: 2500 },
    { name: 'Kitchen Deep Clean', quantity: 1, rate: 800, amount: 800 },
    { name: 'Bathroom Sanitization', quantity: 2, rate: 400, amount: 800 },
    { name: 'Window Cleaning', quantity: 8, rate: 100, amount: 800 },
  ],
  subtotal: 4900,
  tax: 882,
  discount: 500,
  total: 5282,
  paymentMethod: 'Online Payment (UPI)',
  paidDate: '2024-02-10',
  notes: 'Thank you for choosing HomeCare Pro Services. We appreciate your business!',
};

export default function InvoiceDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [invoice] = useState(mockInvoice);
  const [showActionsModal, setShowActionsModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'pending':
        return '#FF9800';
      case 'overdue':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Invoice ${invoice.invoiceNumber}\nAmount: ₹${invoice.total}\nCustomer: ${invoice.customer.name}`,
        title: `Invoice ${invoice.invoiceNumber}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Invoice Details</ThemedText>
        <TouchableOpacity onPress={() => setShowActionsModal(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Invoice Header Card */}
        <View style={[styles.invoiceHeader, { backgroundColor: colors.card }]}>
          <View style={styles.invoiceHeaderTop}>
            <View>
              <ThemedText style={[styles.invoiceLabel, { color: colors.textSecondary }]}>
                Invoice Number
              </ThemedText>
              <ThemedText style={styles.invoiceNumber}>{invoice.invoiceNumber}</ThemedText>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(invoice.status) + '15' },
              ]}
            >
              <Ionicons
                name={invoice.status === 'paid' ? 'checkmark-circle' : 'time'}
                size={16}
                color={getStatusColor(invoice.status)}
              />
              <ThemedText
                style={[styles.statusText, { color: getStatusColor(invoice.status) }]}
              >
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.invoiceDates}>
            <View style={styles.dateItem}>
              <ThemedText style={[styles.dateLabel, { color: colors.textSecondary }]}>
                Invoice Date
              </ThemedText>
              <ThemedText style={styles.dateValue}>{formatDate(invoice.date)}</ThemedText>
            </View>
            <View style={styles.dateItem}>
              <ThemedText style={[styles.dateLabel, { color: colors.textSecondary }]}>
                Due Date
              </ThemedText>
              <ThemedText style={styles.dateValue}>{formatDate(invoice.dueDate)}</ThemedText>
            </View>
            {invoice.paidDate && (
              <View style={styles.dateItem}>
                <ThemedText style={[styles.dateLabel, { color: colors.textSecondary }]}>
                  Paid On
                </ThemedText>
                <ThemedText style={[styles.dateValue, { color: colors.success }]}>
                  {formatDate(invoice.paidDate)}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Customer Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={colors.primary} />
            <ThemedText style={styles.sectionTitle}>Bill To</ThemedText>
          </View>
          <View style={styles.customerInfo}>
            <ThemedText style={styles.customerName}>{invoice.customer.name}</ThemedText>
            <View style={styles.customerRow}>
              <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
              <ThemedText style={[styles.customerText, { color: colors.textSecondary }]}>
                {invoice.customer.email}
              </ThemedText>
            </View>
            <View style={styles.customerRow}>
              <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
              <ThemedText style={[styles.customerText, { color: colors.textSecondary }]}>
                {invoice.customer.phone}
              </ThemedText>
            </View>
            <View style={styles.customerRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <ThemedText style={[styles.customerText, { color: colors.textSecondary }]}>
                {invoice.customer.address}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Items List */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={colors.primary} />
            <ThemedText style={styles.sectionTitle}>Items</ThemedText>
          </View>

          <View style={styles.itemsTable}>
            <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.tableHeaderText, { flex: 2, color: colors.textSecondary }]}>
                Item
              </ThemedText>
              <ThemedText style={[styles.tableHeaderText, { color: colors.textSecondary }]}>
                Qty
              </ThemedText>
              <ThemedText style={[styles.tableHeaderText, { color: colors.textSecondary }]}>
                Rate
              </ThemedText>
              <ThemedText style={[styles.tableHeaderText, { textAlign: 'right', color: colors.textSecondary }]}>
                Amount
              </ThemedText>
            </View>

            {invoice.items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  { borderBottomColor: colors.border },
                  index === invoice.items.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <ThemedText style={[styles.tableCell, { flex: 2 }]}>{item.name}</ThemedText>
                <ThemedText style={styles.tableCell}>{item.quantity}</ThemedText>
                <ThemedText style={styles.tableCell}>₹{item.rate}</ThemedText>
                <ThemedText style={[styles.tableCell, { textAlign: 'right', fontWeight: '500' }]}>
                  ₹{item.amount.toLocaleString()}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.totalRow}>
            <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>
              Subtotal
            </ThemedText>
            <ThemedText style={styles.totalValue}>₹{invoice.subtotal.toLocaleString()}</ThemedText>
          </View>
          <View style={styles.totalRow}>
            <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>
              Tax (18% GST)
            </ThemedText>
            <ThemedText style={styles.totalValue}>₹{invoice.tax.toLocaleString()}</ThemedText>
          </View>
          {invoice.discount > 0 && (
            <View style={styles.totalRow}>
              <ThemedText style={[styles.totalLabel, { color: colors.success }]}>
                Discount
              </ThemedText>
              <ThemedText style={[styles.totalValue, { color: colors.success }]}>
                -₹{invoice.discount.toLocaleString()}
              </ThemedText>
            </View>
          )}
          <View style={[styles.grandTotalRow, { borderTopColor: colors.border }]}>
            <ThemedText style={styles.grandTotalLabel}>Total Amount</ThemedText>
            <ThemedText style={[styles.grandTotalValue, { color: colors.primary }]}>
              ₹{invoice.total.toLocaleString()}
            </ThemedText>
          </View>
        </View>

        {/* Payment Info */}
        {invoice.paymentMethod && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={20} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Payment Information</ThemedText>
            </View>
            <View style={[styles.paymentInfo, { backgroundColor: colors.success + '10' }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <View style={styles.paymentDetails}>
                <ThemedText style={styles.paymentMethod}>{invoice.paymentMethod}</ThemedText>
                {invoice.paidDate && (
                  <ThemedText style={[styles.paymentDate, { color: colors.textSecondary }]}>
                    Paid on {formatDate(invoice.paidDate)}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
            </View>
            <ThemedText style={[styles.notesText, { color: colors.textSecondary }]}>
              {invoice.notes}
            </ThemedText>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => {}}
          >
            <Ionicons name="download-outline" size={22} color={colors.primary} />
            <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>
              Download PDF
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color="#fff" />
            <ThemedText style={[styles.actionButtonText, { color: '#fff' }]}>
              Share Invoice
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Actions Modal */}
      <Modal visible={showActionsModal} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsModal(false)}
        >
          <View style={[styles.actionsMenu, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowActionsModal(false);
              }}
            >
              <Ionicons name="create-outline" size={20} color={colors.text} />
              <ThemedText style={styles.menuText}>Edit Invoice</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowActionsModal(false);
              }}
            >
              <Ionicons name="copy-outline" size={20} color={colors.text} />
              <ThemedText style={styles.menuText}>Duplicate</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowActionsModal(false);
              }}
            >
              <Ionicons name="print-outline" size={20} color={colors.text} />
              <ThemedText style={styles.menuText}>Print Invoice</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleShare();
                setShowActionsModal(false);
              }}
            >
              <Ionicons name="mail-outline" size={20} color={colors.text} />
              <ThemedText style={styles.menuText}>Send via Email</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => {
                setShowActionsModal(false);
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <ThemedText style={[styles.menuText, { color: colors.error }]}>
                Delete Invoice
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  invoiceHeader: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },
  invoiceHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  invoiceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  invoiceDates: {
    flexDirection: 'row',
    gap: 20,
  },
  dateItem: {},
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  customerInfo: {
    gap: 8,
  },
  customerName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  customerText: {
    flex: 1,
    fontSize: 14,
  },
  itemsTable: {},
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 12,
  },
  paymentDetails: {},
  paymentMethod: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 13,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
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
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  actionsMenu: {
    borderRadius: 14,
    overflow: 'hidden',
    marginLeft: 'auto',
    width: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuText: {
    fontSize: 15,
  },
});
