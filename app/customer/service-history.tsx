import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ServiceHistory {
  id: string;
  serviceName: string;
  providerName: string;
  providerImage?: string;
  date: string;
  time: string;
  status: 'completed' | 'cancelled' | 'refunded';
  price: number;
  discount?: number;
  rating?: number;
  review?: string;
  category: string;
  duration: string;
  address: string;
  invoiceId: string;
}

const mockHistory: ServiceHistory[] = [
  {
    id: '1',
    serviceName: 'Deep Home Cleaning',
    providerName: 'CleanPro Services',
    date: 'Dec 28, 2024',
    time: '10:00 AM',
    status: 'completed',
    price: 1499,
    discount: 200,
    rating: 5,
    review: 'Excellent service, very thorough!',
    category: 'Cleaning',
    duration: '3 hours',
    address: '123 Main Street, Apt 4B',
    invoiceId: 'INV-2024-001',
  },
  {
    id: '2',
    serviceName: 'AC Repair & Service',
    providerName: 'CoolTech Solutions',
    date: 'Dec 20, 2024',
    time: '2:00 PM',
    status: 'completed',
    price: 899,
    rating: 4,
    category: 'AC Repair',
    duration: '1.5 hours',
    address: '123 Main Street, Apt 4B',
    invoiceId: 'INV-2024-002',
  },
  {
    id: '3',
    serviceName: 'Plumbing Work',
    providerName: 'QuickFix Plumbers',
    date: 'Dec 15, 2024',
    time: '11:30 AM',
    status: 'cancelled',
    price: 600,
    category: 'Plumbing',
    duration: '1 hour',
    address: '123 Main Street, Apt 4B',
    invoiceId: 'INV-2024-003',
  },
  {
    id: '4',
    serviceName: "Women's Haircut",
    providerName: 'Style Studio Salon',
    date: 'Dec 10, 2024',
    time: '4:00 PM',
    status: 'completed',
    price: 799,
    discount: 100,
    rating: 5,
    review: 'Amazing stylist, loved the result!',
    category: 'Beauty',
    duration: '45 mins',
    address: 'Style Studio, MG Road',
    invoiceId: 'INV-2024-004',
  },
  {
    id: '5',
    serviceName: 'Pest Control',
    providerName: 'BugBusters',
    date: 'Dec 5, 2024',
    time: '9:00 AM',
    status: 'refunded',
    price: 1200,
    category: 'Pest Control',
    duration: '2 hours',
    address: '123 Main Street, Apt 4B',
    invoiceId: 'INV-2024-005',
  },
  {
    id: '6',
    serviceName: 'Car Wash Premium',
    providerName: 'AutoSpa Detailing',
    date: 'Nov 28, 2024',
    time: '3:30 PM',
    status: 'completed',
    price: 599,
    rating: 4,
    category: 'Car Care',
    duration: '1 hour',
    address: 'AutoSpa Center, Brigade Road',
    invoiceId: 'INV-2024-006',
  },
];

