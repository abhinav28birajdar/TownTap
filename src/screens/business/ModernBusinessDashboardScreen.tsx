import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernCard } from '../../components/modern/ModernCard';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');

interface BusinessStats {
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  averageRating: number;
  pendingOrders: number;
  todayOrders: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const ModernBusinessDashboardScreen: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<BusinessStats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeCustomers: 0,
    averageRating: 0,
    pendingOrders: 0,
    todayOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load business stats (mock data for now)
      setStats({
        totalOrders: 156,
        totalRevenue: 25480.50,
        activeCustomers: 89,
        averageRating: 4.7,
        pendingOrders: 8,
        todayOrders: 12,
      });

      // Load recent orders (mock data)
      setRecentOrders([
        {
          id: '1',
          customer_name: 'John Doe',
          total_amount: 150.00,
          status: 'preparing',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          customer_name: 'Jane Smith',
          total_amount: 85.50,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'preparing': return theme.colors.info;
      case 'ready': return theme.colors.success;
      case 'delivered': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const quickActions = [
    {
      id: 'add-product',
      title: 'Add Product',
      icon: 'add-circle-outline' as keyof typeof Ionicons.glyphMap,
      color: theme.colors.primary,
      onPress: () => console.log('Add Product'),
    },
    {
      id: 'manage-orders',
      title: 'Manage Orders',
      icon: 'receipt-outline' as keyof typeof Ionicons.glyphMap,
      color: theme.colors.secondary,
      onPress: () => console.log('Manage Orders'),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'analytics-outline' as keyof typeof Ionicons.glyphMap,
      color: theme.colors.accent,
      onPress: () => console.log('Analytics'),
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
      color: theme.colors.info,
      onPress: () => console.log('Customers'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    headerTitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    welcomeCard: {
      marginBottom: theme.spacing.lg,
    },
    welcomeContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    avatarText: {
      ...theme.typography.h3,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    welcomeText: {
      flex: 1,
    },
    welcomeTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    welcomeSubtitle: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    statsContainer: {
      marginBottom: theme.spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    statCard: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    statContent: {
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    statValue: {
      ...theme.typography.h3,
      color: theme.colors.text,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    quickActionsContainer: {
      marginBottom: theme.spacing.lg,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -theme.spacing.xs,
    },
    actionCard: {
      width: (width - theme.spacing.lg * 2 - theme.spacing.xs * 2) / 2,
      marginHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    actionContent: {
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    actionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    actionTitle: {
      ...theme.typography.body1,
      color: theme.colors.text,
      fontWeight: '500',
      textAlign: 'center',
    },
    recentOrdersContainer: {
      marginBottom: theme.spacing.xxl,
    },
    orderItem: {
      marginBottom: theme.spacing.sm,
    },
    orderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    orderInfo: {
      flex: 1,
    },
    orderCustomer: {
      ...theme.typography.body1,
      color: theme.colors.text,
      fontWeight: '500',
      marginBottom: theme.spacing.xs,
    },
    orderAmount: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    orderStatus: {
      ...theme.typography.caption,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      fontWeight: '500',
      textTransform: 'uppercase',
    },
  });

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
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={24}
                color={theme.colors.icon}
              />
            </TouchableOpacity>
          </View>

          {/* Welcome Card */}
          <ModernCard style={styles.welcomeCard} variant="elevated">
            <View style={styles.welcomeContent}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>B</Text>
              </View>
              <View style={styles.welcomeText}>
                <Text style={styles.welcomeTitle}>Welcome back!</Text>
                <Text style={styles.welcomeSubtitle}>
                  Here's your business overview
                </Text>
              </View>
            </View>
          </ModernCard>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsRow}>
              <ModernCard style={styles.statCard} variant="elevated">
                <View style={styles.statContent}>
                  <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '20' }]}>
                    <Ionicons name="trending-up" size={20} color={theme.colors.success} />
                  </View>
                  <Text style={styles.statValue}>{stats.todayOrders}</Text>
                  <Text style={styles.statLabel}>Today's Orders</Text>
                </View>
              </ModernCard>
              
              <ModernCard style={styles.statCard} variant="elevated">
                <View style={styles.statContent}>
                  <View style={[styles.statIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                    <Ionicons name="time" size={20} color={theme.colors.warning} />
                  </View>
                  <Text style={styles.statValue}>{stats.pendingOrders}</Text>
                  <Text style={styles.statLabel}>Pending Orders</Text>
                </View>
              </ModernCard>
            </View>

            <View style={styles.statsRow}>
              <ModernCard style={styles.statCard} variant="elevated">
                <View style={styles.statContent}>
                  <View style={[styles.statIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Ionicons name="receipt" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{stats.totalOrders}</Text>
                  <Text style={styles.statLabel}>Total Orders</Text>
                </View>
              </ModernCard>
              
              <ModernCard style={styles.statCard} variant="elevated">
                <View style={styles.statContent}>
                  <View style={[styles.statIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                    <Ionicons name="cash" size={20} color={theme.colors.secondary} />
                  </View>
                  <Text style={styles.statValue}>₹{stats.totalRevenue.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total Revenue</Text>
                </View>
              </ModernCard>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <ModernCard
                  key={action.id}
                  style={styles.actionCard}
                  variant="elevated"
                  onPress={action.onPress}
                >
                  <View style={styles.actionContent}>
                    <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                      <Ionicons name={action.icon} size={24} color={action.color} />
                    </View>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                  </View>
                </ModernCard>
              ))}
            </View>
          </View>

          {/* Recent Orders */}
          <View style={styles.recentOrdersContainer}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {recentOrders.map((order) => (
              <ModernCard
                key={order.id}
                style={styles.orderItem}
                variant="outlined"
              >
                <View style={styles.orderContent}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderCustomer}>{order.customer_name}</Text>
                    <Text style={styles.orderAmount}>₹{order.total_amount}</Text>
                  </View>
                  <Text
                    style={[
                      styles.orderStatus,
                      {
                        backgroundColor: getStatusColor(order.status) + '20',
                        color: getStatusColor(order.status),
                      }
                    ]}
                  >
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </ModernCard>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModernBusinessDashboardScreen;
