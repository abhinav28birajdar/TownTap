import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Image,
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
import { Business, Product, Service } from '../../types';

const BusinessDetailScreen: React.FC<any> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { businessId } = route.params || {};
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessDetails();
  }, [businessId]);

  const loadBusinessDetails = async () => {
    try {
      setLoading(true);
      const businessData = await businessService.getBusinessById(businessId);
      const productsData = await businessService.getBusinessProducts(businessId);
      const servicesData = await businessService.getBusinessServices(businessId);
      
      setBusiness(businessData);
      setProducts(productsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading business details:', error);
      Alert.alert(t('errors.loadingError'), t('errors.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (business?.contact_phone) {
      Alert.alert(
        t('business.contact'),
        business.contact_phone,
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.call'), onPress: () => console.log('Call business') },
        ]
      );
    }
  };

  const handleOrder = () => {
    navigation.navigate('Order', { businessId });
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

  if (!business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('errors.businessNotFound')}</Text>
          <Button
            title={t('common.goBack')}
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{business.business_name}</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Business Image */}
        {business.banner_url && (
          <Image source={{ uri: business.banner_url }} style={styles.businessImage} />
        )}

        {/* Business Info */}
        <Card style={styles.businessInfo}>
          <Text style={styles.businessName}>{business.business_name}</Text>
          <Text style={styles.businessType}>{business.business_type}</Text>
          {business.description && (
            <Text style={styles.businessDescription}>{business.description}</Text>
          )}
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.contactText}>
                {business.address_line1}, {business.city}
              </Text>
            </View>
            {business.contact_phone && (
              <TouchableOpacity style={styles.contactItem} onPress={handleContact}>
                <Ionicons name="call-outline" size={16} color="#007AFF" />
                <Text style={[styles.contactText, styles.phoneText]}>
                  {business.contact_phone}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Products Section */}
        {products.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t('business.products')}</Text>
            {products.slice(0, 3).map((product) => (
              <View key={product.id} style={styles.productItem}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>
                  ₹{product.discount_price || product.price}
                </Text>
              </View>
            ))}
            {products.length > 3 && (
              <TouchableOpacity onPress={handleOrder}>
                <Text style={styles.viewAllText}>
                  {t('business.viewAll')} ({products.length})
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Services Section */}
        {services.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t('business.services')}</Text>
            {services.slice(0, 3).map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>
                  ₹{service.base_price}
                </Text>
              </View>
            ))}
            {services.length > 3 && (
              <TouchableOpacity onPress={handleOrder}>
                <Text style={styles.viewAllText}>
                  {t('business.viewAll')} ({services.length})
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={t('business.placeOrder')}
            onPress={handleOrder}
            style={styles.orderButton}
          />
          <Button
            title={t('business.contact')}
            onPress={handleContact}
            variant="outline"
            style={styles.contactButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  shareButton: {
    padding: 4,
  },
  businessImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  businessInfo: {
    margin: 16,
    padding: 16,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  businessType: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  businessDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  phoneText: {
    color: '#007AFF',
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  orderButton: {
    flex: 1,
  },
  contactButton: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default BusinessDetailScreen;
