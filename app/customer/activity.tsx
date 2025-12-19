import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Activity {
  id: string;
  type: 'booking' | 'review' | 'payment' | 'reward' | 'message' | 'promo';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  image?: string;
  icon?: string;
  iconColor?: string;
  actionText?: string;
  actionRoute?: string;
  meta?: {
    amount?: number;
    rating?: number;
    points?: number;
    providerName?: string;
  };
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    description: 'Your home cleaning service has been confirmed for tomorrow at 10:00 AM',
    timestamp: '2 hours ago',
    read: false,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100',
    actionText: 'View Details',
    actionRoute: '/customer/bookings',
    meta: {
      providerName: 'CleanPro Services',
    },
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Successful',
    description: 'Payment of ₹1,999 for AC Service was successful',
    timestamp: '5 hours ago',
    read: false,
    icon: 'card-outline',
    iconColor: '#4CAF50',
    meta: {
      amount: 1999,
    },
  },
  {
    id: '3',
    type: 'reward',
    title: 'You Earned 50 Points!',
    description: 'Loyalty points added for your recent booking. Total: 350 points',
    timestamp: '1 day ago',
    read: true,
    icon: 'gift-outline',
    iconColor: '#FF9800',
    actionText: 'View Rewards',
    actionRoute: '/customer/loyalty-rewards',
    meta: {
      points: 50,
    },
  },
  {
    id: '4',
    type: 'review',
    title: 'Review Request',
    description: 'How was your experience with GlamUp Salon? Share your feedback',
    timestamp: '2 days ago',
    read: true,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100',
    actionText: 'Write Review',
    actionRoute: '/customer/reviews',
  },
  {
    id: '5',
    type: 'promo',
    title: '20% OFF on Cleaning Services',
    description: 'Use code CLEAN20 on your next home cleaning booking. Valid till 30th June',
    timestamp: '3 days ago',
    read: true,
    icon: 'pricetag-outline',
    iconColor: '#E91E63',
    actionText: 'Use Now',
    actionRoute: '/discover/deals',
  },
  {
    id: '6',
    type: 'message',
    title: 'New Message from CoolCare',
    description: 'Hi! I\'m on my way. Will reach in about 15 minutes.',
    timestamp: '3 days ago',
    read: true,
    icon: 'chatbubble-outline',
    iconColor: '#2196F3',
    actionText: 'Reply',
    actionRoute: '/chat',
  },
  {
    id: '7',
    type: 'booking',
    title: 'Service Completed',
    description: 'Your electrician service has been completed successfully',
    timestamp: '5 days ago',
    read: true,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100',
    meta: {
      providerName: 'PowerFix Electric',
    },
  },
];

const activityFilters = ['All', 'Bookings', 'Payments', 'Rewards', 'Messages'];

export default function ActivityScreen() {
  const colors = useColors();
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState(mockActivities);

  const filteredActivities = activities.filter((activity) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Bookings') return activity.type === 'booking';
    if (activeFilter === 'Payments') return activity.type === 'payment';
    if (activeFilter === 'Rewards') return activity.type === 'reward' || activity.type === 'promo';
    if (activeFilter === 'Messages') return activity.type === 'message' || activity.type === 'review';
    return true;
  });

  const unreadCount = activities.filter((a) => !a.read).length;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const markAsRead = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
  };

  const markAllAsRead = () => {
    setActivities((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const getActivityIcon = (activity: Activity) => {
    if (activity.icon) {
      return (
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: (activity.iconColor || colors.primary) + '15' },
          ]}
        >
          <Ionicons
            name={activity.icon as any}
            size={24}
            color={activity.iconColor || colors.primary}
          />
        </View>
      );
    }
    if (activity.image) {
      return <Image source={{ uri: activity.image }} style={styles.activityImage} />;
    }
    return (
      <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="notifications-outline" size={24} color={colors.primary} />
      </View>
    );
  };

  const renderActivityCard = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={[
        styles.activityCard,
        { backgroundColor: colors.card },
        !item.read && { borderLeftWidth: 3, borderLeftColor: colors.primary },
      ]}
      onPress={() => {
        markAsRead(item.id);
        if (item.actionRoute) {
          router.push(item.actionRoute as any);
        }
      }}
    >
      {getActivityIcon(item)}

      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <ThemedText style={[styles.activityTitle, !item.read && { fontWeight: '700' }]}>
            {item.title}
          </ThemedText>
          {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
        <ThemedText
          style={[styles.activityDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </ThemedText>

        {item.meta && (
          <View style={styles.metaRow}>
            {item.meta.amount && (
              <View style={[styles.metaBadge, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <ThemedText style={[styles.metaText, { color: colors.success }]}>
                  ₹{item.meta.amount}
                </ThemedText>
              </View>
            )}
            {item.meta.points && (
              <View style={[styles.metaBadge, { backgroundColor: '#FFC107' + '20' }]}>
                <Ionicons name="star" size={12} color="#FFC107" />
                <ThemedText style={[styles.metaText, { color: '#B8860B' }]}>
                  +{item.meta.points} pts
                </ThemedText>
              </View>
            )}
            {item.meta.providerName && (
              <ThemedText style={[styles.providerText, { color: colors.textSecondary }]}>
                {item.meta.providerName}
              </ThemedText>
            )}
          </View>
        )}

        <View style={styles.activityFooter}>
          <ThemedText style={[styles.timestamp, { color: colors.textSecondary }]}>
            {item.timestamp}
          </ThemedText>
          {item.actionText && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
              onPress={() => {
                markAsRead(item.id);
                if (item.actionRoute) router.push(item.actionRoute as any);
              }}
            >
              <ThemedText style={[styles.actionBtnText, { color: colors.primary }]}>
                {item.actionText}
              </ThemedText>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
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
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>Activity</ThemedText>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.unreadBadgeText}>{unreadCount}</ThemedText>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead}>
            <ThemedText style={[styles.markAllText, { color: colors.primary }]}>
              Mark all read
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterList}
      >
        {activityFilters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterPill,
              {
                backgroundColor: activeFilter === filter ? colors.primary : colors.card,
                borderColor: activeFilter === filter ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <ThemedText
              style={[
                styles.filterText,
                { color: activeFilter === filter ? '#fff' : colors.text },
              ]}
            >
              {filter}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Activity List */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          unreadCount > 0 ? (
            <View style={styles.todayHeader}>
              <ThemedText style={[styles.todayText, { color: colors.textSecondary }]}>
                New Activity
              </ThemedText>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Activity Yet</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Your recent activity will appear here
            </ThemedText>
          </View>
        }
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterScroll: {
    maxHeight: 50,
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
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
  todayHeader: {
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  activityCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  providerText: {
    fontSize: 12,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
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
});
