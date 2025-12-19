import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const orders = [
  { id: '1', customer: 'John Doe', service: 'Plumbing Repair', amount: 850, status: 'pending', time: 'Today, 2:30 PM' },
  { id: '2', customer: 'Jane Smith', service: 'Electrical Work', amount: 1200, status: 'accepted', time: 'Today, 1:15 PM' },
  { id: '3', customer: 'Mike Johnson', service: 'Carpentry', amount: 2500, status: 'completed', time: 'Yesterday' },
  { id: '4', customer: 'Sarah Williams', service: 'Painting', amount: 3000, status: 'completed', time: '2 days ago' },
  { id: '5', customer: 'Tom Brown', service: 'House Cleaning', amount: 500, status: 'pending', time: '3 days ago' },
];

export default function BusinessOrdersScreen() {
  const [filter, setFilter] = useState('all');

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'accepted': return '#3B82F6';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  const handleOrderClick = (orderId: string) => {
    console.log('Order clicked:', orderId);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color="#2D3E2F" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'accepted', 'completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => handleOrderClick(item.id)}
          >
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.customerName}>{item.customer}</Text>
                <Text style={styles.serviceName}>{item.service}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.orderFooter}>
              <Text style={styles.orderTime}>{item.time}</Text>
              <Text style={styles.orderAmount}>₹{item.amount}</Text>
            </View>

            {item.status === 'pending' && (
              <View style={styles.orderActions}>
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRejectOrder(item.id);
                  }}
                >
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleAcceptOrder(item.id);
                  }}
                >
                  <Text style={styles.acceptText}>Accept</Text>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  filterTabActive: {
    backgroundColor: '#4A5F4E',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B8E6F',
  },
  filterTextActive: {
    color: '#fff',
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
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
    marginBottom: 4,
  },
  serviceName: {
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
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3E2F',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  rejectText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4A5F4E',
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
