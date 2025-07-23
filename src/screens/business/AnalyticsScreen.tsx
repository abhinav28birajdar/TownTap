import React, { useEffect, useState } from 'react';
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

interface AnalyticsData {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    trend: 'up' | 'down' | 'stable';
    percentageChange: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    averageValue: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    retention: number;
  };
  products: {
    topSelling: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
    lowStock: Array<{
      id: string;
      name: string;
      stock: number;
    }>;
  };
  traffic: {
    views: number;
    clicks: number;
    conversion: number;
    sources: Array<{
      source: string;
      percentage: number;
      count: number;
    }>;
  };
  performance: {
    rating: number;
    reviews: number;
    responseTime: number;
    fulfillmentRate: number;
  };
}

const timeRanges = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
];

export default function BusinessAnalyticsScreen() {
  const user = useAuthStore((state) => state.user);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: AnalyticsData = {
      revenue: {
        today: 2450,
        thisWeek: 15680,
        thisMonth: 68920,
        trend: 'up',
        percentageChange: 12.5,
      },
      orders: {
        total: 247,
        pending: 12,
        completed: 230,
        cancelled: 5,
        averageValue: 280,
      },
      customers: {
        total: 1456,
        new: 89,
        returning: 158,
        retention: 68.5,
      },
      products: {
        topSelling: [
          { id: '1', name: 'Fresh Vegetables Bundle', sales: 45, revenue: 6750 },
          { id: '2', name: 'Grocery Essentials Pack', sales: 38, revenue: 5320 },
          { id: '3', name: 'Fruits & Dry Fruits Combo', sales: 32, revenue: 4480 },
          { id: '4', name: 'Dairy Products Set', sales: 28, revenue: 3920 },
        ],
        lowStock: [
          { id: '1', name: 'Organic Rice', stock: 5 },
          { id: '2', name: 'Milk Packets', stock: 8 },
          { id: '3', name: 'Bread Loaves', stock: 3 },
        ],
      },
      traffic: {
        views: 2340,
        clicks: 456,
        conversion: 19.5,
        sources: [
          { source: 'Direct Search', percentage: 45, count: 1053 },
          { source: 'Category Browse', percentage: 30, count: 702 },
          { source: 'Recommendations', percentage: 15, count: 351 },
          { source: 'Social Media', percentage: 10, count: 234 },
        ],
      },
      performance: {
        rating: 4.7,
        reviews: 234,
        responseTime: 12,
        fulfillmentRate: 94.5,
      },
    };

    setAnalyticsData(mockData);
    setIsLoading(false);
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    trend?: 'up' | 'down' | 'stable',
    icon?: string
  ) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{title}</Text>
        {icon && <Text style={styles.metricIcon}>{icon}</Text>}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && (
        <View style={styles.metricSubtitleContainer}>
          {trend && (
            <Text style={[
              styles.trendIcon,
              trend === 'up' && styles.trendUp,
              trend === 'down' && styles.trendDown,
            ]}>
              {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️'}
            </Text>
          )}
          <Text style={styles.metricSubtitle}>{subtitle}</Text>
        </View>
      )}
    </View>
  );

  const renderProgressBar = (percentage: number, color: string = '#2196F3') => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Business Analytics</Text>
        <Text style={styles.headerSubtitle}>Track your business performance</Text>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.timeRangeOptions}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.value}
                style={[
                  styles.timeRangeOption,
                  selectedTimeRange === range.value && styles.timeRangeOptionActive
                ]}
                onPress={() => setSelectedTimeRange(range.value)}
              >
                <Text style={[
                  styles.timeRangeText,
                  selectedTimeRange === range.value && styles.timeRangeTextActive
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Revenue Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Overview</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Today',
            `₹${analyticsData.revenue.today.toLocaleString()}`,
            undefined,
            undefined,
            '💰'
          )}
          {renderMetricCard(
            'This Week',
            `₹${analyticsData.revenue.thisWeek.toLocaleString()}`,
            `${analyticsData.revenue.trend === 'up' ? '+' : ''}${analyticsData.revenue.percentageChange}%`,
            analyticsData.revenue.trend,
            '📈'
          )}
        </View>
        <View style={styles.fullWidthCard}>
          {renderMetricCard(
            'This Month',
            `₹${analyticsData.revenue.thisMonth.toLocaleString()}`,
            'Monthly revenue target: ₹80,000',
            undefined,
            '🎯'
          )}
          {renderProgressBar((analyticsData.revenue.thisMonth / 80000) * 100, '#4CAF50')}
        </View>
      </View>

      {/* Orders Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Orders Summary</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Total Orders',
            analyticsData.orders.total,
            undefined,
            undefined,
            '📦'
          )}
          {renderMetricCard(
            'Avg. Order Value',
            `₹${analyticsData.orders.averageValue}`,
            undefined,
            undefined,
            '💵'
          )}
        </View>
        <View style={styles.orderStatusContainer}>
          <View style={styles.orderStatusItem}>
            <Text style={styles.orderStatusLabel}>Pending</Text>
            <Text style={[styles.orderStatusValue, { color: '#FF9800' }]}>
              {analyticsData.orders.pending}
            </Text>
          </View>
          <View style={styles.orderStatusItem}>
            <Text style={styles.orderStatusLabel}>Completed</Text>
            <Text style={[styles.orderStatusValue, { color: '#4CAF50' }]}>
              {analyticsData.orders.completed}
            </Text>
          </View>
          <View style={styles.orderStatusItem}>
            <Text style={styles.orderStatusLabel}>Cancelled</Text>
            <Text style={[styles.orderStatusValue, { color: '#F44336' }]}>
              {analyticsData.orders.cancelled}
            </Text>
          </View>
        </View>
      </View>

      {/* Customer Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Insights</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Total Customers',
            analyticsData.customers.total,
            undefined,
            undefined,
            '👥'
          )}
          {renderMetricCard(
            'New Customers',
            analyticsData.customers.new,
            'This week',
            undefined,
            '🆕'
          )}
        </View>
        <View style={styles.fullWidthCard}>
          {renderMetricCard(
            'Customer Retention',
            `${analyticsData.customers.retention}%`,
            `${analyticsData.customers.returning} returning customers`,
            undefined,
            '🔄'
          )}
          {renderProgressBar(analyticsData.customers.retention, '#9C27B0')}
        </View>
      </View>

      {/* Top Selling Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        <View style={styles.productsList}>
          {analyticsData.products.topSelling.map((product, index) => (
            <View key={product.id} style={styles.productItem}>
              <View style={styles.productRank}>
                <Text style={styles.productRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productStats}>
                  {product.sales} sales • ₹{product.revenue.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Traffic Sources */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Traffic Sources</Text>
        <View style={styles.trafficContainer}>
          {analyticsData.traffic.sources.map((source) => (
            <View key={source.source} style={styles.trafficItem}>
              <View style={styles.trafficInfo}>
                <Text style={styles.trafficSource}>{source.source}</Text>
                <Text style={styles.trafficCount}>
                  {source.count} visits ({source.percentage}%)
                </Text>
              </View>
              {renderProgressBar(source.percentage, '#2196F3')}
            </View>
          ))}
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Rating',
            `${analyticsData.performance.rating}/5`,
            `${analyticsData.performance.reviews} reviews`,
            undefined,
            '⭐'
          )}
          {renderMetricCard(
            'Response Time',
            `${analyticsData.performance.responseTime} min`,
            'Average response',
            undefined,
            '⚡'
          )}
        </View>
        <View style={styles.fullWidthCard}>
          {renderMetricCard(
            'Order Fulfillment',
            `${analyticsData.performance.fulfillmentRate}%`,
            'On-time delivery rate',
            undefined,
            '✅'
          )}
          {renderProgressBar(analyticsData.performance.fulfillmentRate, '#4CAF50')}
        </View>
      </View>

      {/* Low Stock Alert */}
      {analyticsData.products.lowStock.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Low Stock Alert</Text>
          <View style={styles.lowStockContainer}>
            {analyticsData.products.lowStock.map((product) => (
              <View key={product.id} style={styles.lowStockItem}>
                <Text style={styles.lowStockName}>{product.name}</Text>
                <Text style={styles.lowStockQuantity}>
                  Only {product.stock} left
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  timeRangeContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeRangeOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  timeRangeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeRangeOptionActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fullWidthCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metricIcon: {
    fontSize: 18,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  trendUp: {
    color: '#4CAF50',
  },
  trendDown: {
    color: '#F44336',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  orderStatusContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'space-around',
  },
  orderStatusItem: {
    alignItems: 'center',
  },
  orderStatusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderStatusValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  productsList: {
    paddingHorizontal: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productRankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productStats: {
    fontSize: 14,
    color: '#666',
  },
  trafficContainer: {
    paddingHorizontal: 20,
  },
  trafficItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  trafficInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trafficSource: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  trafficCount: {
    fontSize: 14,
    color: '#666',
  },
  lowStockContainer: {
    paddingHorizontal: 20,
  },
  lowStockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  lowStockName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  lowStockQuantity: {
    fontSize: 14,
    color: '#FF6F00',
    fontWeight: '600',
  },
});
