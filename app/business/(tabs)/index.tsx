/**
 * TownTap - Business Dashboard (Tab Home)
 * Main dashboard for business owners
 */

import { useAuth } from '@/contexts/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const Colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  secondaryLight: '#D1FAE5',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
};

interface DashboardStats {
  todayBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  avgRating: number;
  totalReviews: number;
}

export default function BusinessDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    avgRating: 0,
    totalReviews: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load business data and stats
      // This will be populated once connected to Supabase
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    bgColor 
  }: { 
    title: string; 
    value: string | number; 
    icon: keyof typeof Ionicons.glyphMap; 
    color: string; 
    bgColor: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color={Colors.white} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const QuickAction = ({ 
    title, 
    icon, 
    onPress 
  }: { 
    title: string; 
    icon: keyof typeof Ionicons.glyphMap; 
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={24} color={Colors.primary} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.businessName}>{profile?.full_name || 'Business Owner'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => router.push('/business/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.grayDark} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Today's Bookings"
            value={stats.todayBookings}
            icon="calendar"
            color={Colors.primary}
            bgColor={Colors.primaryLight}
          />
          <StatCard
            title="Pending"
            value={stats.pendingBookings}
            icon="time"
            color={Colors.accent}
            bgColor={Colors.accentLight}
          />
          <StatCard
            title="Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon="wallet"
            color={Colors.secondary}
            bgColor={Colors.secondaryLight}
          />
          <StatCard
            title="Rating"
            value={stats.avgRating.toFixed(1)}
            icon="star"
            color={Colors.accent}
            bgColor={Colors.accentLight}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Add Service"
              icon="add-circle-outline"
              onPress={() => router.push('/business/services/add')}
            />
            <QuickAction
              title="View Bookings"
              icon="calendar-outline"
              onPress={() => router.push('/business/(tabs)/bookings')}
            />
            <QuickAction
              title="Manage Team"
              icon="people-outline"
              onPress={() => router.push('/business/team')}
            />
            <QuickAction
              title="Promotions"
              icon="pricetag-outline"
              onPress={() => router.push('/business/promotions')}
            />
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity onPress={() => router.push('/business/(tabs)/bookings')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={Colors.gray} />
              <Text style={styles.emptyStateText}>No recent bookings</Text>
              <Text style={styles.emptyStateSubtext}>
                New bookings will appear here
              </Text>
            </View>
          ) : (
            recentBookings.map((booking, index) => (
              <TouchableOpacity
                key={booking.id || index}
                style={styles.bookingCard}
                onPress={() => router.push(`/business/bookings/${booking.id}`)}
              >
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingCustomer}>{booking.customer_name}</Text>
                  <Text style={styles.bookingService}>{booking.service_name}</Text>
                  <Text style={styles.bookingTime}>{booking.scheduled_time}</Text>
                </View>
                <View style={[styles.bookingStatus, { backgroundColor: Colors.primaryLight }]}>
                  <Text style={[styles.bookingStatusText, { color: Colors.primary }]}>
                    {booking.status}
                  </Text>
                </View>
              </TouchableOpacity>
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
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.gray,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grayDark,
    marginTop: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grayDark,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grayDark,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '47%',
    padding: 16,
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grayDark,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grayDark,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.grayLight,
    borderRadius: 12,
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  bookingService: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  bookingTime: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  bookingStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
