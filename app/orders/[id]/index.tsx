import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OrderDetails {
  id: string;
  service: string;
  businessName: string;
  businessImage: string;
  businessPhone: string;
  date: string;
  time: string;
  status: string;
  address: string;
  totalAmount: number;
  serviceCharge: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  timeline: {
    status: string;
    time: string;
    description: string;
    completed: boolean;
  }[];
}

const mockOrder: OrderDetails = {
  id: 'ORD-123456',
  service: 'AC Repair & Service',
  businessName: 'Cool Tech Services',
  businessImage: 'https://images.unsplash.com/photo-1631545806609-1d242e217cb5?w=400',
  businessPhone: '+1234567890',
  date: 'Dec 17, 2024',
  time: '2:00 PM - 4:00 PM',
  status: 'on_the_way',
  address: '123 Main Street, Apartment 4B, Bangalore - 560001',
  totalAmount: 649,
  serviceCharge: 599,
  tax: 50,
  discount: 0,
  paymentMethod: 'Credit Card (****1234)',
  timeline: [
    { status: 'Booking Placed', time: '10:30 AM', description: 'Order confirmed', completed: true },
    { status: 'Assigned', time: '10:45 AM', description: 'Service provider assigned', completed: true },
    { status: 'On the Way', time: '1:30 PM', description: 'Provider is coming', completed: true },
    { status: 'Service Started', time: '-', description: 'Work in progress', completed: false },
    { status: 'Completed', time: '-', description: 'Service completed', completed: false },
  ],
};

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const [order] = useState<OrderDetails>(mockOrder);
  const [showSupport, setShowSupport] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);

  const handleTrackOrder = () => {
    router.push(`/orders/${order.id}/tracking` as any);
  };

  const handleCancelOrder = () => {
    router.push(`/orders/${order.id}/cancel` as any);
  };

  const handleReschedule = () => {
    router.push(`/orders/${order.id}/reschedule` as any);
  };

  const handleContactSupport = async () => {
    if (!supportMessage.trim()) return;
    
    setSubmittingSupport(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmittingSupport(false);
    setShowSupport(false);
    setSupportMessage('');
    // Show success toast
  };

  const handleDownloadInvoice = () => {
    // Download invoice logic
    console.log('Downloading invoice...');
  };

  const statusColors: { [key: string]: string } = {
    confirmed: '#3B82F6',
    on_the_way: '#F59E0B',
    in_progress: '#8B5CF6',
    completed: '#10B981',
    cancelled: '#EF4444',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
        <TouchableOpacity onPress={() => setShowSupport(true)}>
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order ID & Status */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.orderIdRow}>
            <ThemedText style={[styles.orderId, { color: colors.textSecondary }]}>
              Order ID: {order.id}
            </ThemedText>
            <View style={[
              styles.statusBadge,
              { backgroundColor: statusColors[order.status] + '20' }
            ]}>
              <ThemedText style={[styles.statusText, { color: statusColors[order.status] }]}>
                {order.status.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Business Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.businessRow}>
            <Image
              source={{ uri: order.businessImage }}
              style={styles.businessImage}
            />
            <View style={styles.businessInfo}>
              <ThemedText style={styles.serviceName}>{order.service}</ThemedText>
              <ThemedText style={[styles.businessName, { color: colors.textSecondary }]}>
                {order.businessName}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.trackButton, { backgroundColor: colors.primary }]}
              onPress={handleTrackOrder}
            >
              <Ionicons name="location" size={18} color="#FFF" />
              <ThemedText style={styles.trackButtonText}>Track</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Schedule</ThemedText>
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <ThemedText style={styles.scheduleText}>{order.date}</ThemedText>
            </View>
            <View style={styles.scheduleItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <ThemedText style={styles.scheduleText}>{order.time}</ThemedText>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Service Address</ThemedText>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <ThemedText style={[styles.addressText, { color: colors.textSecondary }]}>
              {order.address}
            </ThemedText>
          </View>
        </View>

        {/* Order Timeline */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Order Timeline</ThemedText>
          <View style={styles.timeline}>
            {order.timeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineIndicator}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: item.completed ? colors.primary : colors.border,
                        borderColor: item.completed ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {item.completed && (
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    )}
                  </View>
                  {index < order.timeline.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: item.completed ? colors.primary : colors.border },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <ThemedText
                    style={[
                      styles.timelineStatus,
                      !item.completed && { color: colors.textSecondary },
                    ]}
                  >
                    {item.status}
                  </ThemedText>
                  <ThemedText style={[styles.timelineDescription, { color: colors.textSecondary }]}>
                    {item.description}
                  </ThemedText>
                  <ThemedText style={[styles.timelineTime, { color: colors.textSecondary }]}>
                    {item.time}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Summary */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Payment Summary</ThemedText>
          
          <View style={styles.paymentRow}>
            <ThemedText style={[styles.paymentLabel, { color: colors.textSecondary }]}>
              Service Charge
            </ThemedText>
            <ThemedText style={styles.paymentValue}>₹{order.serviceCharge}</ThemedText>
          </View>
          
          <View style={styles.paymentRow}>
            <ThemedText style={[styles.paymentLabel, { color: colors.textSecondary }]}>
              Tax
            </ThemedText>
            <ThemedText style={styles.paymentValue}>₹{order.tax}</ThemedText>
          </View>
          
          {order.discount > 0 && (
            <View style={styles.paymentRow}>
              <ThemedText style={[styles.paymentLabel, { color: colors.success }]}>
                Discount
              </ThemedText>
              <ThemedText style={[styles.paymentValue, { color: colors.success }]}>
                -₹{order.discount}
              </ThemedText>
            </View>
          )}
          
          <View style={[styles.paymentRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <ThemedText style={styles.totalLabel}>Total Amount</ThemedText>
            <ThemedText style={[styles.totalValue, { color: colors.primary }]}>
              ₹{order.totalAmount}
            </ThemedText>
          </View>
          
          <View style={styles.paymentMethodRow}>
            <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
            <ThemedText style={[styles.paymentMethodText, { color: colors.textSecondary }]}>
              Paid via {order.paymentMethod}
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleDownloadInvoice}
          >
            <Ionicons name="download-outline" size={20} color="#FFF" />
            <ThemedText style={styles.actionButtonText}>Download Invoice</ThemedText>
          </TouchableOpacity>

          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.primary }]}
                onPress={handleReschedule}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <ThemedText style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  Reschedule
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.error }]}
                onPress={handleCancelOrder}
              >
                <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                <ThemedText style={[styles.secondaryButtonText, { color: colors.error }]}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Support Modal */}
      {showSupport && (
        <View style={styles.modalOverlay}>
          <View style={[styles.supportModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Need Help?</ThemedText>
              <TouchableOpacity onPress={() => setShowSupport(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Describe your issue and we'll get back to you soon.
            </ThemedText>
            
            <TextInput
              style={[styles.supportInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Type your message here..."
              placeholderTextColor={colors.textSecondary}
              value={supportMessage}
              onChangeText={setSupportMessage}
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: supportMessage.trim() ? colors.primary : colors.border },
              ]}
              onPress={handleContactSupport}
              disabled={!supportMessage.trim() || submittingSupport}
            >
              {submittingSupport ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  businessInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  businessName: {
    fontSize: 14,
    marginTop: 2,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  trackButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 24,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleText: {
    fontSize: 15,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -16,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 8,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: '500',
  },
  timelineDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  timelineTime: {
    fontSize: 12,
    marginTop: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 15,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalRow: {
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  paymentMethodText: {
    fontSize: 14,
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  supportModal: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  supportInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
