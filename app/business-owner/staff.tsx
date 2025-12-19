import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
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
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  avatar: string | null;
  status: 'active' | 'inactive' | 'on_leave';
  assignedServices: string[];
  rating: number;
  completedJobs: number;
  joinDate: string;
}

const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    role: 'Senior Technician',
    phone: '+91 98765 43210',
    email: 'rajesh@example.com',
    avatar: null,
    status: 'active',
    assignedServices: ['AC Repair', 'Electrical'],
    rating: 4.8,
    completedJobs: 234,
    joinDate: 'Jan 2022',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    role: 'Cleaning Specialist',
    phone: '+91 87654 32109',
    email: 'priya@example.com',
    avatar: null,
    status: 'active',
    assignedServices: ['Home Cleaning', 'Deep Cleaning'],
    rating: 4.9,
    completedJobs: 189,
    joinDate: 'Mar 2022',
  },
  {
    id: '3',
    name: 'Amit Singh',
    role: 'Plumber',
    phone: '+91 76543 21098',
    email: 'amit@example.com',
    avatar: null,
    status: 'on_leave',
    assignedServices: ['Plumbing Repair', 'Water Tank'],
    rating: 4.6,
    completedJobs: 156,
    joinDate: 'Jun 2022',
  },
  {
    id: '4',
    name: 'Sneha Patel',
    role: 'Pest Control Expert',
    phone: '+91 65432 10987',
    email: 'sneha@example.com',
    avatar: null,
    status: 'inactive',
    assignedServices: ['Pest Control', 'Termite Treatment'],
    rating: 4.7,
    completedJobs: 98,
    joinDate: 'Sep 2022',
  },
  {
    id: '5',
    name: 'Vikram Rao',
    role: 'Electrician',
    phone: '+91 54321 09876',
    email: 'vikram@example.com',
    avatar: null,
    status: 'active',
    assignedServices: ['Electrical Work', 'Wiring'],
    rating: 4.5,
    completedJobs: 112,
    joinDate: 'Nov 2022',
  },
];

const roleOptions = [
  'Technician',
  'Senior Technician',
  'Cleaning Specialist',
  'Plumber',
  'Electrician',
  'Pest Control Expert',
  'Painter',
  'Carpenter',
  'AC Technician',
  'Other',
];

