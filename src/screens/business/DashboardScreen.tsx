import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { COLORS, DIMENSIONS } from '../../config/constants';
import { getBusinessAnalytics, getRecentOrders } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import type { Order } from '../../types';

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageRating: number;
  totalCustomers: number;
}

const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user, userProfile } = useAuthStore();
  
  // State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async (isRefresh = false) => {
    if (!user?.id) return;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Fetch analytics and recent orders in parallel
      const [analyticsResponse, ordersResponse] = await Promise.all([
        getBusinessAnalytics(user.id),
        getRecentOrders(user.id, 5)
      ]);

      if (analyticsResponse.data) {
        setMetrics(analyticsResponse.data);
      }

      if (ordersResponse.data) {
        setRecentOrders(ordersResponse.data);
      }

      if (analyticsResponse.error || ordersResponse.error) {
        throw new Error('Failed to load dashboard data');
      }

    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadDashboardData(true);
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
      style={[styles.metricCard, { borderLeftColor: color }]}
    >
      <View style={styles.metricHeader}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </MotiView>
  );

  const renderOrderItem = (order: Order, index: number) => (
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
        <Text style={styles.orderNumber}>#{order.id.slice(-6)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>
      <Text style={styles.orderCustomer}>{(order as any).customer_name || 'Anonymous'}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderAmount}>₹{order.total_amount}</Text>
        <Text style={styles.orderDate}>
          {new Date(order.created_at).toLocaleDateString()}
        </Text>
      </View>
    </MotiView>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return COLORS.warning[500];
      case 'confirmed': return COLORS.info[500];
      case 'preparing': return COLORS.warning[600];
      case 'ready': return COLORS.success[500];
      case 'completed': return COLORS.success[600];
      case 'cancelled': return COLORS.error[500];
      default: return COLORS.gray[500];
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading && !metrics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ opacity: { type: 'timing', duration: 500, loop: true } }}
          >
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary[500]]}
            tintColor={COLORS.primary[500]}
          />
        }
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
            <Text style={styles.title}>{t('business.dashboard.title')}</Text>
            <Text style={styles.subtitle}>
              {t('business.dashboard.welcome', { name: userProfile?.full_name || 'Business' })}
            </Text>
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
            <Text style={styles.sectionTitle}>{t('business.dashboard.quickActions')}</Text>
            <View style={styles.actionButtons}>
              <Button
                title={t('business.dashboard.addProduct')}
                onPress={() => {/* Navigate to add product */}}
                variant="primary"
                size="sm"
                icon="➕"
              />
              <Button
                title={t('business.dashboard.viewOrders')}
                onPress={() => {/* Navigate to orders */}}
                variant="outline"
                size="sm"
                icon="📦"
              />
              <Button
                title={t('business.dashboard.analytics')}
                onPress={() => {/* Navigate to analytics */}}
                variant="secondary"
                size="sm"
                icon="📊"
              />
            </View>
          </Card>
        </MotiView>

        {/* Metrics Overview */}
        {metrics && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              opacity: { type: 'timing', duration: 500, delay: 400 },
              translateY: { type: 'timing', duration: 500, delay: 400 }
            }}
          >
            <Card>
              <Text style={styles.sectionTitle}>{t('business.dashboard.overview')}</Text>
              <View style={styles.metricsGrid}>
                {renderMetricCard(
                  t('business.dashboard.totalRevenue'),
                  formatCurrency(metrics.totalRevenue),
                  '💰',
                  COLORS.success[500],
                  0
                )}
                {renderMetricCard(
                  t('business.dashboard.totalOrders'),
                  metrics.totalOrders.toString(),
                  '📦',
                  COLORS.info[500],
                  1
                )}
                {renderMetricCard(
                  t('business.dashboard.avgOrderValue'),
                  formatCurrency(metrics.totalOrders > 0 ? metrics.totalRevenue / metrics.totalOrders : 0),
                  '📈',
                  COLORS.warning[500],
                  2
                )}
                {renderMetricCard(
                  t('business.dashboard.customers'),
                  metrics.totalCustomers.toString(),
                  '👥',
                  COLORS.purple[500],
                  3
                )}
              </View>
            </Card>
          </MotiView>
        )}

        {/* Revenue Breakdown */}
        {metrics && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              opacity: { type: 'timing', duration: 500, delay: 600 },
              translateY: { type: 'timing', duration: 500, delay: 600 }
            }}
          >
            <Card>
              <Text style={styles.sectionTitle}>{t('business.dashboard.revenue')}</Text>
              <View style={styles.revenueGrid}>
                {renderMetricCard(
                  t('business.dashboard.today'),
                  formatCurrency(Math.floor(metrics.totalRevenue * 0.1)), // Mock today's revenue
                  '📅',
                  COLORS.success[600],
                  0
                )}
                {renderMetricCard(
                  t('business.dashboard.thisWeek'),
                  formatCurrency(Math.floor(metrics.totalRevenue * 0.4)), // Mock week revenue
                  '📊',
                  COLORS.info[600],
                  1
                )}
                {renderMetricCard(
                  t('business.dashboard.thisMonth'),
                  formatCurrency(metrics.totalRevenue), // Total revenue as month
                  '📈',
                  COLORS.warning[600],
                  2
                )}
              </View>
            </Card>
          </MotiView>
        )}

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
              <Text style={styles.sectionTitle}>{t('business.dashboard.recentOrders')}</Text>
              <Button
                title={t('common.viewAll')}
                onPress={() => {/* Navigate to all orders */}}
                variant="ghost"
                size="sm"
              />
            </View>
            
            {recentOrders.length > 0 ? (
              <View style={styles.ordersList}>
                {recentOrders.map((order, index) => renderOrderItem(order, index))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {t('business.dashboard.noOrders')}
                </Text>
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
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
    color: COLORS.success[600],
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  emptyState: {
    padding: DIMENSIONS.PADDING.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
