import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { businessService } from '../../services/businessService';
import { useCartStore } from '../../stores/cartStore';
import { Business, CartItem, Product, Service } from '../../types';

const OrderScreen: React.FC<any> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { businessId } = route.params || {};
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { items, addItem, removeItem, updateItemQuantity, getItemCount, getCartTotal } = useCartStore();

  useEffect(() => {
    loadBusinessData();
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const businessData = await businessService.getBusinessById(businessId);
      const productsData = await businessService.getBusinessProducts(businessId);
      const servicesData = await businessService.getBusinessServices(businessId);
      
      setBusiness(businessData);
      setProducts(productsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading business data:', error);
      Alert.alert(t('errors.loadingError'), t('errors.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product: Product) => {
    const cartItem: Omit<CartItem, 'id' | 'added_at'> = {
      business_id: businessId,
      product_id: product.id,
      name: product.name,
      image_url: product.image_urls?.[0],
      price: product.discount_price || product.price,
      quantity: 1,
    };
    addItem(businessId, cartItem);
  };

  const handleAddService = (service: Service) => {
    const cartItem: Omit<CartItem, 'id' | 'added_at'> = {
      business_id: businessId,
      service_id: service.id,
      name: service.name,
      price: service.base_price,
      quantity: 1,
    };
    addItem(businessId, cartItem);
  };

  const getItemQuantity = (itemId: string) => {
    const item = items.find(item => item.product_id === itemId || item.service_id === itemId);
    return item ? item.quantity : 0;
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    const currentQuantity = getItemQuantity(itemId);
    const newQuantity = currentQuantity + change;
    
    if (newQuantity <= 0) {
      const item = items.find(item => item.product_id === itemId || item.service_id === itemId);
      if (item) {
        removeItem(item.id);
      }
    } else {
      const item = items.find(item => item.product_id === itemId || item.service_id === itemId);
      if (item) {
        updateItemQuantity(item.id, newQuantity);
      }
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert(t('cart.empty'), t('cart.addItems'));
      return;
    }
    navigation.navigate('Checkout', { businessId });
  };

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
        <Text style={styles.headerTitle}>{business?.business_name}</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="bag-outline" size={24} color="#333" />
          {getItemCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Products Section */}
        {products.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t('business.products')}</Text>
            {products.map((product) => (
              <View key={product.id} style={styles.itemContainer}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{product.name}</Text>
                  {product.description && (
                    <Text style={styles.itemDescription}>{product.description}</Text>
                  )}
                  <Text style={styles.itemPrice}>
                    ₹{product.discount_price || product.price}
                    {product.discount_price && (
                      <Text style={styles.originalPrice}> ₹{product.price}</Text>
                    )}
                  </Text>
                </View>
                
                <View style={styles.quantityContainer}>
                  {getItemQuantity(product.id) > 0 ? (
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(product.id, -1)}
                      >
                        <Ionicons name="remove" size={20} color="#007AFF" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>
                        {getItemQuantity(product.id)}
                      </Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(product.id, 1)}
                      >
                        <Ionicons name="add" size={20} color="#007AFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddProduct(product)}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Services Section */}
        {services.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t('business.services')}</Text>
            {services.map((service) => (
              <View key={service.id} style={styles.itemContainer}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{service.name}</Text>
                  {service.description && (
                    <Text style={styles.itemDescription}>{service.description}</Text>
                  )}
                  <Text style={styles.itemPrice}>₹{service.base_price}</Text>
                  {service.duration_minutes && (
                    <Text style={styles.serviceDuration}>
                      {service.duration_minutes} minutes
                    </Text>
                  )}
                </View>
                
                <View style={styles.quantityContainer}>
                  {getItemQuantity(service.id) > 0 ? (
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(service.id, -1)}
                      >
                        <Ionicons name="remove" size={20} color="#007AFF" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>
                        {getItemQuantity(service.id)}
                      </Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleQuantityChange(service.id, 1)}
                      >
                        <Ionicons name="add" size={20} color="#007AFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddService(service)}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      {/* Checkout Button */}
      {items.length > 0 && (
        <View style={styles.checkoutContainer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              {t('cart.total')}: ₹{getCartTotal()}
            </Text>
            <Text style={styles.itemCountText}>
              {getItemCount()} {t('cart.items')}
            </Text>
          </View>
          <Button
            title={t('cart.checkout')}
            onPress={handleCheckout}
            style={styles.checkoutButton}
          />
        </View>
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  cartButton: {
    padding: 4,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quantityContainer: {
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    flex: 1,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemCountText: {
    fontSize: 14,
    color: '#666',
  },
  checkoutButton: {
    marginLeft: 16,
    paddingHorizontal: 24,
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
});

export default OrderScreen;
