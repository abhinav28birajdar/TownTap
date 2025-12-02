import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

// UI Components
import { Button, Card, Text } from '@/components/ui';
import { LoadingScreen } from '@/components/ui/loading-screen';

// Services and hooks
import { getThemeColors, useTheme } from '@/hooks/use-theme';
import { imageCacheService } from '@/lib/image-cache-service';
import { PerformanceMetric, PerformanceReport, performanceMonitor } from '@/lib/performance-monitor';

// Constants
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (Spacing.lg * 4);

export default function PerformanceMonitorScreen() {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<PerformanceMetric[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    loadData();
    setupRealtimeUpdates();
  }, []);

  const loadData = async () => {
    try {
      const [performanceReport, cacheData] = await Promise.all([
        performanceMonitor.generateReport(),
        imageCacheService.getCacheStats(),
      ]);

      setReport(performanceReport);
      setCacheStats(cacheData);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    // Update metrics every 5 seconds
    const interval = setInterval(async () => {
      try {
        const metrics = performanceMonitor.getRealtimeMetrics();
        setRealtimeMetrics(metrics.slice(-10)); // Keep last 10 metrics
      } catch (error) {
        console.error('Failed to get realtime metrics:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const clearMetrics = async () => {
    try {
      await performanceMonitor.clearMetrics();
      await loadData();
    } catch (error) {
      console.error('Failed to clear metrics:', error);
    }
  };

  const exportReport = async () => {
    try {
      const exportData = await performanceMonitor.exportMetrics();
      console.log('Performance Report Export:', exportData);
      // In a real app, you'd share this via email or save to device
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  // Chart data calculations
  const responseTimeChart = useMemo(() => {
    if (!report?.details.apiCalls.length) return [];
    
    return report.details.apiCalls
      .slice(-10)
      .map((call, index) => ({
        label: `${index + 1}`,
        value: call.responseTime,
        color: call.responseTime > 1000 ? Colors.red[500] : Colors.green[500],
      }));
  }, [report]);

  const memoryUsageChart = useMemo(() => {
    if (!realtimeMetrics.length) return [];
    
    return realtimeMetrics.map((metric, index) => ({
      label: `${index + 1}`,
      value: metric.data.memoryUsage || 0,
      color: Colors.blue[500],
    }));
  }, [realtimeMetrics]);

  const renderBarChart = (data: ChartData[], title: string, unit: string) => {
    if (!data.length) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = (chartWidth - (data.length - 1) * 8) / data.length;

    return (
      <View style={styles.chartContainer}>
        <Text variant="title-small" style={styles.chartTitle}>
          {title}
        </Text>
        
        <View style={styles.chart}>
          <View style={styles.yAxis}>
            <Text variant="caption" style={styles.yAxisLabel}>
              {maxValue.toFixed(0)}{unit}
            </Text>
            <Text variant="caption" style={styles.yAxisLabel}>
              {(maxValue / 2).toFixed(0)}{unit}
            </Text>
            <Text variant="caption" style={styles.yAxisLabel}>
              0{unit}
            </Text>
          </View>
          
          <View style={styles.chartArea}>
            <View style={styles.bars}>
              {data.map((item, index) => (
                <MotiView
                  key={index}
                  from={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 100, duration: 500 }}
                  style={styles.barContainer}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        width: barWidth,
                        height: maxValue > 0 ? (item.value / maxValue) * 150 : 0,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                  <Text variant="caption" style={styles.barLabel}>
                    {item.label}
                  </Text>
                </MotiView>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingScreen message="Loading performance data..." />;
  }

  if (!report) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text>No performance data available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Performance Monitor',
          headerTintColor: colors.foreground,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
        >
          <View style={styles.summaryGrid}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <Text variant="caption" style={styles.summaryLabel}>
                  Avg Response
                </Text>
              </View>
              <Text variant="title-medium" style={styles.summaryValue}>
                {report.summary.averageApiResponseTime}ms
              </Text>
            </Card>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="warning" size={20} color={Colors.red[500]} />
                <Text variant="caption" style={styles.summaryLabel}>
                  Error Rate
                </Text>
              </View>
              <Text variant="title-medium" style={styles.summaryValue}>
                {report.summary.errorRate.toFixed(1)}%
              </Text>
            </Card>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="navigate" size={20} color={Colors.blue[500]} />
                <Text variant="caption" style={styles.summaryLabel}>
                  Navigation
                </Text>
              </View>
              <Text variant="title-medium" style={styles.summaryValue}>
                {report.summary.averageNavigationTime}ms
              </Text>
            </Card>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="images" size={20} color={Colors.green[500]} />
                <Text variant="caption" style={styles.summaryLabel}>
                  Cache Size
                </Text>
              </View>
              <Text variant="title-medium" style={styles.summaryValue}>
                {cacheStats?.totalSize.toFixed(1) || 0}MB
              </Text>
            </Card>
          </View>
        </MotiView>

        {/* API Response Time Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
        >
          <Card style={styles.section}>
            {renderBarChart(responseTimeChart, 'Recent API Response Times', 'ms')}
          </Card>
        </MotiView>

        {/* Memory Usage Chart */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
        >
          <Card style={styles.section}>
            {renderBarChart(memoryUsageChart, 'Memory Usage Over Time', 'MB')}
          </Card>
        </MotiView>

        {/* Detailed Metrics */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
        >
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={24} color={colors.primary} />
              <Text variant="title-medium" style={styles.sectionTitle}>
                Detailed Metrics
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text variant="body-medium" style={styles.metricLabel}>
                Total API Calls:
              </Text>
              <Text variant="body-medium" style={styles.metricValue}>
                {report.details.apiCalls.length}
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text variant="body-medium" style={styles.metricLabel}>
                Navigation Events:
              </Text>
              <Text variant="body-medium" style={styles.metricValue}>
                {report.details.navigations.length}
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text variant="body-medium" style={styles.metricLabel}>
                Cache Hit Rate:
              </Text>
              <Text variant="body-medium" style={styles.metricValue}>
                {cacheStats?.hitRate.toFixed(1) || 0}%
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text variant="body-medium" style={styles.metricLabel}>
                Cached Items:
              </Text>
              <Text variant="body-medium" style={styles.metricValue}>
                {cacheStats?.itemCount || 0}
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text variant="body-medium" style={styles.metricLabel}>
                Report Period:
              </Text>
              <Text variant="body-medium" style={styles.metricValue}>
                {new Date(report.timestamp).toLocaleDateString()}
              </Text>
            </View>
          </Card>
        </MotiView>

        {/* Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
        >
          <View style={styles.actions}>
            <Button
              variant="outline"
              onPress={exportReport}
              style={styles.actionButton}
              leftIcon="download"
            >
              Export Report
            </Button>
            
            <Button
              variant="destructive"
              onPress={clearMetrics}
              style={styles.actionButton}
              leftIcon="trash"
            >
              Clear Metrics
            </Button>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: Spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    marginLeft: Spacing.xs,
    color: Colors.gray[600],
  },
  summaryValue: {
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    height: 200,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: Spacing.sm,
  },
  yAxisLabel: {
    color: Colors.gray[600],
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  barLabel: {
    color: Colors.gray[600],
    fontSize: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  metricLabel: {
    color: Colors.gray[600],
  },
  metricValue: {
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});