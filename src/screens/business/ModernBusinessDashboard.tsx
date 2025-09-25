import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../config/constants';
import { useTheme } from '../../context/ModernThemeContext';
import { BusinessService } from '../../services/businessService';
import { useAuthStore } from '../../stores/authStore';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  revenue: number;
}

const ModernBusinessDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { user, userProfile } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    revenue: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [business, setBusiness] = useState<any>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'add-product',
      title: 'Add Product',
      icon: 'add-circle',
      color: COLORS.success,
      onPress: handleAddProduct,
    },
    {
      id: 'orders',
      title: 'View Orders',
      icon: 'receipt',
      color: COLORS.primary,
      onPress: handleViewOrders,
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'analytics',
      color: COLORS.warning,
      onPress: handleViewAnalytics,
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: 'people',
      color: COLORS.info,
      onPress: handleViewCustomers,
    },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (user?.id) {
        // Load business info
        const businesses = await BusinessService.getMyBusinesses(user.id);
        if (businesses && businesses.length > 0) {
          setBusiness(businesses[0]);
        }
        
        // Load stats (mock data for now)
        setStats({
          totalOrders: 127,
          pendingOrders: 8,
          totalProducts: 45,
          revenue: 25420,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  function handleAddProduct() {
    // Navigate to add product screen
    Alert.alert('Add Product', 'This will navigate to add product screen');
  }

  function handleViewOrders() {
    // Navigate to orders screen
    Alert.alert('View Orders', 'This will navigate to orders management screen');
  }

  function handleViewAnalytics() {
    // Navigate to analytics screen
    Alert.alert('Analytics', 'This will navigate to analytics screen');
  }

  function handleViewCustomers() {
    // Navigate to customers screen
    Alert.alert('Customers', 'This will navigate to customers screen');
  }

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );

  const QuickActionCard = ({ action }: { action: QuickAction }) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: theme.colors.card }]}
      onPress={action.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
        <Ionicons name={action.icon as any} size={28} color={action.color} />
      </View>
      <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Good morning</Text>
            <Text style={[styles.businessName, { color: theme.colors.text }]}>
              {business?.business_name || userProfile?.full_name || 'Business Owner'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.notificationIcon, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="notifications" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon="receipt"
              color={COLORS.primary}
            />
            <StatCard
              title="Pending"
              value={stats.pendingOrders}
              icon="time"
              color={COLORS.warning}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Products"
              value={stats.totalProducts}
              icon="cube"
              color={COLORS.success}
            />
            <StatCard
              title="Revenue"
              value={`₹${stats.revenue.toLocaleString()}`}
              icon="trending-up"
              color={COLORS.info}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <QuickActionCard key={action.id} action={action} />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
          <View style={[styles.activityCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.activityText, { color: theme.colors.textSecondary }]}>
              No recent activity to show
            </Text>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activityText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ModernBusinessDashboard;
