import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface StaffMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'on-leave';
  joinDate: string;
  rating: number;
  completedOrders: number;
  skills: string[];
  schedule: { day: string; start: string; end: string }[];
}

const staffMembers: StaffMember[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=415D43&color=fff',
    role: 'Senior Technician',
    phone: '+91 98765 43210',
    email: 'rajesh@example.com',
    status: 'active',
    joinDate: 'Mar 15, 2023',
    rating: 4.9,
    completedOrders: 245,
    skills: ['AC Repair', 'Electrical', 'Plumbing'],
    schedule: [
      { day: 'Mon', start: '09:00', end: '18:00' },
      { day: 'Tue', start: '09:00', end: '18:00' },
      { day: 'Wed', start: '09:00', end: '18:00' },
      { day: 'Thu', start: '09:00', end: '18:00' },
      { day: 'Fri', start: '09:00', end: '18:00' },
    ],
  },
  {
    id: '2',
    name: 'Priya Singh',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Singh&background=7D5A50&color=fff',
    role: 'Cleaning Specialist',
    phone: '+91 98765 43211',
    email: 'priya@example.com',
    status: 'active',
    joinDate: 'Jun 20, 2023',
    rating: 4.8,
    completedOrders: 189,
    skills: ['Deep Cleaning', 'Sanitization', 'Carpet Cleaning'],
    schedule: [
      { day: 'Mon', start: '08:00', end: '17:00' },
      { day: 'Tue', start: '08:00', end: '17:00' },
      { day: 'Wed', start: '08:00', end: '17:00' },
      { day: 'Sat', start: '09:00', end: '14:00' },
    ],
  },
  {
    id: '3',
    name: 'Amit Verma',
    avatar: 'https://ui-avatars.com/api/?name=Amit+Verma&background=5D6D7E&color=fff',
    role: 'Plumber',
    phone: '+91 98765 43212',
    email: 'amit@example.com',
    status: 'on-leave',
    joinDate: 'Sep 10, 2023',
    rating: 4.7,
    completedOrders: 134,
    skills: ['Pipe Repair', 'Installation', 'Leakage Fix'],
    schedule: [
      { day: 'Tue', start: '10:00', end: '19:00' },
      { day: 'Wed', start: '10:00', end: '19:00' },
      { day: 'Thu', start: '10:00', end: '19:00' },
      { day: 'Fri', start: '10:00', end: '19:00' },
      { day: 'Sat', start: '10:00', end: '16:00' },
    ],
  },
  {
    id: '4',
    name: 'Neha Gupta',
    avatar: 'https://ui-avatars.com/api/?name=Neha+Gupta&background=A0522D&color=fff',
    role: 'Electrician',
    phone: '+91 98765 43213',
    email: 'neha@example.com',
    status: 'inactive',
    joinDate: 'Jan 5, 2024',
    rating: 4.6,
    completedOrders: 78,
    skills: ['Wiring', 'Installation', 'Repair'],
    schedule: [],
  },
];

