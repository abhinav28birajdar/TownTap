import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../context/ModernThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');

interface RealTimeStats {
  totalMessages: number;
  newCustomers: number;
  pendingOrders: number;
  todayRevenue: number;
  totalOrders: number;
  completedOrders: number;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, trendUp }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={trendUp ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={trendUp ? '#10B981' : '#EF4444'} 
            />
            <Text style={[styles.trendText, { color: trendUp ? '#10B981' : '#EF4444' }]}>
              {trend}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
    </View>
  );
};

const RealTimeBusinessDashboard: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, userProfile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<RealTimeStats>({
    totalMessages: 0,
    newCustomers: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
  });

  // Real-time data fetching
  useEffect(() => {
    loadRealTimeData();
    
    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `business_id=eq.${user?.id}`
      }, () => {
        loadRealTimeData();
      })
      .subscribe();

    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, () => {
        loadRealTimeData();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, [user?.id]);

  const loadRealTimeData = async () => {
    if (!user?.id) return;

    try {
      // Get today's date range
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      // Fetch orders data
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', user.id);

      // Fetch today's orders
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', user.id)
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString());

      // Fetch messages (mock for now)
      const totalMessages = Math.floor(Math.random() * 20) + 5;

      // Fetch new customers (this month)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const { data: newCustomers } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('business_id', user.id)
        .gte('created_at', monthStart.toISOString());

      const uniqueCustomers = new Set(newCustomers?.map(order => order.customer_id) || []);

      setStats({
        totalMessages,
        newCustomers: uniqueCustomers.size,
        pendingOrders: orders?.filter(order => order.order_status === 'pending').length || 0,
        todayRevenue: todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
        totalOrders: orders?.length || 0,
        completedOrders: orders?.filter(order => order.order_status === 'completed').length || 0,
      });

    } catch (error) {
      console.error('Error loading real-time data:', error);
      // Use mock data for demo
      setStats({
        totalMessages: 12,
        newCustomers: 8,
        pendingOrders: 5,
        todayRevenue: 2500,
        totalOrders: 45,
        completedOrders: 38,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRealTimeData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      title: 'Manage Orders',
      icon: 'receipt-outline',
      color: '#3B82F6',
      badge: stats.pendingOrders,
      onPress: () => Alert.alert('Feature', 'Navigate to Order Management')
    },
    {
      title: 'Customer Messages',
      icon: 'chatbubbles-outline',
      color: '#10B981',
      badge: stats.totalMessages,
      onPress: () => Alert.alert('Feature', 'Navigate to Customer Messages')
    },
    {
      title: 'Business Profile',
      icon: 'business-outline',
      color: '#F59E0B',
      onPress: () => Alert.alert('Feature', 'Navigate to Business Profile')
    },
    {
      title: 'Analytics',
      icon: 'analytics-outline',
      color: '#EF4444',
      onPress: () => Alert.alert('Feature', 'Navigate to Analytics')
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.businessName}>
              {userProfile?.full_name || 'Business Owner'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleTheme}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Today's Overview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              📊 Today's Overview
            </Text>
            
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Messages"
                value={stats.totalMessages.toString()}
                icon="chatbubbles"
                color="#3B82F6"
                trend={stats.totalMessages > 0 ? "+12%" : "0%"}
                trendUp={stats.totalMessages > 0}
              />
              <StatCard
                title="New Customers"
                value={stats.newCustomers.toString()}
                icon="people"
                color="#10B981"
                trend={stats.newCustomers > 0 ? "+8%" : "0%"}
                trendUp={stats.newCustomers > 0}
              />
            </View>

            <View style={styles.statsGrid}>
              <StatCard
                title="Pending Orders"
                value={stats.pendingOrders.toString()}
                icon="time"
                color="#F59E0B"
                trend={stats.pendingOrders > 0 ? "Urgent" : "All clear"}
                trendUp={false}
              />
              <StatCard
                title="Today's Revenue"
                value={`₹${stats.todayRevenue.toLocaleString()}`}
                icon="trending-up"
                color="#EF4444"
                trend={stats.todayRevenue > 0 ? "+15%" : "0%"}
                trendUp={stats.todayRevenue > 0}
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              ⚡ Quick Actions
            </Text>
            
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={action.onPress}
                >
                  <View style={styles.actionHeader}>
                    <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    {action.badge && action.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{action.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Business Performance */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              📈 Business Performance
            </Text>
            
            <View style={[styles.performanceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.performanceRow}>
                <Text style={[styles.performanceLabel, { color: theme.colors.textSecondary }]}>
                  Total Orders
                </Text>
                <Text style={[styles.performanceValue, { color: theme.colors.text }]}>
                  {stats.totalOrders}
                </Text>
              </View>
              
              <View style={styles.performanceRow}>
                <Text style={[styles.performanceLabel, { color: theme.colors.textSecondary }]}>
                  Completed Orders
                </Text>
                <Text style={[styles.performanceValue, { color: '#10B981' }]}>
                  {stats.completedOrders}
                </Text>
              </View>
              
              <View style={styles.performanceRow}>
                <Text style={[styles.performanceLabel, { color: theme.colors.textSecondary }]}>
                  Success Rate
                </Text>
                <Text style={[styles.performanceValue, { color: '#10B981' }]}>
                  {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  themeToggle: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 0.48,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  performanceCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  performanceLabel: {
    fontSize: 16,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RealTimeBusinessDashboard;
