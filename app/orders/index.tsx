import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Order {
  id: string;
  service: string;
  businessName: string;
  businessImage: string;
  date: string;
  time: string;
  status: 'confirmed' | 'on_the_way' | 'in_progress' | 'completed';
  address: string;
  totalAmount: number;
}

const activeOrders: Order[] = [
  {
    id: '1',
    service: 'AC Repair & Service',
    businessName: 'Cool Tech Services',
    businessImage: 'https://images.unsplash.com/photo-1631545806609-1d242e217cb5?w=400',
    date: 'Today',
    time: '2:00 PM - 4:00 PM',
    status: 'on_the_way',
    address: '123 Main Street, Apartment 4B',
    totalAmount: 599,
  },
  {
    id: '2',
    service: 'Home Deep Cleaning',
    businessName: 'Sparkle Clean Pro',
    businessImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    date: 'Tomorrow',
    time: '10:00 AM - 12:00 PM',
    status: 'confirmed',
    address: '456 Oak Avenue, Suite 12',
    totalAmount: 1299,
  },
];

const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    color: '#3B82F6',
    icon: 'checkmark-circle',
    description: 'Your booking is confirmed',
  },
  on_the_way: {
    label: 'On the Way',
    color: '#F59E0B',
    icon: 'car',
    description: 'Service provider is coming',
  },
  in_progress: {
    label: 'In Progress',
    color: '#8B5CF6',
    icon: 'construct',
    description: 'Service is in progress',
  },
  completed: {
    label: 'Completed',
    color: '#10B981',
    icon: 'checkmark-done-circle',
    description: 'Service completed',
  },
};

export default function ActiveOrdersScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'in_progress'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState(activeOrders);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'upcoming') {
      return order.status === 'confirmed';
    }
    return order.status === 'on_the_way' || order.status === 'in_progress';
  });

  const handleTrackOrder = (orderId: string) => {
    router.push(`/orders/${orderId}/tracking` as any);
  };

  const handleContactBusiness = (orderId: string) => {
    router.push(`/messages/chat/${orderId}`);
  };

  const handleOrderDetails = (orderId: string) => {
    router.push(`/orders/${orderId}` as any);
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const status = statusConfig[item.status];
    
    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: colors.card }]}
        onPress={() => handleOrderDetails(item.id)}
        activeOpacity={0.7}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
          <Ionicons name={status.icon as any} size={14} color={status.color} />
          <ThemedText style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </ThemedText>
        </View>

        {/* Order Info */}
        <View style={styles.orderContent}>
          <Image
            source={{ uri: item.businessImage }}
            style={styles.businessImage}
            defaultSource={require('@/assets/images/icon.png')}
          />
          
          <View style={styles.orderInfo}>
            <ThemedText style={styles.serviceName}>{item.service}</ThemedText>
            <ThemedText style={[styles.businessName, { color: colors.textSecondary }]}>
              {item.businessName}
            </ThemedText>
            
            <View style={styles.orderMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                  {item.date}
                </ThemedText>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                  {item.time}
                </ThemedText>
              </View>
            </View>

            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <ThemedText 
                style={[styles.addressText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.address}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {(item.status === 'on_the_way' || item.status === 'in_progress') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleTrackOrder(item.id)}
            >
              <Ionicons name="location" size={18} color="#FFF" />
              <ThemedText style={styles.actionButtonText}>Track</ThemedText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
            ]}
            onPress={() => handleContactBusiness(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
            <ThemedText style={[styles.actionButtonText, { color: colors.text }]}>
              Contact
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.amountRow}>
          <ThemedText style={[styles.amountLabel, { color: colors.textSecondary }]}>
            Total Amount
          </ThemedText>
          <ThemedText style={[styles.amountValue, { color: colors.primary }]}>
            ₹{item.totalAmount}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
      <ThemedText style={styles.emptyTitle}>No Active Orders</ThemedText>
      <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
        {activeTab === 'upcoming'
          ? "You don't have any upcoming bookings"
          : "No services in progress right now"}
      </ThemedText>
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <ThemedText style={styles.browseButtonText}>Book a Service</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Active Orders</ThemedText>
        <TouchableOpacity onPress={() => router.push('/customer/order-history')}>
          <Ionicons name="time-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Upcoming
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'in_progress' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('in_progress')}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'in_progress' && styles.activeTabText,
            ]}
          >
            In Progress
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={EmptyState}
      />
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  businessImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  businessName: {
    fontSize: 14,
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 13,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  amountLabel: {
    fontSize: 14,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
