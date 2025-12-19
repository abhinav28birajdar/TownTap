import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/auth-context';

const { width: screenWidth } = Dimensions.get('window');

// Quick action items for business owners
const quickActions = [
  { id: 1, title: 'New Orders', icon: 'receipt-outline', route: '/business-owner/orders', badge: 3 },
  { id: 2, title: 'Services', icon: 'construct-outline', route: '/business-owner/services' },
  { id: 3, title: 'Analytics', icon: 'analytics-outline', route: '/business-owner/analytics' },
  { id: 4, title: 'Customers', icon: 'people-outline', route: '/business-owner/customers' },
];

// Sample business stats
const businessStats = {
  todayEarnings: 2450,
  pendingOrders: 3,
  completedOrders: 28,
  customerRating: 4.8,
  totalCustomers: 156,
  monthlyGrowth: 12.5,
};

export default function BusinessOwnerDashboard() {
  const { user } = useAuth();
  const colors = useColors();
  const [greeting, setGreeting] = useState('');
  const [businessName, setBusinessName] = useState('QuickFix Services');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleQuickAction = (route: string) => {
    console.log('Quick action clicked:', route);
    try {
      router.push(route as any);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleViewOrderDetails = (orderId: string) => {
    console.log('View order details:', orderId);
    router.push(`/business-owner/order-details?id=${orderId}`);
  };

  const handleAcceptOrder = (orderId: string) => {
    console.log('Accept order:', orderId);
    // Add accept order logic
  };

  const handleRejectOrder = (orderId: string) => {
    console.log('Reject order:', orderId);
    // Add reject order logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>{greeting}!</Text>
              <Text style={styles.businessName}>{businessName}</Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => {
                  console.log('Messages clicked');
                  router.push('/(tabs)/messages');
                }}
              >
                <Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => {
                  console.log('Notifications clicked');
                  router.push('/business-owner/notifications');
                }}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => {
                  console.log('Profile clicked');
                  router.push('/business-owner/profile');
                }}
              >
                <Ionicons name="person-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Earnings */}
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Today's Earnings</Text>
            <Text style={styles.earningsAmount}>₹{businessStats.todayEarnings}</Text>
            <View style={styles.earningsChange}>
              <Ionicons name="trending-up" size={16} color="#10B981" />
              <Text style={styles.changeText}>+{businessStats.monthlyGrowth}% this month</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{businessStats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Pending Orders</Text>
              <View style={styles.statIcon}>
                <Ionicons name="time-outline" size={20} color="#F59E0B" />
              </View>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{businessStats.completedOrders}</Text>
              <Text style={styles.statLabel}>Completed</Text>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{businessStats.customerRating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
              <View style={styles.statIcon}>
                <Ionicons name="star" size={20} color="#FBBF24" />
              </View>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{businessStats.totalCustomers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
              <View style={styles.statIcon}>
                <Ionicons name="people-outline" size={20} color="#6366F1" />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => handleQuickAction(action.route)}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon as any} size={24} color="#10B981" />
                  {action.badge && (
                    <View style={styles.actionBadge}>
                      <Text style={styles.actionBadgeText}>{action.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => handleQuickAction('/business-owner/orders')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderService}>Plumbing Repair</Text>
                <Text style={styles.orderCustomer}>John Doe</Text>
              </View>
              <View style={styles.orderStatus}>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.orderFooter}>
              <Text style={styles.orderDate}>Today, 2:30 PM</Text>
              <Text style={styles.orderAmount}>₹850</Text>
            </View>
            
            <View style={styles.orderActions}>
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={() => handleRejectOrder('order-1')}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder('order-1')}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderService}>Electrical Work</Text>
                <Text style={styles.orderCustomer}>Sarah Wilson</Text>
              </View>
              <View style={styles.orderStatus}>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressText}>In Progress</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.orderFooter}>
              <Text style={styles.orderDate}>Today, 11:00 AM</Text>
              <Text style={styles.orderAmount}>₹1200</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.viewOrderButton}
              onPress={() => handleViewOrderDetails('order-2')}
            >
              <Text style={styles.viewOrderText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Insights</Text>
          <View style={styles.insightCard}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.insightGradient}
            >
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Boost Your Visibility</Text>
                <Text style={styles.insightSubtitle}>Complete your business profile to get 3x more bookings</Text>
                <TouchableOpacity style={styles.insightButton}>
                  <Text style={styles.insightButtonText}>Complete Profile</Text>
                </TouchableOpacity>
              </View>
              <Ionicons name="trending-up" size={40} color="#FFFFFF" />
            </LinearGradient>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => router.push('/business-owner/add-service' as any)}
      >
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  businessName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 4,
  },
  demoLabel: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '600',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginRight: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  profileButton: {
    padding: 8,
  },
  earningsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  earningsAmount: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 4,
  },
  earningsChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changeText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: (screenWidth - 52) / 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionItem: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#DCFCE7',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderCustomer: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  progressBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectButton: {
    flex: 0.48,
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  acceptButton: {
    flex: 0.48,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewOrderButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewOrderText: {
    color: '#374151',
    fontWeight: '600',
  },
  insightCard: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  insightGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  insightSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  insightButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  insightButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSpacing: {
    height: 100,
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