export default function ServiceHistoryScreen() {
  const colors = useColors();
  const [history, setHistory] = useState<ServiceHistory[]>(mockHistory);
  const [selectedService, setSelectedService] = useState<ServiceHistory | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');

  const categories = [...new Set(mockHistory.map((h) => h.category))];

  const filteredHistory = history
    .filter((h) => {
      const matchesSearch =
        h.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.providerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !filterStatus || h.status === filterStatus;
      const matchesCategory = !filterCategory || h.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const stats = {
    total: history.length,
    completed: history.filter((h) => h.status === 'completed').length,
    totalSpent: history
      .filter((h) => h.status === 'completed')
      .reduce((sum, h) => sum + (h.price - (h.discount || 0)), 0),
    saved: history.reduce((sum, h) => sum + (h.discount || 0), 0),
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      case 'refunded':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      Cleaning: 'sparkles',
      'AC Repair': 'snow',
      Plumbing: 'water',
      Beauty: 'cut',
      'Pest Control': 'bug',
      'Car Care': 'car',
    };
    return icons[category] || 'pricetag';
  };

  const renderHistoryItem = ({ item }: { item: ServiceHistory }) => (
    <TouchableOpacity
      style={[styles.historyCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedService(item);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(item.category) as any}
            size={20}
            color={colors.primary}
          />
        </View>
        <View style={styles.cardHeaderInfo}>
          <ThemedText style={styles.serviceName} numberOfLines={1}>
            {item.serviceName}
          </ThemedText>
          <ThemedText style={[styles.providerName, { color: colors.textSecondary }]}>
            {item.providerName}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '15' },
          ]}
        >
          <ThemedText
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.cardDetails, { borderTopColor: colors.border }]}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.date}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.time}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="timer-outline" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.duration}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>
              ₹{(item.price - (item.discount || 0)).toLocaleString()}
            </ThemedText>
            {item.discount && (
              <ThemedText style={[styles.originalPrice, { color: colors.textSecondary }]}>
                ₹{item.price}
              </ThemedText>
            )}
          </View>
          {item.rating && (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= item.rating! ? 'star' : 'star-outline'}
                  size={12}
                  color={star <= item.rating! ? '#FFB800' : colors.textSecondary}
                />
              ))}
            </View>
          )}
        </View>
        <View style={styles.cardActions}>
          {item.status === 'completed' && !item.rating && (
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.primary }]}
              onPress={() =>
                router.push({
                  pathname: '/customer/review-service' as any,
                  params: { serviceId: item.id },
                })
              }
            >
              <ThemedText style={[styles.actionBtnText, { color: colors.primary }]}>
                Rate
              </ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.rebookBtn, { backgroundColor: colors.primary }]}
            onPress={() =>
              router.push({
                pathname: '/booking/form',
                params: { serviceId: item.id },
              })
            }
          >
            <ThemedText style={styles.rebookBtnText}>Rebook</ThemedText>
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
        <ThemedText style={styles.headerTitle}>Service History</ThemedText>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <Ionicons name="options-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'CC']}
        style={styles.statsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.completed}</ThemedText>
            <ThemedText style={styles.statLabel}>Completed</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>₹{stats.totalSpent.toLocaleString()}</ThemedText>
            <ThemedText style={styles.statLabel}>Spent</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>₹{stats.saved}</ThemedText>
            <ThemedText style={styles.statLabel}>Saved</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search services or providers..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Active Filters */}
      {(filterStatus || filterCategory) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeFilters}
        >
          {filterStatus && (
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: colors.primary + '15' }]}
              onPress={() => setFilterStatus(null)}
            >
              <ThemedText style={[styles.filterChipText, { color: colors.primary }]}>
                {filterStatus}
              </ThemedText>
              <Ionicons name="close" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
          {filterCategory && (
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: colors.primary + '15' }]}
              onPress={() => setFilterCategory(null)}
            >
              <ThemedText style={[styles.filterChipText, { color: colors.primary }]}>
                {filterCategory}
              </ThemedText>
              <Ionicons name="close" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              setFilterStatus(null);
              setFilterCategory(null);
            }}
          >
            <ThemedText style={[styles.clearAll, { color: colors.error }]}>Clear All</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* History List */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="time-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No History</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Your service history will appear here
            </ThemedText>
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
            {selectedService && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalCategoryIcon,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(selectedService.category) as any}
                      size={28}
                      color={colors.primary}
                    />
                  </View>
                  <ThemedText style={styles.modalTitle}>
                    {selectedService.serviceName}
                  </ThemedText>
                  <ThemedText style={[styles.modalProvider, { color: colors.textSecondary }]}>
                    by {selectedService.providerName}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.statusSection,
                    { backgroundColor: getStatusColor(selectedService.status) + '10' },
                  ]}
                >
                  <Ionicons
                    name={
                      selectedService.status === 'completed'
                        ? 'checkmark-circle'
                        : selectedService.status === 'cancelled'
                        ? 'close-circle'
                        : 'refresh-circle'
                    }
                    size={24}
                    color={getStatusColor(selectedService.status)}
                  />
                  <ThemedText
                    style={[
                      styles.statusLabel,
                      { color: getStatusColor(selectedService.status) },
                    ]}
                  >
                    Service {selectedService.status}
                  </ThemedText>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                    <View style={styles.infoContent}>
                      <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Date & Time
                      </ThemedText>
                      <ThemedText style={styles.infoValue}>
                        {selectedService.date} at {selectedService.time}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="timer" size={18} color={colors.textSecondary} />
                    <View style={styles.infoContent}>
                      <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Duration
                      </ThemedText>
                      <ThemedText style={styles.infoValue}>{selectedService.duration}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={18} color={colors.textSecondary} />
                    <View style={styles.infoContent}>
                      <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Location
                      </ThemedText>
                      <ThemedText style={styles.infoValue}>{selectedService.address}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="receipt" size={18} color={colors.textSecondary} />
                    <View style={styles.infoContent}>
                      <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Invoice ID
                      </ThemedText>
                      <ThemedText style={styles.infoValue}>{selectedService.invoiceId}</ThemedText>
                    </View>
                  </View>
                </View>

                {selectedService.rating && (
                  <View style={[styles.reviewSection, { backgroundColor: colors.background }]}>
                    <ThemedText style={styles.reviewTitle}>Your Review</ThemedText>
                    <View style={styles.ratingDisplay}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= selectedService.rating! ? 'star' : 'star-outline'}
                          size={20}
                          color={star <= selectedService.rating! ? '#FFB800' : colors.textSecondary}
                        />
                      ))}
                    </View>
                    {selectedService.review && (
                      <ThemedText style={[styles.reviewText, { color: colors.textSecondary }]}>
                        "{selectedService.review}"
                      </ThemedText>
                    )}
                  </View>
                )}

                <View style={[styles.priceSection, { borderTopColor: colors.border }]}>
                  <View style={styles.priceRow}>
                    <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>
                      Service Price
                    </ThemedText>
                    <ThemedText style={styles.priceValue}>
                      ₹{selectedService.price.toLocaleString()}
                    </ThemedText>
                  </View>
                  {selectedService.discount && (
                    <View style={styles.priceRow}>
                      <ThemedText style={[styles.priceLabel, { color: colors.success }]}>
                        Discount
                      </ThemedText>
                      <ThemedText style={[styles.priceValue, { color: colors.success }]}>
                        -₹{selectedService.discount}
                      </ThemedText>
                    </View>
                  )}
                  <View style={[styles.priceRow, styles.totalRow]}>
                    <ThemedText style={styles.totalLabel}>Total Paid</ThemedText>
                    <ThemedText style={styles.totalValue}>
                      ₹{(selectedService.price - (selectedService.discount || 0)).toLocaleString()}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.downloadBtn, { borderColor: colors.primary }]}
                    onPress={() => {}}
                  >
                    <Ionicons name="download" size={18} color={colors.primary} />
                    <ThemedText style={[styles.downloadBtnText, { color: colors.primary }]}>
                      Invoice
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rebookModalBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setShowDetailsModal(false);
                      router.push({
                        pathname: '/booking/form',
                        params: { serviceId: selectedService.id },
                      });
                    }}
                  >
                    <ThemedText style={styles.rebookModalBtnText}>Book Again</ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={[styles.filterModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.filterModalTitle}>Filter & Sort</ThemedText>

            <ThemedText style={styles.filterSectionTitle}>Status</ThemedText>
            <View style={styles.filterOptions}>
              {['completed', 'cancelled', 'refunded'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor:
                        filterStatus === status ? colors.primary : colors.background,
                    },
                  ]}
                  onPress={() =>
                    setFilterStatus(filterStatus === status ? null : status)
                  }
                >
                  <ThemedText
                    style={{
                      color: filterStatus === status ? '#fff' : colors.text,
                      fontWeight: '500',
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.filterSectionTitle}>Category</ThemedText>
            <View style={styles.filterOptions}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor:
                        filterCategory === category ? colors.primary : colors.background,
                    },
                  ]}
                  onPress={() =>
                    setFilterCategory(filterCategory === category ? null : category)
                  }
                >
                  <ThemedText
                    style={{
                      color: filterCategory === category ? '#fff' : colors.text,
                      fontWeight: '500',
                    }}
                  >
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.filterSectionTitle}>Sort By</ThemedText>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: sortBy === 'date' ? colors.primary : colors.background,
                  },
                ]}
                onPress={() => setSortBy('date')}
              >
                <ThemedText
                  style={{ color: sortBy === 'date' ? '#fff' : colors.text, fontWeight: '500' }}
                >
                  Date
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: sortBy === 'price' ? colors.primary : colors.background,
                  },
                ]}
                onPress={() => setSortBy('price')}
              >
                <ThemedText
                  style={{ color: sortBy === 'price' ? '#fff' : colors.text, fontWeight: '500' }}
                >
                  Price
                </ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.applyFilterBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowFilterModal(false)}
            >
              <ThemedText style={styles.applyFilterBtnText}>Apply Filters</ThemedText>
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
  statsCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  searchSection: {
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
  activeFilters: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  clearAll: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  historyCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  providerName: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 12,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rebookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rebookBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCategoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalProvider: {
    fontSize: 14,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  ratingDisplay: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  priceSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rebookModalBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  rebookModalBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  filterModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  applyFilterBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  applyFilterBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
