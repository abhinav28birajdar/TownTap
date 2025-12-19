import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    image: string | null;
    address: string;
  };
  items: OrderItem[];
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  scheduledDate: string;
  scheduledTime: string;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  notes: string;
  timeline: {
    status: string;
    time: string;
    description: string;
  }[];
}

export default function BusinessOrderDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Mock order data
  const order: Order = {
    id: id || 'ORD-2024-1234',
    customer: {
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      image: null,
      address: '123 Main Street, Apartment 4B, Koramangala, Bangalore 560095',
    },
    items: [
      { id: '1', name: 'Home Deep Cleaning', quantity: 1, price: 1499 },
      { id: '2', name: 'Sofa Cleaning (3 Seater)', quantity: 1, price: 599 },
    ],
    status: 'accepted',
    createdAt: 'Dec 15, 2024 10:30 AM',
    scheduledDate: 'Dec 17, 2024',
    scheduledTime: '10:00 AM - 12:00 PM',
    total: 2098,
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    notes: 'Please bring extra cleaning supplies for the kitchen. Gate code is 1234.',
    timeline: [
      { status: 'Order Placed', time: '10:30 AM', description: 'Order received from customer' },
      { status: 'Payment Received', time: '10:31 AM', description: 'Payment of ₹2,098 via UPI' },
      { status: 'Order Accepted', time: '10:45 AM', description: 'You accepted this order' },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'accepted':
        return '#2196F3';
      case 'in_progress':
        return '#9C27B0';
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getNextAction = () => {
    switch (order.status) {
      case 'pending':
        return { label: 'Accept Order', icon: 'checkmark', color: colors.success };
      case 'accepted':
        return { label: 'Start Service', icon: 'play', color: '#9C27B0' };
      case 'in_progress':
        return { label: 'Complete Service', icon: 'checkmark-done', color: colors.success };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
        <TouchableOpacity onPress={() => setShowActionsModal(true)}>
          <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order ID & Status */}
        <View style={[styles.orderHeader, { backgroundColor: colors.card }]}>
          <View style={styles.orderIdRow}>
            <ThemedText style={styles.orderId}>{order.id}</ThemedText>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) + '15' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(order.status) },
                ]}
              />
              <ThemedText
                style={[styles.statusText, { color: getStatusColor(order.status) }]}
              >
                {getStatusLabel(order.status)}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.orderDate, { color: colors.textSecondary }]}>
            Placed on {order.createdAt}
          </ThemedText>
        </View>

        {/* Customer Info */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Customer Information</ThemedText>
          <View style={styles.customerRow}>
            <View style={[styles.customerAvatar, { backgroundColor: colors.primary + '20' }]}>
              <ThemedText style={[styles.avatarText, { color: colors.primary }]}>
                {order.customer.name.charAt(0)}
              </ThemedText>
            </View>
            <View style={styles.customerInfo}>
              <ThemedText style={styles.customerName}>{order.customer.name}</ThemedText>
              <ThemedText style={[styles.customerPhone, { color: colors.textSecondary }]}>
                {order.customer.phone}
              </ThemedText>
            </View>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.primary + '15' }]}
              >
                <Ionicons name="call" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.primary + '15' }]}
              >
                <Ionicons name="chatbubble" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.addressRow, { backgroundColor: colors.background }]}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <ThemedText style={[styles.addressText, { color: colors.textSecondary }]}>
              {order.customer.address}
            </ThemedText>
          </View>
        </View>

        {/* Schedule */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Scheduled Date & Time</ThemedText>
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </View>
              <View>
                <ThemedText style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                  Date
                </ThemedText>
                <ThemedText style={styles.scheduleValue}>{order.scheduledDate}</ThemedText>
              </View>
            </View>
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="time" size={20} color={colors.primary} />
              </View>
              <View>
                <ThemedText style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                  Time
                </ThemedText>
                <ThemedText style={styles.scheduleValue}>{order.scheduledTime}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Order Items</ThemedText>
          {order.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index < order.items.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={[styles.itemQty, { color: colors.textSecondary }]}>
                  Qty: {item.quantity}
                </ThemedText>
              </View>
              <ThemedText style={styles.itemPrice}>₹{item.price}</ThemedText>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={[styles.totalValue, { color: colors.primary }]}>
              ₹{order.total}
            </ThemedText>
          </View>
        </View>

        {/* Payment Info */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Payment Information</ThemedText>
          <View style={styles.paymentRow}>
            <View style={styles.paymentInfo}>
              <ThemedText style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                Method
              </ThemedText>
              <View style={styles.paymentMethodRow}>
                <Ionicons name="card" size={16} color={colors.text} />
                <ThemedText style={styles.paymentMethod}>{order.paymentMethod}</ThemedText>
              </View>
            </View>
            <View style={styles.paymentInfo}>
              <ThemedText style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                Status
              </ThemedText>
              <View
                style={[
                  styles.paymentStatusBadge,
                  {
                    backgroundColor:
                      order.paymentStatus === 'paid' ? colors.success + '15' : '#FF9800' + '15',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.paymentStatusText,
                    {
                      color: order.paymentStatus === 'paid' ? colors.success : '#FF9800',
                    },
                  ]}
                >
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Notes */}
        {order.notes && (
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Customer Notes</ThemedText>
            <View style={[styles.notesContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="document-text" size={18} color={colors.textSecondary} />
              <ThemedText style={[styles.notesText, { color: colors.textSecondary }]}>
                {order.notes}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Order Timeline</ThemedText>
          <View style={styles.timeline}>
            {order.timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineIndicator}>
                  <View
                    style={[styles.timelineDot, { backgroundColor: colors.primary }]}
                  />
                  {index < order.timeline.length - 1 && (
                    <View
                      style={[styles.timelineLine, { backgroundColor: colors.border }]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <ThemedText style={styles.timelineStatus}>{event.status}</ThemedText>
                    <ThemedText style={[styles.timelineTime, { color: colors.textSecondary }]}>
                      {event.time}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.timelineDesc, { color: colors.textSecondary }]}>
                    {event.description}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      {nextAction && (
        <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.error }]}
            onPress={() => setShowCancelModal(true)}
          >
            <Ionicons name="close" size={20} color={colors.error} />
            <ThemedText style={[styles.cancelText, { color: colors.error }]}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextActionButton, { backgroundColor: nextAction.color }]}
          >
            <Ionicons name={nextAction.icon as any} size={20} color="#fff" />
            <ThemedText style={styles.nextActionText}>{nextAction.label}</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Actions Modal */}
      <Modal visible={showActionsModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsModal(false)}
        >
          <View style={[styles.actionsModal, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="print" size={22} color={colors.text} />
              <ThemedText style={styles.actionText}>Print Invoice</ThemedText>
            </TouchableOpacity>
            <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="share-social" size={22} color={colors.text} />
              <ThemedText style={styles.actionText}>Share Details</ThemedText>
            </TouchableOpacity>
            <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="calendar" size={22} color={colors.text} />
              <ThemedText style={styles.actionText}>Reschedule</ThemedText>
            </TouchableOpacity>
            <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowActionsModal(false);
                router.push('/support/report-issue');
              }}
            >
              <Ionicons name="flag" size={22} color={colors.error} />
              <ThemedText style={[styles.actionText, { color: colors.error }]}>
                Report Issue
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Cancel Modal */}
      <Modal visible={showCancelModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.cancelModal, { backgroundColor: colors.card }]}>
            <View style={styles.cancelModalHeader}>
              <ThemedText style={styles.cancelModalTitle}>Cancel Order</ThemedText>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ThemedText style={[styles.cancelModalSubtitle, { color: colors.textSecondary }]}>
              Please provide a reason for cancellation
            </ThemedText>
            <TextInput
              style={[styles.cancelInput, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Enter reason..."
              placeholderTextColor={colors.textSecondary}
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.confirmCancelButton,
                { backgroundColor: cancelReason.trim() ? colors.error : colors.border },
              ]}
              disabled={!cancelReason.trim()}
            >
              <ThemedText
                style={[
                  styles.confirmCancelText,
                  { color: cancelReason.trim() ? '#fff' : colors.textSecondary },
                ]}
              >
                Confirm Cancellation
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
  orderHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 18,
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
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 13,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  scheduleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  scheduleValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQty: {
    fontSize: 13,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 20,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentMethod: {
    fontSize: 15,
    fontWeight: '500',
  },
  paymentStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 10,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineTime: {
    fontSize: 12,
  },
  timelineDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  nextActionButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  nextActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsModal: {
    width: width - 60,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  actionText: {
    fontSize: 16,
  },
  actionDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  cancelModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  cancelModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelModalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  cancelModalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  cancelInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    minHeight: 100,
  },
  confirmCancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
