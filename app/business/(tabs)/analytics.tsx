/**
 * TownTap - Business Analytics Tab
 * View business analytics and insights
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const Colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  secondaryLight: '#D1FAE5',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  error: '#EF4444',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
};

const timeFilters = ['Today', 'This Week', 'This Month', 'This Year'];

export default function BusinessAnalytics() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('This Week');

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Load analytics from Supabase
    setRefreshing(false);
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    isPositive,
    icon 
  }: { 
    title: string; 
    value: string; 
    change: string;
    isPositive: boolean;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statIcon}>
          <Ionicons name={icon} size={20} color={Colors.primary} />
        </View>
        <View style={[
          styles.changeBadge,
          { backgroundColor: isPositive ? Colors.secondaryLight : Colors.accentLight }
        ]}>
          <Ionicons 
            name={isPositive ? 'trending-up' : 'trending-down'} 
            size={12} 
            color={isPositive ? Colors.secondary : Colors.accent} 
          />
          <Text style={[
            styles.changeText,
            { color: isPositive ? Colors.secondary : Colors.accent }
          ]}>
            {change}
          </Text>
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        {/* Time Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {timeFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterBtn,
                activeFilter === filter && styles.activeFilterBtn,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText,
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Revenue"
            value="$0.00"
            change="+0%"
            isPositive={true}
            icon="wallet-outline"
          />
          <StatCard
            title="Total Bookings"
            value="0"
            change="+0%"
            isPositive={true}
            icon="calendar-outline"
          />
          <StatCard
            title="New Customers"
            value="0"
            change="+0%"
            isPositive={true}
            icon="people-outline"
          />
          <StatCard
            title="Avg Rating"
            value="0.0"
            change="+0%"
            isPositive={true}
            icon="star-outline"
          />
        </View>

        {/* Revenue Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Overview</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart-outline" size={64} color={Colors.gray} />
            <Text style={styles.placeholderText}>
              Revenue chart will appear here
            </Text>
            <Text style={styles.placeholderSubtext}>
              Start receiving bookings to see your revenue trends
            </Text>
          </View>
        </View>

        {/* Top Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Services</Text>
          <View style={styles.emptyCard}>
            <Ionicons name="trophy-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyText}>No data yet</Text>
            <Text style={styles.emptySubtext}>
              Your most popular services will be shown here
            </Text>
          </View>
        </View>

        {/* Customer Insights */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>Customer Insights</Text>
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyText}>No customer data</Text>
            <Text style={styles.emptySubtext}>
              Customer demographics and behavior insights will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grayDark,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.grayLight,
    marginRight: 8,
  },
  activeFilterBtn: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray,
  },
  activeFilterText: {
    color: Colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    padding: 16,
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
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grayDark,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grayDark,
    marginBottom: 16,
  },
  chartPlaceholder: {
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grayDark,
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grayDark,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
});
