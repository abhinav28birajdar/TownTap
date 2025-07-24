import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

interface OrderDetail {
  id: string;
  businessName: string;
  businessAddress: string;
  status: 'delivered' | 'cancelled' | 'preparing' | 'on_the_way';
  orderDate: string;
  deliveryDate?: string;
  total: number;
  items: OrderItem[];
  deliveryAddress: string;
  paymentMethod: string;
  orderNumber: string;
  estimatedTime?: string;
}

export default function OrderHistoryDetailScreen() {
  const { t } = useTranslation();
  const [selectedOrder] = useState<OrderDetail>({
    id: '1',
    businessName: 'Pizza Palace',
    businessAddress: '123 Main Street, Downtown',
    status: 'delivered',
    orderDate: '2024-01-15T18:30:00Z',
    deliveryDate: '2024-01-15T19:15:00Z',
    total: 850,
    orderNumber: 'TP-2024-001234',
    deliveryAddress: '456 Oak Avenue, Apt 2B, Sector 12',
    paymentMethod: 'UPI - Google Pay',
    items: [
      {
        id: '1',
        name: 'Margherita Pizza',
        quantity: 1,
        price: 450,
        customizations: ['Extra Cheese', 'Thin Crust'],
      },
      {
        id: '2',
        name: 'Garlic Bread',
        quantity: 2,
        price: 150,
      },
      {
        id: '3',
        name: 'Coca Cola',
        quantity: 2,
        price: 100,
      },
    ],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#28A745';
      case 'cancelled':
        return '#DC3545';
      case 'preparing':
        return '#FFC107';
      case 'on_the_way':
        return '#17A2B8';
      default:
        return '#6C757D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'preparing':
        return 'Preparing';
      case 'on_the_way':
        return 'On the Way';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
        {item.customizations && item.customizations.length > 0 && (
          <Text style={styles.customizations}>
            Customizations: {item.customizations.join(', ')}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(selectedOrder.status) },
              ]}
            />
            <Text style={styles.statusText}>{getStatusText(selectedOrder.status)}</Text>
          </View>
          <Text style={styles.orderNumber}>Order #{selectedOrder.orderNumber}</Text>
          <Text style={styles.orderDate}>
            Ordered on {formatDate(selectedOrder.orderDate)}
          </Text>
          {selectedOrder.deliveryDate && (
            <Text style={styles.deliveryDate}>
              Delivered on {formatDate(selectedOrder.deliveryDate)}
            </Text>
          )}
        </View>

        {/* Business Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant</Text>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{selectedOrder.businessName}</Text>
            <Text style={styles.businessAddress}>{selectedOrder.businessAddress}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <FlatList
            data={selectedOrder.items}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.address}>{selectedOrder.deliveryAddress}</Text>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentMethod}>{selectedOrder.paymentMethod}</Text>
            <Text style={styles.paymentStatus}>Paid</Text>
          </View>
        </View>

        {/* Bill Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          <View style={styles.billContainer}>
            {selectedOrder.items.map((item) => (
              <View key={item.id} style={styles.billItem}>
                <Text style={styles.billItemName}>
                  {item.name} x {item.quantity}
                </Text>
                <Text style={styles.billItemPrice}>₹{item.price}</Text>
              </View>
            ))}
            <View style={styles.billSeparator} />
            <View style={styles.billItem}>
              <Text style={styles.billItemName}>Delivery Fee</Text>
              <Text style={styles.billItemPrice}>₹30</Text>
            </View>
            <View style={styles.billItem}>
              <Text style={styles.billItemName}>Taxes & Fees</Text>
              <Text style={styles.billItemPrice}>₹50</Text>
            </View>
            <View style={styles.billSeparator} />
            <View style={styles.billTotal}>
              <Text style={styles.billTotalText}>Total Paid</Text>
              <Text style={styles.billTotalAmount}>₹{selectedOrder.total}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.reorderButton}>
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.rateButton}>
            <Text style={styles.rateButtonText}>Rate & Review</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  helpButton: {
    padding: 4,
  },
  helpButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  orderNumber: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666666',
  },
  deliveryDate: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  businessInfo: {
    paddingHorizontal: 20,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 14,
    color: '#666666',
  },
  orderItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemDetails: {
    marginTop: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666666',
  },
  customizations: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  address: {
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  paymentInfo: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  paymentStatus: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '500',
  },
  billContainer: {
    paddingHorizontal: 20,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billItemName: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  billItemPrice: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  billSeparator: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 8,
  },
  billTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billTotalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  billTotalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  reorderButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rateButton: {
    backgroundColor: '#FFC107',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  supportButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  supportButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
});
