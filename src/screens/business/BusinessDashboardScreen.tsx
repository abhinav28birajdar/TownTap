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
  
  const styles = StyleSheet.create({
    statCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      marginHorizontal: 4,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flex: 1,
    },
    statHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${color}15`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statTitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    statTrend: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    trendText: {
      fontSize: 12,
      marginLeft: 4,
      fontWeight: '600',
    },
    trendUp: {
      color: theme.colors.success,
    },
    trendDown: {
      color: theme.colors.error,
    },
  });

  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statIcon}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {trend && (
        <View style={styles.statTrend}>
          <Ionicons 
            name={trendUp ? "trending-up" : "trending-down"} 
            size={14} 
            color={trendUp ? theme.colors.success : theme.colors.error} 
          />
          <Text style={[styles.trendText, trendUp ? styles.trendUp : styles.trendDown]}>
            {trend}
          </Text>
        </View>
      )}
    </View>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, color, onPress }) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    actionCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: `${color}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    actionInfo: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    actionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    actionArrow: {
      marginLeft: 12,
    },
  });

  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionContent}>
        <View style={styles.actionIcon}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
        <View style={styles.actionArrow}>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const BusinessDashboardScreen: React.FC = () => {
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

      // Fetch messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('business_id', user.id)
        .eq('read', false);

      // Fetch new customers (this month)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const { data: newCustomers } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('business_id', user.id)
        .gte('created_at', monthStart.toISOString());

      const uniqueCustomers = new Set(newCustomers?.map(order => order.customer_id) || []);

      setStats({
        totalMessages: messages?.length || 0,
        newCustomers: uniqueCustomers.size,
        pendingOrders: orders?.filter(order => order.order_status === 'pending').length || 0,
        todayRevenue: todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
        totalOrders: orders?.length || 0,
        completedOrders: orders?.filter(order => order.order_status === 'completed').length || 0,
      });

    } catch (error) {
      console.error('Error loading real-time data:', error);
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
      onPress: () => {
        // Navigate to order management
        Alert.alert('Feature', 'Navigate to Order Management');
      }
    },
    {
      title: 'Customer Messages',
      icon: 'chatbubbles-outline',
      color: '#10B981',
      badge: stats.totalMessages,
      onPress: () => {
        // Navigate to messages
        Alert.alert('Feature', 'Navigate to Customer Messages');
      }
    },
    {
      title: 'Business Profile',
      icon: 'business-outline',
      color: '#F59E0B',
      onPress: () => {
        // Navigate to business profile
        Alert.alert('Feature', 'Navigate to Business Profile');
      }
    },
    {
      title: 'Analytics',
      icon: 'analytics-outline',
      color: '#EF4444',
      onPress: () => {
        // Navigate to analytics
        Alert.alert('Feature', 'Navigate to Analytics');
      }
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const staticStats = [
    {
      title: 'Total Messages',
      value: '48',
      icon: 'chatbubbles',
      color: theme.colors.primary,
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'New Customers',
      value: '23',
      icon: 'people',
      color: theme.colors.success,
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Pending Orders',
      value: '7',
      icon: 'time',
      color: theme.colors.warning,
      trend: '-3%',
      trendUp: false,
    },
    {
      title: 'Revenue Today',
      value: '₹5,240',
      icon: 'wallet',
      color: theme.colors.secondary,
      trend: '+15%',
      trendUp: true,
    },
  ];

  const actions = [
    {
      title: 'Manage Orders',
      description: 'View and update customer orders',
      icon: 'receipt',
      color: theme.colors.primary,
      onPress: () => console.log('Manage Orders'),
    },
    {
      title: 'Customer Messages',
      description: 'Chat with customers and respond to inquiries',
      icon: 'chatbubbles',
      color: theme.colors.secondary,
      onPress: () => console.log('Customer Messages'),
    },
    {
      title: 'Business Profile',
      description: 'Update your business information and services',
      icon: 'storefront',
      color: theme.colors.warning,
      onPress: () => console.log('Business Profile'),
    },
    {
      title: 'Analytics',
      description: 'View detailed business performance metrics',
      icon: 'analytics',
      color: theme.colors.success,
      onPress: () => console.log('Analytics'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#ffffff',
      letterSpacing: 0.5,
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.85)',
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    refreshButton: {
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
    },
    themeButton: {
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
    },
    scrollContent: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    statCardWrapper: {
      width: (width - 48) / 2,
    },
    actionsContainer: {
      marginTop: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Business Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, {userProfile?.full_name || 'Business Owner'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsContainer}>
          {staticStats.map((stat: any, index: number) => (
            <View key={index} style={styles.statCardWrapper}>
              <StatCard {...stat} />
            </View>
          ))}
        </View>

        {/* Actions Section */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <ActionCard key={index} {...action} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessDashboardScreen;
