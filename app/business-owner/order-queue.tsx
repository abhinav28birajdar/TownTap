import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
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

interface QueueOrder {
  id: string;
  customerName: string;
  customerImage: string;
  serviceName: string;
  scheduledTime: string;
  estimatedDuration: number;
  assignedTo: string | null;
  status: 'waiting' | 'assigned' | 'in-progress' | 'completed';
  priority: 'normal' | 'high' | 'urgent';
  price: number;
  notes: string;
}

interface Staff {
  id: string;
  name: string;
  image: string;
  available: boolean;
  currentJob: string | null;
}

const queueOrders: QueueOrder[] = [
  {
    id: '1',
    customerName: 'Priya Sharma',
    customerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    serviceName: 'Deep Home Cleaning',
    scheduledTime: '10:00 AM',
    estimatedDuration: 3,
    assignedTo: null,
    status: 'waiting',
    priority: 'normal',
    price: 999,
    notes: '',
  },
  {
    id: '2',
    customerName: 'Rahul Kumar',
    customerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    serviceName: 'AC Repair',
    scheduledTime: '11:30 AM',
    estimatedDuration: 2,
    assignedTo: 'Amit',
    status: 'in-progress',
    priority: 'high',
    price: 1499,
    notes: 'Customer mentioned AC not cooling',
  },
  {
    id: '3',
    customerName: 'Anjali Patel',
    customerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    serviceName: 'Bathroom Cleaning',
    scheduledTime: '2:00 PM',
    estimatedDuration: 1.5,
    assignedTo: 'Ravi',
    status: 'assigned',
    priority: 'normal',
    price: 499,
    notes: '',
  },
  {
    id: '4',
    customerName: 'Vikram Singh',
    customerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    serviceName: 'Plumbing Repair',
    scheduledTime: '3:30 PM',
    estimatedDuration: 2,
    assignedTo: null,
    status: 'waiting',
    priority: 'urgent',
    price: 799,
    notes: 'Pipe leakage - urgent',
  },
];

const staffMembers: Staff[] = [
  {
    id: '1',
    name: 'Amit Kumar',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100',
    available: false,
    currentJob: 'AC Repair',
  },
  {
    id: '2',
    name: 'Ravi Sharma',
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
    available: true,
    currentJob: null,
  },
  {
    id: '3',
    name: 'Suresh Patel',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    available: true,
    currentJob: null,
  },
];

