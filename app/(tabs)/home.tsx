import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

type Category = Database['public']['Tables']['categories']['Row'];

const CATEGORY_ICONS: { [key: string]: any } = {
  'plumbing': 'water',
  'electrical': 'flash',
  'ac repair': 'snow',
  'cleaning': 'sparkles',
  'painting': 'color-palette',
  'carpentry': 'hammer',
  'pest control': 'bug',
  'appliance repair': 'construct',
  'food': 'restaurant',
  'doctor': 'medical',
  'shopkeeper': 'storefront',
  'gardener': 'leaf',
  'carpenter': 'hammer',
  'painter': 'color-palette',
  'plumber': 'water',
  'house maid': 'sparkles',
};

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const colors = useColors();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await loadCategories();
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
      .eq('is_active', true)
      .order('name')
      .limit(8);

    if (error) throw error;
    setCategories(data || []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primaryDark }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/(tabs)/messages')}
            >
              <Ionicons name="chatbubbles" size={22} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/customer/notifications')}
            >
              <Ionicons name="notifications" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Local Business Heroes Banner */}
        <View style={[styles.heroBanner, { backgroundColor: colors.muted }]}>
          <View style={styles.heroHeader}>
            <Text style={[styles.heroRibbon, { color: colors.text }]}></Text>
          </View>
          <Image
            source={require('@/assets/images/header.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>categories</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {categories.slice(0, 4).map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: '#A1CCA5' }]}
                onPress={() => router.push(`/category/${category.name.toLowerCase()}`)}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons 
                    name={CATEGORY_ICONS[category.name.toLowerCase()] || 'cube'} 
                    size={28} 
                    color="#FFFFFF" 
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
            {categories.slice(4, 8).map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: '#29422B' }]}
                onPress={() => router.push(`/category/${category.name.toLowerCase()}`)}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons 
                    name={CATEGORY_ICONS[category.name.toLowerCase()] || 'cube'} 
                    size={28} 
                    color="#FFFFFF" 
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/customer/orders')}
            >
              <Text style={styles.quickActionText}>Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/customer/history')}
            >
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/customer/booking')}
            >
              <Text style={styles.quickActionText}>Book</Text>
            </TouchableOpacity>
            
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      {/* <View style={[styles.bottomNav, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/location')}
        >
          <Ionicons name="location" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/orders')}
        >
          <Ionicons name="receipt" size={24} color="#fff" />
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
  },
  profileButton: {},
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBanner: {
    marginHorizontal: Spacing.lg,
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    minHeight: 100,
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroRibbon: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroImage: {
    width: '100%',
    height: 150,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  categoryIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  categoryEmoji: {
    fontSize: 32,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    borderRadius: 30,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});