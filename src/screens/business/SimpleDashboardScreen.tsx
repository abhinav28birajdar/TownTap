import { MotiView } from 'moti';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { COLORS, DIMENSIONS } from '../../config/constants';
import { useAuthStore } from '../../stores/authStore';

const SimpleDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user, userProfile, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  // Mock data
  const mockMetrics = {
    totalRevenue: 45000,
    totalOrders: 127,
    averageOrderValue: 354,
    customerCount: 89,
    todayRevenue: 2500,
    weekRevenue: 12000,
    monthRevenue: 45000,
  };

  const mockRecentOrders = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Doe',
      amount: 450,
      status: 'pending',
      date: '2025-01-20'
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      customerName: 'Jane Smith',
      amount: 320,
      status: 'completed',
      date: '2025-01-20'
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      customerName: 'Mike Johnson',
      amount: 675,
      status: 'preparing',
      date: '2025-01-19'
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'confirmed': return COLORS.info;
      case 'preparing': return '#F59E0B';
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.gray[500];
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString()}`;
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: string,
    color: string,
    delay: number = 0
  ) => (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        opacity: { type: 'spring', damping: 15, stiffness: 200, delay: delay * 100 },
        scale: { type: 'spring', damping: 15, stiffness: 200, delay: delay * 100 }
      }}
      key={title}
      style={[styles.metricCard, { borderLeftColor: color }]}
    >
      <View style={styles.metricHeader}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </MotiView>
  );

  const renderOrderItem = (order: any, index: number) => (
    <MotiView
      key={order.id}
      from={{ opacity: 0, translateX: -50 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ 
        opacity: { type: 'timing', duration: 300, delay: index * 100 },
        translateX: { type: 'timing', duration: 300, delay: index * 100 }
      }}
      style={styles.orderItem}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>
      <Text style={styles.orderCustomer}>{order.customerName}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>{formatCurrency(order.amount)}</Text>
        <Text style={styles.orderDate}>{order.date}</Text>
      </View>
    </MotiView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ 
            opacity: { type: 'timing', duration: 500 },
            translateY: { type: 'timing', duration: 500 }
          }}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Business Dashboard</Text>
              <Text style={styles.subtitle}>
                Welcome back, {userProfile?.full_name || 'Business Owner'}!
              </Text>
            </View>
            <View style={{ alignSelf: 'flex-start' }}>
              <Button
                title="Logout"
                onPress={handleLogout}
                variant="outline"
                size="sm"
              />
            </View>
          </View>
        </MotiView>

        {/* Quick Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ 
            opacity: { type: 'timing', duration: 500, delay: 200 },
            translateY: { type: 'timing', duration: 500, delay: 200 }
          }}
        >
          <Card>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <Button
                title="Add Product"
                onPress={() => console.log('Add Product')}
                variant="primary"
                size="sm"
                icon="➕"
              />
              <Button
                title="View Orders"
                onPress={() => console.log('View Orders')}
                variant="outline"
                size="sm"
                icon="📦"
              />
              <Button
                title="Analytics"
                onPress={() => console.log('Analytics')}
                variant="secondary"
                size="sm"
                icon="📊"
              />
            </View>
          </Card>
        </MotiView>

        {/* Metrics Overview */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ 
            opacity: { type: 'timing', duration: 500, delay: 400 },
            translateY: { type: 'timing', duration: 500, delay: 400 }
          }}
        >
          <Card>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.metricsGrid}>
              {renderMetricCard(
                'Total Revenue',
                formatCurrency(mockMetrics.totalRevenue),
                '💰',
                COLORS.success,
                0
              )}
              {renderMetricCard(
                'Total Orders',
                mockMetrics.totalOrders.toString(),
                '📦',
                COLORS.info,
                1
              )}
              {renderMetricCard(
                'Avg Order Value',
                formatCurrency(mockMetrics.averageOrderValue),
                '📈',
                COLORS.warning,
                2
              )}
              {renderMetricCard(
                'Customers',
                mockMetrics.customerCount.toString(),
                '👥',
                COLORS.purple[500],
                3
              )}
            </View>
          </Card>
        </MotiView>

        {/* Revenue Breakdown */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ 
            opacity: { type: 'timing', duration: 500, delay: 600 },
            translateY: { type: 'timing', duration: 500, delay: 600 }
          }}
        >
          <Card>
            <Text style={styles.sectionTitle}>Revenue</Text>
            <View style={styles.revenueGrid}>
              {renderMetricCard(
                'Today',
                formatCurrency(mockMetrics.todayRevenue),
                '📅',
                COLORS.success,
                0
              )}
              {renderMetricCard(
                'This Week',
                formatCurrency(mockMetrics.weekRevenue),
                '📊',
                COLORS.info,
                1
              )}
              {renderMetricCard(
                'This Month',
                formatCurrency(mockMetrics.monthRevenue),
                '📈',
                COLORS.warning,
                2
              )}
            </View>
          </Card>
        </MotiView>

        {/* Recent Orders */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ 
            opacity: { type: 'timing', duration: 500, delay: 800 },
            translateY: { type: 'timing', duration: 500, delay: 800 }
          }}
        >
          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <Button
                title="View All"
                onPress={() => console.log('View All Orders')}
                variant="ghost"
                size="sm"
              />
            </View>
            
            <View style={styles.ordersList}>
              {mockRecentOrders.map((order, index) => renderOrderItem(order, index))}
            </View>
          </Card>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DIMENSIONS.PADDING.md,
  },
  header: {
    marginBottom: DIMENSIONS.PADDING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: DIMENSIONS.PADDING.sm,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: DIMENSIONS.PADDING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DIMENSIONS.PADDING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: DIMENSIONS.PADDING.sm,
  },
  metricsGrid: {
    gap: DIMENSIONS.PADDING.md,
  },
  revenueGrid: {
    gap: DIMENSIONS.PADDING.md,
  },
  metricCard: {
    backgroundColor: COLORS.white,
    padding: DIMENSIONS.PADDING.md,
    borderRadius: DIMENSIONS.BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderColor: COLORS.gray[200],
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  metricIcon: {
    fontSize: 20,
    marginRight: DIMENSIONS.PADDING.sm,
  },
  metricTitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  ordersList: {
    gap: DIMENSIONS.PADDING.sm,
  },
  orderItem: {
    backgroundColor: COLORS.gray[50],
    padding: DIMENSIONS.PADDING.md,
    borderRadius: DIMENSIONS.BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DIMENSIONS.PADDING.xs,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  statusBadge: {
    paddingHorizontal: DIMENSIONS.PADDING.sm,
    paddingVertical: DIMENSIONS.PADDING.xs,
    borderRadius: DIMENSIONS.BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  orderCustomer: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.success,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});

export default SimpleDashboardScreen;
