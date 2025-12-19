import { ThemedText } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const orderStatuses = [
  { id: 'all', label: 'All', icon: 'apps', count: 12 },
  { id: 'active', label: 'Active', icon: 'time', count: 3 },
  { id: 'completed', label: 'Completed', icon: 'checkmark-circle', count: 8 },
  { id: 'cancelled', label: 'Cancelled', icon: 'close-circle', count: 1 },
];

const mockOrders = [
  {
    id: '1',
    serviceName: 'Plumbing Repair',
    businessName: 'QuickFix Plumbers',
    date: '2025-12-15',
    time: '10:00 AM',
    status: 'active',
    amount: 550,
    providerImage: null,
  },
  {
    id: '2',
    serviceName: 'House Cleaning',
    businessName: 'Sparkle Clean Services',
    date: '2025-12-14',
    time: '2:00 PM',
    status: 'completed',
    amount: 800,
    rating: 5,
    providerImage: null,
  },
  {
    id: '3',
    serviceName: 'Electrical Work',
    businessName: 'Bright Electricians',
    date: '2025-12-12',
    time: '11:30 AM',
    status: 'completed',
    amount: 650,
    rating: 4,
    providerImage: null,
  },
  {
    id: '4',
    serviceName: 'AC Repair',
    businessName: 'Cool Tech Services',
    date: '2025-12-10',
    time: '3:00 PM',
    status: 'cancelled',
    amount: 1200,
    providerImage: null,
  },
];

export default function OrdersTabScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState(mockOrders);

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleTrackService = (orderId: string) => {
    router.push('/customer/booking-track' as any);
  };

  const handleReschedule = (orderId: string) => {
    // Show date selection options
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    Alert.alert(
      'Reschedule Booking',
      'Choose a new date:',
      [
        {
          text: 'Tomorrow',
          onPress: () => {
            setOrders(prevOrders =>
              prevOrders.map(order =>
                order.id === orderId 
                  ? { ...order, date: tomorrow.toISOString().split('T')[0] } 
                  : order
              )
            );
            Alert.alert('Success', 'Booking rescheduled to tomorrow');
          },
        },
        {
          text: dayAfter.toLocaleDateString('en-US', { weekday: 'long' }),
          onPress: () => {
            setOrders(prevOrders =>
              prevOrders.map(order =>
                order.id === orderId 
                  ? { ...order, date: dayAfter.toISOString().split('T')[0] } 
                  : order
              )
            );
            Alert.alert('Success', `Booking rescheduled to ${dayAfter.toLocaleDateString()}`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCancelBooking = (orderId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setOrders(prevOrders =>
              prevOrders.map(order =>
                order.id === orderId ? { ...order, status: 'cancelled' } : order
              )
            );
            Alert.alert('Success', 'Booking cancelled successfully');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#FF9800';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return colors.primary;
    }
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/customer/order-details?orderId=${orderId}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Orders</ThemedText>
        <TouchableOpacity onPress={() => router.push('/customer/order-history' as any)}>
          <Ionicons name="time" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Filters */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {orderStatuses.map((status) => (
              <TouchableOpacity
                key={status.id}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      selectedStatus === status.id ? colors.primary : colors.card,
                  },
                ]}
                onPress={() => setSelectedStatus(status.id)}
              >
                <Ionicons
                  name={status.icon as any}
                  size={20}
                  color={selectedStatus === status.id ? '#FFFFFF' : colors.text}
                />
                <ThemedText
                  style={[
                    styles.filterLabel,
                    {
                      color: selectedStatus === status.id ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {status.label}
                </ThemedText>
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor:
                        selectedStatus === status.id
                          ? 'rgba(255,255,255,0.2)'
                          : colors.primary + '20',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.countText,
                      {
                        color: selectedStatus === status.id ? '#FFFFFF' : colors.primary,
                      },
                    ]}
                  >
                    {status.count}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Orders List */}
        <View style={styles.ordersContainer}>
          {filteredOrders.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.emptyState}
            >
              <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Orders Found</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                You don't have any {selectedStatus !== 'all' ? selectedStatus : ''} orders yet
              </ThemedText>
              <TouchableOpacity
                style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <ThemedText style={styles.exploreButtonText}>Explore Services</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            filteredOrders.map((order, index) => (
              <Animated.View
                key={order.id}
                entering={FadeInDown.delay(200 + index * 100)}
              >
                <TouchableOpacity
                  style={[styles.orderCard, { backgroundColor: colors.card }]}
                  onPress={() => handleOrderPress(order.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <ThemedText style={styles.serviceName}>{order.serviceName}</ThemedText>
                      <View style={styles.businessRow}>
                        <Ionicons name="business" size={14} color={colors.textSecondary} />
                        <ThemedText style={styles.businessName}>{order.businessName}</ThemedText>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(order.status) + '20' },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.statusText,
                          { color: getStatusColor(order.status) },
                        ]}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.orderDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                      <ThemedText style={styles.detailText}>
                        {order.date} at {order.time}
                      </ThemedText>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash" size={16} color={colors.textSecondary} />
                      <ThemedText style={styles.detailText}>₹{order.amount}</ThemedText>
                    </View>
                  </View>

                  {order.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFC107" />
                      <ThemedText style={styles.ratingText}>
                        {order.rating}.0 - You rated this service
                      </ThemedText>
                    </View>
                  )}

                  <View style={styles.orderActions}>
                    {order.status === 'active' && (
                      <>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: colors.primary + '10' }]}
                          onPress={() => handleTrackService(order.id)}
                        >
                          <Ionicons name="navigate" size={18} color={colors.primary} />
                          <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>Track Service</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#FF9800' + '10' }]}
                          onPress={() => handleReschedule(order.id)}
                        >
                          <Ionicons name="time" size={18} color="#FF9800" />
                          <ThemedText style={[styles.actionButtonText, { color: '#FF9800' }]}>Reschedule</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: '#F44336' + '10' }]}
                          onPress={() => handleCancelBooking(order.id)}
                        >
                          <Ionicons name="close-circle" size={18} color="#F44336" />
                          <ThemedText style={[styles.actionButtonText, { color: '#F44336' }]}>Cancel</ThemedText>
                        </TouchableOpacity>
                      </>
                    )}
                    {order.status !== 'active' && (
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: colors.primary + '10' }]}
                        onPress={() => router.push(`/messages/chat/${order.id}` as any)}
                      >
                        <Ionicons name="chatbubbles" size={18} color={colors.primary} />
                        <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>Message</ThemedText>
                      </TouchableOpacity>
                    )}
                    {order.status === 'completed' && !order.rating && (
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#FFC107' + '10' }]}
                        onPress={() => router.push(`/business-reviews/write-review?orderId=${order.id}` as any)}
                      >
                        <Ionicons name="star" size={18} color="#FFC107" />
                        <ThemedText style={[styles.actionButtonText, { color: '#FFC107' }]}>Rate</ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  ordersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  businessName: {
    fontSize: 14,
    opacity: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.9,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 12,
    opacity: 0.7,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
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
  emptyDescription: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
