import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModernTheme } from '../../context/ModernThemeContext';
import { useAuthStore } from '../../stores/authStore';

interface Order {
  id: string;
  business_name: string;
  order_date: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  items_count: number;
  delivery_address?: string;
}

// Mock data for demonstration
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    business_name: 'Pizza Palace',
    order_date: '2024-01-15T14:30:00Z',
    status: 'delivered',
    total_amount: 25.99,
    items_count: 3,
    delivery_address: '123 Main St, City',
  },
  {
    id: '2',
    business_name: 'Coffee Corner',
    order_date: '2024-01-14T09:15:00Z',
    status: 'delivered',
    total_amount: 12.50,
    items_count: 2,
  },
  {
    id: '3',
    business_name: 'Burger Barn',
    order_date: '2024-01-13T19:45:00Z',
    status: 'cancelled',
    total_amount: 18.75,
    items_count: 2,
    delivery_address: '456 Oak Ave, City',
  },
];

const OrdersScreen: React.FC = () => {
  const { colors } = useModernTheme();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetchUserOrders(user?.id);
      // setOrders(response.data);
      
      // For now, use mock data
      setTimeout(() => {
        setOrders(MOCK_ORDERS);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return '#3B82F6';
      case 'preparing':
        return '#8B5CF6';
      case 'ready':
        return '#10B981';
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
    }
    if (activeTab === 'completed') {
      return ['delivered', 'cancelled'].includes(order.status);
    }
    return true; // 'all'
  });

  const renderTabButton = (tab: typeof activeTab, label: string) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={[
          styles.tabButton,
          {
            backgroundColor: isActive 
              ? colors.colors?.primary || '#3B82F6' 
              : 'transparent',
            borderColor: colors.colors?.primary || '#3B82F6',
          }
        ]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={[
          styles.tabButtonText,
          { 
            color: isActive 
              ? '#FFFFFF' 
              : colors.colors?.primary || '#3B82F6' 
          }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={[styles.orderCard, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}
      onPress={() => {
        console.log('Navigate to order details:', item.id);
      }}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={[styles.businessName, { color: colors.colors?.text || '#1E293B' }]}>
            {item.business_name}
          </Text>
          <Text style={[styles.orderDate, { color: colors.colors?.textSecondary || '#64748B' }]}>
            {formatDate(item.order_date)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <View style={styles.orderMeta}>
          <View style={styles.metaItem}>
            <Ionicons 
              name="bag-outline" 
              size={16} 
              color={colors.colors?.textSecondary || '#64748B'} 
            />
            <Text style={[styles.metaText, { color: colors.colors?.textSecondary || '#64748B' }]}>
              {item.items_count} items
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons 
              name="cash-outline" 
              size={16} 
              color={colors.colors?.textSecondary || '#64748B'} 
            />
            <Text style={[styles.metaText, { color: colors.colors?.textSecondary || '#64748B' }]}>
              ${item.total_amount.toFixed(2)}
            </Text>
          </View>
          {item.delivery_address && (
            <View style={styles.metaItem}>
              <Ionicons 
                name="location-outline" 
                size={16} 
                color={colors.colors?.textSecondary || '#64748B'} 
              />
              <Text style={[styles.metaText, { color: colors.colors?.textSecondary || '#64748B' }]}>
                Delivery
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.orderActions}>
        {item.status === 'delivered' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.reorderButton, { backgroundColor: colors.colors?.primary || '#3B82F6' }]}
            onPress={() => console.log('Reorder:', item.id)}
          >
            <Ionicons name="repeat-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Reorder</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton, { borderColor: colors.colors?.border || '#E5E7EB' }]}
          onPress={() => console.log('View details:', item.id)}
        >
          <Text style={[styles.viewButtonText, { color: colors.colors?.text || '#1E293B' }]}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.colors?.background || '#FFFFFF' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.colors?.primary || '#3B82F6'} />
          <Text style={[styles.loadingText, { color: colors.colors?.text || '#1E293B' }]}>
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.colors?.background || '#FFFFFF' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.colors?.text || '#1E293B' }]}>
          My Orders
        </Text>
        <Text style={[styles.subtitle, { color: colors.colors?.textSecondary || '#64748B' }]}>
          Track your order history
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('all', 'All')}
        {renderTabButton('active', 'Active')}
        {renderTabButton('completed', 'Completed')}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.colors?.primary || '#3B82F6']}
            tintColor={colors.colors?.primary || '#3B82F6'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="receipt-outline" 
              size={48} 
              color={colors.colors?.textSecondary || '#64748B'} 
            />
            <Text style={[styles.emptyText, { color: colors.colors?.textSecondary || '#64748B' }]}>
              No orders found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.colors?.textSecondary || '#64748B' }]}>
              {activeTab === 'active' 
                ? 'You have no active orders'
                : activeTab === 'completed'
                ? 'You have no completed orders'
                : 'Start ordering from local businesses'
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 16,
  },
  orderMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 6,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  reorderButton: {
    // backgroundColor set dynamically
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  viewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default OrdersScreen;
