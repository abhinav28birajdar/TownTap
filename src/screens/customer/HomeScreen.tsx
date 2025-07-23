import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { businessService } from '../../services/businessService';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { Business } from '../../types';

const { width } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  color?: string;
  business_types: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface HomeScreenProps {
  navigation: any;
}

// Mock categories
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Grocery',
    icon: '🛒',
    description: 'Fresh groceries and daily essentials',
    business_types: ['grocery'],
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Pharmacy',
    icon: '💊',
    description: 'Medicines and health products',
    business_types: ['pharmacy'],
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Electrician',
    icon: '⚡',
    description: 'Electrical repairs and services',
    business_types: ['electrician'],
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Beauty Salon',
    icon: '💄',
    description: 'Beauty and grooming services',
    business_types: ['beauty'],
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { latitude, longitude, address, getCurrentLocation } = useLocationStore();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories] = useState<Category[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadBusinesses(),
        getCurrentLocation(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinesses = async () => {
    try {
      const data = await businessService.getNearbyBusinesses(
        { latitude: latitude || 0, longitude: longitude || 0 },
        10
      );
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await businessService.searchBusinesses(query, {
          location: latitude && longitude ? { latitude, longitude } : undefined,
          categories: selectedCategory ? [selectedCategory] : undefined,
        });
        setBusinesses(results.businesses);
      } catch (error) {
        console.error('Error searching businesses:', error);
      }
    } else {
      await loadBusinesses();
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    try {
      const filters = {
        categories: categoryId === selectedCategory ? undefined : [categoryId],
        location: latitude && longitude ? { latitude, longitude } : undefined,
      };
      const results = await businessService.searchBusinesses(searchQuery, filters);
      setBusinesses(results.businesses);
    } catch (error) {
      console.error('Error filtering by category:', error);
    }
  };

  const navigateToBusiness = (business: Business) => {
    navigation.navigate('BusinessDetail', { businessId: business.id });
  };

  const navigateToAIAssistant = () => {
    navigation.navigate('AIAssistant');
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipSelected,
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <TouchableOpacity onPress={() => navigateToBusiness(item)}>
      <Card style={styles.businessCard} padding="medium">
        <View style={styles.businessHeader}>
          {item.logo_url ? (
            <Image source={{ uri: item.logo_url }} style={styles.businessLogo} />
          ) : (
            <View style={[styles.businessLogo, styles.businessLogoPlaceholder]}>
              <Ionicons name="storefront" size={24} color="#9ca3af" />
            </View>
          )}
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{item.business_name}</Text>
            <Text style={styles.businessCategory}>{item.business_type}</Text>
            <View style={styles.businessMeta}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.rating}>{item.avg_rating?.toFixed(1) || 'N/A'}</Text>
              </View>
              <Text style={styles.distance}>
                2.5 km
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.businessDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.businessFooter}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.status === 'active' ? '#10b981' : '#ef4444' },
              ]}
            />
            <Text style={styles.statusText}>
              {item.status === 'active' ? t('business.open') : t('business.closed')}
            </Text>
          </View>
          
          <Button
            title={t('common.viewDetails')}
            onPress={() => navigateToBusiness(item)}
            variant="outline"
            size="small"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.goodMorning');
    if (hour < 17) return t('home.goodAfternoon');
    return t('home.goodEvening');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.full_name || t('common.user')}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.aiButton}
            onPress={navigateToAIAssistant}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#6b7280" />
          <Text style={styles.locationText}>
            {address || t('home.findingLocation')}
          </Text>
        </View>

        {/* Search */}
        <Input
          placeholder={t('home.searchPlaceholder')}
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon="search"
          style={styles.searchInput}
        />

        {/* AI Assistant Banner */}
        <Card style={styles.aiBanner} padding="large">
          <View style={styles.aiBannerContent}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={32} color="#8b5cf6" />
            </View>
            <View style={styles.aiBannerText}>
              <Text style={styles.aiBannerTitle}>{t('home.aiAssistantTitle')}</Text>
              <Text style={styles.aiBannerSubtitle}>{t('home.aiAssistantSubtitle')}</Text>
            </View>
            <Button
              title={t('common.tryNow')}
              onPress={navigateToAIAssistant}
              variant="primary"
              size="small"
            />
          </View>
        </Card>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.categories')}</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Nearby Businesses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.nearbyBusinesses')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : businesses.length > 0 ? (
            <FlatList
              data={businesses}
              renderItem={renderBusinessItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.businessesList}
            />
          ) : (
            <Card style={styles.emptyState} padding="large">
              <Ionicons name="storefront-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>{t('home.noBusinessesFound')}</Text>
              <Text style={styles.emptyStateSubtitle}>{t('home.noBusinessesSubtitle')}</Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  aiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  searchInput: {
    marginBottom: 24,
  },
  aiBanner: {
    marginBottom: 32,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  aiBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  aiBannerText: {
    flex: 1,
    marginRight: 16,
  },
  aiBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#581c87',
    marginBottom: 4,
  },
  aiBannerSubtitle: {
    fontSize: 14,
    color: '#7c3aed',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
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
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  businessesList: {
    gap: 16,
  },
  businessCard: {
    backgroundColor: '#ffffff',
  },
  businessHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  businessLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  businessLogoPlaceholder: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rating: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  distance: {
    fontSize: 14,
    color: '#6b7280',
  },
  businessDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;
