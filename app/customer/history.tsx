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

const historyOrders = [
  { id: '1', service: 'House Painting', provider: 'Color Masters', amount: 3000, date: 'Dec 20, 2024', rating: 5 },
  { id: '2', service: 'Plumbing Repair', provider: "Mike's Plumbing", amount: 850, date: 'Dec 15, 2024', rating: 4 },
  { id: '3', service: 'Electrical Work', provider: 'Power Solutions', amount: 1200, date: 'Dec 10, 2024', rating: 5 },
  { id: '4', service: 'Carpentry', provider: 'Wood Works', amount: 2500, date: 'Dec 5, 2024', rating: 4 },
  { id: '5', service: 'Garden Maintenance', provider: 'Green Thumbs', amount: 600, date: 'Nov 28, 2024', rating: 5 },
];

export default function CustomerHistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color="#2D3E2F" />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>24</Text>
          <Text style={styles.summaryLabel}>Total Orders</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>₹28,450</Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
        </View>
      </View>

      {/* History List */}
      <FlatList
        data={historyOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View style={styles.serviceIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.serviceName}>{item.service}</Text>
                <Text style={styles.providerName}>{item.provider}</Text>
                <View style={styles.ratingRow}>
                  {[...Array(5)].map((_, index) => (
                    <Ionicons
                      key={index}
                      name={index < item.rating ? 'star' : 'star-outline'}
                      size={14}
                      color="#F59E0B"
                    />
                  ))}
                </View>
              </View>
              <View style={styles.historyAmount}>
                <Text style={styles.amountText}>₹{item.amount}</Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            </View>

            <View style={styles.historyActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="repeat-outline" size={18} color="#4A5F4E" />
                <Text style={styles.actionText}>Book Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="receipt-outline" size={18} color="#4A5F4E" />
                <Text style={styles.actionText}>View Receipt</Text>
              </TouchableOpacity>
            </View>
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3E2F',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#10B98120',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    gap: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  providerName: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  historyAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3E2F',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  historyActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A5F4E',
  },
});
