import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const orders = [
  { id: '1', service: 'Plumbing Repair', provider: "Mike's Plumbing", status: 'in-progress', amount: 850, date: 'Today, 2:30 PM' },
  { id: '2', service: 'House Cleaning', provider: 'Clean Home Services', status: 'confirmed', amount: 500, date: 'Tomorrow, 10:00 AM' },
  { id: '3', service: 'Electrical Work', provider: 'Power Solutions', status: 'pending', amount: 1200, date: 'Dec 28, 3:00 PM' },
];

export default function CustomerOrdersScreen() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'in-progress': return '#8B5CF6';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity onPress={() => router.push('/customer/history')}>
          <Ionicons name="time-outline" size={24} color="#2D3E2F" />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.serviceName}>{item.service}</Text>
                <Text style={styles.providerName}>{item.provider}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.replace('-', ' ')}
                </Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B8E6F" />
                <Text style={styles.detailText}>{item.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={16} color="#6B8E6F" />
                <Text style={styles.detailText}>₹{item.amount}</Text>
              </View>
            </View>

            {item.status === 'in-progress' && (
              <TouchableOpacity 
                style={styles.trackButton}
                onPress={() => router.push('/customer/tracking')}
              >
                <Ionicons name="location-outline" size={18} color="#fff" />
                <Text style={styles.trackButtonText}>Track Service</Text>
              </TouchableOpacity>
            )}

            {item.status === 'pending' && (
              <View style={styles.orderActions}>
                <TouchableOpacity style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rescheduleButton}>
                  <Text style={styles.rescheduleText}>Reschedule</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
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
  listContent: {
    padding: 20,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: '#6B8E6F',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  trackButton: {
    flexDirection: 'row',
    backgroundColor: '#4A5F4E',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4A5F4E',
    alignItems: 'center',
  },
  rescheduleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
