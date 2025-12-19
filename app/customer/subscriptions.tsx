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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Subscription {
  id: string;
  name: string;
  provider: {
    id: string;
    name: string;
    image: string;
  };
  service: string;
  frequency: string;
  nextDate: string;
  price: number;
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  billingCycle: string;
  image: string;
  savingsPercent: number;
}

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Monthly Home Cleaning',
    provider: {
      id: 'p1',
      name: 'CleanPro Services',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    service: 'Deep Cleaning',
    frequency: 'Monthly',
    nextDate: 'Mar 25, 2025',
    price: 1799,
    status: 'active',
    startDate: 'Jan 25, 2025',
    billingCycle: '25th of every month',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    savingsPercent: 15,
  },
  {
    id: '2',
    name: 'Weekly Gardening',
    provider: {
      id: 'p2',
      name: 'GreenThumb Gardens',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
    },
    service: 'Garden Maintenance',
    frequency: 'Weekly',
    nextDate: 'Mar 22, 2025',
    price: 499,
    status: 'active',
    startDate: 'Feb 1, 2025',
    billingCycle: 'Every Saturday',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400',
    savingsPercent: 20,
  },
  {
    id: '3',
    name: 'Quarterly AC Service',
    provider: {
      id: 'p3',
      name: 'CoolCare Services',
      image: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
    service: 'AC Maintenance',
    frequency: 'Quarterly',
    nextDate: 'Jun 15, 2025',
    price: 599,
    status: 'paused',
    startDate: 'Dec 15, 2024',
    billingCycle: '15th of Mar, Jun, Sep, Dec',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    savingsPercent: 10,
  },
];

