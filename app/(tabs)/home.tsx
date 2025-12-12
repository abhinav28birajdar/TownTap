import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/auth-context';
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
  'food': '🍔',
  'doctor': '👨‍⚕️',
  'shopkeeper': '👔',
  'gardener': '👨‍🌾',
  'carpenter': '👷',
  'painter': '🎨',
  'plumber': '🔧',
  'house maid': '🧹',
};

export default function HomeScreen() {
  const { user, profile } = useAuth();
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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications" size={24} color="#4A5F4E" />
          </TouchableOpacity>
        </View>

        {/* Local Business Heroes Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroRibbon}>LOCAL BUSINESS HEROES</Text>
          </View>
          <Image
            source={require('@/assets/images/react-logo.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>categories</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {categories.slice(0, 4).map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => router.push(`/customer/search?category=${category.id}`)}
              >
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryEmoji}>
                    {CATEGORY_ICONS[category.name.toLowerCase()] || '📦'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {categories.slice(4, 8).map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => router.push(`/customer/search?category=${category.id}`)}
              >
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryEmoji}>
                    {CATEGORY_ICONS[category.name.toLowerCase()] || '📦'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#6B8E6F' }]}
              onPress={() => router.push('/customer/search')}
            >
              <Text style={styles.quickActionText}>Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#6B8E6F' }]}
              onPress={() => router.push('/customer/bookings')}
            >
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: '#6B8E6F' }]}
              onPress={() => router.push('/customer/bookings')}
            >
              <Text style={styles.quickActionText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/search')}
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
          onPress={() => router.push('/customer/bookings')}
        >
          <Ionicons name="receipt" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4E7D4',
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
    backgroundColor: '#4A5F4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBanner: {
    marginHorizontal: Spacing.lg,
    backgroundColor: '#E8E8E8',
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    minHeight: 200,
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroRibbon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
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
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#5B9FD7',
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
    backgroundColor: '#6B8E6F',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#6B8E6F',
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