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

const customers = [
  { id: '1', name: 'John Doe', phone: '+91 98765 43210', orders: 12, spent: 15000, lastOrder: '2 days ago' },
  { id: '2', name: 'Jane Smith', phone: '+91 98765 43211', orders: 8, spent: 9600, lastOrder: '5 days ago' },
  { id: '3', name: 'Mike Johnson', phone: '+91 98765 43212', orders: 15, spent: 22500, lastOrder: '1 week ago' },
  { id: '4', name: 'Sarah Williams', phone: '+91 98765 43213', orders: 6, spent: 7200, lastOrder: '2 weeks ago' },
  { id: '5', name: 'Tom Brown', phone: '+91 98765 43214', orders: 10, spent: 12000, lastOrder: '3 weeks ago' },
];

export default function BusinessCustomersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customers</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="#2D3E2F" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>342</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹1.2L</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      {/* Customers List */}
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.customerCard}
            onPress={() => {
              console.log('View customer details:', item.id);
              router.push(`/business-owner/customer-details?id=${item.id}`);
            }}
          >
            <View style={styles.customerAvatar}>
              <Text style={styles.customerInitial}>{item.name.charAt(0)}</Text>
            </View>
            
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text style={styles.customerPhone}>{item.phone}</Text>
              <View style={styles.customerStats}>
                <View style={styles.customerStatItem}>
                  <Ionicons name="receipt-outline" size={14} color="#6B8E6F" />
                  <Text style={styles.customerStatText}>{item.orders} orders</Text>
                </View>
                <View style={styles.customerStatItem}>
                  <Ionicons name="cash-outline" size={14} color="#6B8E6F" />
                  <Text style={styles.customerStatText}>₹{item.spent.toLocaleString()}</Text>
                </View>
              </View>
              <Text style={styles.lastOrder}>Last order: {item.lastOrder}</Text>
            </View>

            <TouchableOpacity 
              style={styles.contactButton}
              onPress={(e) => {
                e.stopPropagation();
                console.log('Call customer:', item.phone);
                // Implement phone call functionality
              }}
            >
              <Ionicons name="call-outline" size={20} color="#4A5F4E" />
            </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  customerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    backgroundColor: '#A8D5AB',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  customerInfo: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  customerPhone: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  customerStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  customerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerStatText: {
    fontSize: 12,
    color: '#6B8E6F',
  },
  lastOrder: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  contactButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
