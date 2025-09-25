import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView,
  Alert,
  Image 
} from 'react-native';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ShopProduct, ShopService } from '../../types';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const BusinessProductsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [services, setServices] = useState<ShopService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');

  const mockProducts: ShopProduct[] = [
    {
      id: '1',
      business_id: userProfile?.id || 'business1',
      name: 'Margherita Pizza',
      description: 'Fresh tomato sauce, mozzarella cheese, and basil',
      image_urls: ['https://via.placeholder.com/150'],
      price: 12.99,
      discount_price: 10.99,
      stock_quantity: 50,
      unit: 'piece',
      is_available: true,
      category_id: 'food',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      business_id: userProfile?.id || 'business1',
      name: 'Caesar Salad',
      description: 'Crispy romaine lettuce with parmesan and croutons',
      image_urls: ['https://via.placeholder.com/150'],
      price: 8.99,
      stock_quantity: 30,
      unit: 'bowl',
      is_available: true,
      category_id: 'food',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const mockServices: ShopService[] = [
    {
      id: '1',
      business_id: userProfile?.id || 'business1',
      name: 'Home Cleaning',
      description: 'Professional home cleaning service',
      image_urls: ['https://via.placeholder.com/150'],
      base_price: 50.00,
      estimated_time_mins: 120,
      is_available: true,
      category_id: 'cleaning',
      pricing_model: 'fixed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      business_id: userProfile?.id || 'business1',
      name: 'AC Repair',
      description: 'Air conditioning repair and maintenance',
      image_urls: ['https://via.placeholder.com/150'],
      base_price: 75.00,
      estimated_time_mins: 90,
      is_available: true,
      category_id: 'repair',
      pricing_model: 'per_hour',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual Supabase calls
      setTimeout(() => {
        setProducts(mockProducts);
        setServices(mockServices);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleAvailability = async (id: string, type: 'product' | 'service') => {
    try {
      if (type === 'product') {
        setProducts(prev => prev.map(item => 
          item.id === id ? { ...item, is_available: !item.is_available } : item
        ));
      } else {
        setServices(prev => prev.map(item => 
          item.id === id ? { ...item, is_available: !item.is_available } : item
        ));
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const deleteItem = async (id: string, type: 'product' | 'service') => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete this ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            if (type === 'product') {
              setProducts(prev => prev.filter(item => item.id !== id));
            } else {
              setServices(prev => prev.filter(item => item.id !== id));
            }
          }
        }
      ]
    );
  };

  const renderProduct = ({ item }: { item: ShopProduct }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          {item.image_urls && item.image_urls[0] && (
            <Image source={{ uri: item.image_urls[0] }} style={styles.itemImage} />
          )}
          <View style={styles.itemDetails}>
            <Text style={[styles.itemName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
            <View style={styles.priceContainer}>
              {item.discount_price && (
                <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
                  ${item.price.toFixed(2)}
                </Text>
              )}
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                ${(item.discount_price || item.price).toFixed(2)}
              </Text>
              <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>
                per {item.unit}
              </Text>
            </View>
            <Text style={[styles.stock, { color: theme.colors.textSecondary }]}>
              Stock: {item.stock_quantity || 0}
            </Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.is_available ? '#4CAF50' : '#F44336' }
        ]}>
          <Text style={styles.statusText}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      <View style={styles.itemActions}>
        <Button
          title={item.is_available ? 'Mark Unavailable' : 'Mark Available'}
          onPress={() => toggleAvailability(item.id, 'product')}
          variant={item.is_available ? 'outline' : 'primary'}
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Edit"
          onPress={() => {/* TODO: Navigate to edit screen */}}
          variant="ghost"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          onPress={() => deleteItem(item.id, 'product')}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const renderService = ({ item }: { item: ShopService }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          {item.image_urls && item.image_urls[0] && (
            <Image source={{ uri: item.image_urls[0] }} style={styles.itemImage} />
          )}
          <View style={styles.itemDetails}>
            <Text style={[styles.itemName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.itemDescription, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                ${item.base_price?.toFixed(2) || 'Quote required'}
              </Text>
              {item.pricing_model && (
                <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>
                  {item.pricing_model === 'per_hour' ? 'per hour' : 
                   item.pricing_model === 'fixed' ? 'fixed price' : 'quote required'}
                </Text>
              )}
            </View>
            {item.estimated_time_mins && (
              <Text style={[styles.estimatedTime, { color: theme.colors.textSecondary }]}>
                Est. time: {Math.floor(item.estimated_time_mins / 60)}h {item.estimated_time_mins % 60}m
              </Text>
            )}
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.is_available ? '#4CAF50' : '#F44336' }
        ]}>
          <Text style={styles.statusText}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      <View style={styles.itemActions}>
        <Button
          title={item.is_available ? 'Mark Unavailable' : 'Mark Available'}
          onPress={() => toggleAvailability(item.id, 'service')}
          variant={item.is_available ? 'outline' : 'primary'}
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Edit"
          onPress={() => {/* TODO: Navigate to edit screen */}}
          variant="ghost"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          onPress={() => deleteItem(item.id, 'service')}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Products & Services</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Manage your offerings
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            { 
              backgroundColor: activeTab === 'products' 
                ? theme.colors.primary 
                : theme.colors.surface,
              borderColor: theme.colors.border
            }
          ]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[
            styles.tabText,
            { 
              color: activeTab === 'products' 
                ? '#FFFFFF' 
                : theme.colors.text 
            }
          ]}>
            Products ({products.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            { 
              backgroundColor: activeTab === 'services' 
                ? theme.colors.primary 
                : theme.colors.surface,
              borderColor: theme.colors.border
            }
          ]}
          onPress={() => setActiveTab('services')}
        >
          <Text style={[
            styles.tabText,
            { 
              color: activeTab === 'services' 
                ? '#FFFFFF' 
                : theme.colors.text 
            }
          ]}>
            Services ({services.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button
          title={`Add ${activeTab === 'products' ? 'Product' : 'Service'}`}
          onPress={() => {/* TODO: Navigate to add screen */}}
          variant="primary"
          size="medium"
        />
      </View>

      {/* List */}
      <FlatList
        data={activeTab === 'products' ? products : services}
        keyExtractor={(item) => item.id}
        renderItem={activeTab === 'products' ? renderProduct : renderService}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No {activeTab} found. Add your first {activeTab.slice(0, -1)} to get started!
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
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listContainer: {
    padding: 20,
  },
  itemCard: {
    marginBottom: 16,
    padding: 16,
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  unit: {
    fontSize: 12,
  },
  stock: {
    fontSize: 14,
    marginBottom: 4,
  },
  estimatedTime: {
    fontSize: 14,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default BusinessProductsScreen;