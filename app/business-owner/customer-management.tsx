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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  joinedDate: string;
  status: 'active' | 'inactive' | 'vip';
  rating: number;
  notes: string;
  favoriteServices: string[];
}

const customers: Customer[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    totalOrders: 24,
    totalSpent: 28500,
    lastOrder: '2 days ago',
    joinedDate: 'Mar 2023',
    status: 'vip',
    rating: 5,
    notes: 'Prefers morning slots. Allergic to strong chemicals.',
    favoriteServices: ['Deep Cleaning', 'AC Service'],
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    email: 'rahul.k@email.com',
    phone: '+91 87654 32109',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    totalOrders: 12,
    totalSpent: 15200,
    lastOrder: '1 week ago',
    joinedDate: 'Jun 2023',
    status: 'active',
    rating: 4.5,
    notes: '',
    favoriteServices: ['Plumbing', 'Electrical'],
  },
  {
    id: '3',
    name: 'Anjali Patel',
    email: 'anjali.patel@email.com',
    phone: '+91 76543 21098',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    totalOrders: 8,
    totalSpent: 9800,
    lastOrder: '3 weeks ago',
    joinedDate: 'Sep 2023',
    status: 'active',
    rating: 4,
    notes: 'Has a pet dog. Needs advance notice.',
    favoriteServices: ['Bathroom Cleaning'],
  },
  {
    id: '4',
    name: 'Vikram Singh',
    email: 'vikram.s@email.com',
    phone: '+91 65432 10987',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    totalOrders: 3,
    totalSpent: 3500,
    lastOrder: '2 months ago',
    joinedDate: 'Nov 2023',
    status: 'inactive',
    rating: 3.5,
    notes: '',
    favoriteServices: ['AC Service'],
  },
];

