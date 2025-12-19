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
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ScheduledService {
  id: string;
  service: {
    name: string;
    image: string;
    category: string;
  };
  provider: {
    name: string;
    avatar: string;
    rating: number;
  };
  dateTime: string;
  duration: string;
  price: number;
  address: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  reminders: boolean;
  notes?: string;
}

const mockSchedules: ScheduledService[] = [
  {
    id: '1',
    service: {
      name: 'Deep House Cleaning',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
      category: 'Home Services',
    },
    provider: {
      name: 'CleanPro Services',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 4.8,
    },
    dateTime: 'Today, 2:00 PM',
    duration: '3 hours',
    price: 1500,
    address: '123 Main Street, Mumbai',
    status: 'upcoming',
    reminders: true,
  },
  {
    id: '2',
    service: {
      name: 'AC Service & Repair',
      image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
      category: 'Appliance Repair',
    },
    provider: {
      name: 'CoolTech Solutions',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      rating: 4.6,
    },
    dateTime: 'Tomorrow, 10:00 AM',
    duration: '1.5 hours',
    price: 800,
    address: '123 Main Street, Mumbai',
    status: 'upcoming',
    reminders: true,
    notes: 'Please bring spare filters',
  },
  {
    id: '3',
    service: {
      name: 'Plumbing Services',
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
      category: 'Home Services',
    },
    provider: {
      name: 'QuickFix Plumbing',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      rating: 4.5,
    },
    dateTime: 'Sat, Jan 25, 11:00 AM',
    duration: '2 hours',
    price: 600,
    address: '123 Main Street, Mumbai',
    status: 'upcoming',
    reminders: false,
  },
  {
    id: '4',
    service: {
      name: 'Car Wash & Detailing',
      image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400',
      category: 'Automotive',
    },
    provider: {
      name: 'SparkleWash Auto',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      rating: 4.9,
    },
    dateTime: 'Sun, Jan 26, 9:00 AM',
    duration: '2 hours',
    price: 1200,
    address: 'B-42, Industrial Area',
    status: 'upcoming',
    reminders: true,
  },
];