export default function StaffManagementScreen() {
  const colors = useColors();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredStaff = staffMembers.filter(staff => {
    if (filterStatus === 'all') return true;
    return staff.status === filterStatus;
  });

  const getStatusColor = (status: StaffMember['status']) => {
    switch (status) {
      case 'active': return colors.success;
      case 'on-leave': return colors.warning;
      case 'inactive': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const activeCount = staffMembers.filter(s => s.status === 'active').length;
  const onLeaveCount = staffMembers.filter(s => s.status === 'on-leave').length;
  const totalOrders = staffMembers.reduce((acc, s) => acc + s.completedOrders, 0);

  const renderStaffCard = (item: StaffMember) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.staffCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedStaff(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.staffHeader}>
        <Image source={{ uri: item.avatar }} style={styles.staffAvatar} />
        <View style={styles.staffInfo}>
          <ThemedText style={styles.staffName}>{item.name}</ThemedText>
          <ThemedText style={[styles.staffRole, { color: colors.textSecondary }]}>
            {item.role}
          </ThemedText>
        </View>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
      </View>

      <View style={styles.staffStats}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={14} color={colors.warning} />
          <ThemedText style={[styles.statValue, { color: colors.text }]}>
            {item.rating}
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <ThemedText style={[styles.statValue, { color: colors.text }]}>
            {item.completedOrders} orders
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="calendar" size={14} color={colors.info} />
          <ThemedText style={[styles.statValue, { color: colors.text }]}>
            {item.schedule.length} days
          </ThemedText>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {item.skills.slice(0, 3).map((skill, index) => (
          <View
            key={index}
            style={[styles.skillBadge, { backgroundColor: colors.primary + '15' }]}
          >
            <ThemedText style={[styles.skillText, { color: colors.primary }]}>
              {skill}
            </ThemedText>
          </View>
        ))}
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
        <ThemedText style={styles.headerTitle}>Staff Management</ThemedText>
        <TouchableOpacity>
          <Ionicons name="person-add-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <LinearGradient
          colors={[colors.primary, '#2d4a2f']}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <ThemedText style={styles.statBlockValue}>{staffMembers.length}</ThemedText>
              <ThemedText style={styles.statBlockLabel}>Total Staff</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.statBlock}>
              <ThemedText style={styles.statBlockValue}>{activeCount}</ThemedText>
              <ThemedText style={styles.statBlockLabel}>Active</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.statBlock}>
              <ThemedText style={styles.statBlockValue}>{onLeaveCount}</ThemedText>
              <ThemedText style={styles.statBlockLabel}>On Leave</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.statBlock}>
              <ThemedText style={styles.statBlockValue}>{totalOrders}</ThemedText>
              <ThemedText style={styles.statBlockLabel}>Orders</ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'on-leave', label: 'On Leave' },
              { key: 'inactive', label: 'Inactive' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  filterStatus === filter.key && { backgroundColor: colors.primary }
                ]}
                onPress={() => setFilterStatus(filter.key)}
              >
                <ThemedText style={[
                  styles.filterText,
                  { color: filterStatus === filter.key ? '#FFF' : colors.textSecondary }
                ]}>
                  {filter.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Staff List */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Staff Members ({filteredStaff.length})
          </ThemedText>
          {filteredStaff.length > 0 ? (
            filteredStaff.map(renderStaffCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Staff Found</ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                No staff members match this filter
              </ThemedText>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Staff Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Staff Details</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedStaff && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                  <Image
                    source={{ uri: selectedStaff.avatar }}
                    style={styles.profileAvatar}
                  />
                  <ThemedText style={styles.profileName}>{selectedStaff.name}</ThemedText>
                  <ThemedText style={[styles.profileRole, { color: colors.textSecondary }]}>
                    {selectedStaff.role}
                  </ThemedText>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedStaff.status) + '15' }
                  ]}>
                    <View style={[styles.statusBadgeDot, { backgroundColor: getStatusColor(selectedStaff.status) }]} />
                    <ThemedText style={[styles.statusBadgeText, { color: getStatusColor(selectedStaff.status) }]}>
                      {selectedStaff.status.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </ThemedText>
                  </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={[styles.gridItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="star" size={24} color={colors.warning} />
                    <ThemedText style={styles.gridValue}>{selectedStaff.rating}</ThemedText>
                    <ThemedText style={[styles.gridLabel, { color: colors.textSecondary }]}>
                      Rating
                    </ThemedText>
                  </View>
                  <View style={[styles.gridItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    <ThemedText style={styles.gridValue}>{selectedStaff.completedOrders}</ThemedText>
                    <ThemedText style={[styles.gridLabel, { color: colors.textSecondary }]}>
                      Orders
                    </ThemedText>
                  </View>
                  <View style={[styles.gridItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="calendar" size={24} color={colors.info} />
                    <ThemedText style={styles.gridValue}>{selectedStaff.joinDate.split(' ')[0]}</ThemedText>
                    <ThemedText style={[styles.gridLabel, { color: colors.textSecondary }]}>
                      Since
                    </ThemedText>
                  </View>
                </View>

                {/* Contact Info */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    CONTACT INFORMATION
                  </ThemedText>
                  <View style={[styles.contactCard, { backgroundColor: colors.background }]}>
                    <View style={styles.contactRow}>
                      <Ionicons name="call-outline" size={18} color={colors.primary} />
                      <ThemedText style={styles.contactText}>{selectedStaff.phone}</ThemedText>
                    </View>
                    <View style={styles.contactRow}>
                      <Ionicons name="mail-outline" size={18} color={colors.primary} />
                      <ThemedText style={styles.contactText}>{selectedStaff.email}</ThemedText>
                    </View>
                  </View>
                </View>

                {/* Skills */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    SKILLS
                  </ThemedText>
                  <View style={styles.skillsList}>
                    {selectedStaff.skills.map((skill, index) => (
                      <View
                        key={index}
                        style={[styles.skillBadgeLarge, { backgroundColor: colors.primary + '15' }]}
                      >
                        <Ionicons name="checkmark" size={14} color={colors.primary} />
                        <ThemedText style={[styles.skillTextLarge, { color: colors.primary }]}>
                          {skill}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Schedule */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    WORK SCHEDULE
                  </ThemedText>
                  {selectedStaff.schedule.length > 0 ? (
                    <View style={[styles.scheduleCard, { backgroundColor: colors.background }]}>
                      {selectedStaff.schedule.map((slot, index) => (
                        <View key={index} style={styles.scheduleRow}>
                          <ThemedText style={styles.scheduleDay}>{slot.day}</ThemedText>
                          <ThemedText style={[styles.scheduleTime, { color: colors.textSecondary }]}>
                            {slot.start} - {slot.end}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={[styles.noScheduleCard, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.noScheduleText, { color: colors.textSecondary }]}>
                        No schedule assigned
                      </ThemedText>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: colors.info }]}
                  >
                    <Ionicons name="call" size={18} color="#FFF" />
                    <ThemedText style={styles.modalActionText}>Call</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="create" size={18} color="#FFF" />
                    <ThemedText style={styles.modalActionText}>Edit</ThemedText>
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
  statsCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statBlockValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  statBlockLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  staffCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  staffInfo: {
    flex: 1,
    marginLeft: 12,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  staffRole: {
    fontSize: 13,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  staffStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 13,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  skillText: {
    fontSize: 11,
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  gridValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 12,
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
  contactCard: {
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  skillTextLarge: {
    fontSize: 13,
    fontWeight: '500',
  },
  scheduleCard: {
    padding: 14,
    borderRadius: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleTime: {
    fontSize: 13,
  },
  noScheduleCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  noScheduleText: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
});