export default function StaffManagementScreen() {
  const colors = useColors();
  const [staff, setStaff] = useState(mockStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
  });

  const filterOptions = [
    { id: 'all', label: 'All Staff' },
    { id: 'active', label: 'Active' },
    { id: 'on_leave', label: 'On Leave' },
    { id: 'inactive', label: 'Inactive' },
  ];

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' ? true : s.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: staff.length,
    active: staff.filter((s) => s.status === 'active').length,
    onLeave: staff.filter((s) => s.status === 'on_leave').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'on_leave':
        return '#FF9800';
      case 'inactive':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'on_leave':
        return 'On Leave';
      case 'inactive':
        return 'Inactive';
      default:
        return status;
    }
  };

  const handleAddStaff = () => {
    if (formData.name && formData.role && formData.phone) {
      const newStaff: StaffMember = {
        id: Date.now().toString(),
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        avatar: null,
        status: 'active',
        assignedServices: [],
        rating: 0,
        completedJobs: 0,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      };
      setStaff((prev) => [...prev, newStaff]);
      setFormData({ name: '', role: '', phone: '', email: '' });
      setShowAddModal(false);
    }
  };

  const toggleStaffStatus = (id: string, newStatus: 'active' | 'inactive' | 'on_leave') => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Staff Management</ThemedText>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="person-add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="people" size={20} color={colors.primary} />
          </View>
          <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
          <ThemedText style={styles.statValue}>{stats.active}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIcon, { backgroundColor: '#FF9800' + '15' }]}>
            <Ionicons name="time" size={20} color="#FF9800" />
          </View>
          <ThemedText style={styles.statValue}>{stats.onLeave}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
            On Leave
          </ThemedText>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search staff..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    selectedFilter === filter.id ? colors.primary : colors.card,
                  borderColor:
                    selectedFilter === filter.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  { color: selectedFilter === filter.id ? '#fff' : colors.text },
                ]}
              >
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Staff List */}
      <FlatList
        data={filteredStaff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.border} />
            <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No staff found
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Add your first team member
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.staffCard, { backgroundColor: colors.card }]}
            onPress={() => {
              setSelectedStaff(item);
              setShowDetailModal(true);
            }}
          >
            <View style={styles.staffHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <ThemedText style={[styles.avatarText, { color: colors.primary }]}>
                  {item.name.charAt(0)}
                </ThemedText>
              </View>
              <View style={styles.staffInfo}>
                <ThemedText style={styles.staffName}>{item.name}</ThemedText>
                <ThemedText style={[styles.staffRole, { color: colors.textSecondary }]}>
                  {item.role}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + '15' },
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]}
                />
                <ThemedText
                  style={[styles.statusText, { color: getStatusColor(item.status) }]}
                >
                  {getStatusLabel(item.status)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.staffStats}>
              <View style={styles.staffStatItem}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <ThemedText style={styles.staffStatValue}>{item.rating}</ThemedText>
              </View>
              <View style={styles.staffStatItem}>
                <Ionicons name="checkmark-done" size={14} color={colors.primary} />
                <ThemedText style={styles.staffStatValue}>{item.completedJobs} jobs</ThemedText>
              </View>
              <View style={styles.staffStatItem}>
                <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                <ThemedText style={[styles.staffStatValue, { color: colors.textSecondary }]}>
                  Since {item.joinDate}
                </ThemedText>
              </View>
            </View>

            <View style={styles.servicesRow}>
              {item.assignedServices.slice(0, 2).map((service, index) => (
                <View
                  key={index}
                  style={[styles.serviceTag, { backgroundColor: colors.background }]}
                >
                  <ThemedText style={[styles.serviceTagText, { color: colors.textSecondary }]}>
                    {service}
                  </ThemedText>
                </View>
              ))}
              {item.assignedServices.length > 2 && (
                <View style={[styles.serviceTag, { backgroundColor: colors.primary + '15' }]}>
                  <ThemedText style={[styles.serviceTagText, { color: colors.primary }]}>
                    +{item.assignedServices.length - 2}
                  </ThemedText>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add Staff Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.addModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add Staff Member</ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Full Name *</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Role *</ThemedText>
                <View style={styles.roleOptions}>
                  {roleOptions.slice(0, 6).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        {
                          backgroundColor:
                            formData.role === role ? colors.primary + '15' : colors.background,
                          borderColor:
                            formData.role === role ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, role })}
                    >
                      <ThemedText
                        style={[
                          styles.roleOptionText,
                          { color: formData.role === role ? colors.primary : colors.text },
                        ]}
                      >
                        {role}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Phone Number *</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                />
              </View>

              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Email (Optional)</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor:
                    formData.name && formData.role && formData.phone
                      ? colors.primary
                      : colors.border,
                },
              ]}
              onPress={handleAddStaff}
              disabled={!formData.name || !formData.role || !formData.phone}
            >
              <ThemedText
                style={[
                  styles.submitText,
                  {
                    color:
                      formData.name && formData.role && formData.phone
                        ? '#fff'
                        : colors.textSecondary,
                  },
                ]}
              >
                Add Staff Member
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Staff Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            {selectedStaff && (
              <>
                <View style={styles.detailHeader}>
                  <View style={[styles.detailAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <ThemedText style={[styles.detailAvatarText, { color: colors.primary }]}>
                      {selectedStaff.name.charAt(0)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.detailName}>{selectedStaff.name}</ThemedText>
                  <ThemedText style={[styles.detailRole, { color: colors.textSecondary }]}>
                    {selectedStaff.role}
                  </ThemedText>
                  <View
                    style={[
                      styles.detailStatusBadge,
                      { backgroundColor: getStatusColor(selectedStaff.status) + '15' },
                    ]}
                  >
                    <ThemedText
                      style={[styles.detailStatusText, { color: getStatusColor(selectedStaff.status) }]}
                    >
                      {getStatusLabel(selectedStaff.status)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.detailStats}>
                  <View style={styles.detailStatItem}>
                    <Ionicons name="star" size={24} color="#FFC107" />
                    <ThemedText style={styles.detailStatValue}>{selectedStaff.rating}</ThemedText>
                    <ThemedText style={[styles.detailStatLabel, { color: colors.textSecondary }]}>
                      Rating
                    </ThemedText>
                  </View>
                  <View style={styles.detailStatItem}>
                    <Ionicons name="checkmark-done" size={24} color={colors.success} />
                    <ThemedText style={styles.detailStatValue}>{selectedStaff.completedJobs}</ThemedText>
                    <ThemedText style={[styles.detailStatLabel, { color: colors.textSecondary }]}>
                      Jobs Done
                    </ThemedText>
                  </View>
                  <View style={styles.detailStatItem}>
                    <Ionicons name="calendar" size={24} color={colors.primary} />
                    <ThemedText style={styles.detailStatValue}>{selectedStaff.joinDate}</ThemedText>
                    <ThemedText style={[styles.detailStatLabel, { color: colors.textSecondary }]}>
                      Joined
                    </ThemedText>
                  </View>
                </View>

                <View style={[styles.contactInfo, { backgroundColor: colors.background }]}>
                  <View style={styles.contactRow}>
                    <Ionicons name="call" size={18} color={colors.primary} />
                    <ThemedText style={styles.contactText}>{selectedStaff.phone}</ThemedText>
                  </View>
                  <View style={styles.contactRow}>
                    <Ionicons name="mail" size={18} color={colors.primary} />
                    <ThemedText style={styles.contactText}>{selectedStaff.email}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={[styles.detailAction, { backgroundColor: colors.primary }]}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Ionicons name="create" size={20} color="#fff" />
                    <ThemedText style={styles.detailActionText}>Edit</ThemedText>
                  </TouchableOpacity>
                  {selectedStaff.status === 'active' ? (
                    <TouchableOpacity
                      style={[styles.detailAction, { backgroundColor: '#FF9800' }]}
                      onPress={() => {
                        toggleStaffStatus(selectedStaff.id, 'on_leave');
                        setShowDetailModal(false);
                      }}
                    >
                      <Ionicons name="time" size={20} color="#fff" />
                      <ThemedText style={styles.detailActionText}>Set Leave</ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.detailAction, { backgroundColor: colors.success }]}
                      onPress={() => {
                        toggleStaffStatus(selectedStaff.id, 'active');
                        setShowDetailModal(false);
                      }}
                    >
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <ThemedText style={styles.detailActionText}>Activate</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  staffCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
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
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  staffRole: {
    fontSize: 13,
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
    fontWeight: '600',
  },
  staffStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  staffStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  staffStatValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  servicesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  serviceTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  serviceTagText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
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
  formSection: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailAvatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  detailName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailRole: {
    fontSize: 15,
    marginBottom: 8,
  },
  detailStatusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  detailStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  detailStatItem: {
    alignItems: 'center',
  },
  detailStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  detailStatLabel: {
    fontSize: 12,
  },
  contactInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 15,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  detailActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
