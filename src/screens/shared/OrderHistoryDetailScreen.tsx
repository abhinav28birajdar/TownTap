import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ModernThemeContext';
import { supabase } from '../../lib/supabase';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderDetail {
  id: string;
  order_number: string;
  business_name: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  delivery_address: any;
  items: OrderItem[];
}

const OrderHistoryDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
  
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
    
    // Real-time subscription for order updates
    const subscription = supabase
      .channel('order_detail')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, () => {
        loadOrderDetail();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          order_status,
          payment_status,
          total_amount,
          created_at,
          delivery_address,
          businesses(name),
          order_items(
            id,
            quantity,
            unit_price,
            total_price,
            products(name)
          )
        `)
        .eq('id', orderId)
        .single();

      if (order) {
        setOrderDetail({
          id: order.id,
          order_number: order.order_number,
          business_name: (order.businesses as any)?.name || 'Unknown Business',
          status: order.order_status,
          payment_status: order.payment_status,
          total_amount: order.total_amount,
          created_at: order.created_at,
          delivery_address: order.delivery_address,
          items: order.order_items?.map((item: any) => ({
            id: item.id,
            product_name: item.products?.name || 'Unknown Product',
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          })) || [],
        });
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'preparing': return '#EF4444';
      case 'ready': return '#10B981';
      case 'delivered': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    orderInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    orderLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    orderValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    itemCard: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    itemName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    itemDetails: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    totalSection: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
    },
    totalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center',
    },
    addressText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginTop: 12,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (!orderDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Not Found</Text>
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
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Order Number:</Text>
            <Text style={styles.orderValue}>{orderDetail.order_number}</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Business:</Text>
            <Text style={styles.orderValue}>{orderDetail.business_name}</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Order Date:</Text>
            <Text style={styles.orderValue}>{formatDate(orderDetail.created_at)}</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderDetail.status) }]}>
              <Text style={styles.statusText}>{orderDetail.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Payment:</Text>
            <Text style={[styles.orderValue, { 
              color: orderDetail.payment_status === 'paid' ? '#10B981' : '#F59E0B' 
            }]}>
              {orderDetail.payment_status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          
          {orderDetail.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemPrice}>₹{item.total_price}</Text>
              </View>
              <Text style={styles.itemDetails}>
                Qty: {item.quantity} × ₹{item.unit_price}
              </Text>
            </View>
          ))}
          
          <View style={styles.totalSection}>
            <Text style={styles.totalText}>Total: ₹{orderDetail.total_amount}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>
            {orderDetail.delivery_address?.address_line_1 || 'No address provided'}
            {orderDetail.delivery_address?.address_line_2 && 
              `\n${orderDetail.delivery_address.address_line_2}`}
            {orderDetail.delivery_address?.city && 
              `\n${orderDetail.delivery_address.city}, ${orderDetail.delivery_address.state || ''}`}
            {orderDetail.delivery_address?.postal_code && 
              ` ${orderDetail.delivery_address.postal_code}`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderHistoryDetailScreen;
