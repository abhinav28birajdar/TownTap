import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RecurringService {
  id: string;
  serviceName: string;
  businessName: string;
  frequency: string;
  nextDate: string;
  time: string;
  price: number;
  status: 'active' | 'paused' | 'cancelled';
  totalBookings: number;
  completedBookings: number;
}

const recurringServices: RecurringService[] = [
  {
    id: '1',
    serviceName: 'Deep Home Cleaning',
    businessName: 'Sparkle Cleaners',
    frequency: 'Weekly',
    nextDate: 'Sat, Dec 28, 2024',
    time: '10:00 AM',
    price: 999,
    status: 'active',
    totalBookings: 12,
    completedBookings: 8,
  },
  {
    id: '2',
    serviceName: 'AC Maintenance',
    businessName: 'AC Cool Services',
    frequency: 'Monthly',
    nextDate: 'Jan 15, 2025',
    time: '02:00 PM',
    price: 499,
    status: 'active',
    totalBookings: 6,
    completedBookings: 4,
  },
  {
    id: '3',
    serviceName: 'Pest Control',
    businessName: 'BugFree Services',
    frequency: 'Quarterly',
    nextDate: 'Mar 01, 2025',
    time: '11:00 AM',
    price: 1499,
    status: 'paused',
    totalBookings: 4,
    completedBookings: 2,
  },
];

export default function RecurringServicesScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedService, setSelectedService] = useState<RecurringService | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const activeServices = recurringServices.filter(s => s.status !== 'cancelled');
  const historyServices = recurringServices.filter(s => s.status === 'cancelled');

  const getStatusColor = (status: RecurringService['status']) => {
    switch (status) {
      case 'active': return colors.success;
      case 'paused': return colors.warning;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'daily': return 'today';
      case 'weekly': return 'calendar';
      case 'bi-weekly': return 'calendar-outline';
      case 'monthly': return 'calendar-number';
      case 'quarterly': return 'calendar-clear';
      default: return 'repeat';
    }
  };

  const handlePauseResume = (service: RecurringService) => {
    const action = service.status === 'paused' ? 'resume' : 'pause';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Service`,
      `Are you sure you want to ${action} ${service.serviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: action.charAt(0).toUpperCase() + action.slice(1), onPress: () => {} },
      ]
    );
  };

  const handleCancel = (service: RecurringService) => {
    Alert.alert(
      'Cancel Recurring Service',
      `Are you sure you want to cancel ${service.serviceName}? This will cancel all future bookings.`,
      [
        { text: 'Keep Service', style: 'cancel' },
        { 
          text: 'Cancel Service', 
          style: 'destructive',
          onPress: () => {} 
        },
      ]
    );
  };

  const renderService = ({ item }: { item: RecurringService }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedService(item);
        setShowActionModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.frequencyBadge, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={getFrequencyIcon(item.frequency) as any} size={14} color={colors.primary} />
          <ThemedText style={[styles.frequencyText, { color: colors.primary }]}>
            {item.frequency}
          </ThemedText>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + '15' }
        ]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.serviceName}>{item.serviceName}</ThemedText>
      <ThemedText style={[styles.businessName, { color: colors.textSecondary }]}>
        {item.businessName}
      </ThemedText>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.scheduleInfo}>
        <View style={styles.scheduleItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.scheduleText, { color: colors.textSecondary }]}>
            Next: {item.nextDate}
          </ThemedText>
        </View>
        <View style={styles.scheduleItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.scheduleText, { color: colors.textSecondary }]}>
            {item.time}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.progressInfo}>
          <ThemedText style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Completed
          </ThemedText>
          <ThemedText style={styles.progressValue}>
            {item.completedBookings}/{item.totalBookings}
          </ThemedText>
        </View>
        <View style={styles.priceInfo}>
          <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>
            Per Service
          </ThemedText>
          <ThemedText style={[styles.priceValue, { color: colors.primary }]}>
            ₹{item.price}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              backgroundColor: colors.primary,
              width: `${(item.completedBookings / item.totalBookings) * 100}%` 
            }
          ]} 
        />
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
        <ThemedText style={styles.headerTitle}>Recurring Services</ThemedText>
        <TouchableOpacity onPress={() => router.push('/booking/schedule')}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <LinearGradient
        colors={[colors.primary, '#2D4A3E']}
        style={styles.statsCard}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{activeServices.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Active</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {recurringServices.reduce((acc, s) => acc + s.completedBookings, 0)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Completed</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              ₹{recurringServices.reduce((acc, s) => acc + (s.completedBookings * s.price), 0).toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Spent</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('active')}
        >
          <ThemedText style={[styles.tabText, { color: activeTab === 'active' ? '#FFF' : colors.textSecondary }]}>
            Active ({activeServices.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('history')}
        >
          <ThemedText style={[styles.tabText, { color: activeTab === 'history' ? '#FFF' : colors.textSecondary }]}>
            History
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <FlatList
        data={activeTab === 'active' ? activeServices : historyServices}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="repeat-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Recurring Services</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Set up recurring services to automate your regular bookings
            </ThemedText>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/booking/schedule')}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <ThemedText style={styles.addButtonText}>Add Recurring Service</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{selectedService?.serviceName}</ThemedText>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalAction, { backgroundColor: colors.background }]}
                onPress={() => {
                  setShowActionModal(false);
                  router.push(`/orders/${selectedService?.id}` as any);
                }}
              >
                <View style={[styles.modalActionIcon, { backgroundColor: colors.info + '15' }]}>
                  <Ionicons name="eye" size={22} color={colors.info} />
                </View>
                <ThemedText style={styles.modalActionText}>View Details</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalAction, { backgroundColor: colors.background }]}
                onPress={() => {
                  setShowActionModal(false);
                  router.push('/booking/schedule');
                }}
              >
                <View style={[styles.modalActionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="create" size={22} color={colors.primary} />
                </View>
                <ThemedText style={styles.modalActionText}>Edit Schedule</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalAction, { backgroundColor: colors.background }]}
                onPress={() => {
                  setShowActionModal(false);
                  if (selectedService) handlePauseResume(selectedService);
                }}
              >
                <View style={[styles.modalActionIcon, { backgroundColor: colors.warning + '15' }]}>
                  <Ionicons 
                    name={selectedService?.status === 'paused' ? 'play' : 'pause'} 
                    size={22} 
                    color={colors.warning} 
                  />
                </View>
                <ThemedText style={styles.modalActionText}>
                  {selectedService?.status === 'paused' ? 'Resume Service' : 'Pause Service'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalAction, { backgroundColor: colors.background }]}
                onPress={() => {
                  setShowActionModal(false);
                  // Navigate to chat
                }}
              >
                <View style={[styles.modalActionIcon, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="chatbubble" size={22} color={colors.success} />
                </View>
                <ThemedText style={styles.modalActionText}>Contact Provider</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalAction, { backgroundColor: colors.error + '10' }]}
                onPress={() => {
                  setShowActionModal(false);
                  if (selectedService) handleCancel(selectedService);
                }}
              >
                <View style={[styles.modalActionIcon, { backgroundColor: colors.error + '15' }]}>
                  <Ionicons name="trash" size={22} color={colors.error} />
                </View>
                <ThemedText style={[styles.modalActionText, { color: colors.error }]}>
                  Cancel Service
                </ThemedText>
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
  statsCard: {
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  scheduleInfo: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressInfo: {},
  progressLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
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
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalActions: {
    gap: 10,
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  modalActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
