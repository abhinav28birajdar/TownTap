import { BusinessCard } from '@/components/ui/business-card';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/auth-context';
import { calculateDistance, getBusinesses, getCategories } from '@/lib/api';
import { Database } from '@/lib/database.types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Category = Database['public']['Tables']['categories']['Row'];
type BusinessWithCategory = any;

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [businesses, setBusinesses] = useState<BusinessWithCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [selectedCategory]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    }
  };

  const loadData = async () => {
    try {
      const [categoriesData, businessesData] = await Promise.all([
        getCategories(),
        getBusinesses(),
      ]);
      setCategories(categoriesData);
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadBusinesses = async () => {
    try {
      const data = await getBusinesses(selectedCategory || undefined);
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getBusinessDistance = (business: BusinessWithCategory) => {
    if (!userLocation || !business.latitude || !business.longitude) return undefined;
    return calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      business.latitude,
      business.longitude
    );
  };

  const sortedBusinesses = [...businesses].sort((a, b) => {
    const distA = getBusinessDistance(a);
    const distB = getBusinessDistance(b);
    if (distA === undefined) return 1;
    if (distB === undefined) return -1;
    return distA - distB;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {profile?.full_name || 'Guest'} 👋</Text>
            <Text style={styles.headerSubtitle}>Find services near you</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={Colors.background} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={20} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons name="search" size={20} color={Colors.textLight} />
          <Text style={styles.searchPlaceholder}>Search for services...</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            <CategoryItem
              icon="grid-outline"
              name="All"
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
            />
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                icon={getCategoryIcon(category.name)}
                name={category.name}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Businesses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? 'Filtered' : 'Nearby'} Businesses
            </Text>
            <Text style={styles.sectionSubtitle}>{businesses.length} found</Text>
          </View>
          {sortedBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              distance={getBusinessDistance(business)}
              onPress={() => router.push(`/business/${business.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const CategoryItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  selected: boolean;
  onPress: () => void;
}> = ({ icon, name, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryItem, selected && styles.categoryItemSelected]}
    onPress={onPress}
  >
    <View
      style={[styles.categoryIcon, selected && styles.categoryIconSelected]}
    >
      <Ionicons
        name={icon}
        size={24}
        color={selected ? Colors.background : Colors.primary}
      />
    </View>
    <Text style={[styles.categoryName, selected && styles.categoryNameSelected]}>
      {name}
    </Text>
  </TouchableOpacity>
);

const getCategoryIcon = (name: string): keyof typeof Ionicons.glyphMap => {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    carpenter: 'hammer',
    plumber: 'water',
    electrician: 'flash',
    gardener: 'leaf',
    furniture: 'bed',
    cleaning: 'sparkles',
    stationery: 'book',
    catering: 'restaurant',
    barber: 'cut',
    'machine shop': 'construct',
  };
  return icons[name.toLowerCase()] || 'briefcase';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    paddingTop: Spacing.xxl + 10,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.background,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.background,
    opacity: 0.9,
    marginTop: Spacing.xs - 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    color: Colors.background,
    fontWeight: FontWeight.bold,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textLight,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  categoriesContainer: {
    gap: Spacing.md,
    paddingTop: Spacing.xs,
  },
  categoryItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryItemSelected: {},
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  categoryIconSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryName: {
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  categoryNameSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});
