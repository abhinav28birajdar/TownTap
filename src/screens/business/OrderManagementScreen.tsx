import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Card from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../../types';

interface OrderManagementScreenProps {
  navigation: any;
}

const OrderManagementScreen: React.FC<OrderManagementScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Mock orders for business - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: '1',
          customer_id: 'c1',
          business_id: user?.id || '',
          order_type: 'product' as const,
          items: [
            {
              id: 'item1',
              product_id: 'p1',
              name: 'Organic Apples',
              quantity: 2,
              unit_price: 150,
              total_price: 300,
            },
            {
              id: 'item2',
              product_id: 'p2',
              name: 'Whole Wheat Bread',
              quantity: 1,
              unit_price: 80,
              total_price: 80,
            },
          ],
          subtotal: 380,
          delivery_charge: 30,
          service_charge: 0,
          discount_amount: 0,
          tax_amount: 20,
          total_amount: 430,
          status: 'confirmed' as OrderStatus,
          payment_status: 'completed' as PaymentStatus,
          payment_method: 'upi' as PaymentMethod,
          delivery_address: {
            id: 'addr1',
            label: 'Home',
            address_line1: '123 Main Street',
            city: 'Pune',
            state: 'Maharashtra',
            zip_code: '411001',
            country: 'India',
            latitude: 18.5204,
            longitude: 73.8567,
            is_default: true,
            address_type: 'home' as const,
          },
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          customer_id: 'c2',
          business_id: user?.id || '',
          order_type: 'service' as const,
          items: [
            {
              id: 'item3',
              service_id: 's1',
              name: 'Home Cleaning Service',
              quantity: 1,
              unit_price: 500,
              total_price: 500,
            },
          ],
          subtotal: 500,
          delivery_charge: 0,
          service_charge: 50,
          discount_amount: 0,
          tax_amount: 25,
          total_amount: 575,
          status: 'pending' as OrderStatus,
          payment_status: 'completed' as PaymentStatus,
          payment_method: 'card' as PaymentMethod,
          created_at: '2024-01-15T14:15:00Z',
          updated_at: '2024-01-15T14:15:00Z',
        },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Update order status in backend
      console.log(`Updating order ${orderId} to status ${newStatus}`);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'confirmed':
        return '#007AFF';
      case 'preparing':
        return '#FF9500';
      case 'ready':
        return '#34C759';
      case 'delivered':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    return t(`order.status.${status}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'delivered';
      default:
        return null;
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'pending') return orders.filter(order => order.status === 'pending');
    if (activeTab === 'confirmed') return orders.filter(order => ['confirmed', 'preparing', 'ready'].includes(order.status));
    if (activeTab === 'completed') return orders.filter(order => ['delivered', 'cancelled'].includes(order.status));
    return orders;
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const nextStatus = getNextStatus(item.status);
    
    return (
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{item.id}</Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.itemCount}>
            {item.items.length} {item.items.length === 1 ? t('order.item') : t('order.items')}
          </Text>
          <Text style={styles.orderTotal}>₹{item.total_amount}</Text>
        </View>

        <View style={styles.orderItems}>
          {item.items.map((orderItem, index) => (
            <Text key={orderItem.id} style={styles.itemText}>
              {orderItem.name} x{orderItem.quantity}
              {index < item.items.length - 1 && ', '}
            </Text>
          ))}
        </View>

        {item.delivery_address && (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.addressText}>
              {item.delivery_address.address_line1}, {item.delivery_address.city}
            </Text>
          </View>
        )}

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          >
            <Ionicons name="eye-outline" size={16} color="#007AFF" />
            <Text style={styles.actionText}>{t('order.view')}</Text>
          </TouchableOpacity>
          
          {nextStatus && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => updateOrderStatus(item.id, nextStatus)}
            >
              <Ionicons name="arrow-forward-outline" size={16} color="#fff" />
              <Text style={[styles.actionText, { color: '#fff' }]}>
                {t(`order.markAs${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`)}
              </Text>
            </TouchableOpacity>
          )}
          
          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerAction]}
              onPress={() => updateOrderStatus(item.id, 'cancelled')}
            >
              <Ionicons name="close-outline" size={16} color="#fff" />
              <Text style={[styles.actionText, { color: '#fff' }]}>{t('order.cancel')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  const renderTabButton = (tab: typeof activeTab, label: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('business.orderManagement')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('all', t('order.all'))}
        {renderTabButton('pending', t('order.pending'))}
        {renderTabButton('confirmed', t('order.active'))}
        {renderTabButton('completed', t('order.completed'))}
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>{t('order.noOrders')}</Text>
          <Text style={styles.emptySubtitle}>{t('order.waitingForOrders')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderItems: {
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  primaryAction: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dangerAction: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default OrderManagementScreen;