export default function CustomerManagementScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'recent'>('recent');

  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery);
      
      if (filterStatus === 'all') return matchesSearch;
      return customer.status === filterStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'orders': return b.totalOrders - a.totalOrders;
        case 'spent': return b.totalSpent - a.totalSpent;
        default: return 0;
      }
    });

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'vip': return colors.warning;
      case 'active': return colors.success;
      case 'inactive': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: Customer['status']) => {
    switch (status) {
      case 'vip': return 'star';
      case 'active': return 'checkmark-circle';
      case 'inactive': return 'time';
      default: return 'ellipse';
    }
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={[styles.customerCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedCustomer(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.image }} style={styles.customerImage} />
        <View style={styles.customerInfo}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.customerName}>{item.name}</ThemedText>
            {item.status === 'vip' && (
              <View style={[styles.vipBadge, { backgroundColor: colors.warning }]}>
                <Ionicons name="star" size={10} color="#FFF" />
                <ThemedText style={styles.vipText}>VIP</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[styles.customerEmail, { color: colors.textSecondary }]}>
            {item.email}
          </ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: colors.primary }]}>
                {item.totalOrders}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Orders
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: colors.success }]}>
                ₹{(item.totalSpent / 1000).toFixed(1)}k
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Spent
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={styles.ratingValue}>
                <ThemedText style={styles.statValue}>{item.rating}</ThemedText>
                <Ionicons name="star" size={12} color="#FFB800" />
              </View>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Rating
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={styles.lastOrderInfo}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.lastOrderText, { color: colors.textSecondary }]}>
            Last order: {item.lastOrder}
          </ThemedText>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="call" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="chatbubble" size={16} color={colors.info} />
          </TouchableOpacity>
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
        <ThemedText style={styles.headerTitle}>Customers</ThemedText>
        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <LinearGradient
        colors={[colors.primary, '#2D4A3E']}
        style={styles.statsCard}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statsItem}>
            <ThemedText style={styles.statsValue}>{customers.length}</ThemedText>
            <ThemedText style={styles.statsLabel}>Total</ThemedText>
          </View>
          <View style={[styles.statsItemDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.statsItem}>
            <ThemedText style={styles.statsValue}>
              {customers.filter(c => c.status === 'vip').length}
            </ThemedText>
            <ThemedText style={styles.statsLabel}>VIP</ThemedText>
          </View>
          <View style={[styles.statsItemDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.statsItem}>
            <ThemedText style={styles.statsValue}>
              {customers.filter(c => c.status === 'active').length}
            </ThemedText>
            <ThemedText style={styles.statsLabel}>Active</ThemedText>
          </View>
          <View style={[styles.statsItemDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={styles.statsItem}>
            <ThemedText style={styles.statsValue}>
              ₹{(customers.reduce((acc, c) => acc + c.totalSpent, 0) / 1000).toFixed(1)}k
            </ThemedText>
            <ThemedText style={styles.statsLabel}>Revenue</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search customers..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'vip', 'active', 'inactive'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filterStatus === status && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <ThemedText style={[
                styles.filterChipText,
                { color: filterStatus === status ? '#FFF' : colors.textSecondary }
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={[styles.sortButton, { borderColor: colors.border }]}>
          <Ionicons name="swap-vertical" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.sortText, { color: colors.textSecondary }]}>Sort</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Customers List */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Customers Found</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              {searchQuery ? 'Try a different search term' : 'Your customer list is empty'}
            </ThemedText>
          </View>
        )}
      />

      {/* Customer Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Customer Details</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedCustomer && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.modalProfile}>
                  <Image 
                    source={{ uri: selectedCustomer.image }} 
                    style={styles.modalProfileImage} 
                  />
                  <ThemedText style={styles.modalProfileName}>
                    {selectedCustomer.name}
                  </ThemedText>
                  <View style={[
                    styles.modalStatusBadge, 
                    { backgroundColor: getStatusColor(selectedCustomer.status) + '20' }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(selectedCustomer.status)} 
                      size={14} 
                      color={getStatusColor(selectedCustomer.status)} 
                    />
                    <ThemedText style={[
                      styles.modalStatusText, 
                      { color: getStatusColor(selectedCustomer.status) }
                    ]}>
                      {selectedCustomer.status.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>

                {/* Contact Info */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    CONTACT INFO
                  </ThemedText>
                  <View style={[styles.contactItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="mail-outline" size={18} color={colors.primary} />
                    <ThemedText style={styles.contactText}>{selectedCustomer.email}</ThemedText>
                  </View>
                  <View style={[styles.contactItem, { backgroundColor: colors.background }]}>
                    <Ionicons name="call-outline" size={18} color={colors.primary} />
                    <ThemedText style={styles.contactText}>{selectedCustomer.phone}</ThemedText>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    STATISTICS
                  </ThemedText>
                  <View style={styles.modalStatsGrid}>
                    <View style={[styles.modalStatItem, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.modalStatValue, { color: colors.primary }]}>
                        {selectedCustomer.totalOrders}
                      </ThemedText>
                      <ThemedText style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                        Total Orders
                      </ThemedText>
                    </View>
                    <View style={[styles.modalStatItem, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.modalStatValue, { color: colors.success }]}>
                        ₹{selectedCustomer.totalSpent.toLocaleString()}
                      </ThemedText>
                      <ThemedText style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                        Total Spent
                      </ThemedText>
                    </View>
                    <View style={[styles.modalStatItem, { backgroundColor: colors.background }]}>
                      <View style={styles.ratingDisplay}>
                        <ThemedText style={[styles.modalStatValue, { color: colors.warning }]}>
                          {selectedCustomer.rating}
                        </ThemedText>
                        <Ionicons name="star" size={14} color={colors.warning} />
                      </View>
                      <ThemedText style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                        Rating
                      </ThemedText>
                    </View>
                    <View style={[styles.modalStatItem, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.modalStatValue, { color: colors.info }]}>
                        {selectedCustomer.joinedDate}
                      </ThemedText>
                      <ThemedText style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                        Joined
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Favorite Services */}
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                    FAVORITE SERVICES
                  </ThemedText>
                  <View style={styles.servicesGrid}>
                    {selectedCustomer.favoriteServices.map((service, index) => (
                      <View 
                        key={index} 
                        style={[styles.serviceChip, { backgroundColor: colors.primary + '15' }]}
                      >
                        <ThemedText style={[styles.serviceChipText, { color: colors.primary }]}>
                          {service}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Notes */}
                {selectedCustomer.notes && (
                  <View style={styles.modalSection}>
                    <ThemedText style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                      NOTES
                    </ThemedText>
                    <View style={[styles.notesCard, { backgroundColor: colors.warning + '10' }]}>
                      <Ionicons name="document-text-outline" size={18} color={colors.warning} />
                      <ThemedText style={styles.notesText}>{selectedCustomer.notes}</ThemedText>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="calendar" size={18} color="#FFF" />
                    <ThemedText style={styles.modalActionText}>New Booking</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: colors.info }]}
                  >
                    <Ionicons name="chatbubble" size={18} color="#FFF" />
                    <ThemedText style={styles.modalActionText}>Send Message</ThemedText>
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
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsItem: {
    alignItems: 'center',
  },
  statsValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  statsItemDivider: {
    width: 1,
    height: '100%',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 8,
    gap: 4,
  },
  sortText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  customerCard: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
  },
  customerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },
  customerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  vipText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  customerEmail: {
    fontSize: 13,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  lastOrderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastOrderText: {
    fontSize: 12,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalProfile: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  modalProfileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '600',
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalStatItem: {
    width: (width - 60) / 2 - 5,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 11,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  serviceChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  notesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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
  modalActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
