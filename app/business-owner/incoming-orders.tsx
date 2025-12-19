import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Order {
  id: string;
  customerName: string;
  customerImage: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  address: string;
  phone: string;
}

const incomingOrders: Order[] = [
  {
    id: '1',
    customerName: 'Priya Sharma',
    customerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    serviceName: 'Deep Home Cleaning',
    date: 'Today',
    time: '2:00 PM',
    status: 'pending',
    price: 999,
    address: '123 Main St, Sector 15, Noida',
    phone: '+91 98765 43210',
  },
  {
    id: '2',
    customerName: 'Rahul Kumar',
    customerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    serviceName: 'AC Servicing',
    date: 'Today',
    time: '4:30 PM',
    status: 'pending',
    price: 599,
    address: '456 Oak Ave, DLF Phase 2, Gurgaon',
    phone: '+91 87654 32109',
  },
  {
    id: '3',
    customerName: 'Anjali Patel',
    customerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    serviceName: 'Bathroom Deep Clean',
    date: 'Tomorrow',
    time: '10:00 AM',
    status: 'pending',
    price: 499,
    address: '789 Park Rd, Indirapuram, Ghaziabad',
    phone: '+91 76543 21098',
  },
];

export default function IncomingOrdersScreen() {
  const colors = useColors();
  const [orders, setOrders] = useState(incomingOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow'>('all');

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'today') return order.date === 'Today';
    if (filter === 'tomorrow') return order.date === 'Tomorrow';
    return true;
  });

  const handleAcceptOrder = (orderId: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: 'accepted' as const } : order
      )
    );
    setShowDetailModal(false);
  };

  const handleDeclineOrder = (orderId: string) => {
    setOrders(prevOrders =>
      prevOrders.filter(order => order.id !== orderId)
    );
    setShowDetailModal(false);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedOrder(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.customerInfo}>
          <Image source={{ uri: item.customerImage }} style={styles.customerImage} />
          <View>
            <ThemedText style={styles.customerName}>{item.customerName}</ThemedText>
            <View style={styles.serviceRow}>
              <Ionicons name="construct-outline" size={12} color={colors.textSecondary} />
              <ThemedText style={[styles.serviceName, { color: colors.textSecondary }]}>
                {item.serviceName}
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={[styles.priceBadge, { backgroundColor: colors.primary + '15' }]}>
          <ThemedText style={[styles.priceText, { color: colors.primary }]}>₹{item.price}</ThemedText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.orderDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.date}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.time}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <ThemedText 
            style={[styles.detailText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.address.split(',')[0]}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton, { borderColor: colors.error }]}
          onPress={() => handleDeclineOrder(item.id)}
        >
          <Ionicons name="close" size={18} color={colors.error} />
          <ThemedText style={[styles.actionButtonText, { color: colors.error }]}>Decline</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton, { backgroundColor: colors.primary }]}
          onPress={() => handleAcceptOrder(item.id)}
        >
          <Ionicons name="checkmark" size={18} color="#FFF" />
          <ThemedText style={[styles.actionButtonText, { color: '#FFF' }]}>Accept</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Time indicator */}
      <View style={[styles.timeIndicator, { backgroundColor: item.date === 'Today' ? colors.warning : colors.info }]}>
        <ThemedText style={styles.timeIndicatorText}>
          {item.date === 'Today' ? 'URGENT' : 'UPCOMING'}
        </ThemedText>
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
        <ThemedText style={styles.headerTitle}>Incoming Orders</ThemedText>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Banner */}
      <LinearGradient
        colors={[colors.primary, '#2D4A3E']}
        style={styles.statsBanner}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{orders.length}</ThemedText>
            <ThemedText style={styles.statLabel}>New Requests</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {orders.filter(o => o.date === 'Today').length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Today</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              ₹{orders.reduce((acc, o) => acc + o.price, 0).toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Potential</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'today', 'tomorrow'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              filter === f && { backgroundColor: colors.primary }
            ]}
            onPress={() => setFilter(f)}
          >
            <ThemedText style={[
              styles.filterText,
              { color: filter === f ? '#FFF' : colors.textSecondary }
            ]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Incoming Orders</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              New booking requests will appear here
            </ThemedText>
          </View>
        )}
      />

      {/* Order Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Order Details</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Customer Info */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    CUSTOMER
                  </ThemedText>
                  <View style={styles.modalCustomerInfo}>
                    <Image 
                      source={{ uri: selectedOrder.customerImage }} 
                      style={styles.modalCustomerImage} 
                    />
                    <View style={styles.modalCustomerDetails}>
                      <ThemedText style={styles.modalCustomerName}>
                        {selectedOrder.customerName}
                      </ThemedText>
                      <TouchableOpacity style={styles.phoneRow}>
                        <Ionicons name="call" size={14} color={colors.primary} />
                        <ThemedText style={[styles.phoneText, { color: colors.primary }]}>
                          {selectedOrder.phone}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Service Info */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    SERVICE
                  </ThemedText>
                  <View style={[styles.serviceCard, { backgroundColor: colors.background }]}>
                    <View style={[styles.serviceIcon, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name="construct" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.serviceDetails}>
                      <ThemedText style={styles.serviceTitle}>{selectedOrder.serviceName}</ThemedText>
                      <ThemedText style={[styles.servicePrice, { color: colors.primary }]}>
                        ₹{selectedOrder.price}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Schedule Info */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    SCHEDULE
                  </ThemedText>
                  <View style={styles.scheduleGrid}>
                    <View style={[styles.scheduleItem, { backgroundColor: colors.background }]}>
                      <Ionicons name="calendar" size={20} color={colors.info} />
                      <ThemedText style={styles.scheduleLabel}>Date</ThemedText>
                      <ThemedText style={styles.scheduleValue}>{selectedOrder.date}</ThemedText>
                    </View>
                    <View style={[styles.scheduleItem, { backgroundColor: colors.background }]}>
                      <Ionicons name="time" size={20} color={colors.warning} />
                      <ThemedText style={styles.scheduleLabel}>Time</ThemedText>
                      <ThemedText style={styles.scheduleValue}>{selectedOrder.time}</ThemedText>
                    </View>
                  </View>
                </View>

                {/* Address Info */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    ADDRESS
                  </ThemedText>
                  <View style={[styles.addressCard, { backgroundColor: colors.background }]}>
                    <Ionicons name="location" size={20} color={colors.error} />
                    <ThemedText style={styles.addressText}>{selectedOrder.address}</ThemedText>
                  </View>
                  <TouchableOpacity style={[styles.mapButton, { borderColor: colors.primary }]}>
                    <Ionicons name="map" size={18} color={colors.primary} />
                    <ThemedText style={[styles.mapButtonText, { color: colors.primary }]}>
                      View on Map
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.declineModalButton, { borderColor: colors.error }]}
                    onPress={() => handleDeclineOrder(selectedOrder.id)}
                  >
                    <Ionicons name="close" size={20} color={colors.error} />
                    <ThemedText style={[styles.modalActionText, { color: colors.error }]}>
                      Decline Order
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.acceptModalButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleAcceptOrder(selectedOrder.id)}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                    <ThemedText style={[styles.modalActionText, { color: '#FFF' }]}>
                      Accept Order
                    </ThemedText>
                  </TouchableOpacity>
                </View>
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
  statsBanner: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  orderCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceName: {
    fontSize: 13,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  declineButton: {
    borderWidth: 1,
  },
  acceptButton: {},
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeIndicator: {
    position: 'absolute',
    top: 0,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  timeIndicatorText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
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
    fontSize: 20,
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 1,
  },
  modalCustomerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  modalCustomerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  modalCustomerDetails: {},
  modalCustomerName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneText: {
    fontSize: 14,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceDetails: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  scheduleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleItem: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  scheduleLabel: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 2,
  },
  scheduleValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingBottom: 20,
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
  declineModalButton: {
    borderWidth: 1,
  },
  acceptModalButton: {},
  modalActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