export default function OrderQueueScreen() {
  const colors = useColors();
  const [orders, setOrders] = useState(queueOrders);
  const [selectedOrder, setSelectedOrder] = useState<QueueOrder | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const getPriorityColor = (priority: QueueOrder['priority']) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      default: return colors.info;
    }
  };

  const getStatusColor = (status: QueueOrder['status']) => {
    switch (status) {
      case 'waiting': return colors.warning;
      case 'assigned': return colors.info;
      case 'in-progress': return colors.primary;
      case 'completed': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const handleAssignStaff = (orderId: string, staffName: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId 
          ? { ...order, assignedTo: staffName, status: 'assigned' as const }
          : order
      )
    );
    setShowAssignModal(false);
  };

  const handleStartJob = (orderId: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'in-progress' as const }
          : order
      )
    );
  };

  const handleCompleteJob = (orderId: string) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'completed' as const }
          : order
      )
    );
  };

  const renderOrder = ({ item, index }: { item: QueueOrder; index: number }) => (
    <View style={[styles.orderCard, { backgroundColor: colors.card }]}>
      {/* Priority indicator */}
      <View style={[styles.priorityBar, { backgroundColor: getPriorityColor(item.priority) }]} />
      
      <View style={styles.cardContent}>
        {/* Queue Position */}
        <View style={[styles.queuePosition, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.queueNumber, { color: colors.primary }]}>
            #{index + 1}
          </ThemedText>
        </View>

        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <View style={styles.customerSection}>
              <Image source={{ uri: item.customerImage }} style={styles.customerImage} />
              <View>
                <ThemedText style={styles.customerName}>{item.customerName}</ThemedText>
                <ThemedText style={[styles.serviceName, { color: colors.textSecondary }]}>
                  {item.serviceName}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
              <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.scheduledTime}
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="hourglass-outline" size={14} color={colors.textSecondary} />
              <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.estimatedDuration}h
              </ThemedText>
            </View>
            <View style={styles.detailItem}>
              <ThemedText style={[styles.priceText, { color: colors.primary }]}>
                ₹{item.price}
              </ThemedText>
            </View>
          </View>

          {item.assignedTo && (
            <View style={[styles.assignedSection, { backgroundColor: colors.background }]}>
              <Ionicons name="person" size={14} color={colors.success} />
              <ThemedText style={[styles.assignedText, { color: colors.success }]}>
                Assigned to {item.assignedTo}
              </ThemedText>
            </View>
          )}

          {item.notes && (
            <View style={[styles.notesSection, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="alert-circle" size={14} color={colors.warning} />
              <ThemedText style={[styles.notesText, { color: colors.warning }]}>
                {item.notes}
              </ThemedText>
            </View>
          )}

          <View style={styles.actionButtons}>
            {item.status === 'waiting' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setSelectedOrder(item);
                  setShowAssignModal(true);
                }}
              >
                <Ionicons name="person-add" size={16} color="#FFF" />
                <ThemedText style={styles.actionButtonText}>Assign</ThemedText>
              </TouchableOpacity>
            )}
            {item.status === 'assigned' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                onPress={() => handleStartJob(item.id)}
              >
                <Ionicons name="play" size={16} color="#FFF" />
                <ThemedText style={styles.actionButtonText}>Start</ThemedText>
              </TouchableOpacity>
            )}
            {item.status === 'in-progress' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.info }]}
                onPress={() => handleCompleteJob(item.id)}
              >
                <Ionicons name="checkmark-done" size={16} color="#FFF" />
                <ThemedText style={styles.actionButtonText}>Complete</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.outlineButton, { borderColor: colors.border }]}
              onPress={() => router.push(`/orders/${item.id}` as any)}
            >
              <Ionicons name="eye-outline" size={16} color={colors.text} />
              <ThemedText style={[styles.actionButtonText, { color: colors.text }]}>View</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Order Queue</ThemedText>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
          <ThemedText style={[styles.statNumber, { color: colors.warning }]}>
            {orders.filter(o => o.status === 'waiting').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Waiting</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.info + '15' }]}>
          <ThemedText style={[styles.statNumber, { color: colors.info }]}>
            {orders.filter(o => o.status === 'assigned').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Assigned</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
          <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
            {orders.filter(o => o.status === 'in-progress').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>In Progress</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
          <ThemedText style={[styles.statNumber, { color: colors.success }]}>
            {orders.filter(o => o.status === 'completed').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Done</ThemedText>
        </View>
      </View>

      {/* Available Staff */}
      <View style={styles.staffSection}>
        <ThemedText style={styles.sectionTitle}>Available Staff</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {staffMembers.map((staff) => (
            <View 
              key={staff.id} 
              style={[
                styles.staffCard, 
                { 
                  backgroundColor: colors.card,
                  opacity: staff.available ? 1 : 0.5
                }
              ]}
            >
              <Image source={{ uri: staff.image }} style={styles.staffImage} />
              <ThemedText style={styles.staffName} numberOfLines={1}>{staff.name}</ThemedText>
              {staff.available ? (
                <View style={[styles.availableBadge, { backgroundColor: colors.success }]}>
                  <ThemedText style={styles.availableText}>Free</ThemedText>
                </View>
              ) : (
                <ThemedText style={[styles.busyText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {staff.currentJob}
                </ThemedText>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'waiting', 'assigned', 'in-progress', 'completed'].map((status) => (
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
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Queue List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Orders in Queue</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              All orders have been processed
            </ThemedText>
          </View>
        )}
      />

      {/* Assign Staff Modal */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Assign Staff</ThemedText>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <>
                <View style={[styles.orderPreview, { backgroundColor: colors.background }]}>
                  <ThemedText style={styles.orderPreviewService}>
                    {selectedOrder.serviceName}
                  </ThemedText>
                  <ThemedText style={[styles.orderPreviewCustomer, { color: colors.textSecondary }]}>
                    for {selectedOrder.customerName} at {selectedOrder.scheduledTime}
                  </ThemedText>
                </View>

                <ThemedText style={[styles.selectStaffLabel, { color: colors.textSecondary }]}>
                  Select available staff member:
                </ThemedText>

                {staffMembers.filter(s => s.available).map((staff) => (
                  <TouchableOpacity
                    key={staff.id}
                    style={[styles.staffOption, { borderColor: colors.border }]}
                    onPress={() => handleAssignStaff(selectedOrder.id, staff.name)}
                  >
                    <Image source={{ uri: staff.image }} style={styles.staffOptionImage} />
                    <View style={styles.staffOptionInfo}>
                      <ThemedText style={styles.staffOptionName}>{staff.name}</ThemedText>
                      <ThemedText style={[styles.staffOptionStatus, { color: colors.success }]}>
                        Available
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}

                {staffMembers.filter(s => s.available).length === 0 && (
                  <View style={styles.noStaffAvailable}>
                    <Ionicons name="alert-circle-outline" size={40} color={colors.warning} />
                    <ThemedText style={[styles.noStaffText, { color: colors.textSecondary }]}>
                      No staff members currently available
                    </ThemedText>
                  </View>
                )}
              </>
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
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  staffSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  staffCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginLeft: 16,
    width: 90,
  },
  staffImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 6,
  },
  staffName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  availableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  availableText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  busyText: {
    fontSize: 10,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  orderCard: {
    flexDirection: 'row',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  priorityBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
  },
  queuePosition: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  queueNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  orderInfo: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  customerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  assignedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 10,
  },
  assignedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 12,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  outlineButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  orderPreview: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  orderPreviewService: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderPreviewCustomer: {
    fontSize: 13,
  },
  selectStaffLabel: {
    fontSize: 13,
    marginBottom: 12,
  },
  staffOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  staffOptionImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  staffOptionInfo: {
    flex: 1,
  },
  staffOptionName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  staffOptionStatus: {
    fontSize: 12,
  },
  noStaffAvailable: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noStaffText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});
