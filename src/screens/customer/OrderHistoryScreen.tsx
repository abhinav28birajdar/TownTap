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

interface OrderHistoryScreenProps {
  navigation: any;
}

const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [businessNames, setBusinessNames] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      // Mock order data - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: '1',
          customer_id: user?.id || '',
          business_id: 'b1',
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
          status: 'delivered' as OrderStatus,
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
          updated_at: '2024-01-15T14:30:00Z',
        },
        {
          id: '2',
          customer_id: user?.id || '',
          business_id: 'b2',
          order_type: 'product' as const,
          items: [
            {
              id: 'item3',
              product_id: 'p3',
              name: 'Paracetamol',
              quantity: 1,
              unit_price: 25,
              total_price: 25,
            },
          ],
          subtotal: 25,
          delivery_charge: 15,
          service_charge: 0,
          discount_amount: 0,
          tax_amount: 2,
          total_amount: 42,
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
          created_at: '2024-01-14T15:45:00Z',
          updated_at: '2024-01-14T16:00:00Z',
        },
      ];
      setOrders(mockOrders);
      
      // Mock business names lookup
      setBusinessNames({
        'b1': 'Fresh Grocery Store',
        'b2': 'Quick Pharmacy',
      });
    } catch (error) {
      console.error('Error loading order history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrderHistory();
    setRefreshing(false);
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

  const renderOrderItem = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.businessName}>{businessNames[item.business_id] || 'Unknown Business'}</Text>
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
          {item.items.slice(0, 2).map((orderItem, index) => (
            <Text key={orderItem.id} style={styles.itemText}>
              {orderItem.name} x{orderItem.quantity}
              {index < Math.min(item.items.length, 2) - 1 && ', '}
            </Text>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>
              {t('order.andMore', { count: item.items.length - 2 })}
            </Text>
          )}
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="repeat-outline" size={16} color="#007AFF" />
            <Text style={styles.actionText}>{t('order.reorder')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={16} color="#007AFF" />
            <Text style={styles.actionText}>{t('order.help')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('order.history')}</Text>
        <View style={styles.placeholder} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>{t('order.noOrders')}</Text>
          <Text style={styles.emptySubtitle}>{t('order.startShopping')}</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>{t('order.startShoppingButton')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
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
  businessName: {
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
  },
  moreItems: {
    fontSize: 14,
    color: '#007AFF',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
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
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OrderHistoryScreen;
