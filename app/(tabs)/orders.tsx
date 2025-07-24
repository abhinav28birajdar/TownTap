import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
// TODO: Fix cartStore import issue
// import { useCartStore } from '../../src/stores/cartStore';
import { Address, Order, OrderStatus } from '../../src/types';

// Mock address data
const mockAddress: Address = {
  label: 'Home',
  address_line1: '123 Main Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  zip_code: '400001',
  country: 'India',
  latitude: 19.0760,
  longitude: 72.8777,
  is_default: true,
  address_type: 'home',
};

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'order-1',
    business_id: 'business-1',
    customer_id: 'customer-1',
    order_type: 'product',
    items: [],
    subtotal: 400.00,
    delivery_charge: 50.00,
    service_charge: 0,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 450.00,
    status: 'delivered',
    payment_status: 'completed',
    payment_method: 'upi',
    delivery_address: mockAddress,
    estimated_delivery_time: '2024-01-15T12:00:00Z',
    actual_delivery_time: '2024-01-15T12:15:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T12:15:00Z',
  },
  {
    id: 'order-2',
    business_id: 'business-2',
    customer_id: 'customer-1',
    order_type: 'product',
    items: [],
    subtotal: 270.00,
    delivery_charge: 50.00,
    service_charge: 0,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 320.00,
    status: 'out_for_delivery',
    payment_status: 'completed',
    payment_method: 'card',
    delivery_address: mockAddress,
    estimated_delivery_time: '2024-01-16T16:00:00Z',
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:45:00Z',
  },
  {
    id: 'order-3',
    business_id: 'business-3',
    customer_id: 'customer-1',
    order_type: 'service',
    items: [],
    subtotal: 180.00,
    delivery_charge: 0,
    service_charge: 0,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 180.00,
    status: 'pending',
    payment_status: 'pending',
    payment_method: 'cash',
    created_at: '2024-01-16T16:45:00Z',
    updated_at: '2024-01-16T16:45:00Z',
  },
];

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
      return '#28A745';
    case 'out_for_delivery':
      return '#007AFF';
    case 'pending':
      return '#FFC107';
    case 'cancelled':
      return '#DC3545';
    default:
      return '#6C757D';
  }
};

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
      return 'Delivered';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'pending':
      return 'Pending';
    case 'cancelled':
      return 'Cancelled';
    case 'confirmed':
      return 'Confirmed';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready';
    case 'refunded':
      return 'Refunded';
    default:
      return status;
  }
};

export default function OrdersTab() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [refreshing, setRefreshing] = useState(false);
  
  // Access cart for current items
  // TODO: Fix cartStore import and uncomment below
  // const cartStore = useCartStore();
  // const items = cartStore?.items || [];
  // const total_items = cartStore?.total_items || 0;
  // const subtotal = cartStore?.subtotal || 0;
  
  // Temporary mock data
  const items: any[] = [];
  const total_items = 0;
  const subtotal = 0;

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>Order #{item.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.deliveryAddress}>
        {item.delivery_address 
          ? `${item.delivery_address.address_line1}, ${item.delivery_address.city}, ${item.delivery_address.state}`
          : 'No delivery address'
        }
      </Text>
      
      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>₹{item.total_amount.toFixed(2)}</Text>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCurrentCart = () => {
    if (total_items === 0) return null;
    
    return (
      <View style={styles.cartSection}>
        <Text style={styles.sectionTitle}>Current Cart</Text>
        <View style={styles.cartCard}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartItems}>{total_items} items in cart</Text>
            <Text style={styles.cartTotal}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptyText}>
        When you place your first order, it will appear here.
      </Text>
      <TouchableOpacity style={styles.exploreButton}>
        <Text style={styles.exploreButtonText}>Explore Businesses</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Track your orders and history</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={renderCurrentCart}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={orders.length === 0 ? styles.emptyContainer : styles.contentContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
  },
  cartSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginHorizontal: 20,
    color: '#1A1A1A',
  },
  cartCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartItems: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
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
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666666',
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
  deliveryAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  viewButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
