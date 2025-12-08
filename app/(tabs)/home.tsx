import { BusinessCard } from '@/components/ui/business-card';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type Business = Database['public']['Tables']['businesses']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const colors = useColors();
  const { selectedCategory: paramCategory } = useLocalSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(paramCategory as string || null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    requestLocationPermission();
    loadData();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadData = async () => {
    try {
      await Promise.all([loadCategories(), loadBusinesses()]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    setCategories(data || []);
  };

  const loadBusinesses = async () => {
    if (isDemo) {
      const filteredBusinesses = selectedCategory 
        ? demoBusinesses.filter(b => b.category_id === selectedCategory)
        : demoBusinesses;
      setBusinesses(filteredBusinesses);
      return;
    }

    let query = supabase.from('businesses').select('*').eq('is_verified', true);

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data, error } = await query;

    if (error) throw error;
    setBusinesses(data || []);
  };

  useEffect(() => {
    if (!loading && !isDemo) {
      loadBusinesses();
    } else if (isDemo) {
      loadBusinesses();
    }
  }, [selectedCategory, isDemo, loading]);

  const getBusinessDistance = (business: Business) => {
    if (!userLocation || !business.latitude || !business.longitude) {
      return null;
    }

    const R = 6371; // Earth's radius in km
    const dLat = ((business.latitude - userLocation.latitude) * Math.PI) / 180;
    const dLon = ((business.longitude - userLocation.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.latitude * Math.PI) / 180) *
        Math.cos((business.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortedBusinesses = [...businesses].sort((a, b) => {
    const distA = getBusinessDistance(a);
    const distB = getBusinessDistance(b);
    if (distA === null) return 1;
    if (distB === null) return -1;
    return distA - distB;
  });

  const getCategoryIcon = (slug: string) => {
    const icons: { [key: string]: string } = {
      carpenter: 'hammer',
      plumber: 'water',
      electrician: 'flash',
      gardener: 'leaf',
      furniture: 'bed',
      cleaning: 'sparkles',
      stationery: 'document',
      catering: 'restaurant',
      barber: 'cut',
      'machine-shop': 'construct',
    };
    return icons[slug] || 'briefcase';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              {((isDemo ? currentUser?.avatar_url : profile?.avatar_url)) ? (
                <Image source={{ uri: (isDemo ? currentUser?.avatar_url : profile?.avatar_url) || '' }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={20} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>{isDemo ? currentUser?.full_name || 'Demo User' : profile?.full_name || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            style={styles.notificationButton}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.card} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search services...</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            colors={[Colors.primary]}
          />
        }
      >
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            <CategoryItem
              label="All"
              icon="apps"
              isSelected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
            />
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                label={category.name}
                icon={getCategoryIcon(category.slug)}
                isSelected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.businessesSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? 'Filtered Services' : 'Nearby Services'}
          </Text>
          {sortedBusinesses.length > 0 ? (
            sortedBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                distance={getBusinessDistance(business) ?? undefined}
                onPress={() => router.push(`/business/${business.id}` as any)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={64} color={Colors.textLight} />
              <Text style={styles.emptyText}>No services available</Text>
              <Text style={styles.emptySubtext}>
                Check back later for new businesses
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const CategoryItem = ({
  label,
  icon,
  isSelected,
  onPress,
}: {
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
    onPress={onPress}
  >
    <View
      style={[
        styles.categoryIcon,
        isSelected && styles.categoryItemSelected,
      ]}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={isSelected ? Colors.card : Colors.primary}
      />
    </View>
    <Text
      style={[
        styles.categoryLabel,
        isSelected && styles.categoryLabelSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.card,
    opacity: 0.9,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.card,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  categoriesSection: {
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  categoriesList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryIconSelected: {
    backgroundColor: Colors.primary,
  },
  categoryItemSelected: {
    // Style for selected category item
  },
  categoryLabel: {
    fontSize: FontSize.xs,
    color: Colors.text,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  businessesSection: {
    padding: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});