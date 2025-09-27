/**
 * FILE: src/screens/customer/UnifiedBusinessDetailScreen.tsx
 * PURPOSE: Unified Business Detail Screen handling Type A, B, C interactions
 * RESPONSIBILITIES: Display business info, products/services, enable ordering/booking/inquiring
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  StyleSheet,
  FlatList,
  Linking,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import {
  BusinessBase,
  TypeABusiness,
  TypeBBusiness,
  TypeCBusiness,
  Product,
  Service,
  Review,
  BusinessInteractionType
} from '../../types/localMartTypes';
import { BusinessCategoryService } from '../../services/businessCategoryService';
import { useTheme } from '../../context/ModernThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function UnifiedBusinessDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  
  const [business, setBusiness] = useState<BusinessBase | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'items' | 'reviews'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setIsLoading(true);
      
      // In real implementation, fetch from Firebase
      const mockBusiness = generateMockBusinessData(
        params.businessId as string,
        params.interaction_type as BusinessInteractionType
      );
      
      setBusiness(mockBusiness);
      setIsBusinessOpen(BusinessCategoryService.isBusinessOpenNow(mockBusiness));
      
      if (mockBusiness.interaction_type === 'type_a') {
        setProducts(generateMockProducts(mockBusiness.id));
      } else if (mockBusiness.interaction_type === 'type_b') {
        setServices(generateMockServices(mockBusiness.id));
      }
      
      setReviews(generateMockReviews(mockBusiness.id));
      
    } catch (error) {
      console.error('Error loading business data:', error);
      Alert.alert('Error', 'Failed to load business details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleFavoritePress = () => {
    setIsFavorite(!isFavorite);
    // In real implementation, update user's favorites in Firebase
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `Check out ${business?.business_name} on LocalMart!`,
        url: `https://localmart.app/business/${business?.id}`
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCallPress = () => {
    if (business?.contact_phone) {
      Linking.openURL(`tel:${business.contact_phone}`);
    }
  };

  const handleDirectionsPress = () => {
    if (business?.address) {
      const url = `https://maps.google.com/?q=${business.address.latitude},${business.address.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleChatPress = () => {
    router.push({
      pathname: '/customer/chat',
      params: { businessId: business?.id }
    });
  };

  // Type A: Order & Buy Actions
  const handleAddToCart = (product: Product) => {
    // Add to cart logic
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/customer/product-detail',
      params: { productId: product.id, businessId: business?.id }
    });
  };

  const handleViewCart = () => {
    router.push('/customer/cart');
  };

  // Type B: Book & Request Service Actions
  const handleBookService = (service: Service) => {
    router.push({
      pathname: '/customer/service-booking',
      params: { serviceId: service.id, businessId: business?.id }
    });
  };

  const handleRequestCustomService = () => {
    router.push({
      pathname: '/customer/service-request',
      params: { businessId: business?.id }
    });
  };

  // Type C: Inquire & Consult Actions
  const handleSubmitInquiry = (inquiryType?: string) => {
    router.push({
      pathname: '/customer/inquiry-form',
      params: { businessId: business?.id, inquiryType }
    });
  };

  const handleScheduleConsultation = () => {
    router.push({
      pathname: '/customer/consultation-booking',
      params: { businessId: business?.id }
    });
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <SafeAreaView edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleFavoritePress} style={styles.headerButton}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#FF6B6B" : theme.colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSharePress} style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  const renderBusinessInfo = () => {
    if (!business) return null;

    return (
      <View style={[styles.businessInfoContainer, { backgroundColor: theme.colors.surface }]}>
        {/* Banner Image */}
        <Image
          source={{ uri: business.banner_url || 'https://via.placeholder.com/400x200' }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        
        {/* Business Basic Info */}
        <View style={styles.businessBasicInfo}>
          <Image
            source={{ uri: business.logo_url || 'https://via.placeholder.com/80' }}
            style={styles.businessLogo}
            resizeMode="cover"
          />
          
          <View style={styles.businessDetails}>
            <Text style={[styles.businessName, { color: theme.colors.text }]}>
              {business.business_name}
            </Text>
            <Text style={[styles.businessCategory, { color: theme.colors.textSecondary }]}>
              {business.category.name}
            </Text>
            
            <View style={styles.businessMeta}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                  {business.avg_rating.toFixed(1)}
                </Text>
                <Text style={[styles.reviewCount, { color: theme.colors.textSecondary }]}>
                  ({business.total_reviews} reviews)
                </Text>
              </View>
              
              <View style={[styles.statusContainer, {
                backgroundColor: isBusinessOpen ? '#4CAF50' : '#F44336'
              }]}>
                <Text style={styles.statusText}>
                  {isBusinessOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Business Description */}
        <Text style={[styles.businessDescription, { color: theme.colors.textSecondary }]}>
          {business.description}
        </Text>

        {/* Interaction Type Badge */}
        <View style={[styles.interactionTypeBadge, {
          backgroundColor: getInteractionTypeColor(business.interaction_type)
        }]}>
          <Text style={styles.interactionTypeText}>
            {getInteractionTypeLabel(business.interaction_type)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCallPress}
          >
            <Ionicons name="call" size={20} color="white" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
            onPress={handleDirectionsPress}
          >
            <Ionicons name="location" size={20} color="white" />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
            onPress={handleChatPress}
          >
            <Ionicons name="chatbubble" size={20} color="white" />
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'overview' && { borderBottomColor: theme.colors.primary }]}
        onPress={() => setSelectedTab('overview')}
      >
        <Text style={[
          styles.tabText,
          { color: selectedTab === 'overview' ? theme.colors.primary : theme.colors.textSecondary }
        ]}>
          Overview
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'items' && { borderBottomColor: theme.colors.primary }]}
        onPress={() => setSelectedTab('items')}
      >
        <Text style={[
          styles.tabText,
          { color: selectedTab === 'items' ? theme.colors.primary : theme.colors.textSecondary }
        ]}>
          {business?.interaction_type === 'type_a' ? 'Products' : 
           business?.interaction_type === 'type_b' ? 'Services' : 'Consultation Types'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'reviews' && { borderBottomColor: theme.colors.primary }]}
        onPress={() => setSelectedTab('reviews')}
      >
        <Text style={[
          styles.tabText,
          { color: selectedTab === 'reviews' ? theme.colors.primary : theme.colors.textSecondary }
        ]}>
          Reviews
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Operating Hours */}
      <View style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Operating Hours</Text>
        {Object.entries(business?.operating_hours || {}).map(([day, schedule]) => (
          <View key={day} style={styles.hourRow}>
            <Text style={[styles.dayText, { color: theme.colors.text }]}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Text>
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              {schedule.is_open 
                ? schedule.is_24_hours 
                  ? '24 Hours' 
                  : `${schedule.open_time} - ${schedule.close_time}`
                : 'Closed'}
            </Text>
          </View>
        ))}
      </View>

      {/* Contact Information */}
      <View style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact Information</Text>
        <View style={styles.contactRow}>
          <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
            {business?.address.full_address}
          </Text>
        </View>
        <TouchableOpacity style={styles.contactRow} onPress={handleCallPress}>
          <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.contactText, { color: theme.colors.primary }]}>
            {business?.contact_phone}
          </Text>
        </TouchableOpacity>
        {business?.contact_email && (
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
              {business?.contact_email}
            </Text>
          </View>
        )}
      </View>

      {/* Type-specific information */}
      {renderTypeSpecificInfo()}
    </View>
  );

  const renderTypeSpecificInfo = () => {
    if (!business) return null;

    switch (business.interaction_type) {
      case 'type_a':
        const typeABusiness = business as TypeABusiness;
        return (
          <View style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Delivery Information</Text>
            <View style={styles.deliveryInfo}>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Delivery Radius: {typeABusiness.delivery_radius_km || 'N/A'} km
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Minimum Order: ₹{typeABusiness.min_order_value || 0}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Delivery Charge: ₹{typeABusiness.delivery_charge || 0}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Preparation Time: {typeABusiness.avg_preparation_time_minutes || 30} mins
              </Text>
            </View>
          </View>
        );

      case 'type_b':
        const typeBBusiness = business as TypeBBusiness;
        return (
          <View style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Service Information</Text>
            <View style={styles.serviceInfo}>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Service Radius: {typeBBusiness.service_radius_km || 'N/A'} km
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Home Service: {typeBBusiness.supports_home_service ? 'Available' : 'Not Available'}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                In-store Service: {typeBBusiness.supports_in_store_service ? 'Available' : 'Not Available'}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Advance Booking: {typeBBusiness.advance_booking_required ? 'Required' : 'Not Required'}
              </Text>
            </View>
          </View>
        );

      case 'type_c':
        const typeCBusiness = business as TypeCBusiness;
        return (
          <View style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Consultation Information</Text>
            <View style={styles.consultationInfo}>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Consultation Fee: ₹{typeCBusiness.consultation_fee || 'Free'}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Duration: {typeCBusiness.consultation_duration_minutes || 60} minutes
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Remote Consultation: {typeCBusiness.supports_remote_consultation ? 'Available' : 'Not Available'}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Site Visit: {typeCBusiness.supports_site_visit ? 'Available' : 'Not Available'}
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Experience: {typeCBusiness.years_of_experience || 'N/A'} years
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderItemsTab = () => {
    if (!business) return null;

    switch (business.interaction_type) {
      case 'type_a':
        return renderProductsList();
      case 'type_b':
        return renderServicesList();
      case 'type_c':
        return renderConsultationTypes();
      default:
        return null;
    }
  };

  const renderProductsList = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.productCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => handleProductPress(item)}
          >
            <Image
              source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: theme.colors.text }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
                ₹{item.price}
              </Text>
              {item.discount_price && (
                <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
                  ₹{item.discount_price}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.addToCartButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleAddToCart(item)}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      
      {/* Floating Cart Button */}
      <TouchableOpacity
        style={[styles.floatingCartButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleViewCart}
      >
        <Ionicons name="cart" size={24} color="white" />
        <Text style={styles.cartButtonText}>View Cart</Text>
      </TouchableOpacity>
    </View>
  );

  const renderServicesList = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.serviceCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceName, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.serviceDescription, { color: theme.colors.textSecondary }]}>
                {item.description}
              </Text>
              <View style={styles.serviceDetails}>
                <Text style={[styles.servicePrice, { color: theme.colors.primary }]}>
                  {item.price_type === 'fixed' ? `₹${item.base_price}` : 
                   item.price_type === 'hourly' ? `₹${item.base_price}/hr` :
                   'Quote Based'}
                </Text>
                {item.estimated_duration_minutes && (
                  <Text style={[styles.serviceDuration, { color: theme.colors.textSecondary }]}>
                    ~{item.estimated_duration_minutes} mins
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.bookServiceButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleBookService(item)}
            >
              <Text style={styles.bookServiceText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      {/* Custom Service Request Button */}
      <TouchableOpacity
        style={[styles.customServiceButton, { backgroundColor: theme.colors.secondary }]}
        onPress={handleRequestCustomService}
      >
        <Ionicons name="create-outline" size={24} color="white" />
        <Text style={styles.customServiceText}>Request Custom Service</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConsultationTypes = () => {
    const consultationTypes = [
      'Property Consultation',
      'Travel Planning',
      'Legal Advice',
      'Business Strategy',
      'Investment Planning'
    ];

    return (
      <View style={styles.tabContent}>
        <FlatList
          data={consultationTypes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.consultationCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => handleSubmitInquiry(item)}
            >
              <View style={styles.consultationInfo}>
                <Text style={[styles.consultationName, { color: theme.colors.text }]}>
                  {item}
                </Text>
                <Text style={[styles.consultationDescription, { color: theme.colors.textSecondary }]}>
                  Get expert advice and consultation for {item.toLowerCase()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        />
        
        {/* Schedule Consultation Button */}
        <TouchableOpacity
          style={[styles.scheduleConsultationButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleScheduleConsultation}
        >
          <Ionicons name="calendar-outline" size={24} color="white" />
          <Text style={styles.scheduleConsultationText}>Schedule Consultation</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.reviewHeader}>
              <Image
                source={{ uri: item.customer_profile_picture || 'https://via.placeholder.com/40' }}
                style={styles.reviewerAvatar}
              />
              <View style={styles.reviewerInfo}>
                <Text style={[styles.reviewerName, { color: theme.colors.text }]}>
                  {item.customer_name}
                </Text>
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= item.rating ? "star" : "star-outline"}
                      size={16}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
              <Text style={[styles.reviewDate, { color: theme.colors.textSecondary }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            {item.comment && (
              <Text style={[styles.reviewComment, { color: theme.colors.textSecondary }]}>
                {item.comment}
              </Text>
            )}
            {item.response_from_business && (
              <View style={[styles.businessResponse, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.responseLabel, { color: theme.colors.primary }]}>
                  Business Response:
                </Text>
                <Text style={[styles.responseText, { color: theme.colors.textSecondary }]}>
                  {item.response_from_business}
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );

  const getInteractionTypeColor = (type: BusinessInteractionType): string => {
    switch (type) {
      case 'type_a': return '#4CAF50';
      case 'type_b': return '#2196F3';
      case 'type_c': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getInteractionTypeLabel = (type: BusinessInteractionType): string => {
    switch (type) {
      case 'type_a': return 'Order & Buy Now';
      case 'type_b': return 'Book & Request Service';
      case 'type_c': return 'Inquire & Consult';
      default: return 'Unknown';
    }
  };

  // Mock data generators (in real app, these would come from Firebase)
  const generateMockBusinessData = (
    businessId: string,
    interactionType: BusinessInteractionType
  ): BusinessBase => {
    const categories = BusinessCategoryService.getBusinessCategories();
    const category = categories.find(cat => cat.interaction_type === interactionType) || categories[0];

    return {
      id: businessId,
      owner_id: 'owner_123',
      business_name: `Sample ${category.name}`,
      logo_url: 'https://via.placeholder.com/80',
      banner_url: 'https://via.placeholder.com/400x200',
      gallery_images: [],
      description: `Professional ${category.name.toLowerCase()} services with excellent quality and customer satisfaction.`,
      address: {
        id: 'addr_1',
        full_address: '123 Main Street, Mumbai, Maharashtra 400001',
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip_code: '400001',
        latitude: 19.0760,
        longitude: 72.8777,
        is_default: true
      },
      location: { latitude: 19.0760, longitude: 72.8777 } as any,
      contact_person: 'John Doe',
      contact_phone: '+91 9876543210',
      contact_email: 'contact@business.com',
      operating_hours: {
        monday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        tuesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        wednesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        thursday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        friday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        saturday: { is_open: true, open_time: '09:00', close_time: '18:00' },
        sunday: { is_open: false }
      },
      category,
      interaction_type: interactionType,
      specialized_categories: [category.id],
      is_approved: true,
      status: 'active',
      is_featured: true,
      avg_rating: 4.5,
      total_reviews: 127,
      created_at: new Date(),
      updated_at: new Date()
    };
  };

  const generateMockProducts = (businessId: string): Product[] => {
    return [
      {
        id: 'product_1',
        business_id: businessId,
        name: 'Fresh Apples',
        description: 'Premium quality fresh apples',
        images: ['https://via.placeholder.com/150'],
        price: 120,
        discount_price: 100,
        currency: 'INR',
        category: 'Fruits',
        stock_quantity: 50,
        unit: 'kg',
        is_available: true,
        is_featured: false,
        tags: ['fresh', 'organic'],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
  };

  const generateMockServices = (businessId: string): Service[] => {
    return [
      {
        id: 'service_1',
        business_id: businessId,
        name: 'Electrical Repair',
        description: 'Professional electrical repair services',
        images: [],
        category: 'Electrical',
        base_price: 500,
        price_type: 'fixed',
        currency: 'INR',
        estimated_duration_minutes: 60,
        service_location: 'at_customer',
        is_available: true,
        is_featured: false,
        tags: ['repair', 'electrical'],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
  };

  const generateMockReviews = (businessId: string): Review[] => {
    return [
      {
        id: 'review_1',
        customer_id: 'customer_1',
        customer_name: 'Alice Johnson',
        customer_profile_picture: 'https://via.placeholder.com/40',
        business_id: businessId,
        rating: 5,
        comment: 'Excellent service! Highly recommended.',
        verified_purchase: true,
        helpful_count: 5,
        created_at: new Date()
      }
    ];
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading business details...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {renderBusinessInfo()}
        {renderTabs()}
        
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'items' && renderItemsTab()}
        {selectedTab === 'reviews' && renderReviewsTab()}
      </ScrollView>
    </View>
  );
}

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
    fontWeight: '500',
  },
  header: {
    paddingBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  businessInfoContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 200,
  },
  businessBasicInfo: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  businessLogo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  businessDescription: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  interactionTypeBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  interactionTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  infoSection: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  deliveryInfo: {
    gap: 8,
  },
  serviceInfo: {
    gap: 8,
  },
  consultationInfo: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (screenWidth - 48) / 2,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
  },
  serviceDuration: {
    fontSize: 12,
  },
  bookServiceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bookServiceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  customServiceButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  customServiceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  consultationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  consultationInfo: {
    flex: 1,
  },
  consultationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  consultationDescription: {
    fontSize: 14,
  },
  scheduleConsultationButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  scheduleConsultationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  businessResponse: {
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 18,
  },
});

export default UnifiedBusinessDetailScreen;