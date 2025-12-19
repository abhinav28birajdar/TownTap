import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ReportData {
  period: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  growth: number;
}

interface ServiceReport {
  name: string;
  orders: number;
  revenue: number;
  percentage: number;
}

const monthlyReports: ReportData[] = [
  { period: 'Dec 2024', revenue: 145000, orders: 156, avgOrderValue: 929, growth: 12.5 },
  { period: 'Nov 2024', revenue: 128500, orders: 142, avgOrderValue: 905, growth: 8.2 },
  { period: 'Oct 2024', revenue: 118700, orders: 138, avgOrderValue: 860, growth: 5.3 },
  { period: 'Sep 2024', revenue: 112800, orders: 125, avgOrderValue: 902, growth: -2.1 },
  { period: 'Aug 2024', revenue: 115200, orders: 130, avgOrderValue: 886, growth: 3.8 },
  { period: 'Jul 2024', revenue: 110900, orders: 122, avgOrderValue: 909, growth: 6.7 },
];

const serviceReports: ServiceReport[] = [
  { name: 'Deep Cleaning', orders: 52, revenue: 51948, percentage: 35.8 },
  { name: 'AC Servicing', orders: 38, revenue: 28842, percentage: 19.9 },
  { name: 'Plumbing', orders: 31, revenue: 24769, percentage: 17.1 },
  { name: 'Electrical', orders: 22, revenue: 22176, percentage: 15.3 },
  { name: 'Painting', orders: 13, revenue: 17265, percentage: 11.9 },
];

const weeklyData = [
  { day: 'Mon', orders: 12, revenue: 11988 },
  { day: 'Tue', orders: 18, revenue: 16722 },
  { day: 'Wed', orders: 15, revenue: 13935 },
  { day: 'Thu', orders: 22, revenue: 20438 },
  { day: 'Fri', orders: 25, revenue: 23225 },
  { day: 'Sat', orders: 35, revenue: 32515 },
  { day: 'Sun', orders: 29, revenue: 26941 },
];

