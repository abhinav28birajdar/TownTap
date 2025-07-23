import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');

interface DashboardStats {
  todaysSales: number;
  totalOrders: number;
  newCustomers: number;
  avgRating: number;
  pendingOrders: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'review' | 'customer';
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

const mockStats: DashboardStats = {
  todaysSales: 12500,
  totalOrders: 45,
  newCustomers: 8,
  avgRating: 4.6,
  pendingOrders: 3,
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order #1234',
    subtitle: 'Rajesh Kumar - ₹350',
    time: '2 min ago',
    status: 'pending',
  },
  {
    id: '2',
    type: 'review',
    title: 'New Review',
    subtitle: 'Priya Sharma gave 5 stars',
    time: '15 min ago',
  },
  {
    id: '3',
    type: 'order',
    title: 'Order Completed',
    subtitle: 'Amit Patel - ₹780',
    time: '1 hour ago',
    status: 'completed',
  },
  {
    id: '4',
    type: 'customer',
    title: 'New Customer',
    subtitle: 'Sunita Devi joined',
    time: '2 hours ago',
  },
];

export default function BusinessDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const StatCard = ({ title, value, subtitle, icon, color }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const QuickActionCard = ({ title, icon, onPress }: {
    title: string;
    icon: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ item }: { item: RecentActivity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Text style={styles.activityIconText}>
          {item.type === 'order' ? '🛒' : item.type === 'review' ? '⭐' : '👤'}
        </Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.activityMeta}>
        <Text style={styles.activityTime}>{item.time}</Text>
        {item.status && (
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'pending' ? '#ff9800' : '#4caf50' }
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'pending' ? 'Pending' : 'Completed'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.businessName}>{user?.full_name || 'Business Owner'}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['today', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Today's Sales"
            value={`₹${mockStats.todaysSales.toLocaleString()}`}
            subtitle="+12% from yesterday"
            icon="💰"
            color="#4caf50"
          />
          <StatCard
            title="Total Orders"
            value={mockStats.totalOrders}
            subtitle="3 pending"
            icon="📦"
            color="#2196F3"
          />
          <StatCard
            title="New Customers"
            value={mockStats.newCustomers}
            subtitle="This week"
            icon="👥"
            color="#ff9800"
          />
          <StatCard
            title="Average Rating"
            value={mockStats.avgRating}
            subtitle="Based on 120 reviews"
            icon="⭐"
            color="#9c27b0"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Add Product"
              icon="➕"
              onPress={() => console.log('Add Product')}
            />
            <QuickActionCard
              title="AI Content"
              icon="🤖"
              onPress={() => console.log('AI Content')}
            />
            <QuickActionCard
              title="View Orders"
              icon="📋"
              onPress={() => console.log('View Orders')}
            />
            <QuickActionCard
              title="Analytics"
              icon="📊"
              onPress={() => console.log('Analytics')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {mockRecentActivity.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* AI Insights Card */}
        <TouchableOpacity style={styles.aiInsightsCard}>
          <View style={styles.aiInsightsContent}>
            <Text style={styles.aiInsightsIcon}>🤖</Text>
            <View style={styles.aiInsightsText}>
              <Text style={styles.aiInsightsTitle}>AI Business Insights</Text>
              <Text style={styles.aiInsightsSubtitle}>
                Get AI-powered insights about your business performance
              </Text>
            </View>
            <Text style={styles.aiInsightsArrow}>→</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2196F3',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  statsGrid: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    width: (width - 64) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  aiInsightsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 24,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  aiInsightsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiInsightsIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  aiInsightsText: {
    flex: 1,
  },
  aiInsightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  aiInsightsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  aiInsightsArrow: {
    fontSize: 20,
    color: '#2196F3',
  },
});