const frequencyOptions = [
  { id: 'weekly', label: 'Weekly', description: 'Every week on the same day' },
  { id: 'biweekly', label: 'Bi-weekly', description: 'Every 2 weeks' },
  { id: 'monthly', label: 'Monthly', description: 'Once a month' },
  { id: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
];

export default function SubscriptionsScreen() {
  const colors = useColors();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (activeFilter === 'all') return true;
    return sub.status === activeFilter;
  });

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const monthlySavings = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, sub) => acc + (sub.price * sub.savingsPercent) / 100, 0);

  const toggleSubscriptionStatus = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, status: sub.status === 'active' ? 'paused' : 'active' }
          : sub
      )
    );
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: 'cancelled' as const } : sub))
    );
    setShowManageModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'paused':
        return colors.info;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderSubscriptionCard = ({ item }: { item: Subscription }) => (
    <TouchableOpacity
      style={[styles.subscriptionCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedSubscription(item);
        setShowManageModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.image }} style={styles.serviceImage} />
        <View style={styles.cardHeaderInfo}>
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
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </ThemedText>
          </View>
          <ThemedText style={styles.subscriptionName}>{item.name}</ThemedText>
          <ThemedText style={[styles.serviceName, { color: colors.textSecondary }]}>
            {item.service}
          </ThemedText>
        </View>
      </View>

      <View style={styles.providerRow}>
        <Image source={{ uri: item.provider.image }} style={styles.providerAvatar} />
        <ThemedText style={[styles.providerName, { color: colors.textSecondary }]}>
          {item.provider.name}
        </ThemedText>
      </View>

      <View style={[styles.detailsRow, { borderTopColor: colors.border }]}>
        <View style={styles.detailItem}>
          <Ionicons name="repeat-outline" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.frequency}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            Next: {item.nextDate}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <ThemedText style={[styles.priceLabel, { color: colors.textSecondary }]}>
            Per service
          </ThemedText>
          <View style={styles.priceRow}>
            <ThemedText style={[styles.price, { color: colors.primary }]}>
              ₹{item.price}
            </ThemedText>
            <View style={[styles.savingsBadge, { backgroundColor: colors.success + '15' }]}>
              <ThemedText style={[styles.savingsText, { color: colors.success }]}>
                Save {item.savingsPercent}%
              </ThemedText>
            </View>
          </View>
        </View>
        {item.status !== 'cancelled' && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor:
                  item.status === 'active' ? colors.info + '15' : colors.success + '15',
              },
            ]}
            onPress={() => toggleSubscriptionStatus(item.id)}
          >
            <Ionicons
              name={item.status === 'active' ? 'pause' : 'play'}
              size={18}
              color={item.status === 'active' ? colors.info : colors.success}
            />
            <ThemedText
              style={[
                styles.actionBtnText,
                { color: item.status === 'active' ? colors.info : colors.success },
              ]}
            >
              {item.status === 'active' ? 'Pause' : 'Resume'}
            </ThemedText>
          </TouchableOpacity>
        )}
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
        <ThemedText style={styles.headerTitle}>My Subscriptions</ThemedText>
        <TouchableOpacity onPress={() => router.push('/discover/explore' as any)}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summarySection}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'CC']}
            style={styles.summaryCard}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>{activeCount}</ThemedText>
                <ThemedText style={styles.summaryLabel}>Active Plans</ThemedText>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>₹{Math.round(monthlySavings)}</ThemedText>
                <ThemedText style={styles.summaryLabel}>Monthly Savings</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'all' && { backgroundColor: colors.primary + '15' },
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <ThemedText
              style={[
                styles.filterTabText,
                { color: activeFilter === 'all' ? colors.primary : colors.textSecondary },
              ]}
            >
              All ({subscriptions.length})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'active' && { backgroundColor: colors.success + '15' },
            ]}
            onPress={() => setActiveFilter('active')}
          >
            <ThemedText
              style={[
                styles.filterTabText,
                { color: activeFilter === 'active' ? colors.success : colors.textSecondary },
              ]}
            >
              Active ({subscriptions.filter((s) => s.status === 'active').length})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'paused' && { backgroundColor: colors.info + '15' },
            ]}
            onPress={() => setActiveFilter('paused')}
          >
            <ThemedText
              style={[
                styles.filterTabText,
                { color: activeFilter === 'paused' ? colors.info : colors.textSecondary },
              ]}
            >
              Paused ({subscriptions.filter((s) => s.status === 'paused').length})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Subscriptions List */}
        <View style={styles.listSection}>
          {filteredSubscriptions.map((item) => (
            <View key={item.id}>{renderSubscriptionCard({ item })}</View>
          ))}

          {filteredSubscriptions.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="repeat-outline" size={60} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Subscriptions</ThemedText>
              <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Subscribe to services and save on regular bookings
              </ThemedText>
              <TouchableOpacity
                style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/discover/explore' as any)}
              >
                <ThemedText style={styles.exploreBtnText}>Explore Services</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
          <Ionicons name="information-circle-outline" size={24} color={colors.info} />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoTitle}>Subscription Benefits</ThemedText>
            <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
              • Save up to 20% on regular services{'\n'}
              • Priority scheduling with your favorite providers{'\n'}
              • Easy pause/resume anytime{'\n'}
              • Cancel subscription without penalties
            </ThemedText>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Manage Subscription Modal */}
      <Modal visible={showManageModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowManageModal(false)}
        >
          <View style={[styles.manageModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />

            {selectedSubscription && (
              <>
                <View style={styles.modalHeader}>
                  <Image
                    source={{ uri: selectedSubscription.image }}
                    style={styles.modalImage}
                  />
                  <View style={styles.modalHeaderInfo}>
                    <ThemedText style={styles.modalTitle}>
                      {selectedSubscription.name}
                    </ThemedText>
                    <ThemedText style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                      {selectedSubscription.service}
                    </ThemedText>
                  </View>
                </View>

                <View style={[styles.modalDetails, { backgroundColor: colors.background }]}>
                  <View style={styles.modalDetailRow}>
                    <ThemedText style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>
                      Start Date
                    </ThemedText>
                    <ThemedText style={styles.modalDetailValue}>
                      {selectedSubscription.startDate}
                    </ThemedText>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <ThemedText style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>
                      Billing Cycle
                    </ThemedText>
                    <ThemedText style={styles.modalDetailValue}>
                      {selectedSubscription.billingCycle}
                    </ThemedText>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <ThemedText style={[styles.modalDetailLabel, { color: colors.textSecondary }]}>
                      Next Service
                    </ThemedText>
                    <ThemedText style={styles.modalDetailValue}>
                      {selectedSubscription.nextDate}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  {selectedSubscription.status !== 'cancelled' && (
                    <>
                      <TouchableOpacity
                        style={[styles.modalActionBtn, { backgroundColor: colors.info + '15' }]}
                        onPress={() => {
                          toggleSubscriptionStatus(selectedSubscription.id);
                          setShowManageModal(false);
                        }}
                      >
                        <Ionicons
                          name={
                            selectedSubscription.status === 'active' ? 'pause' : 'play'
                          }
                          size={20}
                          color={colors.info}
                        />
                        <ThemedText style={[styles.modalActionText, { color: colors.info }]}>
                          {selectedSubscription.status === 'active' ? 'Pause' : 'Resume'}
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalActionBtn, { backgroundColor: colors.error + '15' }]}
                        onPress={() => cancelSubscription(selectedSubscription.id)}
                      >
                        <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                        <ThemedText style={[styles.modalActionText, { color: colors.error }]}>
                          Cancel Subscription
                        </ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: colors.primary + '15' }]}
                    onPress={() => {
                      setShowManageModal(false);
                      router.push({
                        pathname: '/chat/[id]',
                        params: { id: selectedSubscription.provider.id },
                      });
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                    <ThemedText style={[styles.modalActionText, { color: colors.primary }]}>
                      Contact Provider
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  summarySection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 50,
  },
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listSection: {
    paddingHorizontal: 16,
  },
  subscriptionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  serviceImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
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
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 13,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  providerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  providerName: {
    fontSize: 13,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginBottom: 12,
    borderTopWidth: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  savingsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    marginBottom: 24,
  },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  manageModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
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
    flexDirection: 'row',
    marginBottom: 20,
  },
  modalImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  modalHeaderInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  modalDetails: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDetailLabel: {
    fontSize: 14,
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    gap: 10,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