export default function UpcomingScheduleScreen() {
  const colors = useColors();
  const [schedules, setSchedules] = useState<ScheduledService[]>(mockSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledService | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return colors.info;
      case 'in-progress':
        return colors.primary;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const handleCancelSchedule = () => {
    if (selectedSchedule) {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === selectedSchedule.id ? { ...s, status: 'cancelled' as const } : s
        )
      );
      setShowCancelModal(false);
      setShowDetailsModal(false);
    }
  };

  const toggleReminder = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, reminders: !s.reminders } : s))
    );
  };

  const filteredSchedules = schedules.filter((s) => {
    if (filter === 'today') {
      return s.dateTime.toLowerCase().includes('today');
    }
    if (filter === 'week') {
      return !s.dateTime.toLowerCase().includes('jan 3');
    }
    return true;
  });

  const renderSchedule = ({ item }: { item: ScheduledService }) => (
    <TouchableOpacity
      style={[styles.scheduleCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedSchedule(item);
        setShowDetailsModal(true);
      }}
    >
      <Image source={{ uri: item.service.image }} style={styles.serviceImage} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
              {item.service.category}
            </ThemedText>
          </View>
          {item.reminders && (
            <Ionicons name="notifications" size={16} color={colors.info} />
          )}
        </View>

        <ThemedText style={styles.serviceName}>{item.service.name}</ThemedText>

        <View style={styles.providerRow}>
          <Image source={{ uri: item.provider.avatar }} style={styles.providerAvatar} />
          <ThemedText style={[styles.providerName, { color: colors.textSecondary }]}>
            {item.provider.name}
          </ThemedText>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <ThemedText style={styles.ratingText}>{item.provider.rating}</ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.scheduleDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={14} color={colors.primary} />
            <ThemedText style={[styles.detailText, { color: colors.text }]}>
              {item.dateTime}
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.duration}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <ThemedText style={[styles.price, { color: colors.primary }]}>₹{item.price}</ThemedText>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '15' },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]}
            />
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </ThemedText>
          </View>
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
        <ThemedText style={styles.headerTitle}>Upcoming Schedule</ThemedText>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summarySection}>
        <LinearGradient
          colors={[colors.primary, colors.primary + 'DD']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryValue}>
                {schedules.filter((s) => s.status === 'upcoming').length}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Upcoming</ThemedText>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryValue}>
                {schedules.filter((s) => s.dateTime.toLowerCase().includes('today')).length}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Today</ThemedText>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryValue}>
                ₹{schedules.reduce((acc, s) => acc + s.price, 0).toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Total Value</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        {(['all', 'today', 'week'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              filter === f && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter(f)}
          >
            <ThemedText
              style={[styles.filterText, { color: filter === f ? '#fff' : colors.text }]}
            >
              {f === 'all' ? 'All' : f === 'today' ? 'Today' : 'This Week'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Schedule List */}
      <FlatList
        data={filteredSchedules}
        keyExtractor={(item) => item.id}
        renderItem={renderSchedule}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Scheduled Services</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              You don't have any scheduled services
            </ThemedText>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/home')}
            >
              <ThemedText style={styles.emptyBtnText}>Book a Service</ThemedText>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Details Modal */}
      <Modal visible={showDetailsModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetailsModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />

            {selectedSchedule && (
              <>
                <Image
                  source={{ uri: selectedSchedule.service.image }}
                  style={styles.modalImage}
                />

                <View style={styles.modalContent}>
                  <ThemedText style={styles.modalTitle}>
                    {selectedSchedule.service.name}
                  </ThemedText>

                  <View style={styles.modalProvider}>
                    <Image
                      source={{ uri: selectedSchedule.provider.avatar }}
                      style={styles.modalProviderAvatar}
                    />
                    <View>
                      <ThemedText style={styles.modalProviderName}>
                        {selectedSchedule.provider.name}
                      </ThemedText>
                      <View style={styles.modalRating}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <ThemedText style={styles.modalRatingText}>
                          {selectedSchedule.provider.rating}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalDetails}>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="calendar" size={18} color={colors.primary} />
                      <ThemedText style={styles.modalDetailText}>
                        {selectedSchedule.dateTime}
                      </ThemedText>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="time" size={18} color={colors.textSecondary} />
                      <ThemedText style={styles.modalDetailText}>
                        Duration: {selectedSchedule.duration}
                      </ThemedText>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="location" size={18} color={colors.textSecondary} />
                      <ThemedText style={styles.modalDetailText}>
                        {selectedSchedule.address}
                      </ThemedText>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="wallet" size={18} color={colors.primary} />
                      <ThemedText style={[styles.modalDetailText, { fontWeight: '600' }]}>
                        ₹{selectedSchedule.price}
                      </ThemedText>
                    </View>
                  </View>

                  {selectedSchedule.notes && (
                    <View style={[styles.notesSection, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.notesLabel, { color: colors.textSecondary }]}>
                        Notes:
                      </ThemedText>
                      <ThemedText style={styles.notesText}>{selectedSchedule.notes}</ThemedText>
                    </View>
                  )}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.reminderBtn, { borderColor: colors.info }]}
                      onPress={() => toggleReminder(selectedSchedule.id)}
                    >
                      <Ionicons
                        name={selectedSchedule.reminders ? 'notifications' : 'notifications-off'}
                        size={18}
                        color={colors.info}
                      />
                      <ThemedText style={[styles.reminderBtnText, { color: colors.info }]}>
                        {selectedSchedule.reminders ? 'Reminder On' : 'Reminder Off'}
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rescheduleBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        setShowDetailsModal(false);
                        router.push('/booking/reschedule');
                      }}
                    >
                      <Ionicons name="calendar" size={18} color="#fff" />
                      <ThemedText style={styles.rescheduleBtnText}>Reschedule</ThemedText>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: colors.error }]}
                    onPress={() => {
                      setShowDetailsModal(false);
                      setShowCancelModal(true);
                    }}
                  >
                    <ThemedText style={[styles.cancelBtnText, { color: colors.error }]}>
                      Cancel Booking
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmModal, { backgroundColor: colors.card }]}>
            <View style={[styles.confirmIcon, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="warning" size={36} color={colors.error} />
            </View>
            <ThemedText style={styles.confirmTitle}>Cancel Booking?</ThemedText>
            <ThemedText style={[styles.confirmDesc, { color: colors.textSecondary }]}>
              Are you sure you want to cancel this booking? Cancellation charges may apply.
            </ThemedText>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.background }]}
                onPress={() => setShowCancelModal(false)}
              >
                <ThemedText style={styles.confirmBtnTextDark}>Keep Booking</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.error }]}
                onPress={handleCancelSchedule}
              >
                <ThemedText style={styles.confirmBtnTextLight}>Yes, Cancel</ThemedText>
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
  summarySection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  scheduleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  serviceImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#415D4310',
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  providerName: {
    fontSize: 13,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  scheduleDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalProvider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalProviderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  modalProviderName: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  modalRatingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalDetails: {
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  modalDetailText: {
    fontSize: 15,
  },
  notesSection: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  reminderBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rescheduleBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  confirmDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnTextDark: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtnTextLight: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
