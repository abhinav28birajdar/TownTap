import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BusinessAnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity>
          <Ionicons name="calendar-outline" size={24} color="#2D3E2F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="cash-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>₹45,250</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <Text style={styles.statChange}>+12.5% this month</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>128</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
            <Text style={styles.statChange}>+8% this month</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="star-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
            <Text style={styles.statChange}>256 reviews</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#8B5CF620' }]}>
              <Ionicons name="people-outline" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>342</Text>
            <Text style={styles.statLabel}>Total Customers</Text>
            <Text style={styles.statChange}>+15% this month</Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Revenue Overview</Text>
            <TouchableOpacity style={styles.chartFilter}>
              <Text style={styles.chartFilterText}>Last 7 days</Text>
              <Ionicons name="chevron-down" size={16} color="#6B8E6F" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart-outline" size={60} color="#A8D5AB" />
            <Text style={styles.chartPlaceholderText}>Revenue chart will display here</Text>
          </View>
        </View>

        {/* Top Services */}
        <View style={styles.topServicesCard}>
          <Text style={styles.sectionTitle}>Top Services</Text>
          {[
            { name: 'Plumbing Repair', bookings: 45, revenue: 22500 },
            { name: 'Electrical Work', bookings: 38, revenue: 30400 },
            { name: 'House Painting', bookings: 25, revenue: 62500 },
          ].map((service, index) => (
            <View key={index} style={styles.serviceRow}>
              <View style={styles.serviceRank}>
                <Text style={styles.serviceRankText}>{index + 1}</Text>
              </View>
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceRowName}>{service.name}</Text>
                <Text style={styles.serviceRowMeta}>{service.bookings} bookings</Text>
              </View>
              <Text style={styles.serviceRowRevenue}>₹{service.revenue.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8E6C9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3E2F',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3E2F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B8E6F',
    marginBottom: 8,
  },
  statChange: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  chartFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  chartFilterText: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  chartPlaceholderText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  topServicesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
    marginBottom: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceRank: {
    width: 28,
    height: 28,
    backgroundColor: '#A8D5AB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  serviceDetails: {
    flex: 1,
  },
  serviceRowName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3E2F',
    marginBottom: 2,
  },
  serviceRowMeta: {
    fontSize: 12,
    color: '#6B8E6F',
  },
  serviceRowRevenue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A5F4E',
  },
});
