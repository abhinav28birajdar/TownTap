/**
 * Revenue Reports - Phase 10
 * Detailed revenue analytics and reports
 */

import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RevenueData {
  total_revenue: number;
  revenue_growth: number;
  avg_booking_value: number;
  total_bookings: number;
  revenue_by_service: { service: string; revenue: number; percentage: number }[];
  revenue_by_month: { month: string; revenue: number }[];
  top_customers: { name: string; total_spent: number; bookings: number }[];
}

export default function RevenueReportsPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<RevenueData>({
    total_revenue: 45250,
    revenue_growth: 12.5,
    avg_booking_value: 650,
    total_bookings: 128,
    revenue_by_service: [
      { service: 'Plumbing', revenue: 15000, percentage: 33 },
      { service: 'Electrical', revenue: 12500, percentage: 28 },
      { service: 'Carpentry', revenue: 10000, percentage: 22 },
      { service: 'Painting', revenue: 7750, percentage: 17 },
    ],
    revenue_by_month: [
      { month: 'Jan', revenue: 35000 },
      { month: 'Feb', revenue: 38000 },
      { month: 'Mar', revenue: 42000 },
      { month: 'Apr', revenue: 45250 },
    ],
    top_customers: [
      { name: 'Rahul Sharma', total_spent: 5200, bookings: 8 },
      { name: 'Priya Patel', total_spent: 4800, bookings: 7 },
      { name: 'Amit Kumar', total_spent: 3600, bookings: 5 },
    ],
  });

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Revenue Reports</Text>
        </View>

        {/* Period Filter */}
        <View style={styles.periodFilter}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === 'week' && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod('week')}
          >
            <Text
              style={[
                styles.periodText,
                period === 'week' && styles.periodTextActive,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === 'month' && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod('month')}
          >
            <Text
              style={[
                styles.periodText,
                period === 'month' && styles.periodTextActive,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              period === 'year' && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod('year')}
          >
            <Text
              style={[
                styles.periodText,
                period === 'year' && styles.periodTextActive,
              ]}
            >
              Year
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Revenue Card */}
        <Card style={([styles.revenueCard, { backgroundColor: colors.primary }] as any)}>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueValue}>
            {formatCurrency(revenueData.total_revenue)}
          </Text>
          <View style={styles.growthBadge}>
            <Text style={styles.growthText}>
              ↗ {revenueData.revenue_growth}% vs last {period}
            </Text>
          </View>
        </Card>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: colors.primary }]}>
              {formatCurrency(revenueData.avg_booking_value)}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Avg Booking Value
            </Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: colors.primary }]}>
              {revenueData.total_bookings}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Total Bookings
            </Text>
          </Card>
        </View>

        {/* Revenue by Service */}
        <Card style={styles.breakdownCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Revenue by Service
          </Text>
          {revenueData.revenue_by_service.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <Text style={[styles.breakdownService, { color: colors.text }]}>
                  {item.service}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.percentage}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.breakdownRight}>
                <Text style={[styles.breakdownRevenue, { color: colors.primary }]}>
                  {formatCurrency(item.revenue)}
                </Text>
                <Text style={[styles.breakdownPercentage, { color: colors.textSecondary }]}>
                  {item.percentage}%
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Monthly Trend */}
        <Card style={styles.trendCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Revenue Trend
          </Text>
          <View style={styles.chartPlaceholder}>
            {revenueData.revenue_by_month.map((item, index) => {
              const maxRevenue = Math.max(
                ...revenueData.revenue_by_month.map((m) => m.revenue)
              );
              const height = (item.revenue / maxRevenue) * 120;

              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height }]} />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                    {item.month}
                  </Text>
                  <Text style={[styles.barValue, { color: colors.text }]}>
                    {(item.revenue / 1000).toFixed(0)}K
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Top Customers */}
        <Card style={styles.customersCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Top Customers by Revenue
          </Text>
          {revenueData.top_customers.map((customer, index) => (
            <View key={index} style={styles.customerItem}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={[styles.customerName, { color: colors.text }]}>
                  {customer.name}
                </Text>
                <Text style={[styles.customerBookings, { color: colors.textSecondary }]}>
                  {customer.bookings} bookings
                </Text>
              </View>
              <Text style={[styles.customerRevenue, { color: colors.primary }]}>
                {formatCurrency(customer.total_spent)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Export Options */}
        <Card style={styles.exportCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Export Reports
          </Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportIcon}>📊</Text>
              <Text style={[styles.exportText, { color: colors.text }]}>
                Excel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportIcon}>📄</Text>
              <Text style={[styles.exportText, { color: colors.text }]}>
                PDF
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportIcon}>📧</Text>
              <Text style={[styles.exportText, { color: colors.text }]}>
                Email
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  periodFilter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  periodButtonActive: {
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  revenueCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  revenueValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  growthBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.md,
  },
  growthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  breakdownCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownService: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  breakdownRevenue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  breakdownPercentage: {
    fontSize: 12,
  },
  trendCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  chartPlaceholder: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
  },
  barContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 40,
    borderRadius: BorderRadius.md,
  },
  barLabel: {
    fontSize: 12,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  customersCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: spacing.md,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  customerBookings: {
    fontSize: 12,
  },
  customerRevenue: {
    fontSize: 16,
    fontWeight: '700',
  },
  exportCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  exportButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  exportIcon: {
    fontSize: 32,
  },
  exportText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