export default function ReportsScreen() {
  const colors = useColors();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

  const currentReport = monthlyReports[0];
  const previousReport = monthlyReports[1];

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? colors.success : colors.error;
  };

  const maxWeeklyRevenue = Math.max(...weeklyData.map(d => d.revenue));
  const maxServicePercentage = Math.max(...serviceReports.map(s => s.percentage));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Financial Reports</ThemedText>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['weekly', 'monthly', 'yearly'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodTab,
                selectedPeriod === period && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <ThemedText style={[
                styles.periodText,
                { color: selectedPeriod === period ? '#FFF' : colors.textSecondary }
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Overview */}
        <LinearGradient
          colors={[colors.primary, '#2d4a2f']}
          style={styles.revenueCard}
        >
          <ThemedText style={styles.revenueLabel}>Total Revenue</ThemedText>
          <ThemedText style={styles.revenueValue}>
            ₹{currentReport.revenue.toLocaleString()}
          </ThemedText>
          <View style={styles.revenueGrowth}>
            <Ionicons
              name={currentReport.growth >= 0 ? 'trending-up' : 'trending-down'}
              size={18}
              color={currentReport.growth >= 0 ? '#4ECDC4' : '#FF6B6B'}
            />
            <ThemedText style={[
              styles.growthText,
              { color: currentReport.growth >= 0 ? '#4ECDC4' : '#FF6B6B' }
            ]}>
              {currentReport.growth >= 0 ? '+' : ''}{currentReport.growth}% vs last month
            </ThemedText>
          </View>
          <View style={styles.revenueStats}>
            <View style={styles.revenueStatItem}>
              <ThemedText style={styles.revenueStatValue}>{currentReport.orders}</ThemedText>
              <ThemedText style={styles.revenueStatLabel}>Orders</ThemedText>
            </View>
            <View style={[styles.revenueStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.revenueStatItem}>
              <ThemedText style={styles.revenueStatValue}>₹{currentReport.avgOrderValue}</ThemedText>
              <ThemedText style={styles.revenueStatLabel}>Avg. Order</ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Key Metrics */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Key Metrics</ThemedText>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <View style={[styles.metricIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
              <ThemedText style={styles.metricValue}>{currentReport.orders}</ThemedText>
              <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Completed
              </ThemedText>
              <View style={styles.metricGrowth}>
                <Ionicons
                  name="arrow-up"
                  size={12}
                  color={colors.success}
                />
                <ThemedText style={[styles.metricGrowthText, { color: colors.success }]}>
                  +9.8%
                </ThemedText>
              </View>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <View style={[styles.metricIcon, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="people" size={24} color={colors.info} />
              </View>
              <ThemedText style={styles.metricValue}>89</ThemedText>
              <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Customers
              </ThemedText>
              <View style={styles.metricGrowth}>
                <Ionicons
                  name="arrow-up"
                  size={12}
                  color={colors.success}
                />
                <ThemedText style={[styles.metricGrowthText, { color: colors.success }]}>
                  +15.2%
                </ThemedText>
              </View>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <View style={[styles.metricIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="star" size={24} color={colors.warning} />
              </View>
              <ThemedText style={styles.metricValue}>4.8</ThemedText>
              <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Avg. Rating
              </ThemedText>
              <View style={styles.metricGrowth}>
                <Ionicons
                  name="arrow-up"
                  size={12}
                  color={colors.success}
                />
                <ThemedText style={[styles.metricGrowthText, { color: colors.success }]}>
                  +0.2
                </ThemedText>
              </View>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <View style={[styles.metricIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="repeat" size={24} color={colors.primary} />
              </View>
              <ThemedText style={styles.metricValue}>42%</ThemedText>
              <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Repeat Rate
              </ThemedText>
              <View style={styles.metricGrowth}>
                <Ionicons
                  name="arrow-up"
                  size={12}
                  color={colors.success}
                />
                <ThemedText style={[styles.metricGrowthText, { color: colors.success }]}>
                  +5.3%
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>This Week</ThemedText>
            <View style={styles.chartToggle}>
              {['revenue', 'orders'].map((metric) => (
                <TouchableOpacity
                  key={metric}
                  style={[
                    styles.chartToggleButton,
                    selectedMetric === metric && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => setSelectedMetric(metric)}
                >
                  <ThemedText style={[
                    styles.chartToggleText,
                    { color: selectedMetric === metric ? colors.primary : colors.textSecondary }
                  ]}>
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <View style={styles.barChart}>
              {weeklyData.map((data, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: index === 5 ? colors.primary : colors.primary + '60',
                          height: `${(data.revenue / maxWeeklyRevenue) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.barLabel, { color: colors.textSecondary }]}>
                    {data.day}
                  </ThemedText>
                </View>
              ))}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>
                  ₹{weeklyData.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()} total
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Service Performance */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Service Performance</ThemedText>
          <View style={[styles.serviceCard, { backgroundColor: colors.card }]}>
            {serviceReports.map((service, index) => (
              <View key={index} style={styles.serviceRow}>
                <View style={styles.serviceInfo}>
                  <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
                  <ThemedText style={[styles.serviceOrders, { color: colors.textSecondary }]}>
                    {service.orders} orders • ₹{service.revenue.toLocaleString()}
                  </ThemedText>
                </View>
                <View style={styles.serviceProgress}>
                  <View style={[styles.serviceProgressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.serviceProgressFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${(service.percentage / maxServicePercentage) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.servicePercentage, { color: colors.primary }]}>
                    {service.percentage}%
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Comparison */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Monthly Comparison</ThemedText>
          {monthlyReports.slice(0, 4).map((report, index) => (
            <View key={index} style={[styles.monthCard, { backgroundColor: colors.card }]}>
              <View style={styles.monthHeader}>
                <ThemedText style={styles.monthPeriod}>{report.period}</ThemedText>
                <View style={styles.monthGrowth}>
                  <Ionicons
                    name={report.growth >= 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={getGrowthColor(report.growth)}
                  />
                  <ThemedText style={[styles.monthGrowthText, { color: getGrowthColor(report.growth) }]}>
                    {report.growth >= 0 ? '+' : ''}{report.growth}%
                  </ThemedText>
                </View>
              </View>
              <View style={styles.monthStats}>
                <View style={styles.monthStatItem}>
                  <ThemedText style={[styles.monthStatLabel, { color: colors.textSecondary }]}>
                    Revenue
                  </ThemedText>
                  <ThemedText style={styles.monthStatValue}>
                    ₹{report.revenue.toLocaleString()}
                  </ThemedText>
                </View>
                <View style={styles.monthStatItem}>
                  <ThemedText style={[styles.monthStatLabel, { color: colors.textSecondary }]}>
                    Orders
                  </ThemedText>
                  <ThemedText style={styles.monthStatValue}>{report.orders}</ThemedText>
                </View>
                <View style={styles.monthStatItem}>
                  <ThemedText style={[styles.monthStatLabel, { color: colors.textSecondary }]}>
                    Avg. Value
                  </ThemedText>
                  <ThemedText style={styles.monthStatValue}>₹{report.avgOrderValue}</ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Export Reports</ThemedText>
          <View style={styles.exportOptions}>
            <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.card }]}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <ThemedText style={styles.exportText}>PDF Report</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.card }]}>
              <Ionicons name="grid" size={24} color={colors.success} />
              <ThemedText style={styles.exportText}>Excel Export</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.card }]}>
              <Ionicons name="share" size={24} color={colors.info} />
              <ThemedText style={styles.exportText}>Share Report</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  revenueCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  revenueLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  revenueValue: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '700',
    marginVertical: 8,
  },
  revenueGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  growthText: {
    fontSize: 14,
    fontWeight: '500',
  },
  revenueStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  revenueStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  revenueStatValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  revenueStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  revenueStatDivider: {
    width: 1,
    height: '100%',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  metricGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricGrowthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  chartToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chartToggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
  },
  barChart: {
    flexDirection: 'row',
    height: 150,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: '60%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 8,
    position: 'absolute',
    bottom: 0,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceOrders: {
    fontSize: 12,
  },
  serviceProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceProgressBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  serviceProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  servicePercentage: {
    fontSize: 13,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  monthCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthPeriod: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthGrowthText: {
    fontSize: 13,
    fontWeight: '500',
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthStatItem: {
    flex: 1,
  },
  monthStatLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  monthStatValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  exportOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  exportText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
});
