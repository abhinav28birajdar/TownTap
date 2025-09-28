import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

interface BusinessStats {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  todayOrders: number;
  todayRevenue: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  order_total: number;
  status: string;
  created_at: string;
}

const { width } = Dimensions.get('window');

export default function BusinessDashboardScreen() {
  const { user, profile } = useAuthStore();
  const [stats, setStats] = useState<BusinessStats>({
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadBusinessStats(),
        loadRecentOrders(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBusinessStats = async () => {
    if (!user?.id) return;

    try {
      // Load business statistics
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total, status, created_at')
        .eq('business_id', user.id);

      if (ordersError) throw ordersError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', user.id);

      if (reviewsError) throw reviewsError;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = ordersData?.filter(order => 
        new Date(order.created_at) >= today
      ) || [];

      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageRating = reviewsData?.length 
        ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
        : 0;

      setStats({
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        averageRating,
        totalReviews: reviewsData?.length || 0,
        todayOrders: todayOrders.length,
        todayRevenue,
      });
    } catch (error) {
      console.error('Error loading business stats:', error);
    }
  };

  const loadRecentOrders = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          status,
          created_at,
          profiles!customer_id (
            name
          )
        `)
        .eq('business_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedOrders = data?.map(order => ({
        id: order.id,
        customer_name: (order.profiles as any)?.name || 'Unknown Customer',
        order_total: order.total,
        status: order.status,
        created_at: order.created_at,
      })) || [];

      setRecentOrders(formattedOrders);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#3b82f6';
      case 'preparing':
        return '#8b5cf6';
      case 'ready':
        return '#10b981';
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && !refreshing) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.businessName}>
            {profile?.business_name || profile?.name || 'Your Business'}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Text style={styles.statValue}>{stats.todayOrders}</Text>
              <Text style={styles.statLabel}>Today's Orders</Text>
            </View>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Text style={styles.statValue}>{formatCurrency(stats.todayRevenue)}</Text>
              <Text style={styles.statLabel}>Today's Revenue</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Text style={styles.statValue}>{stats.averageRating.toFixed(1)} ⭐</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Text style={styles.statValue}>{stats.totalReviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/business/orders')}
            >
              <Text style={styles.quickActionText}>📋 View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/business/profile')}
            >
              <Text style={styles.quickActionText}>⚙️ Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/business/analytics')}
            >
              <Text style={styles.quickActionText}>📊 Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/business/reviews')}
            >
              <Text style={styles.quickActionText}>⭐ Reviews</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/business/orders')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent orders</Text>
            </View>
          ) : (
            <View style={styles.ordersContainer}>
              {recentOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.customerName}>{order.customer_name}</Text>
                    <Text style={styles.orderTotal}>{formatCurrency(order.order_total)}</Text>
                  </View>
                  <View style={styles.orderFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  businessName: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  statCardHalf: {
    flex: 1,
    marginHorizontal: 6,
  },
  statValue: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    width: (width - 64) / 2,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  ordersContainer: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  emptyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.7,
  },
});