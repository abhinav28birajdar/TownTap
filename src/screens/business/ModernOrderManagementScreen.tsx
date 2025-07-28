import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernButton } from '../../components/modern/ModernButton';
import { ModernCard } from '../../components/modern/ModernCard';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuthStore } from '../../stores/authStore';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  delivery_type: 'pickup' | 'delivery';
  delivery_address?: string;
  special_instructions?: string;
  created_at: string;
  estimated_time?: number;
}

const ModernOrderManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailVisible, setOrderDetailVisible] = useState(false);

  const statusFilters = [
    { key: 'all', label: 'All Orders', color: theme.colors.textSecondary },
    { key: 'pending', label: 'Pending', color: theme.colors.warning },
    { key: 'preparing', label: 'Preparing', color: theme.colors.info },
    { key: 'ready', label: 'Ready', color: theme.colors.success },
    { key: 'delivered', label: 'Delivered', color: theme.colors.success },
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Mock orders data - replace with real Supabase query
      const mockOrders: Order[] = [
        {
          id: '1',
          order_number: 'ORD-001',
          customer_name: 'John Doe',
          customer_phone: '+91 9876543210',
          items: [
            { id: '1', name: 'Butter Chicken', quantity: 2, price: 180 },
            { id: '2', name: 'Naan', quantity: 4, price: 40 },
          ],
          total_amount: 520,
          status: 'pending',
          delivery_type: 'delivery',
          delivery_address: '123 Main St, Mumbai',
          special_instructions: 'Extra spicy',
          created_at: new Date().toISOString(),
          estimated_time: 30,
        },
        {
          id: '2',
          order_number: 'ORD-002',
          customer_name: 'Jane Smith',
          customer_phone: '+91 9876543211',
          items: [
            { id: '3', name: 'Margherita Pizza', quantity: 1, price: 250 },
            { id: '4', name: 'Garlic Bread', quantity: 1, price: 80 },
          ],
          total_amount: 330,
          status: 'preparing',
          delivery_type: 'pickup',
          created_at: new Date().toISOString(),
          estimated_time: 15,
        },
        {
          id: '3',
          order_number: 'ORD-003',
          customer_name: 'Mike Johnson',
          customer_phone: '+91 9876543212',
          items: [
            { id: '5', name: 'Chicken Biryani', quantity: 1, price: 220 },
          ],
          total_amount: 220,
          status: 'ready',
          delivery_type: 'pickup',
          created_at: new Date().toISOString(),
        },
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Update in local state
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      // TODO: Update in Supabase
      // await supabase
      //   .from('orders')
      //   .update({ status: newStatus })
      //   .eq('id', orderId);
      
      setOrderDetailVisible(false);
      Alert.alert('Success', 'Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'preparing': return theme.colors.info;
      case 'ready': return theme.colors.success;
      case 'delivered': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return [
          { label: 'Accept', status: 'preparing' as const, color: theme.colors.success },
          { label: 'Cancel', status: 'cancelled' as const, color: theme.colors.error },
        ];
      case 'preparing':
        return [
          { label: 'Mark Ready', status: 'ready' as const, color: theme.colors.success },
        ];
      case 'ready':
        return order.delivery_type === 'pickup'
          ? [{ label: 'Mark Delivered', status: 'delivered' as const, color: theme.colors.success }]
          : [];
      default:
        return [];
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderOrderItem = ({ item: order }: { item: Order }) => (
    <ModernCard
      style={styles.orderCard}
      variant="elevated"
      onPress={() => {
        setSelectedOrder(order);
        setOrderDetailVisible(true);
      }}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <Text style={styles.customerName}>{order.customer_name}</Text>
          <Text style={styles.orderTime}>{formatTime(order.created_at)}</Text>
        </View>
        <View style={styles.orderMeta}>
          <Text
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(order.status) + '20',
                color: getStatusColor(order.status),
              }
            ]}
          >
            {order.status.toUpperCase()}
          </Text>
          <Text style={styles.orderAmount}>₹{order.total_amount}</Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <View style={styles.itemsPreview}>
          <Text style={styles.itemsText}>
            {order.items.length} item{order.items.length > 1 ? 's' : ''}
          </Text>
          <View style={styles.deliveryInfo}>
            <Ionicons
              name={order.delivery_type === 'pickup' ? 'storefront' : 'bicycle'}
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.deliveryText}>
              {order.delivery_type === 'pickup' ? 'Pickup' : 'Delivery'}
            </Text>
          </View>
        </View>
        
        {order.estimated_time && (
          <View style={styles.estimatedTime}>
            <Ionicons name="time" size={16} color={theme.colors.info} />
            <Text style={styles.estimatedTimeText}>
              {order.estimated_time} min
            </Text>
          </View>
        )}
      </View>
    </ModernCard>
  );

  const renderOrderDetail = () => {
    if (!selectedOrder) return null;

    return (
      <Modal
        visible={orderDetailVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOrderDetailVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setOrderDetailVisible(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            style={styles.modalContent}
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={
              <>
                <ModernCard style={styles.detailCard} variant="outlined">
                  <Text style={styles.detailTitle}>Order Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Order Number:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.order_number}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Customer:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.customer_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.customer_phone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.delivery_type === 'pickup' ? 'Pickup' : 'Delivery'}
                    </Text>
                  </View>
                  {selectedOrder.delivery_address && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Address:</Text>
                      <Text style={styles.detailValue}>{selectedOrder.delivery_address}</Text>
                    </View>
                  )}
                  {selectedOrder.special_instructions && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Instructions:</Text>
                      <Text style={styles.detailValue}>{selectedOrder.special_instructions}</Text>
                    </View>
                  )}
                </ModernCard>

                <ModernCard style={styles.detailCard} variant="outlined">
                  <Text style={styles.detailTitle}>Items</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemName}>
                        {item.quantity}x {item.name}
                      </Text>
                      <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                    </View>
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>₹{selectedOrder.total_amount}</Text>
                  </View>
                </ModernCard>

                {getStatusActions(selectedOrder).length > 0 && (
                  <ModernCard style={styles.detailCard} variant="outlined">
                    <Text style={styles.detailTitle}>Actions</Text>
                    {getStatusActions(selectedOrder).map((action, index) => (
                      <ModernButton
                        key={index}
                        title={action.label}
                        onPress={() => updateOrderStatus(selectedOrder.id, action.status)}
                        style={styles.actionButton}
                        variant="primary"
                      />
                    ))}
                  </ModernCard>
                )}
              </>
            }
          />
        </SafeAreaView>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    headerTitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    filtersContainer: {
      marginBottom: theme.spacing.md,
    },
    filtersScroll: {
      paddingHorizontal: theme.spacing.lg,
    },
    filterChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.sm,
      borderWidth: 1,
    },
    filterChipText: {
      ...theme.typography.body2,
      fontWeight: '500',
    },
    ordersList: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    orderCard: {
      marginBottom: theme.spacing.md,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    orderInfo: {
      flex: 1,
    },
    orderNumber: {
      ...theme.typography.body1,
      color: theme.colors.text,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    customerName: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    orderTime: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    orderMeta: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      ...theme.typography.caption,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: theme.spacing.xs,
    },
    orderAmount: {
      ...theme.typography.h4,
      color: theme.colors.text,
      fontWeight: '700',
    },
    orderDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemsPreview: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemsText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.md,
    },
    deliveryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    deliveryText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    estimatedTime: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    estimatedTimeText: {
      ...theme.typography.body2,
      color: theme.colors.info,
      marginLeft: theme.spacing.xs,
      fontWeight: '500',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    emptyText: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      ...theme.typography.h3,
      color: theme.colors.text,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    detailCard: {
      marginVertical: theme.spacing.sm,
    },
    detailTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    detailLabel: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    detailValue: {
      ...theme.typography.body2,
      color: theme.colors.text,
      flex: 2,
      textAlign: 'right',
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    itemName: {
      ...theme.typography.body2,
      color: theme.colors.text,
      flex: 1,
    },
    itemPrice: {
      ...theme.typography.body2,
      color: theme.colors.text,
      fontWeight: '500',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: theme.spacing.sm,
    },
    totalLabel: {
      ...theme.typography.body1,
      color: theme.colors.text,
      fontWeight: '600',
    },
    totalAmount: {
      ...theme.typography.body1,
      color: theme.colors.text,
      fontWeight: '700',
    },
    actionButton: {
      marginBottom: theme.spacing.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
          data={statusFilters}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedStatus === item.key
                    ? item.color + '20'
                    : theme.colors.surface,
                  borderColor: selectedStatus === item.key
                    ? item.color
                    : theme.colors.border,
                }
              ]}
              onPress={() => setSelectedStatus(item.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedStatus === item.key
                      ? item.color
                      : theme.colors.textSecondary,
                  }
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Orders List */}
      <FlatList
        style={styles.ordersList}
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {selectedStatus === 'all' ? 'No orders found' : `No ${selectedStatus} orders found`}
            </Text>
          </View>
        }
      />

      {/* Order Detail Modal */}
      {renderOrderDetail()}
    </SafeAreaView>
  );
};

export default ModernOrderManagementScreen;
