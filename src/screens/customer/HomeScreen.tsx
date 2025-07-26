import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { COLORS, DIMENSIONS } from '../../config/constants';
import { getBusinessCategories, getNearbyBusinesses, getPopularProducts } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useLocationStore } from '../../stores/locationStore';
import type { BusinessProfile, Category, ProductWithBusiness } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { location, setLocation } = useLocationStore();
  const { items: cartItems } = useCartStore();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyBusinesses, setNearbyBusinesses] = useState<BusinessProfile[]>([]);
  const [popularProducts, setPopularProducts] = useState<ProductWithBusiness[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load home screen data
  const loadHomeData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Get user location if not available
      if (!location) {
        await requestLocationPermission();
      }

      // Fetch data in parallel
      const [businessesResponse, productsResponse, categoriesResponse] = await Promise.all([
        getNearbyBusinesses(location?.latitude || 0, location?.longitude || 0, 5000),
        getPopularProducts(10),
        getBusinessCategories()
      ]);

      if (businessesResponse.data) {
        setNearbyBusinesses(businessesResponse.data);
      }

      if (productsResponse.data) {
        setPopularProducts(productsResponse.data);
      }

      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('location.permissionDenied'), t('location.permissionMessage'));
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
    } catch (error: any) {
      console.error('Location error:', error);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadHomeData(true);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results
      console.log('Search for:', searchQuery);
    }
  };

  const getBusinessTypeIcon = (type: string): string => {
    switch (type) {
      case 'type_a': return '🛒'; // ORDER_BUY
      case 'type_b': return '📅'; // BOOK_SERVICE  
      case 'type_c': return '💬'; // INQUIRE_CONSULT
      default: return '🏪';
    }
  };

  const getBusinessTypeColor = (type: string): string => {
    switch (type) {
      case 'type_a': return COLORS.success[500]; // ORDER_BUY
      case 'type_b': return COLORS.info[500]; // BOOK_SERVICE
      case 'type_c': return COLORS.warning[500]; // INQUIRE_CONSULT
      default: return COLORS.gray[500];
    }
  };

  const renderBusinessCard = (business: BusinessProfile, index: number) => (
    <MotiView
      key={business.id}
      from={{ opacity: 0, translateX: 50 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ 
        type: 'timing',
        duration: 300,
        delay: index * 100
      }}
      style={styles.businessCard}
    >
      <TouchableOpacity
        onPress={() => {/* Navigate to business detail */}}
        style={styles.businessCardContent}
      >
        <View style={styles.businessHeader}>
          <View style={[styles.businessTypeIcon, { backgroundColor: getBusinessTypeColor(business.business_type) }]}>
            <Text style={styles.businessIcon}>{getBusinessTypeIcon(business.business_type)}</Text>
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{business.business_name}</Text>
            <Text style={styles.businessCategory}>{business.category}</Text>
            <Text style={styles.businessDistance}>
              {business.distance ? `${business.distance.toFixed(1)} km` : ''}
            </Text>
          </View>
        </View>
        
        <Text style={styles.businessDescription} numberOfLines={2}>
          {business.description}
        </Text>
        
        <View style={styles.businessFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {business.rating || '4.5'}</Text>
            <Text style={styles.reviewCount}>({business.review_count || 0})</Text>
          </View>
          {business.is_open && (
            <View style={styles.openBadge}>
              <Text style={styles.openText}>{t('business.open')}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </MotiView>
  );

  const renderProductCard = (product: ProductWithBusiness, index: number) => (
    <MotiView
      key={product.id}
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: 'spring',
        damping: 15,
        stiffness: 200,
        delay: index * 50
      }}
      style={styles.productCard}
    >
      <TouchableOpacity
        onPress={() => {/* Navigate to product detail */}}
        style={styles.productCardContent}
      >
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImageIcon}>📦</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>₹{product.price}</Text>
        <Text style={styles.productBusiness}>{product.business?.name}</Text>
      </TouchableOpacity>
    </MotiView>
  );

  const renderCategoryChip = (category: Category, index: number) => (
    <MotiView
      key={category.id}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ 
        type: 'timing',
        duration: 200,
        delay: index * 50
      }}
    >
      <TouchableOpacity
        onPress={() => setSelectedCategory(category.id)}
        style={[
          styles.categoryChip,
          selectedCategory === category.id && styles.selectedCategoryChip
        ]}
      >
        <Text style={[
          styles.categoryText,
          selectedCategory === category.id && styles.selectedCategoryText
        ]}>
          {category.icon_url} {category.name}
        </Text>
      </TouchableOpacity>
    </MotiView>
  );

  if (isLoading && nearbyBusinesses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 500, loop: true }}
          >
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary[500]]}
            tintColor={COLORS.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {t('customer.home.greeting', { name: user?.profile?.full_name?.split(' ')[0] || 'User' })}
            </Text>
            <Text style={styles.subtitle}>{t('customer.home.subtitle')}</Text>
            
            {cartItems.length > 0 && (
              <TouchableOpacity style={styles.cartBadge}>
                <Text style={styles.cartCount}>{cartItems.length}</Text>
                <Text style={styles.cartIcon}>🛒</Text>
              </TouchableOpacity>
            )}
          </View>
        </MotiView>

        {/* Search Bar */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
        >
          <Card>
            <View style={styles.searchContainer}>
              <Input
                placeholder={t('customer.home.searchPlaceholder')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <Button
                title={t('common.search')}
                onPress={handleSearch}
                variant="primary"
                size="sm"
                icon="🔍"
              />
            </View>
          </Card>
        </MotiView>

        {/* Categories */}
        {categories.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 400 }}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('customer.home.categories')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {categories.map((category, index) => renderCategoryChip(category, index))}
              </ScrollView>
            </View>
          </MotiView>
        )}

        {/* Nearby Businesses */}
        {nearbyBusinesses.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 600 }}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('customer.home.nearbyBusinesses')}</Text>
              <View style={styles.businessesList}>
                {nearbyBusinesses.slice(0, 3).map((business, index) => 
                  renderBusinessCard(business, index)
                )}
              </View>
              <Button
                title={t('customer.home.viewAllBusinesses')}
                onPress={() => {/* Navigate to all businesses */}}
                variant="outline"
                size="sm"
              />
            </View>
          </MotiView>
        )}

        {/* Popular Products */}
        {popularProducts.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 800 }}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('customer.home.popularProducts')}</Text>
              <FlatList
                data={popularProducts}
                renderItem={({ item, index }) => renderProductCard(item, index)}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
              />
            </View>
          </MotiView>
        )}

        {/* Empty State */}
        {nearbyBusinesses.length === 0 && !isLoading && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <Card>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🏪</Text>
                <Text style={styles.emptyStateTitle}>{t('customer.home.noBusinesses')}</Text>
                <Text style={styles.emptyStateMessage}>{t('customer.home.noBusinessesMessage')}</Text>
                <Button
                  title={t('customer.home.exploreMore')}
                  onPress={() => {/* Navigate to explore */}}
                  variant="primary"
                />
              </View>
            </Card>
          </MotiView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DIMENSIONS.PADDING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  header: {
    marginBottom: DIMENSIONS.PADDING.lg,
    position: 'relative',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: DIMENSIONS.PADDING.xs,
    lineHeight: 24,
  },
  cartBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: DIMENSIONS.PADDING.sm,
    paddingVertical: DIMENSIONS.PADDING.xs,
    borderRadius: DIMENSIONS.BORDER_RADIUS.md,
  },
  cartCount: {
    color: COLORS.white,
    fontWeight: '600',
    marginRight: DIMENSIONS.PADDING.xs,
  },
  cartIcon: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: DIMENSIONS.PADDING.sm,
  },
  section: {
    marginBottom: DIMENSIONS.PADDING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: DIMENSIONS.PADDING.md,
  },
  categoriesContainer: {
    paddingHorizontal: DIMENSIONS.PADDING.xs,
    gap: DIMENSIONS.PADDING.sm,
  },
  categoryChip: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: DIMENSIONS.PADDING.md,
    paddingVertical: DIMENSIONS.PADDING.sm,
    borderRadius: DIMENSIONS.BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  businessesList: {
    gap: DIMENSIONS.PADDING.md,
    marginBottom: DIMENSIONS.PADDING.md,
  },
  businessCard: {
    backgroundColor: COLORS.white,
    borderRadius: DIMENSIONS.BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessCardContent: {
    padding: DIMENSIONS.PADDING.md,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  businessTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DIMENSIONS.PADDING.md,
  },
  businessIcon: {
    fontSize: 20,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  businessCategory: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: DIMENSIONS.PADDING.xs,
  },
  businessDistance: {
    fontSize: 12,
    color: COLORS.info[500],
    marginTop: DIMENSIONS.PADDING.xs,
  },
  businessDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: DIMENSIONS.PADDING.xs,
  },
  openBadge: {
    backgroundColor: COLORS.success[500],
    paddingHorizontal: DIMENSIONS.PADDING.sm,
    paddingVertical: DIMENSIONS.PADDING.xs,
    borderRadius: DIMENSIONS.BORDER_RADIUS.sm,
  },
  openText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  productsContainer: {
    paddingHorizontal: DIMENSIONS.PADDING.xs,
    gap: DIMENSIONS.PADDING.md,
  },
  productCard: {
    width: 150,
    backgroundColor: COLORS.white,
    borderRadius: DIMENSIONS.BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productCardContent: {
    padding: DIMENSIONS.PADDING.sm,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.gray[100],
    borderRadius: DIMENSIONS.BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  productImageIcon: {
    fontSize: 24,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: DIMENSIONS.PADDING.xs,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success[600],
    marginBottom: DIMENSIONS.PADDING.xs,
  },
  productBusiness: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: DIMENSIONS.PADDING.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: DIMENSIONS.PADDING.md,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: DIMENSIONS.PADDING.sm,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: DIMENSIONS.PADDING.lg,
  },
});

export default HomeScreen;
