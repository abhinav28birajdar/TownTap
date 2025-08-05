import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModernTheme } from '../../context/ModernThemeContext';

interface Order {
  id: string;
  business_name: string;
  order_status: 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  estimated_delivery: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const OrdersScreen: React.FC = () => {
  const { colors } = useModernTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Simulated orders data (in real app, this would come from Supabase)
  const sampleOrders: Order[] = [
    {
      id: '1',
      business_name: 'Pizza Palace',
      order_status: 'in_progress',
      total_amount: 25.99,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      estimated_delivery: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 min from now
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 18.99 },
        { name: 'Garlic Bread', quantity: 1, price: 7.00 },
      ]
    },
    {
      id: '2',
      business_name: 'Coffee Corner',
      order_status: 'ready',
      total_amount: 12.50,
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
      estimated_delivery: new Date().toISOString(), // Ready now
      items: [
        { name: 'Cappuccino', quantity: 2, price: 5.50 },
        { name: 'Blueberry Muffin', quantity: 1, price: 1.50 },
      ]
    },
    {
      id: '3',
      business_name: 'Burger Station',
      order_status: 'delivered',
      total_amount: 32.75,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      estimated_delivery: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // Delivered 90 min ago
      items: [
        { name: 'Classic Burger', quantity: 2, price: 12.99 },
        { name: 'Fries', quantity: 2, price: 4.99 },
        { name: 'Cola', quantity: 1, price: 2.99 },
      ]
    }
  ];

  useEffect(() => {
    loadOrders();
    setupRealtimeSubscription();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(sampleOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Simulate real-time connection
    setTimeout(() => {
      setRealtimeConnected(true);
    }, 2000);

    // Simulate real-time order updates
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        const updatedOrders = [...prevOrders];
        const randomIndex = Math.floor(Math.random() * updatedOrders.length);
        
        if (updatedOrders[randomIndex]?.order_status === 'pending') {
          updatedOrders[randomIndex].order_status = 'confirmed';
        } else if (updatedOrders[randomIndex]?.order_status === 'confirmed') {
          updatedOrders[randomIndex].order_status = 'in_progress';
        }
        
        return updatedOrders;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'in_progress': return '#FF5722';
      case 'ready': return '#4CAF50';
      case 'delivered': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return colors.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'in_progress': return 'restaurant-outline';
      case 'ready': return 'bag-check-outline';
      case 'delivered': return 'checkmark-done-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  const getEstimatedDeliveryText = (status: string, estimatedDelivery: string) => {
    if (status === 'delivered') return 'Delivered';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'ready') return 'Ready for pickup!';
    
    const deliveryTime = new Date(estimatedDelivery);
    const now = new Date();
    const diffMs = deliveryTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Should be ready now';
    if (diffMins < 60) return `Ready in ${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `Ready in ${diffHours}h ${diffMins % 60}m`;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={[styles.orderCard, { backgroundColor: colors.colors.surface }]}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={[styles.businessName, { color: colors.colors.text }]}>
            {item.business_name}
          </Text>
          <Text style={[styles.orderTime, { color: colors.colors.textSecondary }]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.order_status) }]}>
            <Ionicons 
              name={getStatusIcon(item.order_status)} 
              size={16} 
              color="white" 
            />
            <Text style={styles.statusText}>
              {item.order_status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={[styles.itemsText, { color: colors.colors.textSecondary }]}>
          {item.items.map(orderItem => `${orderItem.quantity}x ${orderItem.name}`).join(', ')}
        </Text>
        
        <View style={styles.orderFooter}>
          <Text style={[styles.totalAmount, { color: colors.colors.text }]}>
            ${item.total_amount.toFixed(2)}
          </Text>
          <Text style={[styles.estimatedTime, { color: getStatusColor(item.order_status) }]}>
            {getEstimatedDeliveryText(item.order_status, item.estimated_delivery)}
          </Text>
        </View>
      </View>

      {(item.order_status === 'in_progress' || item.order_status === 'ready') && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.trackButton, { backgroundColor: colors.colors.primary }]}>
            <Ionicons name="location-outline" size={16} color="white" />
            <Text style={styles.buttonText}>Track Order</Text>
          </TouchableOpacity>
          
          {item.order_status === 'ready' && (
            <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.colors.backgroundSecondary }]}>
              <Ionicons name="call-outline" size={16} color={colors.colors.primary} />
              <Text style={[styles.buttonText, { color: colors.colors.primary }]}>Contact</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.colors.primary} />
          <Text style={[styles.loadingText, { color: colors.colors.textSecondary }]}>
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.colors.text }]}>Your Orders</Text>
        <View style={styles.realtimeIndicator}>
          <View style={[
            styles.realtimeDot, 
            { backgroundColor: realtimeConnected ? '#4CAF50' : '#FF9800' }
          ]} />
          <Text style={styles.realtimeText}>
            {realtimeConnected ? '📡 Live Tracking' : '🔄 Connecting...'}
          </Text>
        </View>
      </View>

      {/* Active Orders Count */}
      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryText, { color: colors.colors.text }]}>
          {orders.filter(o => ['pending', 'confirmed', 'in_progress', 'ready'].includes(o.order_status)).length} active orders
        </Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.colors.primary]}
          />
        }
      />

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={colors.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.colors.text }]}>
            No orders yet
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.colors.textSecondary }]}>
            Start exploring local businesses to place your first order!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  realtimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  realtimeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ordersList: {
    paddingHorizontal: 16,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderDetails: {
    marginBottom: 12,
  },
  itemsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  estimatedTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  trackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OrdersScreen;
