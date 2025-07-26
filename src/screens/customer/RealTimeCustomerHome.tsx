import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface LiveOrder {
  id: string;
  business_name: string;
  status: string;
  total_amount: number;
  created_at: string;
  items_count: number;
}

interface LiveBusiness {
  id: string;
  name: string;
  category: string;
  rating: number;
  is_open: boolean;
  delivery_time: string;
  distance: number;
}

const RealTimeCustomerHome: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<LiveBusiness[]>([]);
  const [notifications, setNotifications] = useState(0);

  // Real-time data fetching
  useEffect(() => {
    loadRealTimeData();
    
    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('customer_orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `customer_id=eq.${user?.id}`
      }, () => {
        loadRealTimeData();
      })
      .subscribe();

    const businessesSubscription = supabase
      .channel('businesses')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'businesses'
      }, () => {
        loadRealTimeData();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      businessesSubscription.unsubscribe();
    };
  }, [user?.id]);

  const loadRealTimeData = async () => {
    if (!user?.id) return;

    try {
      // Fetch user's recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          order_status,
          created_at,
          businesses(name)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch nearby businesses (mock for now)
      const mockBusinesses: LiveBusiness[] = [
        {
          id: '1',
          name: 'Fresh Mart Grocery',
          category: 'Grocery',
          rating: 4.5,
          is_open: true,
          delivery_time: '30-45 min',
          distance: 0.8,
        },
        {
          id: '2',
          name: 'Cafe Coffee Day',
          category: 'Restaurant',
          rating: 4.2,
          is_open: true,
          delivery_time: '20-30 min',
          distance: 1.2,
        },
        {
          id: '3',
          name: 'Book World',
          category: 'Stationary',
          rating: 4.8,
          is_open: false,
          delivery_time: 'Closed',
          distance: 0.5,
        },
        {
          id: '4',
          name: 'Tech Repair Pro',
          category: 'Electronics',
          rating: 4.6,
          is_open: true,
          delivery_time: 'Book Service',
          distance: 2.1,
        },
      ];

      setLiveOrders(orders?.map(order => ({
        id: order.id,
        business_name: (order.businesses as any)?.name || 'Unknown Business',
        status: order.order_status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        items_count: Math.floor(Math.random() * 5) + 1,
      })) || []);

      setNearbyBusinesses(mockBusinesses);
      setNotifications(Math.floor(Math.random() * 5));

    } catch (error) {
      console.error('Error loading real-time data:', error);
      // Use mock data for demo
      setLiveOrders([
        {
          id: '1',
          business_name: 'Fresh Mart Grocery',
          status: 'preparing',
          total_amount: 450,
          created_at: new Date().toISOString(),
          items_count: 3,
        },
        {
          id: '2',
          business_name: 'Cafe Coffee Day',
          status: 'delivered',
          total_amount: 230,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          items_count: 2,
        },
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRealTimeData();
    setRefreshing(false);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
      padding: 20,
      paddingTop: 10,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    welcomeContainer: {
      flex: 1,
    },
    welcomeText: {
      fontSize: 16,
      color: '#ffffff',
      opacity: 0.9,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
      marginTop: 4,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#EF4444',
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 25,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: '#ffffff',
      marginLeft: 12,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    seeAllButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    seeAllText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: '600',
    },
    liveOrdersContainer: {
      marginBottom: 32,
    },
    orderCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    businessName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    orderDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    orderInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    orderInfoText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 4,
    },
    orderAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    businessCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginRight: 16,
      width: 280,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    businessHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    businessCardName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    businessStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    businessStatusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    businessInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    businessCategory: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    businessRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginLeft: 4,
    },
    businessFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    deliveryTime: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    distance: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyStateIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'}!</Text>
            <Text style={styles.userName}>{user?.profile?.full_name || 'Customer'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="notifications" size={24} color="#ffffff" />
              {notifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifications}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={toggleTheme}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#ffffff" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses, products..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Live Orders */}
        <View style={styles.liveOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔴 Live Orders</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {liveOrders.length > 0 ? (
            liveOrders.map((order) => (
              <TouchableOpacity key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.businessName}>{order.business_name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                  </View>
                </View>
                <View style={styles.orderDetails}>
                  <View style={styles.orderInfo}>
                    <Ionicons name="bag" size={16} color={theme.textSecondary} />
                    <Text style={styles.orderInfoText}>{order.items_count} items</Text>
                  </View>
                  <Text style={styles.orderAmount}>₹{order.total_amount}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📦</Text>
              <Text style={styles.emptyStateText}>No active orders</Text>
            </View>
          )}
        </View>

        {/* Nearby Businesses */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏪 Nearby Businesses</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nearbyBusinesses.map((business) => (
              <TouchableOpacity key={business.id} style={styles.businessCard}>
                <View style={styles.businessHeader}>
                  <Text style={styles.businessCardName}>{business.name}</Text>
                  <View style={styles.businessStatus}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: business.is_open ? '#10B981' : '#EF4444' }
                    ]} />
                    <Text style={[
                      styles.businessStatusText,
                      { color: business.is_open ? '#10B981' : '#EF4444' }
                    ]}>
                      {business.is_open ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </View>

                <View style={styles.businessInfo}>
                  <Text style={styles.businessCategory}>{business.category}</Text>
                  <View style={styles.businessRating}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={styles.ratingText}>{business.rating}</Text>
                  </View>
                </View>

                <View style={styles.businessFooter}>
                  <Text style={styles.deliveryTime}>{business.delivery_time}</Text>
                  <Text style={styles.distance}>{business.distance} km</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RealTimeCustomerHome;
