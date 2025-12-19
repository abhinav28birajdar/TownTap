import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockHistory = [
  {
    id: '1',
    serviceName: 'Plumbing Repair',
    businessName: 'QuickFix Plumbers',
    date: '2025-12-15',
    time: '10:00 AM',
    status: 'completed',
    amount: 550,
    rating: 5,
  },
  {
    id: '2',
    serviceName: 'House Cleaning',
    businessName: 'Sparkle Clean Services',
    date: '2025-12-10',
    time: '2:00 PM',
    status: 'completed',
    amount: 800,
    rating: 5,
  },
  {
    id: '3',
    serviceName: 'Electrical Work',
    businessName: 'Bright Electricians',
    date: '2025-12-05',
    time: '11:30 AM',
    status: 'completed',
    amount: 650,
    rating: 4,
  },
  {
    id: '4',
    serviceName: 'AC Repair',
    businessName: 'Cool Tech Services',
    date: '2025-11-28',
    time: '3:00 PM',
    status: 'completed',
    amount: 1200,
    rating: 5,
  },
  {
    id: '5',
    serviceName: 'Painting',
    businessName: 'Color Masters',
    date: '2025-11-20',
    time: '9:00 AM',
    status: 'completed',
    amount: 3500,
    rating: 4,
  },
];

export default function OrderHistoryScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState(mockHistory);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/customer/order-details?orderId=${orderId}`);
  };

  const handleReorder = (orderId: string) => {
    const order = history.find(o => o.id === orderId);
    if (order) {
      router.push(`/booking/booking-form?service=${order.serviceName}` as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Order History</ThemedText>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {history.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={styles.emptyState}
          >
            <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Order History</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Your completed orders will appear here
            </ThemedText>
          </Animated.View>
        ) : (
          <View style={styles.historyContainer}>
            {history.map((order, index) => (
              <Animated.View
                key={order.id}
                entering={FadeInDown.delay(100 + index * 50)}
              >
                <TouchableOpacity
                  style={[styles.orderCard, { backgroundColor: colors.card }]}
                  onPress={() => handleOrderPress(order.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderHeader}>
                    <View style={[styles.serviceIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="construct" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.orderInfo}>
                      <ThemedText style={styles.serviceName} numberOfLines={1}>
                        {order.serviceName}
                      </ThemedText>
                      <ThemedText style={styles.businessName} numberOfLines={1}>
                        {order.businessName}
                      </ThemedText>
                      <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= order.rating ? 'star' : 'star-outline'}
                            size={14}
                            color="#FFC107"
                          />
                        ))}
                      </View>
                    </View>
                    <View style={styles.orderMeta}>
                      <ThemedText style={styles.orderAmount}>₹{order.amount}</ThemedText>
                      <ThemedText style={styles.orderDate}>{order.date}</ThemedText>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.orderActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.border }]}
                      onPress={() => handleOrderPress(order.id)}
                    >
                      <Ionicons name="document-text-outline" size={18} color={colors.text} />
                      <ThemedText style={styles.actionText}>Details</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.reorderButton, { backgroundColor: colors.primary }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleReorder(order.id);
                      }}
                    >
                      <Ionicons name="repeat-outline" size={18} color="#FFFFFF" />
                      <ThemedText style={styles.reorderText}>Reorder</ThemedText>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
        <View style={{ height: 20 }} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  historyContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  reorderButton: {
    borderWidth: 0,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reorderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
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
    opacity: 0.6,
  },
});
