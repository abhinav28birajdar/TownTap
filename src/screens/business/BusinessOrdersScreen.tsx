import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView 
} from 'react-native';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus } from '../../types';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const BusinessOrdersScreen: React.FC = () => {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  const statusOptions: Array<{key: OrderStatus | 'all', label: string}> = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready_for_pickup', label: 'Ready' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'completed', label: 'Completed' }
  ];

  const mockOrders: Order[] = [
    {
      id: '1',
      customer_id: 'cust1',
      business_id: userProfile?.id || 'business1',
      total_amount: 25.99,
      delivery_charge: 2.99,
      platform_commission_amount: 2.60,
      order_status: 'pending',
      status: 'pending',
      payment_status: 'successful',
      payment_method: 'CARD',
      delivery_option: 'delivery',
      delivery_address: {
        address_line1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip_code: '12345',
        country: 'USA',
        latitude: 37.7749,
        longitude: -122.4194
      },
      customer_notes: 'Please ring doorbell',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer_details: {
        full_name: 'John Doe',
        phone_number: '+1234567890'
      }
    },
    {
      id: '2',
      customer_id: 'cust2',
      business_id: userProfile?.id || 'business1',
      total_amount: 42.50,
      delivery_charge: 3.99,
      platform_commission_amount: 4.25,
      order_status: 'preparing',
      status: 'preparing',
      payment_status: 'successful',
      payment_method: 'UPI_COLLECT',
      delivery_option: 'pickup',
      delivery_address: {
        address_line1: '456 Oak Ave',
        city: 'Somewhere',
        state: 'NY',
        zip_code: '67890',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060
      },
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString(),
      customer_details: {
        full_name: 'Jane Smith',
        phone_number: '+1987654321'
      }
    }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual Supabase call
      // const { data, error } = await supabase
      //   .from('orders')
      //   .select('*, customer_details:profiles(*)')
      //   .eq('business_id', userProfile?.id);
      
      setTimeout(() => {
        setOrders(mockOrders);
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

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // TODO: Replace with actual Supabase call
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, order_status: status, status }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const renderOrder = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: theme.colors.text }]}>
          Order #{item.id}
        </Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={[styles.customerName, { color: theme.colors.text }]}>
          {item.customer_details?.full_name || 'Customer'}
        </Text>
        <Text style={[styles.customerPhone, { color: theme.colors.textSecondary }]}>
          {item.customer_details?.phone_number}
        </Text>
        <Text style={[styles.totalAmount, { color: theme.colors.text }]}>
          Total: ${item.total_amount.toFixed(2)}
        </Text>
        <Text style={[styles.deliveryOption, { color: theme.colors.textSecondary }]}>
          {item.delivery_option === 'delivery' ? 'Delivery' : 'Pickup'}
        </Text>
        {item.customer_notes && (
          <Text style={[styles.notes, { color: theme.colors.textSecondary }]}>
            Note: {item.customer_notes}
          </Text>
        )}
      </View>

      <View style={styles.orderActions}>
        {item.status === 'pending' && (
          <>
            <Button
              title="Accept"
              onPress={() => updateOrderStatus(item.id, 'accepted')}
              variant="primary"
              size="small"
              style={styles.actionButton}
            />
            <Button
              title="Reject"
              onPress={() => updateOrderStatus(item.id, 'cancelled_by_business')}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          </>
        )}
        {item.status === 'accepted' && (
          <Button
            title="Start Preparing"
            onPress={() => updateOrderStatus(item.id, 'preparing')}
            variant="primary"
            size="small"
          />
        )}
        {item.status === 'preparing' && (
          <Button
            title="Mark Ready"
            onPress={() => updateOrderStatus(item.id, 'ready_for_pickup')}
            variant="primary"
            size="small"
          />
        )}
        {item.status === 'ready_for_pickup' && item.delivery_option === 'delivery' && (
          <Button
            title="Out for Delivery"
            onPress={() => updateOrderStatus(item.id, 'out_for_delivery')}
            variant="primary"
            size="small"
          />
        )}
      </View>
    </Card>
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'accepted': return '#4CAF50';
      case 'preparing': return '#2196F3';
      case 'ready_for_pickup': return '#9C27B0';
      case 'out_for_delivery': return '#FF5722';
      case 'delivered': return '#4CAF50';
      case 'completed': return '#4CAF50';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Orders</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Manage your incoming orders
        </Text>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusOptions}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                { 
                  backgroundColor: selectedStatus === item.key 
                    ? theme.colors.primary 
                    : theme.colors.surface,
                  borderColor: theme.colors.border
                }
              ]}
              onPress={() => setSelectedStatus(item.key)}
            >
              <Text style={[
                styles.filterText,
                { 
                  color: selectedStatus === item.key 
                    ? '#FFFFFF' 
                    : theme.colors.text 
                }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No orders found
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default BusinessOrdersScreen;